require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middlewares Globais
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos e imagens enviadas
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

module.exports = app;
