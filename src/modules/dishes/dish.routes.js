
const express = require('express');
const router = express.Router();

const dishController = require('./dish.controller');
const authenticate = require('../auth/auth.middleware');
const upload = require('../../shared/upload.middleware');

// Cadastrar prato
router.post('/restaurant/:restaurantId', authenticate, dishController.create);

// Listar pratos de um restaurante
router.get('/restaurant/:restaurantId', dishController.listByRestaurant);

// Enviar imagem do prato
router.post('/:id/image', authenticate, upload.single('image'), dishController.uploadImage);

module.exports = router;
