const dbConnection = require('../../config/dbConnection');
const connection  = dbConnection();
const {validateJWT,validateAdmin} = require('../../validateJWT');

function getProductId(req,res,next){
    const {productId} = req.params;
    connection.query(`SELECT * FROM products where product_id = ?`,{replacements:[productId]})
    .then((response)=>{
        if(response[0][0]){
            req.product = response[0][0];
            next();
        }else{
            res.status(404).json({message:'Product not found'});
        }
    })
    .catch((err)=>{
        console.log(err);
    });
}

function updateProduct(req,res,next){
    const {productId} = req.params;
    const {product_name,price} = req.body;
    if(product_name && price){
        connection.query('UPDATE products SET product_name = ?, price = ? where product_id = ?',{replacements:[product_name,price,productId]})
        .then((response)=>{
            connection.query(`SELECT * FROM products where product_id = ?`,{replacements:[productId]})
            .then((response)=>{
                req.newProduct = response[0];
                next();
            })
            .catch((err)=>{
                console.log(err);
            });
        })
        .catch((err)=>{
            console.log(err);
        })
    }else{
        res.status(400).json({message:'Missing Arguments'});
    }
}

function deleteProduct(req,res,next){
    const {product} = req;
    connection.query('DELETE FROM products WHERE product_id = ? ',{replacements:[product.product_id]})
    .then((response)=>{
        next();
    })
    .catch((err)=>{
        console.log(err);
    });
}

module.exports = app =>{
    app.get('/v1/products',validateJWT,(req,res)=>{
        connection.query('SELECT * FROM products',{type:connection.QueryTypes.SELECT})
        .then((response)=>{
            res.json(response);
        })
        .catch((err)=>{
            console.log(err);
        });
    });

    app.post('/v1/products',validateJWT,validateAdmin,(req,res)=>{
        const {product_name,price} = req.body;
        if(product_name && price){
            connection.query('INSERT INTO products (product_name,price) values (?,?)',{replacements:[product_name,price]})
            .then((response)=>{
                res.status(201).json({message:'new Product created'});
            })
            .catch((err)=>{
                console.log(err);
            });
        }else{
            res.status(400).json({message:'Missing Arguments'});
        }
    });

    app.put('/v1/products/:productId',validateJWT,validateAdmin,getProductId,updateProduct,(req,res)=>{
        const {newProduct} = req;
        res.status(200).json(newProduct);
    });

    app.delete('/v1/products/:productId',validateJWT,validateAdmin,getProductId,deleteProduct,(req,res)=>{
        res.status(204).json();
    });
}