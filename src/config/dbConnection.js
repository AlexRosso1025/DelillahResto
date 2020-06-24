const {database,user,password,host,dialet} = require("./dbConfig");
const Sequelize = require("sequelize");
const sequelize = new Sequelize(`${dialet}://${user}:${password}@${host}:3306/${database}`);

module.exports = () => sequelize;