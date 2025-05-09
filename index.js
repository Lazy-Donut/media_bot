require("dotenv").config();
const { Bot, GrammyError, HttpError } = require("grammy");
const sequelize = require("./db");
const { runMigrations } = require("./src/migrations");
const bot = new Bot(process.env.BOT_API_KEY);
const { processToken } = require("./src/services");
const {
  nameSearch,
  mediaSearch,
  mediaTypeSearch,
  specializationSearch,
} = require("./src/search");
const { helpMessage } = require("./src/msgs");
const { create, newContactMessage } = require("./src/contact-creation");
const { authorizationCheck } = require("./src/authorization");
const { mainKeyboard } = require("./src/keyboards");
const { sendMessage } = require("./src/moderator-message");
const { exportToCsv } = require("./src/export-to-csv");
const { deleteContact } = require("./src/contact-deletion");

const chats = {};

const contactModes = {};

const newContacts = {};

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    // Run migrations
    await runMigrations(sequelize.getQueryInterface());

    console.log("База данных успешно подключена");
  } catch (e) {
    console.error("Ошибка подключения к базе данных:", e);
    process.exit(1);
  }

  bot.api.setMyCommands([
    { command: "start", description: "Запуск бота" },
    { command: "help", description: "Получить справку" },
  ]);

  bot.command("start", async (ctx) => {
    if (await authorizationCheck(ctx)) {
      chats[ctx.chatId] = undefined;

      await ctx.reply(`Привет, ${ctx.from.first_name}!`, {
        reply_markup: { remove_keyboard: true },
      });
      await ctx.reply(`Можно приступать к работе`, {
        reply_markup: mainKeyboard(),
      });
    }
  }); //приветственное сообщение при первом контакте с ботом после авторизации

  bot.command("export", async (ctx) => {
    await exportToCsv(ctx);
  });

  bot.command("help", async (ctx) => {
    if (await authorizationCheck(ctx)) {
      await ctx.reply(helpMessage, { parse_mode: "HTML" });
    }
  }); //справочное сообщение при вводе /help

  bot.hears("Поиск по имени журналиста", async (ctx) => {
    if ((await authorizationCheck(ctx)) === true) {
      chats[ctx.chatId] = "name_search";
      await ctx.reply("Введи имя журналиста для поиска");
    }
  });

  bot.hears("Поиск по названию СМИ", async (ctx) => {
    if ((await authorizationCheck(ctx)) === true) {
      chats[ctx.chatId] = "media_search";
      await ctx.reply("Введи название СМИ для поиска");
    }
  });

  bot.hears("Поиск по типу СМИ", async (ctx) => {
    if ((await authorizationCheck(ctx)) === true) {
      chats[ctx.chatId] = "media_type_search";
      await ctx.reply("Введи тип СМИ для поиска");
    }
  });

  bot.hears("Добавить новый контакт", async (ctx) => {
    if ((await authorizationCheck(ctx)) === true) {
      await ctx.reply(`Создание нового контакта`, {
        reply_markup: { remove_keyboard: true },
      });
      chats[ctx.chatId] = "new_contact";
      contactModes[ctx.chatId] = await newContactMessage(ctx);
      newContacts[ctx.chatId] = {};
    }
  });

  bot.hears("Поиск по профилю журналиста", async (ctx) => {
    if ((await authorizationCheck(ctx)) === true) {
      chats[ctx.chatId] = "specialization_search";
      await ctx.reply("Введи профиль журналиста");
    }
  });

  bot.hears("Отправить сообщение админу", async (ctx) => {
    if ((await authorizationCheck(ctx)) === true) {
      chats[ctx.chatId] = "moderator_message";
      await ctx.reply("Введи текст сообщения");
    }
  });

  bot.on(":text", async (ctx) => {
    switch (chats[ctx.chatId]) {
      case "name_search":
        nameSearch(ctx);
        break;
      case "media_search":
        mediaSearch(ctx);
        break;
      case "media_type_search":
        mediaTypeSearch(ctx);
        break;
      case "moderator_message":
        sendMessage(ctx);
        break;
      case "specialization_search":
        specializationSearch(ctx);
        break;
      case "new_contact":
        const mode = contactModes[ctx.chatId];
        newContacts[ctx.chatId][mode] = ctx.msg.text;
        contactModes[ctx.chatId] = await newContactMessage(ctx, mode);
        if (mode === "notes") {
          await create(ctx, newContacts[ctx.chatId]);
          chats[ctx.chatId] = undefined;
          contactModes[ctx.chatId] = undefined;
          newContacts[ctx.chatId] = undefined;
        }
        break;
      case undefined:
        (await authorizationCheck(ctx, false)) === true
          ? await ctx.reply("Выбери пункт меню для дальнейшей работы")
          : processToken(ctx);
        break;
    }
  });

  bot.on("callback_query", async (ctx) => {
    try {
      const data = ctx.callbackQuery.data;
      if (data.startsWith("delete_")) {
        const contactId = data.split("_")[1];
        await deleteContact(ctx, contactId);
        await ctx.answerCallbackQuery({ text: "Контакт успешно удален" });
        await ctx.reply("✅ Контакт успешно удален из базы данных");
      }
    } catch (error) {
      console.error("Ошибка при обработке callback:", error);
      await ctx.answerCallbackQuery({ text: "Ошибка при удалении контакта" });
      await ctx.reply("❌ Произошла ошибка при удалении контакта");
    }
  });

  bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;

    if (e instanceof GrammyError) {
      console.error("Error in request:", e.description);
    } else if (e instanceof HttpError) {
      console.error("Could not contact Telegram:", e);
    } else {
      console.error("Unknown error:", e);
    }
  });
  bot.start();
};
start();
