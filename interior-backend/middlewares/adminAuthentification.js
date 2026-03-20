const jwt = require('jsonwebtoken');
const { blacklistModel } = require('../models/blacklisttoken');

const adminAuthentification = async(req,res,next)=>{

try {
    const token = req.cookies.admintoken;
    if(!token) return res.status(400).send("You are not logged in as admin")
    const isBlacklisted = await blacklistModel.findOne({ token })
    if(isBlacklisted) return res.status(400).send("Token is blacklisted")
    const data = jwt.verify(token, process.env.ADMIN_JWT_SECRET)
    let email = process.env.ADMIN_EMAIL;
    if(!(email === data.email)) return res.status(400).send("You are not admin")
    req.admin = data;
    next()
} catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong")
}

       
}


module.exports = adminAuthentification