const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../../database/prisma");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "1d";

async function registerUser({ name, email, password }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const error = new Error("E-mail já cadastrado");
    error.status = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, password: passwordHash },
  });

  return { id: user.id, name: user.name, email: user.email, imageUrl: user.imageUrl };
}

async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const error = new Error("E-mail ou senha inválidos");
    error.status = 401;
    throw error;
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    const error = new Error("E-mail ou senha inválidos");
    error.status = 401;
    throw error;
  }

  const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      imageUrl: user.imageUrl,
    },
  };
}

async function getUserById(userId) {
  return await prisma.user.findUnique({
    where: { id: Number(userId) },
    select: { id: true, name: true, email: true, imageUrl: true, createdAt: true },
  });
}

async function updateUserImage(userId, imageUrl) {
  const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
  if (!user) {
    const error = new Error("Usuário não encontrado");
    error.status = 404;
    throw error;
  }

  return await prisma.user.update({
    where: { id: Number(userId) },
    data: { imageUrl },
    select: { id: true, name: true, email: true, imageUrl: true, createdAt: true },
  });
}

module.exports = { registerUser, loginUser, getUserById, updateUserImage };
