/*CMD
  command: /support_reply
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

if (event.status !== "waiting") {
  answerSupportCallback(
    "This customer message is no longer waiting for a reply.",
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

var currentPending =
  User.getProp(
    "zs_admin_pending_event",
    ""
  );

if (
  currentPending &&
  String(currentPending) !== eventToken
) {
  var oldEvent =
    getEvent(currentPending);

  if (
    oldEvent &&
    oldEvent.status === "replying"
  ) {
    oldEvent.status = "waiting";
    saveEvent(oldEvent);

    var oldTicket =
      getTicket(
        oldEvent.ticketToken
      );

    if (oldTicket) {
      editEvent(
        oldEvent,
        oldTicket
      );
    }
  }
}

event.status = "replying";
saveEvent(event);

User.setProp(
  "zs_admin_pending_event",
  eventToken,
  "string"
);

editEvent(
  event,
  ticket
);

answerSupportCallback(
  "Reply mode enabled.",
  false
);
