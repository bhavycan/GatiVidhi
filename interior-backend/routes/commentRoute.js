const express = require('express');
const { createCommentController, getAllCommentsController, getMyCommentsController, resolveCommentController } = require('../controllers/comment.controller');
const adminAuthentification = require('../middlewares/adminAuthentification');
const userAuthentification = require('../middlewares/userAuthentification');
const route = express.Router();

route.post('/create', userAuthentification, createCommentController);
route.get('/all', adminAuthentification, getAllCommentsController);
route.get('/my', userAuthentification, getMyCommentsController);
route.patch('/:id/resolve', adminAuthentification, resolveCommentController);

module.exports = route;
