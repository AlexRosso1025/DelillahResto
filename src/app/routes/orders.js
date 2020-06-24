const dbConnection = require('../../config/dbConnection');
const moment = require('moment');
const connection  = dbConnection();
const {validateJWT,validateAdmin} = require('../../validateJWT');
const app = require('../../config/server');
const { response } = require('express');

function validatePaymentMethodOrder(req,res,next){
    const {payment_method} = req.body;
    const types = ['efectivo','pse','tarjeta credito','tarjeta debito'];
    const existPaymentMethod = types.find((elem)=>{
        if(elem==payment_method){
            return true;
        }
    });

    if(!existPaymentMethod){
        res.status(400).json(`there's not a payment method named ${payment_method} please validate`);
    }else{
        next();
    }
}

function arrayOrders(req,res,next){
    const {products,payment_method,order_description} = req.body;
    let j=0;
    for(i in products){
        if(!products[i].product_id || !payment_method || !order_description){
            res.status(400).json({message:'Missing Arguments'});
        }else{
            j++;
        }
    }
    if(j===products.length){
        next();
    }
}

function productsExist(req,res,next){
    const {products} = req.body;
    let j=0;
    for(i in products){
        let productId = products[i].product_id;
        connection.query('SELECT * FROM products where product_id = ? ',{replacements:[productId]})
        .then((response)=>{
            if(response[0][0]){
                j++;
            }else{
                res.status(400).json({message:`There's not a product with id ${productId} in our system`})
            }
            if(j==products.length){
                next();
            }   
        })
        .catch((err)=>{
            console.log(err);
        });
    }
}

function insertOrder(req,res,next){ 
    const email = req.payload.email;
    const {payment_method,order_description} = req.body;
    const time = moment().format('LTS');
    connection.query(`SELECT user_id FROM users where email = ?`,{replacements:[email]})
    .then((response)=>{
        const id= response[0][0].user_id;
        connection.query(`INSERT INTO orders(order_status,order_time,order_description,payment_method,user_id) VALUES ('nuevo',?,?,?,?)`,{replacements:[time,order_description,payment_method,id]})
        .then((response)=>{
            const orderId = response[0];
            req.orderId = orderId;
            next();
        })
        .catch((err)=>{
            console.log(err);
        });
    })
    .catch((err)=>{
        console.log(err);
    });
}

function insertOrderDetail(req,res,next){
    const {products} = req.body;
    const {orderId} = req;
    for (i in products){
        connection.query('INSERT INTO orders_detail(order_id,product_id) VALUES(?,?)',{replacements:[orderId,products[i].product_id]})
        .then((response)=>{
            next();
        })
        .catch((err)=>{
            console.log(err);
        })
    }
}

function getOrderId(req,res,next){
    const {orderId} = req.params;
    connection.query(`SELECT * FROM orders where order_id = ?`,{replacements:[orderId]})
    .then((response)=>{
        if(response[0][0]){
            req.order = response[0][0];
            next();
        }else{
            res.status(404).json({message:'order not found'});
        }
    })
    .catch((err)=>{
        console.log(err);
    });
}

function validateOrderStatus(req,res,next){
    const {order_status} = req.body;
    if(order_status){
        const types = ['nuevo','confirmado','preparando','enviando','cancelado','entregado'];
        const existOrderStatus = types.find((elem)=>{
            if(elem==order_status){
                return true;
            }
        });

        if(!existOrderStatus){
            res.status(400).json(`there's not a order status named ${order_status} please validate`);
        }else{
            next();
        }
    }else{
        res.status(400).json({message:'Missing Arguments'});
    }
}

function updateOrder(req,res,next){
    const {orderId} = req.params;
    const {order_status} = req.body;
    connection.query('UPDATE orders SET order_status = ? WHERE order_id = ?',{replacements:[order_status,orderId]})
    .then((response)=>{
        connection.query(`SELECT o.order_status,o.order_time,o.order_id,o.order_description,SUM(price), concat(u.firstname, ' ', u.lastname) as fullname,u.address FROM orders o join orders_detail od on o.order_id = od.order_id join products p on od.product_id = p.product_id join users u on o.user_id = u.user_id where o.order_id = ? group by o.order_id`,
        {replacements:[orderId]})
        .then((response)=>{
            req.newOrder = response[0];
            next();
        })
        .catch((err)=>{
            console.log(err);
        });
    })
    .catch((err)=>{
        console.log(err);
    });
}

function deleteOrder(req,res,next){
    const {order} = req;
    connection.query('DELETE FROM orders_detail WHERE order_id = ? ',{replacements:[order.order_id]})
    .then((response)=>{
        connection.query('DELETE FROM orders WHERE order_id = ? ',{replacements:[order.order_id]})
        .then((response)=>{
            next();
        })
        .catch((err)=>{
            console.log(err);
        });
    })
    .catch((err)=>{
        console.log(err);
    });
}

module.exports = app => {
    app.post('/v1/orders',validateJWT,validatePaymentMethodOrder,arrayOrders,productsExist,insertOrder,insertOrderDetail,(req,res)=>{
        res.status(201).json('new order created');
    });

    app.get('/v1/orders',validateJWT,validateAdmin,(req,res)=>{
        connection.query(`SELECT o.order_status,o.order_time,o.order_id,o.order_description,SUM(price) as total_payment, concat(u.firstname, ' ', u.lastname) as fullname,u.address FROM orders o join orders_detail od on o.order_id = od.order_id join products p on od.product_id = p.product_id join users u on o.user_id = u.user_id where o.order_id = od.order_id group by o.order_id`,
        {type:connection.QueryTypes.SELECT})
        .then((response)=>{
            res.json(response);
        })
        .catch((err)=>{
            console.log(err);
        });
    });

    app.get('/v1/orders/myOrders',validateJWT,(req,res)=>{
        const {email,permit} = req.payload;
        if(permit){
            res.redirect('/v1/orders');
        }else{
            connection.query(`SELECT o.order_status,o.order_time,o.order_id,o.order_description,SUM(price) as total_payment, concat(u.firstname, ' ', u.lastname) as fullname,u.address FROM orders o join orders_detail od on o.order_id = od.order_id join products p on od.product_id = p.product_id join users u on o.user_id = u.user_id where u.email= ? group by o.order_id`,
            {replacements:[email]})
            .then((response)=>{
                res.json(response[0]);
            })
            .catch((err)=>{
                console.log(err);
            })
        }
    });

    app.put('/v1/orders/:orderId',validateJWT,validateAdmin,validateOrderStatus,getOrderId,updateOrder,(req,res)=>{
        const {newOrder} = req;
        res.status(200).json(newOrder);
    });

    app.delete('/v1/orders/:orderId',validateJWT,validateAdmin,getOrderId,deleteOrder,(req,res)=>{
        res.status(204).json();
    });
};