require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/conversions', require('./routes/conversions'));
app.use('/api/accounts', require('./routes/accounts'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
