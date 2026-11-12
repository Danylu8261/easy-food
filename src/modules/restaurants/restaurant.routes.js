const express = require("express");
const controller = require("./restaurant.controller");
const dishController = require("../dishes/dish.controller");
const authenticate = require("../auth/auth.middleware");

const router = express.Router();

router.get("/", controller.list);
router.post("/", authenticate, controller.create);
router.delete("/:id", authenticate, controller.remove);

// Cadastro e listagem de pratos vinculados ao restaurante (Parte 1)
router.post("/:restaurantId/dishes", authenticate, dishController.create);
router.get("/:restaurantId/dishes", dishController.listByRestaurant);

module.exports = router;
