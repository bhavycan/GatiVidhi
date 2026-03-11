const express = require('express');
const jwt = require('jsonwebtoken');
const { blacklistModel } = require('../models/blacklisttoken');


const userAuthentification = async(req,res,next)=>{

try {
    const token = req.cookies.token;
     if(!req.cookies.token) return res.status(400).send("You are not logged in")
    const istokenBlackListed = await blacklistModel.findOne({token})
    if(istokenBlackListed) return res.status(400).send("Token is already BlackListed")
      const data =   jwt.verify(req.cookies.token, process.env.USER_JWT_SECRET)
    req.user = data;
    next()
} catch (error) {
    console.error(error);
    res.status(500).send("Something went erong")
}

       
}


module.exports = userAuthentification