const express = require('express');
const { userCreateController, userProfileController, userLogInController, userLogOutController, userChangePassword, userGetAllController, userUpdateController, userDeleteController, sendOtpController, verifyOtpChangePasswordController, updateSelfController, forgotPasswordSendOtpController, forgotPasswordResetController } = require('../controllers/user.controller');
const userAuthentification = require('../middlewares/userAuthentification');
const adminAuthentification = require('../middlewares/adminAuthentification');

const route = express.Router();


route.get('/',(req,res)=>{
    res.send("This is th userIndex Page")
})

route.get('/all', adminAuthentification, userGetAllController)
route.post("/create",adminAuthentification ,userCreateController)
route.post('/update', adminAuthentification, userUpdateController)
route.post('/delete', adminAuthentification, userDeleteController)
route.post('/login',userLogInController)
route.post('/forgot-password', forgotPasswordSendOtpController)
route.post('/reset-password', forgotPasswordResetController)
route.post('/logout',userAuthentification,userLogOutController)
route.post('/changePassword', userChangePassword)
route.get('/profile',userAuthentification,userProfileController);
route.post('/send-otp', userAuthentification, sendOtpController);
route.post('/verify-change-password', userAuthentification, verifyOtpChangePasswordController);
route.post('/update-self', userAuthentification, updateSelfController);

module.exports = route