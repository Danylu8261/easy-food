const service = require("./restaurant.service");

exports.list = async (req, res) => {
  try {
    const restaurants = await service.list();
    return res.json(restaurants);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const restaurant = await service.create(req.body);
    return res.status(201).json(restaurant);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    await service.remove(id);
    return res.status(200).json({ message: "Restaurante removido com sucesso!" });
  } catch (error) {
    return res.status(400).json({ error: "Erro ao remover restaurante." });
  }
};