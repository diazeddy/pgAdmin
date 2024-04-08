const express = require('express')
const jwt = require('jsonwebtoken');
//const { testConnection, connectToDatabase, getDBSchemaAndTables, getTableData } = require('../db');
const { isAuthenticated } = require('../authMiddleware');

const { Sequelize } = require('sequelize');

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







// // Test Connection Endpoint
// apiRouter.post('/api/test-connection', async (req, res) => {
//     const { host, user, password, database } = req.body;
//     const result = await testConnection(host, user, password, database);
//     res.json({ message: result });
//   });
  
// // Connect to Database Endpoint
// apiRouter.post('/api/connect', async (req, res) => {
//     const { host, user, password, database } = req.body;
//     const result = await connectToDatabase(host, user, password, database);
//     res.json({ message: result });
// });

// // Protected route
// apiRouter.get('/api/dashboard', isAuthenticated, (req, res) => {
//     // Your route logic here
//     res.json({ message: 'Welcome to the dashboard!' });
// });

// // Protected route to test authentication
// apiRouter.get('/api/test-auth', isAuthenticated, (req, res) => {
//     res.json({ message: 'Authentication successful', user: req.user });
// });

// // Protected route to get DB schemas and tables
// apiRouter.get('/api/db-info', isAuthenticated, async (req, res) => {
//     try {
//         const dbInfo = await getDBSchemaAndTables();
//         res.json(dbInfo);
//     } catch (error) {
//         console.error('Error fetching DB schema and tables:', error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });

// // Protected route to get the table data with pagination

// apiRouter.get('/api/table-data/:tableName', isAuthenticated, async(req, res) => {
//     try {
//         const { tableName } = req.params;
//         const { page } = req.query;
//         const tableData = await getTableData(tableName, page);
//         res.json(tableData);
//     } catch (error) {
//         console.error('Error fetching the table data:', error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });

// // Protected route to run SQL query
// apiRouter.post('/api/run-sql', isAuthenticated, async (req, res) => {
//     try {
//       const { sqlQuery } = req.body;
//       const result = await runSQLQuery(sqlQuery);
//       res.json(result);
//     } catch (error) {
//       console.error('Error running SQL query:', error);
//       res.status(500).json({ message: 'Internal Server Error' });
//     }
// });

// // Protected route to search data in table
// apiRouter.get('/search/:tableName', isAuthenticated, async (req, res) => {
//     try {
//       const { tableName } = req.params;
//       const { query } = req.query;
//       const searchData = await searchData(tableName, query);
//       res.json(searchData);
//     } catch (error) {
//       console.error('Error searching data:', error);
//       res.status(500).json({ message: 'Internal Server Error' });
//     }
// });

module.exports = apiRouter;
