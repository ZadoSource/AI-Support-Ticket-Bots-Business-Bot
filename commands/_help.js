/*CMD
  command: /help
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

if (!chat) {
  return;
}

Api.sendMessage({
  chat_id: chat.chatid,
  text:
    "<b>Customer Support</b>\n\n" +
    "Send your question or issue as a normal Telegram message.\n\n" +
    "ZadoSource AI will review it first. If the AI has a useful answer, you will receive it and human support will also receive the conversation.\n\n" +
    "If the AI cannot answer, your message is still delivered to human support.\n\n" +
    "Your ticket stays active until an administrator closes it.\n\n" +
    "For ZadoSource assistance:\n" +
    "Email: help@zadosource.com\n" +
    "Telegram: @ZadoSourceAssistant",
  parse_mode: "HTML",
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: "ZadoSource AI",
          url: "https://ai.zadosource.com/"
        },
        {
          text: "Telegram Support",
          url: "https://t.me/ZadoSourceAssistant"
        }
      ]
    ]
  }
});
