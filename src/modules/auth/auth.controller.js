const authService = require("./auth.service");

async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      error: "Nome, e-mail e senha são obrigatórios",
    });
  }

  try {
    const user = await authService.registerUser({ name, email, password });
    res.status(201).json(user);
  } catch (error) {
    res.status(error.status || 500).json({
      error: error.message || "Erro interno do servidor",
    });
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "E-mail e senha são obrigatórios",
    });
  }

  try {
    const result = await authService.loginUser({ email, password });
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({
      error: error.message || "Erro interno do servidor",
    });
  }
}

module.exports = { register, login };