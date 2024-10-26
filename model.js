const Sequelize = require('./db');
const {DataTypes} = require('sequelize');

const TokenModel = Sequelize.define('token', {
    id: {type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
    token: {type: DataTypes.STRING, unique: true},
})

module.exports = TokenModel;