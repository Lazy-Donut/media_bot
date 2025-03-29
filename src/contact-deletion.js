const { ContactModel } = require("../model");

async function deleteContact(ctx, contactId) {
  try {
    const contact = await ContactModel.findByPk(contactId);
    if (!contact) {
      throw new Error("Контакт не найден");
    }
    await contact.destroy();
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
