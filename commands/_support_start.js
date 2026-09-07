/*CMD
  command: /support_start
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

if (
  !user ||
  !chat ||
  !tgUpdate ||
  !tgUpdate.callback_query
) {
  return;
}

if (chat.chat_type !== "private") {
  answerSupportCallback(
    "Open the bot in a private chat.",
    true
  );
  return;
}

if (!configReady()) {
  answerSupportCallback(
    "Support is not configured yet.",
    true
  );
  configurationMessage(chat.chatid);
  return;
}

answerSupportCallback("", false);

var callbackMessage =
  tgUpdate.callback_query.message;

if (
  callbackMessage &&
  callbackMessage.message_id
) {
  Api.editMessageText({
    chat_id: chat.chatid,
    message_id: callbackMessage.message_id,
    text:
      "<b>AI Support Ticket</b>\n\n" +
      "Send your question or describe the issue below.",
    parse_mode: "HTML"
  });
}
