const express = require('express');
const adminAuthentification = require('../middlewares/adminAuthentification');
const {
  noteGetAllController,
  noteCreateController,
  noteToggleController,
  noteDeleteController,
} = require('../controllers/note.controller');

const route = express.Router();

route.get('/all',   adminAuthentification, noteGetAllController);
route.post('/create', adminAuthentification, noteCreateController);
route.post('/toggle', adminAuthentification, noteToggleController);
route.post('/delete', adminAuthentification, noteDeleteController);

module.exports = route;
