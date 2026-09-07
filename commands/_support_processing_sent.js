/*CMD
  command: /support_processing_sent
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
  !options ||
  !options.bb_options
) {
  return;
}

var eventToken =
  String(
    options.bb_options.eventToken ||
    ""
  );

if (!eventToken) {
  return;
}

var event =
  getEvent(
    eventToken
  );

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
  event.status !== "processing"
) {
  return;
}



if (
  options.ok &&
  options.result &&
  options.result.message_id
) {
  event.processingMessageId =
    options.result.message_id;

  saveEvent(
    event
  );
}


startAiRequest(
  ticket,
  event,
  event.customerMessage
);

return;
