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
    String(options.eventToken);
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

event.status = "replying";
saveEvent(event);

var cfg = zsConfig();

if (cfg.adminTelegramId) {
  setUserPropByTelegramId(
    "zs_admin_pending_event",
    cfg.adminTelegramId,
    eventToken,
    "string"
  );

  Api.sendMessage({
    chat_id: cfg.adminTelegramId,
    text:
      "⚠️ <b>The reply could not be delivered to the customer.</b>\n\n" +
      "Reply mode has been restored. Send the message again or close the ticket.",
    parse_mode: "HTML"
  });
}

editEvent(
  event,
  ticket
);


