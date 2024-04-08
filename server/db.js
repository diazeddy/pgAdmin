const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'developer2020!A',
    port: 5432, // default PostgreSQL port
});


// Function to test database connection
const testConnection = async (host, user, password, database) => {
    try {
        await pool.query('SELECT 1');
        return 'Connection successful.';
    } catch (error) {
        console.error('Error testing connection:', error);
        return 'Error: Unable to establish connection.';
    }
};

// Function to connect to the database
const connectToDatabase = async (host, user, password, database) => {
    try {
        const client = await pool.connect();
        client.release();
        return 'Database connected.';
    } catch (error) {
        console.error('Error connecting to database:', error);
        return 'Error: Unable to connect to the database.';
    }
};

const getDBSchemaAndTables = async () => {
    const client = await pool.connect();
    try {
      const schemaQuery = "SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT LIKE 'pg_%' AND schema_name != 'information_schema';";
      const tableQuery = "SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema NOT LIKE 'pg_%' AND table_schema != 'information_schema';";
      const [schemaResult, tableResult] = await Promise.all([
        client.query(schemaQuery),
        client.query(tableQuery)
      ]);
      return { schemas: schemaResult.rows, tables: tableResult.rows };
    } finally {
      client.release();
    }
};

const getTableData = async (tableName, page) => {
    const offset = (page - 1) * 1000;
    const limit = 1000;
    const client = await pool.connect();
    try {
      const query = `SELECT * FROM ${tableName} OFFSET ${offset} LIMIT ${limit};`;
      const totalCountQuery = `SELECT COUNT(*) FROM ${tableName};`;
      const [dataResult, totalCountResult] = await Promise.all([
        client.query(query),
        client.query(totalCountQuery),
      ]);
      return { data: dataResult.rows, totalCount: parseInt(totalCountResult.rows[0].count) };
    } finally {
      client.release();
    }
};

const runSQLQuery = async (sqlQuery) => {
    const client = await pool.connect();
    try {
      const result = await client.query(sqlQuery);
      return result.rows;
    } finally {
      client.release();
    }
};

const searchData = async (tableName, query) => {
    const client = await pool.connect();
    try {
      const searchQuery = `SELECT * FROM ${tableName} WHERE <search conditions>;`; // Replace <search conditions> with actual conditions
      const result = await client.query(searchQuery);
      return result.rows;
    } finally {
      client.release();
    }
};

module.exports = { testConnection, connectToDatabase, getDBSchemaAndTables, getTableData, runSQLQuery, searchData };