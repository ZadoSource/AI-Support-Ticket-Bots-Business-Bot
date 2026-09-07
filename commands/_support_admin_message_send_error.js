/*CMD
  command: /support_admin_message_send_error
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

event.adminSendFailed = true;
saveEvent(event);
