const jwt = require('jsonwebtoken');
const {key} = require('../src/config/jwt');
const validateJWT = (req,res,next) =>{
    const token = req.header('token');
    if(!token){
        res.status(401).json({message:`There's not a token in the request`});
    }
    try{
        const payload = jwt.verify(token,key);
        req.payload = payload;
        next();
    }catch(err){
        res.status(401).json({message:`Token expired. Login again`});
    }
};

function validateAdmin (req,res,next){
    const{payload}=req;
    if(!payload.permit){
        res.status(403).json({message:`You don't have permissions`});
    }else{
        next();
    }
}

module.exports = {validateJWT,validateAdmin};