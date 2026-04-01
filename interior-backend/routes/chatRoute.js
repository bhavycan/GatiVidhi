const express = require('express')
const {
  getconnectingSocket,
  getAllConversationsController,
  getChatHistoryController,
  getDMConversationsController,
  getDMHistoryController,
  getMyDMHistoryController,
} = require('../controllers/chat.controller')
const adminAuthentification = require('../middlewares/adminAuthentification')
const userAuthentification = require('../middlewares/userAuthentification')
const route = express.Router()

// Direct client-admin messaging (must be before /:id wildcard)
route.get('/dm/conversations', adminAuthentification, getDMConversationsController)
route.get('/dm/my', userAuthentification, getMyDMHistoryController)
route.get('/dm/history/:clientId', adminAuthentification, getDMHistoryController)

// AI chatbot (existing)
route.get('/conversations', adminAuthentification, getAllConversationsController)
route.get('/history/:clientId', adminAuthentification, getChatHistoryController)
route.get('/:id', getconnectingSocket)

module.exports = route
