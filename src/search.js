const sequelize = require("../db");
const { ContactModel } = require("../model");
const { createDeleteButton } = require("./contact-deletion");

const searchContacts = async (ctx, query) => {
  const contacts = await sequelize.query(query, {
    model: ContactModel,
    mapToModel: true,
  });
  if (contacts.length === 0) {
    await ctx.reply("Ничего не найдено");
    return;
  }
  contacts.forEach((contact) =>
    ctx.reply(
      `<b>Имя</b>: ${contact.first_name}\n<b>Фамилия:</b> ${contact.last_name}\n<b>СМИ:</b> ${contact.media}\n<b>Тип СМИ:</b> ${contact.media_type}\n<b>Профиль журналиста:</b> ${contact.specialization}\n<b>Telegram:</b> ${contact.telegram_username}\n<b>Почта:</b> ${contact.email}\n<b>Телефон:</b> ${contact.phone_number}\n<b>Соцсети:</b> ${contact.social_media_link}\n<b>Примечания:</b> ${contact.notes}`,
      { parse_mode: "HTML", reply_markup: createDeleteButton(contact.id) }
    )
  );
};

const nameSearch = async (ctx) => {
  await searchContacts(
    ctx,
    'SELECT * FROM contacts WHERE CONCAT(first_name, " ", COALESCE(last_name, "")) like "%' +
      ctx.msg.text +
      '%" AND is_deleted = false'
  );
};

const mediaSearch = async (ctx) => {
  await searchContacts(
    ctx,
    'SELECT * FROM contacts WHERE media like "%' +
      ctx.msg.text +
      '%" AND is_deleted = false'
  );
};

const mediaTypeSearch = async (ctx) => {
  await searchContacts(
    ctx,
    'SELECT * FROM contacts WHERE media_type like "%' +
      ctx.msg.text +
      '%" AND is_deleted = false'
  );
};

const specializationSearch = async (ctx) => {
  await searchContacts(
    ctx,
    'SELECT * FROM contacts WHERE specialization like "%' +
      ctx.msg.text +
      '%" AND is_deleted = false'
  );
};

module.exports = {
  nameSearch,
  mediaSearch,
  mediaTypeSearch,
  specializationSearch,
};
