/*CMD
  command: /setup_support
  help: 
  need_reply: false
  auto_retry_time: 
  folder: 

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: 
  group: 
CMD*/

if (!user || !chat) {
  return;
}

// ================================
// CONFIGURE YOUR SUPPORT BOT HERE
// ================================

var setup = {
  apiUrl: "https://api.zadosource.com/v1/ai/chat",

  // Put your ZadoSource API Key here
  apiKey: "PUT_YOUR_API_KEY_HERE",

  // Put your AI Training Key here
  trainKey: "PUT_YOUR_TRAIN_KEY_HERE",

  // Put your Telegram numeric user ID here
  adminTelegramId: 123456789,

  // Maximum query characters
  queryMax: 500
};


//DO NOT EDIT BELOW ALL REQUIRED FIELDS ARE ABOVE TO FILL EVEN BELOW IS JUST TO VERIFY

if (
  !setup.apiKey ||
  setup.apiKey === "PUT_YOUR_API_KEY_HERE"
) {
  Bot.sendMessage(
    "❌ Please configure your ZadoSource API Key in /setup_support."
  );
  return;
}

if (
  !setup.trainKey ||
  setup.trainKey === "PUT_YOUR_TRAIN_KEY_HERE"
) {
  Bot.sendMessage(
    "❌ Please configure your ZadoSource AI Training Key in /setup_support."
  );
  return;
}

if (
  !setup.adminTelegramId ||
  setup.adminTelegramId === 123456789
) {
  Bot.sendMessage(
    "❌ Please configure your Telegram Admin ID in /setup_support."
  );
  return;
}

if (
  !setup.queryMax ||
  setup.queryMax < 1
) {
  Bot.sendMessage(
    "❌ queryMax must be greater than 0."
  );
  return;
}


if (
  String(user.telegramid) !==
  String(setup.adminTelegramId)
) {
  Bot.sendMessage(
    "❌ You are not authorized to run this setup command."
  );
  return;
}


Bot.setProp(
  "zs_support_config",
  setup,
  "json"
);


Api.sendMessage({
  chat_id: chat.chatid,
  text:
    "✅ <b>Support configuration saved successfully.</b>\n\n" +
    "API URL: <code>" +
    setup.apiUrl +
    "</code>\n\n" +
    "Admin ID: <code>" +
    setup.adminTelegramId +
    "</code>\n\n" +
    "Query Max: <code>" +
    setup.queryMax +
    "</code>\n\n" +
    "🔐 Your API keys were saved but are not displayed here.\n\n" +
    "<b>For security, now delete or disable the /setup_support command.</b>",
  parse_mode: "HTML"
});
