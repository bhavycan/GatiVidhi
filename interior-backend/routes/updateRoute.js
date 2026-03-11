const express = require('express');
const upload = require('../config/multer');
const { updateCreateController, updateDeleteController, updateGetAllController } = require('../controllers/update.controller');
const adminAuthentification = require('../middlewares/adminAuthentification');
const userAuthentification = require('../middlewares/userAuthentification');
const route = express.Router();


route.get('/', (req,res)=>{
    res.send("Hiii you are on the update Route")
});


route.get('/all', userAuthentification, updateGetAllController)
route.post('/create',adminAuthentification ,  upload.array('images',5),updateCreateController)
route.post('/delete',adminAuthentification,updateDeleteController )

module.exports = route