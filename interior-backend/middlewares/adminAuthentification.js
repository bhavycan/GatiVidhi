const express = require('express');
const jwt = require('jsonwebtoken');


const adminAuthentification = async(req,res,next)=>{

try {
     if(!req.cookies.admintoken) return res.status(400).send("You are not logged in as admin")
      const data =  jwt.verify(req.cookies.admintoken, process.env.ADMIN_JWT_SECRET)
    let email = process.env.ADMIN_EMAIL;
    if(!(email === data.email)) return res.status(400).send("You are not admin")
    req.admin = data;
    next()
} catch (error) {
    console.error(error);
    res.status(500).send("Something went erong")
}

       
}


module.exports = adminAuthentification