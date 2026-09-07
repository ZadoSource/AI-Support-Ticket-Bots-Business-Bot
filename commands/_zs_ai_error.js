/*CMD
  command: /zs_ai_error
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

var hasHttpContext =
  typeof http_status !== "undefined" ||
  typeof content !== "undefined" ||
  typeof http_headers !== "undefined";

if (!hasHttpContext) {
  return;
}

var eventToken =
  String(
    params || ""
  ).trim();

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
  event.status !== "processing" &&
  event.status !== "superseded"
) {
  return;
}


var statusCode =
  typeof http_status !== "undefined"
    ? Number(
        http_status || 0
      )
    : 0;

var rawContent =
  typeof content !== "undefined"
    ? String(
        content || ""
      )
    : "";

var data =
  parseJsonSafe(
    rawContent
  );

var details =
  apiErrorText(
    data,
    rawContent
  );

if (!details) {
  details =
    "ZadoSource AI request failed without a response body.";
}


var issueType =
  classifyAiIssue(
    statusCode,
    details,
    true
  );

notifyAdminAiIssue(
  issueType,
  statusCode,
  details
);



var wasSuperseded =
  event.status ===
  "superseded";

event.aiAnswered =
  false;

event.aiFailed =
  true;

event.aiAnswer =
  "";

if (!wasSuperseded) {
  event.status =
    "waiting";

  ticket.activeEventToken =
    event.token;
}

saveEvent(
  event
);

saveTicket(
  ticket
);



if (wasSuperseded) {
  if (
    event.processingMessageId
  ) {
    Api.editMessageText({
      chat_id:
        ticket.userTelegramId,

      message_id:
        event.processingMessageId,

      text:
        "☑️ <b>Previous message</b>\n\n" +
        "A newer support message was received.",

      parse_mode:
        "HTML"
    });
  }

  sendAdminEvent(
    ticket,
    event
  );

  return;
}



if (
  event.processingMessageId
) {
  Api.editMessageText({
    chat_id:
      ticket.userTelegramId,

    message_id:
      event.processingMessageId,

    text:
      "👨‍💻 <b>Human Support</b>\n\n" +
      "AI could not process this message at the moment.\n\n" +
      "Your message has been sent to human support and an administrator can reply here.",

    parse_mode:
      "HTML"
  });
} else {
  sendCustomerHumanFallback(
    ticket,
    true
  );
}


sendAdminEvent(
  ticket,
  event
);

return;
