require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middlewares Globais
app.use(cors());
app.use(express.json());

// Servir os ficheiros estáticos do front-end (public/index.html)
app.use(express.static(path.join(__dirname, '../public')));

module.exports = app;