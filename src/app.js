const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const app = express();
const JWT_SECRET = process.env.JWT_SECRET || "secreto_super_seguro_prato_cheio";

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// ==========================================
// MIDDLEWARE DE AUTENTICAÇÃO
// ==========================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Acesso negado. Token não fornecido." });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ error: "Token inválido ou expirado." });
    }
    req.user = user;
    next();
  });
};

// ==========================================
// ROTAS DE AUTENTICAÇÃO (/auth)
// ==========================================

// Cadastro de usuário (hash de senha)
app.post("/auth/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "E-mail já cadastrado." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: name || "",
        email,
        password: hashedPassword
      }
    });

    res.status(201).json({ id: user.id, name: user.name, email: user.email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao cadastrar usuário." });
  }
});

// Login (Retorna JWT)
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao realizar login." });
  }
});

// Obter dados do usuário logado (Apenas com Token)
app.get("/auth/me", authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, createdAt: true }
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar dados do usuário." });
  }
});

// ==========================================
// ROTAS DE RESTAURANTES
// ==========================================

// PÚBLICA: Listar restaurantes
app.get("/restaurants", async (req, res) => {
  try {
    const restaurants = await prisma.restaurant.findMany({
      orderBy: { id: "asc" }
    });
    res.json(restaurants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar restaurantes." });
  }
});

// PROTEGIDA: Cadastrar restaurante (Requer Token Válido)
app.post("/restaurants", authenticateToken, async (req, res) => {
  const { name, category, rating, imageUrl } = req.body;

  if (!name || !category) {
    return res.status(400).json({ error: "Nome e categoria são obrigatórios." });
  }

  try {
    const newRestaurant = await prisma.restaurant.create({
      data: {
        name,
        category,
        rating: rating !== undefined && rating !== null ? parseFloat(rating) : 0.0,
        imageUrl: imageUrl || null
      }
    });
    res.status(201).json(newRestaurant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao cadastrar restaurante." });
  }
});

// ==========================================
// ROTAS DE PRATOS (DISHES)
// ==========================================

// PÚBLICA: Listar pratos
app.get("/restaurants/:restaurantId/dishes", async (req, res) => {
  const restaurantId = parseInt(req.params.restaurantId, 10);
  if (isNaN(restaurantId)) {
    return res.status(400).json({ error: "ID de restaurante inválido." });
  }

  try {
    const dishes = await prisma.dish.findMany({
      where: { restaurantId },
      orderBy: { id: "asc" }
    });
    res.json(dishes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar pratos." });
  }
});

// PROTEGIDA: Cadastrar prato
app.post("/restaurants/:restaurantId/dishes", authenticateToken, async (req, res) => {
  const restaurantId = parseInt(req.params.restaurantId, 10);
  const { name, price, description, imageUrl } = req.body;

  if (isNaN(restaurantId)) {
    return res.status(400).json({ error: "ID do restaurante inválido." });
  }

  if (!name || price === undefined || price === null || price === "") {
    return res.status(400).json({ error: "Nome e preço são obrigatórios." });
  }

  const parsedPrice = parseFloat(price);
  if (isNaN(parsedPrice)) {
    return res.status(400).json({ error: "Preço inválido." });
  }

  try {
    const newDish = await prisma.dish.create({
      data: {
        name,
        price: parsedPrice,
        description: description || "",
        imageUrl: imageUrl || null,
        restaurantId
      }
    });
    res.status(201).json(newDish);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao cadastrar prato." });
  }
});

module.exports = app;

