const express = require('express')
const { getconnectingSocket } = require('../controllers/chat.controller')
const userAuthentification = require('../middlewares/userAuthentification')
const route = express.Router()


route.get('/:id', getconnectingSocket)


module.exports = route