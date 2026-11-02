const express = require("express");
const controller = require("./dish.controller");
const authenticate = require("../auth/auth.middleware");

const router = express.Router({ mergeParams: true });

router.get("/", controller.listByRestaurant);
router.post("/", authenticate, controller.create);

module.exports = router;
