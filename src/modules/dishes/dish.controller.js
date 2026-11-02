const service = require("./dish.service");

exports.create = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const dish = await service.create(restaurantId, req.body);
    return res.status(201).json(dish);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

exports.listByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const dishes = await service.listByRestaurant(restaurantId);
    return res.json(dishes);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

