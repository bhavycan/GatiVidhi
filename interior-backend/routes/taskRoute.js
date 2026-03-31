const express = require('express');
const adminAuthentification = require('../middlewares/adminAuthentification');
const userAuthentification = require('../middlewares/userAuthentification');
const { taskCreateController, taskUpdateController, taskDeleteController, taskGetController, taskStaleController, taskGetAllController } = require('../controllers/task.controller');

const route = express.Router();

route.get('/all', adminAuthentification, taskGetAllController);
route.get('/stale', adminAuthentification, taskStaleController);
route.get('/client/:projectId', userAuthentification, taskGetController);
route.get('/:projectId', adminAuthentification, taskGetController);
route.post('/create', adminAuthentification, taskCreateController);
route.post('/update', adminAuthentification, taskUpdateController);
route.post('/delete', adminAuthentification, taskDeleteController);

module.exports = route;
