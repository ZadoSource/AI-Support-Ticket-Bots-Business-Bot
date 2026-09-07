/*CMD
  command: /support_cancel_reply
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
  answerSupportCallback(
    "Access denied.",
    true
  );
  return;
}

var eventToken =
  String(params || "").trim();

var event =
  getEvent(eventToken);

if (!event) {
  answerSupportCallback(
    "Support message not found.",
    true
  );
  return;
}

var ticket =
  getTicket(
    event.ticketToken
  );

if (
  !ticket ||
  ticket.status === "closed"
) {
  answerSupportCallback(
    "This ticket is closed.",
    true
  );
  return;
}

var callbackMessage =
  tgUpdate.callback_query.message;

if (
  callbackMessage &&
  callbackMessage.message_id
) {
  event.adminMessageId =
    callbackMessage.message_id;
}

if (event.status === "replying") {
  event.status = "waiting";
  saveEvent(event);
}

var pending =
  User.getProp(
    "zs_admin_pending_event",
    ""
  );

if (
  String(pending || "") === eventToken
) {
  User.setProp(
    "zs_admin_pending_event",
    "",
    "string"
  );
}

editEvent(
  event,
  ticket
);

answerSupportCallback(
  "Reply mode cancelled.",
  false
);


