 const express = require('express');
const path = require('path');
const cors = require('cors');

// Importação das rotas dos módulos
const authRoutes = require('./src/modules/auth/auth.routes');
const restaurantRoutes = require('./src/modules/restaurants/restaurant.routes');
const dishRoutes = require('./src/modules/dishes/dish.routes');

const app = express();

// Middlewares para parsing do body e CORS
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Disponibilização estática das pastas
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Mapeamento das rotas da API
app.use('/', authRoutes);
app.use('/restaurants', restaurantRoutes);
app.use('/dishes', dishRoutes);

// Fallback para SPA (caso aceda a uma rota inexistente no navegador)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicialização do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ativo na porta ${PORT}`);
});