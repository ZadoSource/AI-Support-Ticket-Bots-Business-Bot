/*CMD
  command: !
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

var cfg =
  Bot.getProp(
    "zs_support_config",
    {}
  );

cfg =
  cfg && typeof cfg === "object"
    ? cfg
    : {};

var adminTelegramId =
  Number(
    cfg.adminTelegramId || 0
  );

var errorText =
  "Unknown BJS error";

if (
  typeof error !== "undefined" &&
  error
) {
  if (error.message) {
    errorText =
      String(error.message);
  } else {
    errorText =
      String(error);
  }
} else if (
  typeof options !== "undefined" &&
  options
) {
  try {
    errorText =
      JSON.stringify(options);
  } catch (e) {
    errorText =
      "BJS error occurred";
  }
}

function safeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

if (
  user &&
  chat &&
  String(user.telegramid) !==
    String(adminTelegramId)
) {
  Api.sendMessage({
    chat_id:
      chat.chatid,
    text:
      "⚠️ <b>We could not process your request.</b>\n\n" +
      "Please try again. If the issue continues, contact help@zadosource.com or @ZadoSourceAssistant.",
    parse_mode:
      "HTML"
  });
}

if (adminTelegramId) {
  Api.sendMessage({
    chat_id:
      adminTelegramId,
    text:
      "⚠️ <b>Support Bot Error</b>\n\n" +
      "<code>" +
      safeHtml(
        String(errorText)
          .slice(0, 3000)
      ) +
      "</code>",
    parse_mode:
      "HTML"
  });
}
