const express = require('express')
const { getconnectingSocket, getAllConversationsController, getChatHistoryController } = require('../controllers/chat.controller')
const adminAuthentification = require('../middlewares/adminAuthentification')
const route = express.Router()

route.get('/conversations', adminAuthentification, getAllConversationsController)
route.get('/history/:clientId', adminAuthentification, getChatHistoryController)
route.get('/:id', getconnectingSocket)

module.exports = route