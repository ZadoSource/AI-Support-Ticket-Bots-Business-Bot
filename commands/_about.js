/*CMD
  command: /about
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
    "<b>🧠 Powered by ZadoSource AI</b>\n\n" +
    "This Telegram support bot demonstrates how a developer can connect " +
    "ZadoSource AI to a real application using the REST API.\n\n" +
    "The AI handles conversation context, customer responses, support " +
    "analysis, and human-agent assistance.",
  parse_mode: "HTML",
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: "🚀 Try ZadoSource AI",
          url: "https://ai.zadosource.com/"
        }
      ],
      [
        {
          text: "📖 Developer Documentation",
          url: "https://docs.zadosource.com/"
        }
      ]
    ]
  }
});
