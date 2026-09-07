/*CMD
  command: /support_admin_reply_delivered
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

if (event.status !== "delivering") {
  return;
}

if (
  !options.ok ||
  !options.result ||
  !options.result.message_id
) {
  return;
}

event.status = "replied";
event.adminReply =
  event.pendingAdminReply || "";
event.pendingAdminReply = "";
event.repliedAt = nowIso();

ticket.lastHumanReply =
  event.adminReply;
ticket.lastHumanReplyAt =
  event.repliedAt;

if (
  String(ticket.activeEventToken || "") ===
  event.token
) {
  ticket.activeEventToken = "";
}

saveEvent(event);
saveTicket(ticket);

editEvent(
  event,
  ticket
);
