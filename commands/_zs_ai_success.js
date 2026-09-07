/*CMD
  command: /zs_ai_success
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



function failAi(
  type,
  errorDetails
) {
  var wasSuperseded =
    event.status ===
    "superseded";

  notifyAdminAiIssue(
    type,
    statusCode,
    errorDetails
  );

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
          "A newer support message was received, so this previous AI request is no longer active.",

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
}



if (
  !statusCode ||
  statusCode < 200 ||
  statusCode >= 300
) {
  failAi(
    classifyAiIssue(
      statusCode,
      details,
      false
    ),
    details
  );

  return;
}



if (
  !data ||
  typeof data !== "object"
) {
  failAi(
    "request",
    "Invalid JSON response from ZadoSource AI."
  );

  return;
}



if (
  data.success === false
) {
  failAi(
    classifyAiIssue(
      statusCode,
      details,
      false
    ),
    details
  );

  return;
}


var answer =
  cleanAi(
    data.data &&
    data.data.answer
      ? data.data.answer
      : ""
  );

var conversationId =
  data.meta &&
  data.meta.conv_id
    ? String(
        data.meta.conv_id
      )
    : String(
        ticket.conversationId ||
        ""
      );

var wasSuperseded =
  event.status ===
  "superseded";

var answered =
  !isNoAnswer(
    answer
  );



event.aiAnswered =
  answered;

event.aiFailed =
  false;

event.aiAnswer =
  answered
    ? answer
    : "";

if (!wasSuperseded) {
  event.status =
    "waiting";

  ticket.activeEventToken =
    event.token;
}

if (conversationId) {
  ticket.conversationId =
    conversationId;
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



if (answered) {
  if (
    event.processingMessageId
  ) {
    Api.editMessageText({
      chat_id:
        ticket.userTelegramId,

      message_id:
        event.processingMessageId,

      text:
        "🤖 <b>AI Support Ticket Bot</b>\n\n" +
        esc(
          clip(
            answer,
            3400
          )
        ) +
        "\n\n" +
        "<i>Your message and the AI response have also been sent to human support.</i>",

      parse_mode:
        "HTML",

      reply_markup: {
        inline_keyboard: [
          [
            {
              text:
                "Powered by ZadoSource AI",

              url:
                "https://ai.zadosource.com/"
            }
          ]
        ]
      }
    });
  } else {
    sendCustomerAiAnswer(
      ticket,
      answer
    );
  }
}


else {
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
        "AI did not have a useful answer for this message.\n\n" +
        "Your message has been sent to human support and an administrator can reply here.",

      parse_mode:
        "HTML"
    });
  } else {
    sendCustomerHumanFallback(
      ticket,
      false
    );
  }
}


sendAdminEvent(
  ticket,
  event
);

return;
