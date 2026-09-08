/*CMD
  command: /support_close
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

if (!isSupportAdmin()) {
  Api.answerCallbackQuery({
    callback_query_id: tgUpdate.callback_query.id,
    text: "Access denied.",
    show_alert: true
  });
  return;
}

var eventToken =
  String(params || "").trim();

if (!eventToken) {
  return;
}

var event =
  getEvent(eventToken);

if (!event) {
  Api.answerCallbackQuery({
    callback_query_id: tgUpdate.callback_query.id,
    text: "Support message not found.",
    show_alert: true
  });
  return;
}

var ticket =
  getTicket(event.ticketToken);

if (!ticket) {
  Api.answerCallbackQuery({
    callback_query_id: tgUpdate.callback_query.id,
    text: "Ticket not found.",
    show_alert: true
  });
  return;
}

if (ticket.status === "closed") {
  Api.answerCallbackQuery({
    callback_query_id: tgUpdate.callback_query.id,
    text: "Ticket already closed.",
    show_alert: true
  });
  return;
}


var pendingEventToken =
  User.getProp(
    "zs_admin_pending_event",
    ""
  );

pendingEventToken =
  String(pendingEventToken || "");

var pendingEvent =
  pendingEventToken
    ? getEvent(pendingEventToken)
    : null;

var clearPendingReply = false;


if (
  pendingEventToken &&
  !pendingEvent
) {
  clearPendingReply = true;
}


if (
  pendingEvent &&
  String(pendingEvent.ticketToken || "") ===
    String(ticket.token || "")
) {
  clearPendingReply = true;

  if (
    String(pendingEvent.token || "") !==
      String(event.token || "")
  ) {
    pendingEvent.status = "closed";
    pendingEvent.pendingAdminReply = "";

    saveEvent(pendingEvent);

    if (pendingEvent.adminMessageId) {
      editEvent(
        pendingEvent,
        ticket
      );
    }
  }
}

if (
  pendingEvent &&
  String(pendingEvent.ticketToken || "") !==
    String(ticket.token || "")
) {
  var pendingTicket =
    getTicket(
      pendingEvent.ticketToken
    );

  if (
    !pendingTicket ||
    pendingTicket.status === "closed" ||
    pendingEvent.status !== "replying"
  ) {
    clearPendingReply = true;
  }
}

ticket.status = "closed";

ticket.closedAt =
  new Date().toISOString();

ticket.activeEventToken = "";


event.status = "closed";
event.pendingAdminReply = "";

saveTicket(ticket);
saveEvent(event);

Bot.setProp({
  name: "zs_active_support_ticket",
  value: "",
  type: "string",
  user_telegramid:
    Number(ticket.userTelegramId)
});

Bot.setProp({
  name: "zs_support_conversation",
  value: "",
  type: "string",
  user_telegramid:
    Number(ticket.userTelegramId)
});


if (clearPendingReply) {
  User.setProp(
    "zs_admin_pending_event",
    "",
    "string"
  );
}


Api.answerCallbackQuery({
  callback_query_id:
    tgUpdate.callback_query.id,

  text:
    "Ticket closed."
});


var callbackMessage =
  tgUpdate.callback_query.message;

if (
  callbackMessage &&
  callbackMessage.message_id
) {
  Api.editMessageText({
    chat_id:
      chat.chatid,

    message_id:
      callbackMessage.message_id,

    text:
      "🎫 <b>" +
      esc(ticket.ticketId) +
      "</b>\n" +
      "✅ Ticket closed\n\n" +
      customerIdentity(ticket) +
      "\n\n" +
      "💬 <b>Customer</b>\n" +
      esc(
        clip(
          event.customerMessage || "",
          1800
        )
      ),

    parse_mode:
      "HTML",

    reply_markup: {
      inline_keyboard: []
    },

    on_error:
      "/support_close_edit_error"
  });
}


Api.sendMessage({
  chat_id:
    Number(ticket.userTelegramId),

  text:
    "✅ <b>Support ticket closed</b>\n\n" +
    "Ticket <code>" +
    esc(ticket.ticketId) +
    "</code> has been closed.\n\n" +
    "If you need assistance again, send another message and a new ticket will be created.",

  parse_mode:
    "HTML"
});
