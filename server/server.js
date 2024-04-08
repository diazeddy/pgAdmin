const express = require('express')
const cors = require('cors');
const apiRouter = require('./router/apiRouter')

const app = express();

app.use(express.json());
app.use(cors());

app.use(apiRouter)


const PORT = process.env.PORT || 5000;


// app.get('/', async (req, res) => {
//   try {
//     const client = await pool.connect();
//     const result = await client.query('SELECT NOW()');
//     res.send(`PostgreSQL connected successfully. Current time: ${result.rows[0].now}`);
//     client.release();
//   } catch (error) {
//     console.error('Error executing query', error);
//     res.status(500).send('Internal Server Error');
//   }
// });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});