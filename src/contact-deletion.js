const { ContactModel } = require("../model");
const sequelize = require("../db");

async function deleteContact(ctx, contactId) {
  try {
    console.log(`Начинаем удаление контакта с ID: ${contactId}`);

    const contact = await ContactModel.findOne({
      where: { id: contactId },
    });
    if (!contact) {
      throw new Error("Контакт не найден");
    }

    // Soft delete через прямой SQL-запрос
    await sequelize.query(
      `UPDATE contacts SET is_deleted = true, deleted_at = NOW(), deleted_by = ${ctx.from.id} WHERE id = ${contactId}`
    );

    return true;
  } catch (error) {
    console.error("Ошибка при удалении контакта:", error);
    throw error;
  }
}

function createDeleteButton(contactId) {
  return {
    inline_keyboard: [
      [{ text: "❌ Удалить контакт", callback_data: `delete_${contactId}` }],
    ],
  };
}

module.exports = {
  deleteContact,
  createDeleteButton,
};
