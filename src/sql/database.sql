create database if not exists delillahresto;

use delillahresto;

create table if not exists users(
	user_id int not null primary key auto_increment,
	username varchar(45) not null,
	password varchar(45) not null,
	firstname varchar(30) not null,
	lastname varchar(30) not null,
	email varchar(30) not null,
	cellphone varchar(30) not null,
	address varchar(60) not null,
	is_admin boolean not null
);

create table if not exists products(
	product_id int not null primary key auto_increment,
	product_name varchar(50) not null,
	price int not null
);

create table if not exists orders(
	order_id int not null primary key auto_increment,
	order_status enum('nuevo','confirmado','preparando','enviando','cancelado','entregado') not null,
	order_time time NOT NULL,
	order_description varchar(50),
	amount int not null,
	payment_method enum('efectivo','pse','tarjeta credito','tarjeta debito') not null,
    user_id int not null,
    foreign key (user_id) references users(user_id)
);

create table if not exists order_detail(
	order_detail_id int not null primary key auto_increment,
    order_id int not null,
    product_id int not null,
    foreign key(order_id) references orders(order_id),
    foreign key(product_id) references products(product_id)
);