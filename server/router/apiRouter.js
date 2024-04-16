const express = require('express')

const { Sequelize, QueryTypes, DataTypes, Op } = require('sequelize');
const csv = require('csv-stringify');
const apiRouter = express.Router()

let sequelize;

sequelize = new Sequelize('postgres', 'postgres', 'developer2020!A', {
    host: 'localhost',
    dialect: 'postgres'
});

// Initialize the sample schemas and tables in a function
const initDb = async () => {
    await sequelize.query("CREATE SCHEMA IF NOT EXISTS schema1; CREATE TABLE IF NOT EXISTS schema1.table1(id serial PRIMARY KEY, name VARCHAR(50));");
    await sequelize.query("CREATE SCHEMA IF NOT EXISTS schema2; CREATE TABLE IF NOT EXISTS schema2.table2(id serial PRIMARY KEY, name VARCHAR(50));");
    await sequelize.query("CREATE SCHEMA IF NOT EXISTS schema3; CREATE TABLE IF NOT EXISTS schema3.table3(id serial PRIMARY KEY, name VARCHAR(50));");

    // Insert fake data to tables
    await sequelize.query("INSERT INTO schema1.table1 (name) VALUES ('John'), ('Paul'), ('George'), ('Ringo')");
    await sequelize.query("INSERT INTO schema2.table2 (name) VALUES ('Mick'), ('Keith'), ('Charlie'), ('Ronnie')");
    await sequelize.query("INSERT INTO schema3.table3 (name) VALUES ('Jim'), ('Ray'), ('Robby'), ('John')");
};

initDb();

apiRouter.post('/api/test-connection', async (req, res) => {
    const { host, user, password, database } = req.body;
    sequelize = new Sequelize(database, user, password, {
        host: host,
        dialect: 'postgres',
    });
    
    try {
        await sequelize.authenticate();
        res.json({ message: 'Connected to the database successfully.' });
    } catch (error) {
        res.status(400).json({ message: 'Unable to connect to the database:' + error.message });
    }
});

apiRouter.post('/api/connect', async (req, res) => {
    const { host, user, password, database } = req.body;
    sequelize = new Sequelize(database, user, password, {
        host: host,
        dialect: 'postgres',
    });

    try {
        await sequelize.sync();
        const schemasAndTables = await getSchemaTables();
        res.json({ message: 'Connected to the database successfully.', data: schemasAndTables });
    } catch (error) {
        res.status(400).json({ message: 'Unable to connect to the database:' + error.message });
    }
});

apiRouter.get('/api/table/:schema/:table', async (req, res) => {
    const { schema, table } = req.params;

    try {
        const result = await sequelize.query(`SELECT * FROM "${schema}"."${table}"`);
        res.json(result[0]); // Assume that the 1st element of the result array contains the rows
    } catch (error) {
        res.status(500).json({ message: 'Error fetching table data', error: error.message });
    }
});



const getSchemaTables = async () => {
    const result = await sequelize.query(`
        SELECT 
        table_schema as schema, 
        table_name as table 
        FROM 
        information_schema.tables
        WHERE 
        table_type = 'BASE TABLE' 
            AND 
        table_schema not in ('pg_catalog', 'information_schema');
    `);
    return result[0];
}


apiRouter.get('/api/schemas', async (req, res) => {
    const schemasAndTables = await getSchemaTables()
    res.json(schemasAndTables);
});

apiRouter.post('/api/run-sql', async (req, res) => {
    const { sqlQuery } = req.body;
  
    try {
      const result = await sequelize.query(sqlQuery, { type: QueryTypes.SELECT });
      res.json({ success: true, result });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Failed to execute SQL query' });
    }
});

apiRouter.post('/api/search', async (req, res) => {
    const searchQuery = req.query.query;

    try {
    const result = await sequelize.query(`
        SELECT * FROM ${req.query.schema}.${req.query.table}
        WHERE name LIKE :mode
    `, { 
        replacements: { mode: "%" + searchQuery + "%" },
        type: QueryTypes.SELECT
    });

    res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to perform search' });
    }
});


apiRouter.post('/api/export', async (req, res) => {
    const { format, schema, table } = req.query;

    try {
        let data = await sequelize.query(`
        SELECT * FROM ${schema}.${table}
        `); ;
        if (format === 'csv') {
            // Fetch data from the database
            // data = await Product.findAll();
             
            // Convert data to CSV format
            const csvData = await stringifyDataToCSV(data);
            // Send CSV data as response
            res.attachment('export.csv');
            res.send(csvData);
        } else if (format === 'sql') {
            // Fetch data from the database
            // data = await Product.findAll();
            
            // Convert data to SQL insert statements
            const sqlData = await convertDataToSQL(data, schema);
            // Send SQL data as response
            res.attachment('export.sql');
            res.send(sqlData);
        } else {
            res.status(400).json({ message: 'Invalid export format' });
        }
    } catch (error) {
        console.error('Failed to export data:', error);
        res.status(500).json({ error: 'Failed to export data' });
    }
});


// Helper function to convert data to CSV format
const stringifyDataToCSV = async (data) => {
    return new Promise((resolve, reject) => {
        csv(data, { header: true }, (err, output) => {
            if (err) reject(err);
            else resolve(output);
        });
    });
};

// Helper function to convert data to SQL format
const convertDataToSQL = async (data, schema) => {
    // Assuming the model has 'id' and 'name' fields
    const insertStatements = data.map(row => `INSERT INTO ${schema} (id, name) VALUES (${row.id}, '${row.name}');`);
    return insertStatements.join('\n');
};

module.exports = apiRouter;
