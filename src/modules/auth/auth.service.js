const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../../database/prisma");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "1d";

async function registerUser({ email, password }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const error = new Error("E-mail já cadastrado");
    error.status = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, password: passwordHash },
  });

  return { id: user.id, email: user.email };
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

  return { token };
}

module.exports = { registerUser, loginUser };
