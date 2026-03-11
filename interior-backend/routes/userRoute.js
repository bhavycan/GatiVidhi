const express = require('express');
const { userCreateController,userProfileController, userLogInController, userLogOutController, userChangePassword } = require('../controllers/user.controller');
const userAuthentification = require('../middlewares/userAuthentification');
const adminAuthentification = require('../middlewares/adminAuthentification');

const route = express.Router();


route.get('/',(req,res)=>{
    res.send("This is th userIndex Page")
})

route.post("/create",adminAuthentification ,userCreateController)
route.post('/login',userLogInController)
route.post('/logout',userAuthentification,userLogOutController)
route.post('/changePassword', userChangePassword)
route.get('/profile',userAuthentification,userProfileController);

module.exports = route