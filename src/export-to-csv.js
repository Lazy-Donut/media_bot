require('dotenv').config();
const {ContactModel} = require("../model");
const {Parser} = require("@json2csv/plainjs");
const fs = require("node:fs");
const {InputFile} = require("grammy");


const exportToCsv = async (ctx) => {
    console.log(ctx.from.id);
    console.log(process.env.MODERATOR_TG_ID)
    if (ctx.from.id == process.env.MODERATOR_TG_ID) {
        console.log('started export');
        const contacts = await ContactModel.findAll();
        const parser = new Parser({
            fields: [
                'media',
                'first_name',
                'last_name',
                'media_type',
                'telegram_username',
                'email',
                'phone_number',
                'social_media_link'
            ],
        });
        const csv = parser.parse(contacts);
        console.log(csv);
        fs.writeFile('../export.csv', csv, err => {
            if (err) {
                console.error(err);
            } else {
                // file written successfully
            }
        });
        await ctx.replyWithDocument(new InputFile("../export.csv"));

    }
}

module.exports = {
    exportToCsv,
};