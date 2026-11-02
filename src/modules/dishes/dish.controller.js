const dishService = require('./dish.service');

async function create(req, res) {
  try {
    const { restaurantId } = req.params;
    const dish = await dishService.createDish(Number(restaurantId), req.body);
    return res.status(201).json(dish);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

async function listByRestaurant(req, res) {
  try {
    const { restaurantId } = req.params;
    const dishes = await dishService.getDishesByRestaurant(Number(restaurantId));
    return res.json(dishes);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

async function uploadImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada ou formato inválido.' });
    }

    const { id } = req.params;
    const updatedDish = await dishService.processAndSaveImage(Number(id), req.file.buffer);

    return res.status(200).json(updatedDish);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

module.exports = {
  create,
  listByRestaurant,
  uploadImage
};
