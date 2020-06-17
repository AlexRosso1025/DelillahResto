const dbConnection = require('../../config/dbConnection');

module.exports = app =>{
    const connection  = dbConnection();
    app.get('/v1/products',(req,res)=>{
        connection.query('SELECT * FROM products',(err,result)=>{
            res.json(result);
        });
    });

    app.post('/v1/products',(req,res)=>{
        const {product_name,price} = req.body;
        connection.query('INSERT INTO products SET?',{
            product_name,
            price
        },(err,result)=>{
            res.status(201).json({message:'new Product created'});
        });
    });

    app.put('/v1/products/:productId',(req,res)=>{
    });
}