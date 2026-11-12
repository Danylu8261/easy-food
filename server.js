require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const authRoutes = require('./src/modules/auth/auth.routes');
const restaurantRoutes = require('./src/modules/restaurants/restaurant.routes');
const dishRoutes = require('./src/modules/dishes/dish.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Disponibilização estática das imagens e front-end
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Mapeamento das rotas da API
app.use('/auth', authRoutes);
app.use('/restaurants', restaurantRoutes);
app.use('/dishes', dishRoutes);

// Tratamento de erros do Multer / Upload (formato inválido ou > 5MB)
app.use((err, req, res, next) => {
  if (err) {
    return res.status(err.status || 400).json({ error: err.message });
  }
  next();
});

// Fallback para front-end
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ativo na porta ${PORT}`);
});
