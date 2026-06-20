const jwt = require("jsonwebtoken");

function auth(req,res,next){
    const header = req.headers.authorization;

    if(!header){
        return res.status(401).json({message:"NO token"})
    }

    const token = header.split(" ")[1];

    try {
        const user = jwt.verify(token,"suraj123456")
        req.user = user
        next();
    } catch (error) {
        return res.status(401).json({message:"Invalid token"})
        
    }
}


module.exports = auth;