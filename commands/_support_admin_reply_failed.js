/*CMD
  command: /support_admin_reply_failed
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

var eventToken = "";

if (
  options &&
  options.eventToken
) {
  eventToken =
    String(
      options.eventToken
    );
} else if (
  options &&
  options.bb_options &&
  options.bb_options.eventToken
) {
  eventToken =
    String(
      options.bb_options.eventToken
    );
}

if (!eventToken) {
  return;
}


var event =
  getEvent(eventToken);

if (!event) {
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
  return;
}

  
if (
  event.status !== "delivering"
) {
  return;
}


var cfg =
  zsConfig();

if (!cfg.adminTelegramId) {
  return;
}

var failedReply =
  String(
    event.pendingAdminReply || ""
  );


var currentPending =
  getUserPropByTelegramId(
    "zs_admin_pending_event",
    cfg.adminTelegramId,
    ""
  );

currentPending =
  String(currentPending || "");


var otherReplyIsActive = false;

if (
  currentPending &&
  currentPending !== eventToken
) {
  var otherEvent =
    getEvent(
      currentPending
    );

  if (
    otherEvent &&
    otherEvent.status === "replying"
  ) {
    var otherTicket =
      getTicket(
        otherEvent.ticketToken
      );

    if (
      otherTicket &&
      otherTicket.status !== "closed"
    ) {
      otherReplyIsActive = true;
    }
  }
}


if (!otherReplyIsActive) {
  event.status =
    "replying";

  saveEvent(event);

  setUserPropByTelegramId(
    "zs_admin_pending_event",
    cfg.adminTelegramId,
    eventToken,
    "string"
  );

  Api.sendMessage({
    chat_id:
      cfg.adminTelegramId,

    text:
      "⚠️ <b>The reply could not be delivered to the customer.</b>\n\n" +
      "Ticket: <code>" +
      esc(ticket.ticketId) +
      "</code>\n\n" +
      "Reply mode has been restored.\n\n" +
      "Send the message again or close the ticket.",

    parse_mode:
      "HTML"
  });

  editEvent(
    event,
    ticket
  );

  return;
}


event.status =
  "waiting";

event.pendingAdminReply =
  "";

saveEvent(event);

editEvent(
  event,
  ticket
);


var failedText = "";

if (failedReply) {
  failedText =
    "\n\n<b>Failed reply:</b>\n" +
    esc(
      clip(
        failedReply,
        1500
      )
    );
}


Api.sendMessage({
  chat_id:
    cfg.adminTelegramId,

  text:
    "⚠️ <b>A support reply could not be delivered.</b>\n\n" +
    "Ticket: <code>" +
    esc(ticket.ticketId) +
    "</code>\n\n" +
    "You already have reply mode active for another support message, so that newer reply session was kept.\n\n" +
    "Use the <b>Reply</b> button on this ticket if you want to try again." +
    failedText,

  parse_mode:
    "HTML"
});
