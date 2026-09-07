/*CMD
  command: /support_attachment_forward_error
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

if (!options || !options.bb_options) {
  return;
}

var eventToken =
  String(
    options.bb_options.eventToken || ""
  );

var event =
  getEvent(eventToken);

if (!event) {
  return;
}

event.attachmentForwardFailed = true;
event.customerMessage =
  "Attachment sent (Telegram forwarding failed)";
saveEvent(event);

var ticket =
  getTicket(
    event.ticketToken
  );

if (ticket) {
  editEvent(
    event,
    ticket
  );
}
