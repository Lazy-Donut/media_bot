const { DataTypes } = require("sequelize");

module.exports = {
  up: async (queryInterface) => {
    // Проверяем существование колонок
    const tableInfo = await queryInterface.describeTable("contacts");

    if (!tableInfo.is_deleted) {
      await queryInterface.addColumn("contacts", "is_deleted", {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      });
    }

    if (!tableInfo.deleted_at) {
      await queryInterface.addColumn("contacts", "deleted_at", {
        type: DataTypes.DATE,
        allowNull: true,
      });
    }

    if (!tableInfo.deleted_by) {
      await queryInterface.addColumn("contacts", "deleted_by", {
        type: DataTypes.INTEGER,
        allowNull: true,
      });
    }
  },

  down: async (queryInterface) => {
    const tableInfo = await queryInterface.describeTable("contacts");

    if (tableInfo.is_deleted) {
      await queryInterface.removeColumn("contacts", "is_deleted");
    }

    if (tableInfo.deleted_at) {
      await queryInterface.removeColumn("contacts", "deleted_at");
    }

    if (tableInfo.deleted_by) {
      await queryInterface.removeColumn("contacts", "deleted_by");
    }
  },
};
