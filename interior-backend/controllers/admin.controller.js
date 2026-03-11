const { adminModel } = require("../models/adminModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


module.exports.adminLogInController = async (req, res) => {
  const { email, password } = req.body;
  if (!email | !password) {
    return res.status(400).send("Email and password not available");
  }

  try {
    let admin = await adminModel.findOne({ email });
    if (!admin) return res.status(400).send("Admin does not exist");
    const check = await bcrypt.compare(password, admin.password);
    if (!check) return res.status(400).send("Wrong Password");
    const token = jwt.sign({ email: email }, process.env.ADMIN_JWT_SECRET);
      res.cookie("admintoken", token,{
      httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict", // or "lax"
  maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    res.status(200).send("Admin Login Succesful");
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
}

module.exports.adminLogOutController = async(req,res)=>{
    try {
            const {id} = req.body;
            let admin = await adminModel.findOne({_id : id});
            if(!admin) return res.status(400).send("Inavlid Id");
            res.cookie("admintoken", "")
            res.status(200).send("Logged Out succesfully")
        } catch (error) {
            console.error(error);
            res.status(500).send("Something wend wrong!")
        }
}
