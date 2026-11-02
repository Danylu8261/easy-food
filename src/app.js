const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { sendEmail } = require('./modules/shared/email.service');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Middleware de autenticação JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'minha_chave_secreta_super_segura_123', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido ou expirado.' });
    }
    req.user = user;
    next();
  });
}

// Rota de Login
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: 'Credenciais inválidas.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET || 'minha_chave_secreta_super_segura_123',
      { expiresIn: '1d' }
    );

    return res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao realizar login.' });
  }
});

// Rota para obter dados do utilizador autenticado
app.get('/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado.' });
    }

    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao buscar dados do utilizador.' });
  }
});

// Rota para listar restaurantes
app.get('/restaurants', async (req, res) => {
  try {
    const restaurants = await prisma.restaurant.findMany();
    return res.json(restaurants);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao buscar restaurantes.' });
  }
});

// Rota para cadastrar novo restaurante (com disparo de e-mail resiliente)
app.post('/restaurants', authenticateToken, async (req, res) => {
  try {
    const { name, category, rating, imageUrl } = req.body;

    if (!name || !category) {
      return res.status(400).json({ error: 'Nome e categoria são obrigatórios.' });
    }

    // 1. Guarda o restaurante no PostgreSQL
    const newRestaurant = await prisma.restaurant.create({
      data: {
        name,
        category,
        rating: Number(rating) || 0,
        imageUrl: imageUrl || null,
      },
    });

    // 2. Disparo do e-mail com tratamento isolado de exceção (Resiliência)
    try {
      await sendEmail({
        to: req.user.email,
        subject: 'Novo Restaurante Cadastrado!',
        header: 'Confirmação de Registo',
        body: `<p>Olá, <strong>${req.user.name || 'Utilizador'}</strong>!</p>
               <p>O restaurante <strong>${newRestaurant.name}</strong> foi registado com sucesso na categoria <em>${newRestaurant.category}</em>.</p>`,
        footer: 'Prato Cheio App © 2026 - Gestão de Restaurantes',
      });
      console.log(`[E-mail] Notificação enviada com sucesso para ${req.user.email}`);
    } catch (emailError) {
      // Falha no e-mail não interrompe a resposta HTTP nem cancela o registo
      console.error('[E-mail Error] Não foi possível enviar o e-mail:', emailError.message);
    }

    // 3. Devolve a resposta com sucesso (HTTP 201)
    return res.status(201).json(newRestaurant);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao cadastrar restaurante.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor a rodar na porta ${PORT}`);
});

module.exports = app;