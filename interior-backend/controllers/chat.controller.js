

module.exports.getconnectingSocket =  async(req,res)=>{
    const  id  = req.params.id;
 


    
    res.render('chatbot', {userId : id})
}


