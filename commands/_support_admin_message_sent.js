/*CMD
  command: /support_admin_message_sent
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

if (!eventToken) {
  return;
}

var event =
  getEvent(eventToken);

if (!event) {
  return;
}

if (
  options.ok &&
  options.result &&
  options.result.message_id
) {
  event.adminMessageId =
    options.result.message_id;

  saveEvent(event);
}
