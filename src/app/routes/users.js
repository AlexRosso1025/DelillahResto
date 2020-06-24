const dbConnection = require('../../config/dbConnection');
const {validateJWT,validateAdmin} = require('../../validateJWT');
const jwt = require('jsonwebtoken');
const {key} = require('../../config/jwt');
const connection  = dbConnection();

function validateDuplicateUser(req,res,next){
    const {email} = req.body;
    connection.query(`SELECT * FROM users where email = ?`,{replacements:[email]})
    .then((response)=>{
        if(response[0][0]){
            res.status(409).json({message:`User already exists with email ${email}`});
        }else{
            next();
        }
    })
    .catch((err)=>{
        console.log(err);
    });
}

function validateUserExist(req,res,next){
    const {email} = req.body;
    connection.query(`SELECT * FROM users where email = ?`,{replacements:[email]})
    .then((response)=>{
        if(response[0][0]){
            next();
        }else{
            res.status(404).json({message:`There's a problem with your email or password`});
        }
    })
    .catch((err)=>{
        console.log(err);
    });
}

function validatePassword(req,res,next){
    const {email,password} = req.body;
    connection.query(`SELECT password FROM users where email = ?`,{replacements:[email]})
    .then((response)=>{
        const pass= response[0][0].password;
        if(pass===password){
            next();
        }else{
            res.status(404).json(`There's a problem with your email or password`);
        }
    })
    .catch((err)=>{
        console.log(err);
    });
}

function generateToken(req,res,next){
    const {email} = req.body;
    connection.query(`SELECT is_admin FROM users where email = ?`,{replacements:[email]})
    .then((response)=>{
        const permit = response[0][0].is_admin;
        const payload = {email,permit};
        const token = jwt.sign(payload,key,{
            expiresIn:'2h'
        });
        req.token = token;
        next();
    })
    .catch((err)=>{
        console.log(err);
    });
}

module.exports = app =>{
        app.get('/v1/users',validateJWT,validateAdmin,(req,res)=>{
            connection.query('SELECT * FROM users',{type:connection.QueryTypes.SELECT})
            .then((response)=>{
                res.json(response);
            })
            .catch((err)=>{
                console.log(err);
            })
        });

        app.post('/v1/users',validateDuplicateUser,(req,res)=>{
        const {username,password,firstname,lastname,email,cellphone,address} = req.body;
        if(username && password && firstname && lastname && email && cellphone && address){
            connection.query('INSERT INTO users(username,password,firstname,lastname,email,cellphone,address,is_admin) VALUES (?,?,?,?,?,?,?,false)',
            {replacements:[username,password,firstname,lastname,email,cellphone,address]})
            .then((response)=>{
                res.status(201).json({message:`new User created with email ${email}`});
            })
            .catch((err)=>{
                console.log(err);
            });
        }else{
            res.status(400).json({message:'Missing Arguments'});
        }
        });

        app.post('/v1/users/auth',validateUserExist,validatePassword,generateToken,(req,res)=>{
            const {token} = req;
            res.json({token});
        });
}