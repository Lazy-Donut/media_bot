const addSoftDeleteFields = require("./add-soft-delete-fields");

const migrations = [
  {
    name: "add-soft-delete-fields",
    up: addSoftDeleteFields.up,
    down: addSoftDeleteFields.down,
  },
];

async function runMigrations(queryInterface) {
  for (const migration of migrations) {
    try {
      await migration.up(queryInterface);
      console.log(`Миграция ${migration.name} успешно выполнена`);
    } catch (error) {
      // Проверяем, является ли ошибка связанной с существованием колонок
      if (
        error.name === "SequelizeDatabaseError" &&
        (error.message.includes("duplicate column name") ||
          error.message.includes("column already exists"))
      ) {
        console.log(
          `Миграция ${migration.name} пропущена (колонки уже существуют)`
        );
      } else {
        // Если это другая ошибка, логируем её и прерываем выполнение
        console.error(
          `Ошибка при выполнении миграции ${migration.name}:`,
          error
        );
        throw error;
      }
    }
  }
}

module.exports = {
  runMigrations,
};
