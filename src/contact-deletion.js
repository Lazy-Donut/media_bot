const { ContactModel } = require("../model");

async function deleteContact(ctx, contactId) {
  try {
    const contact = await ContactModel.findByPk(contactId);
    if (!contact) {
      throw new Error("Contact not found");
    }
    await contact.destroy();
    return true;
  } catch (error) {
    console.error("Error deleting contact:", error);
    throw error;
  }
}

function createDeleteButton(contactId) {
  return {
    inline_keyboard: [
      [{ text: "❌ Delete contact", callback_data: `delete_${contactId}` }],
    ],
  };
}

module.exports = {
  deleteContact,
  createDeleteButton,
};
