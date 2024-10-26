const MD5 = require('crypto-js/md5')
const sequelize = require('./db')
const TokenModel = require('./model')

const generateNumber = (min = 0, length) => Math.floor(Math.random() * (length - min + 1)) + min;

const generateString = (symbols) => {
    let result = '';
    for (let i = 0; i < 10; i++) {
        result += symbols[generateNumber(0, symbols.length)]
    }
    return result;
}
const symbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
sequelize.options.logging = false;

const run = async () => {
    await sequelize.authenticate();
    await sequelize.sync();
    for (let i = 0; i < 10; i++) {
        const token = MD5(`${generateString(symbols)}`).toString();
        const dbToken = await TokenModel.create({token: token});
        console.log(dbToken.token)
    }
    await sequelize.close();
}
run();
