const mongoose = require('mongoose');

const connectDb = async()=>{
    try {
        await mongoose.connect(process.env.MONGOURL);
        console.log("Databse Connected")
    } catch (error) {
        console.log("Failed To connect Database" + error)
        process.exit(1)
    }
}


module.exports = connectDb;