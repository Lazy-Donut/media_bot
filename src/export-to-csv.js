require('dotenv').config();
const {ContactModel} = require("../model");
const {Parser} = require("@json2csv/plainjs");
const fs = require("node:fs");
const {InputFile} = require("grammy");


const exportToCsv = async (ctx) => {
    if (ctx.from.id == process.env.MODERATOR_TG_ID) {
        const contacts = await ContactModel.findAll();
        const parser = new Parser({
            fields: [
                'media',
                'first_name',
                'last_name',
                'media_type',
                'specialization',
                'telegram_username',
                'email',
                'phone_number',
                'social_media_link',
                'notes',
            ],
        });
        const csv = parser.parse(contacts);
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