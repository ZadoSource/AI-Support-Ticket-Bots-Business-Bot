/*CMD
  command: *
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
  !tgUpdate.message
) {
  return;
}

if (chat.chat_type !== "private") {
  return;
}

if (!configReady()) {
  configurationMessage(chat.chatid);
  return;
}

var tgMessage = tgUpdate.message;

var customerOrAdminText =
  String(
    tgMessage.text ||
    tgMessage.caption ||
    message ||
    ""
  ).trim();


if (isSupportAdmin()) {
  if (!customerOrAdminText) {
    return;
  }

  if (
    customerOrAdminText.charAt(0) === "/"
  ) {
    return;
  }

  var pendingEventToken =
    User.getProp(
      "zs_admin_pending_event",
      ""
    );

  if (!pendingEventToken) {
    return;
  }

  var pendingEvent =
    getEvent(
      pendingEventToken
    );

  if (!pendingEvent) {
    User.setProp(
      "zs_admin_pending_event",
      "",
      "string"
    );

    return;
  }

  var pendingTicket =
    getTicket(
      pendingEvent.ticketToken
    );

  if (
    !pendingTicket ||
    pendingTicket.status === "closed"
  ) {
    User.setProp(
      "zs_admin_pending_event",
      "",
      "string"
    );

    return;
  }

  if (
    pendingEvent.status !== "replying"
  ) {
    User.setProp(
      "zs_admin_pending_event",
      "",
      "string"
    );

    return;
  }

  pendingEvent.status =
    "delivering";

  pendingEvent.pendingAdminReply =
    customerOrAdminText;

  saveEvent(
    pendingEvent
  );

  User.setProp(
    "zs_admin_pending_event",
    "",
    "string"
  );

  editEvent(
    pendingEvent,
    pendingTicket
  );

  Api.sendMessage({
    chat_id:
      pendingTicket.userTelegramId,

    text:
      "👨‍💻 <b>Human Support</b>\n\n" +
      esc(
        clip(
          customerOrAdminText,
          3400
        )
      ),

    parse_mode:
      "HTML",

    on_result:
      "/support_admin_reply_delivered",

    on_error:
      "/support_admin_reply_failed",

    bb_options: {
      eventToken:
        pendingEvent.token
    }
  });

  return;
}


if (
  customerOrAdminText &&
  customerOrAdminText.charAt(0) === "/"
) {
  return;
}


var activeTicketToken =
  User.getProp(
    "zs_active_support_ticket",
    ""
  );

var ticket =
  activeTicketToken
    ? getTicket(activeTicketToken)
    : null;


if (
  !ticket ||
  ticket.status === "closed"
) {
  if (activeTicketToken) {
    User.setProp(
      "zs_active_support_ticket",
      "",
      "string"
    );
  }

  activeTicketToken =
    makeToken();

  ticket = {
    token:
      activeTicketToken,

    ticketId:
      makeTicketId(
        user.telegramid
      ),

    userTelegramId:
      Number(
        user.telegramid
      ),

    userBbId:
      user.id,

    name:
      (
        String(
          user.first_name || ""
        ) +
        " " +
        String(
          user.last_name || ""
        )
      ).trim(),

    username:
      String(
        user.username || ""
      ),

    status:
      "open",

    createdAt:
      nowIso(),

    closedAt:
      "",

    conversationId:
      "",

    lastHumanReply:
      "",

    lastHumanReplyAt:
      "",

    activeEventToken:
      ""
  };

  User.setProp(
    "zs_active_support_ticket",
    activeTicketToken,
    "string"
  );

  saveTicket(
    ticket
  );
}


retirePreviousEvent(
  ticket
);


var eventToken =
  makeToken();

var hasAttachment =
  Boolean(
    tgMessage.photo ||
    tgMessage.document ||
    tgMessage.video ||
    tgMessage.audio ||
    tgMessage.voice ||
    tgMessage.sticker ||
    tgMessage.animation ||
    tgMessage.video_note ||
    tgMessage.contact ||
    tgMessage.location ||
    tgMessage.venue ||
    tgMessage.poll
  );

var event = {
  token:
    eventToken,

  ticketToken:
    ticket.token,

  customerMessage:
    customerOrAdminText ||
    "Attachment sent",

  hasAttachment:
    hasAttachment,

  attachmentForwardFailed:
    false,

  aiAnswered:
    false,

  aiFailed:
    false,

  aiAnswer:
    "",

  status:
    customerOrAdminText
      ? "processing"
      : "waiting",

  createdAt:
    nowIso(),

  adminMessageId:
    null,

  processingMessageId:
    null,

  adminSendFailed:
    false,

  adminReply:
    "",

  pendingAdminReply:
    "",

  repliedAt:
    ""
};

ticket.activeEventToken =
  eventToken;

saveEvent(
  event
);

saveTicket(
  ticket
);



if (hasAttachment) {
  var cfg =
    zsConfig();

  Api.forwardMessage({
    chat_id:
      cfg.adminTelegramId,

    from_chat_id:
      chat.chatid,

    message_id:
      tgMessage.message_id,

    on_error:
      "/support_attachment_forward_error",

    bb_options: {
      eventToken:
        eventToken
    }
  });
}



if (!customerOrAdminText) {
  sendAdminEvent(
    ticket,
    event
  );

  Api.sendMessage({
    chat_id:
      chat.chatid,

    text:
      "📎 <b>Attachment received</b>\n\n" +
      "It has been forwarded to human support under ticket <code>" +
      esc(ticket.ticketId) +
      "</code>.\n\n" +
      "You can send a text explanation in your next message.",

    parse_mode:
      "HTML"
  });

  return;
}



Api.sendChatAction({
  chat_id:
    chat.chatid,

  action:
    "typing"
});

Api.sendMessage({
  chat_id:
    chat.chatid,

  text:
    "🧠 <b>AI is reviewing your message…</b>\n\n" +
    "<i>Please wait while ZadoSource AI processes your request.</i>",

  parse_mode:
    "HTML",

  on_result:
    "/support_processing_sent",

  on_error:
    "/support_processing_error",

  bb_options: {
    eventToken:
      event.token
  }
});

return;
