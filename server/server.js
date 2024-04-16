const express = require('express')
const cors = require('cors');
const apiRouter = require('./router/apiRouter')

const app = express();

app.use(express.json());
app.use(cors());

app.use(apiRouter)


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});