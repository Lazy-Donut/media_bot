const {UserModel} = require("../model");
const {startMessage} = require("./msgs");
const {mainKeyboard} = require("./keyboards");

const authorizationCheck = async (ctx, withMessage = true) => {
    const user = await UserModel.findOne({where: {telegram_id: ctx.from.id}});
if (user === null && withMessage) {
    await ctx.reply((startMessage), {
        reply_markup: mainKeyboard(),
        parse_mode: "HTML"
    })
}
return user !== null;
}

module.exports = {authorizationCheck};