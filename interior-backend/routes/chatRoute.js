const express = require('express')
const {
  getconnectingSocket,
  getAllConversationsController,
  getChatHistoryController,
  getDMConversationsController,
  getDMHistoryController,
  getMyDMHistoryController,
  uploadDMImagesController,
} = require('../controllers/chat.controller')
const adminAuthentification = require('../middlewares/adminAuthentification')
const userAuthentification = require('../middlewares/userAuthentification')
const upload = require('../config/multer')
const route = express.Router()

// Direct client-admin messaging (must be before /:id wildcard)
route.post('/dm/upload', userAuthentification, upload.array('images', 5), uploadDMImagesController)
route.get('/dm/conversations', adminAuthentification, getDMConversationsController)
route.get('/dm/my', userAuthentification, getMyDMHistoryController)
route.get('/dm/history/:clientId', adminAuthentification, getDMHistoryController)

// AI chatbot (existing)
route.get('/conversations', adminAuthentification, getAllConversationsController)
route.get('/history/:clientId', adminAuthentification, getChatHistoryController)
route.get('/:id', getconnectingSocket)

module.exports = route
