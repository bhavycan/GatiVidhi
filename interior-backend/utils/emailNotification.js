const ejs = require('ejs');
const transporter = require('../config/nodemailer')
const fs = require('fs').promises;

const sendEmail = async(user, ejsFilePath) =>{

    try {
    const template = await fs.readFile(ejsFilePath, 'utf-8');
    const html = ejs.render(template, {user : user});
    const info = await transporter.sendMail({
        from: '"Tanika Associate" <bhavy203@gmail.com>',
        to: user.email,
        subject: user.subject,
        html
    })
    console.log("Message sent:", info.messageId);
    } catch (error) {
        console.error("Failed to send email:", error);
        throw error;
    }
 
}


module.exports = sendEmail