const  helpMessage = `🛠 <b>Справка</b>

Я здесь, чтобы помочь тебе в работе с базой СМИ. Вот список команд, которые можно использовать:

📌 <b>Основные команды:</b>

<i>/start</i> — начать работу с ботом.
<i>/help</i> — показать это сообщение.

📌 <b>Возможности поиска:</b>
Можно искать информацию по следующим критериям:

    1️⃣ Имя журналиста — «Иван Иванов».
2️⃣ Название СМИ — «Коммерсант».
3️⃣ Вид СМИ — «деловые», возможен поиск по городу, например «Хабаровск».

📌 <b>Работа с контактами:</b>

<b>Добавить нового журналиста:</b>
Напиши <i>/add_contact</i>, и я подскажу, как добавить контакт.

<b>Сообщить о неактуальном контакте:</b>
Напиши <i>/report_contact</i>, чтобы отправить сообщение администратору.

📌 <b>Часто задаваемые вопросы:</b>
1️⃣ Что такое токен?
Токен — это уникальный ключ для доступа к медиабазе. Получить его можно обратившись к администратору.

2️⃣ Что делать, если токен не работает?
Убедись, что отправлен корректный токен. Если ошибка сохраняется, напиши администратору.

📢 Нужна помощь?
В любой непонятной ситуации пиши админу @damn_good_coffee ☕️`

const startMessage = `👋 Привет!

Я — твой помощник для работы с базой СМИ 📚

<b>С помощью меня ты можешь:</b>
🔍 Узнать контактные данные журналистов разных СМИ.
✅ Добавить и удалить устаревшие данные.

<b>Как начать?</b>
📝 Введи свой токен для авторизации в поле для ввода сообщения и пришли мне.`

module.exports = { startMessage, helpMessage };