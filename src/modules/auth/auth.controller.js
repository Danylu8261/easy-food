const authService = require("./auth.service");
const imageService = require("../../shared/image.service");

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

async function me(req, res) {
  try {
    const userId = req.user.id || req.user.sub;
    const user = await authService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message });
  }
}

async function uploadProfileImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhuma imagem enviada ou formato inválido." });
    }

    const userId = req.user.id || req.user.sub;
    const imageUrl = await imageService.processAndSaveImage(
      req.file.buffer,
      "users",
      `user-${userId}`
    );

    const updatedUser = await authService.updateUserImage(userId, imageUrl);
    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(error.status || 400).json({ error: error.message });
  }
}

module.exports = { register, login, me, uploadProfileImage };
