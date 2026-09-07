/*CMD
  command: /new
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
      "<b>Active support ticket</b>\n\n" +
      "Ticket <code>" +
      esc(ticket.ticketId) +
      "</code> is still open.\n\n" +
      "Continue sending messages here. A new ticket can be created after the current ticket is closed by support.",
    parse_mode: "HTML"
  });

  return;
}

User.setProp(
  "zs_active_support_ticket",
  "",
  "string"
);

Api.sendMessage({
  chat_id: chat.chatid,
  text:
    "<b>Ready for a new support request.</b>\n\n" +
    "Send your question or issue below.",
  parse_mode: "HTML"
});
