/*CMD
  command: /start
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

if (chat.chat_type !== "private") {
  return;
}

if (!configReady()) {
  configurationMessage(chat.chatid);
  return;
}

var activeToken =
  User.getProp(
    "zs_active_support_ticket",
    ""
  );

var ticket =
  activeToken
    ? getTicket(activeToken)
    : null;

if (
  ticket &&
  ticket.status !== "closed"
) {
  Api.sendMessage({
    chat_id: chat.chatid,
    text:
      "<b>AI Support Ticket Bot</b>\n\n" +
      "Your support conversation is currently open.\n\n" +
      "Ticket: <code>" +
      esc(ticket.ticketId) +
      "</code>\n\n" +
      "Send your next message below to continue the same conversation.",
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "ZadoSource AI",
            url: "https://ai.zadosource.com/"
          }
        ]
      ]
    }
  });

  return;
}

if (activeToken) {
  User.setProp(
    "zs_active_support_ticket",
    "",
    "string"
  );
}

Api.sendMessage({
  chat_id: chat.chatid,
  text:
    "<b>AI Support Ticket Bot</b>\n\n" +
    "Describe your question or issue in your own words.\n\n" +
    "ZadoSource AI will review the message first. Every support message is also available to human support, and the ticket remains active until an administrator closes it.",
  parse_mode: "HTML",
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: "Start Support",
          callback_data: "/support_start"
        }
      ],
      [
        {
          text: "Powered by ZadoSource AI",
          url: "https://ai.zadosource.com/"
        }
      ]
    ]
  }
});
