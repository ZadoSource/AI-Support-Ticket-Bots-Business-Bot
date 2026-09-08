/*CMD
  command: @
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

function zsConfig() {
  var raw = Bot.getProp("zs_support_config", {});
  raw = raw && typeof raw === "object" ? raw : {};

  return {
    apiUrl: String(raw.apiUrl || "https://api.zadosource.com/v1/ai/chat"),
    apiKey: String(raw.apiKey || ""),
    trainKey: String(raw.trainKey || ""),
    adminTelegramId: Number(raw.adminTelegramId || 0),
    queryMax: Number(raw.queryMax || 0)
  };
}

function configReady() {
  var cfg = zsConfig();

  return Boolean(
    cfg.apiKey &&
    cfg.trainKey &&
    cfg.adminTelegramId &&
    Number.isFinite(cfg.queryMax) &&
    cfg.queryMax > 0
  );
}

function isSupportAdmin() {
  var cfg = zsConfig();

  return Boolean(
    user &&
    cfg.adminTelegramId &&
    String(user.telegramid) === String(cfg.adminTelegramId)
  );
}

function esc(value) {
  return String(value === null || value === undefined ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function cleanAi(value) {
  return String(value === null || value === undefined ? "" : value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<p[^>]*>/gi, "")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/?(ul|ol)[^>]*>/gi, "")
    .replace(/<\/?(strong|b|em|i|code|pre)[^>]*>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .trim();
}

function clip(value, maxLength) {
  var text = String(value === null || value === undefined ? "" : value);
  var max = Number(maxLength || 0);

  if (!max || text.length <= max) {
    return text;
  }

  if (max <= 3) {
    return text.slice(0, max);
  }

  return text.slice(0, max - 3) + "...";
}

function nowIso() {
  return new Date().toISOString();
}

function makeToken() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 10)
  );
}

function makeTicketId(telegramId) {
  var id = String(telegramId || "");

  return (
    "SUP-" +
    id.slice(-4) +
    "-" +
    Date.now().toString(36).toUpperCase()
  );
}

function getTicket(token) {
  if (!token) {
    return null;
  }

  return Bot.getProp("zs_support_ticket:" + token, null);
}

function saveTicket(ticket) {
  if (!ticket || !ticket.token) {
    return;
  }

  Bot.setProp(
    "zs_support_ticket:" + ticket.token,
    ticket,
    "json"
  );
}

function getEvent(token) {
  if (!token) {
    return null;
  }

  return Bot.getProp("zs_support_event:" + token, null);
}

function saveEvent(event) {
  if (!event || !event.token) {
    return;
  }

  Bot.setProp(
    "zs_support_event:" + event.token,
    event,
    "json"
  );
}

function getUserPropByTelegramId(name, telegramId, defaultValue) {
  var value = Bot.getProp({
    name: name,
    user_telegramid: Number(telegramId)
  });

  return value === null || value === undefined
    ? defaultValue
    : value;
}

function setUserPropByTelegramId(name, telegramId, value, type) {
  var data = {
    name: name,
    value: value,
    user_telegramid: Number(telegramId)
  };

  if (type) {
    data.type = type;
  }

  Bot.setProp(data);
}

function customerIdentity(ticket) {
  var text =
    "👤 <b>" +
    esc(ticket.name || "Customer") +
    "</b>";

  if (ticket.username) {
    text += "\n@" + esc(ticket.username);
  }

  text +=
    "\n<code>" +
    esc(ticket.userTelegramId) +
    "</code>";

  return text;
}

function eventAiText(event) {
  var text = "";

  if (event.aiAnswered) {
    text =
      "🤖 <b>ZadoSource AI answered</b>\n" +
      esc(clip(event.aiAnswer || "", 1300));
  } else if (event.aiFailed) {
    text =
      "🤖 <b>AI unavailable</b>\n" +
      "Human response required.";
  } else {
    text =
      "🤖 <b>AI had no answer</b>\n" +
      "Human response required.";
  }

  if (event.hasAttachment) {
    text +=
      "\n\n📎 " +
      (
        event.attachmentForwardFailed
          ? "Attachment forwarding failed."
          : "Attachment forwarded to support."
      );
  }

  return text;
}

function eventView(ticket, event) {
  var text = "";
  var keyboard = [];

  if (event.status === "replying") {
    text =
      "🎫 <b>" +
      esc(ticket.ticketId) +
      "</b>\n" +
      "🟢 Open\n\n" +
      customerIdentity(ticket) +
      "\n\n" +
      "💬 <b>Customer message</b>\n" +
      esc(clip(event.customerMessage || "", 1400)) +
      "\n\n" +
      "✍️ <b>Reply mode active</b>\n" +
      "Send your next text message to reply to this customer.";

    keyboard = [
      [
        {
          text: "Cancel",
          callback_data: "/support_cancel_reply " + event.token
        },
        {
          text: "Close Ticket",
          callback_data: "/support_close " + event.token
        }
      ]
    ];
  } else if (event.status === "delivering") {
    text =
      "🎫 <b>" +
      esc(ticket.ticketId) +
      "</b>\n" +
      "🟢 Open\n\n" +
      customerIdentity(ticket) +
      "\n\n" +
      "💬 <b>Customer message</b>\n" +
      esc(clip(event.customerMessage || "", 1200)) +
      "\n\n" +
      "📤 <b>Sending your reply…</b>\n" +
      esc(clip(event.pendingAdminReply || "", 1200));
  } else if (event.status === "replied") {
    text =
      "🎫 <b>" +
      esc(ticket.ticketId) +
      "</b>\n" +
      "✅ Replied\n\n" +
      customerIdentity(ticket) +
      "\n\n" +
      "💬 <b>Customer</b>\n" +
      esc(clip(event.customerMessage || "", 1200)) +
      "\n\n" +
      "👨‍💻 <b>Your reply</b>\n" +
      esc(clip(event.adminReply || "", 1200));
  } else if (event.status === "superseded") {
    text =
      "🎫 <b>" +
      esc(ticket.ticketId) +
      "</b>\n" +
      "☑️ Previous message\n\n" +
      customerIdentity(ticket) +
      "\n\n" +
      "💬 <b>Customer</b>\n" +
      esc(clip(event.customerMessage || "", 1500)) +
      "\n\n" +
      "A newer customer message was received.";
  } else if (event.status === "closed") {
    text =
      "🎫 <b>" +
      esc(ticket.ticketId) +
      "</b>\n" +
      "✅ Ticket closed\n\n" +
      customerIdentity(ticket) +
      "\n\n" +
      "💬 <b>Customer</b>\n" +
      esc(clip(event.customerMessage || "", 1400));

    if (event.adminReply) {
      text +=
        "\n\n👨‍💻 <b>Your reply</b>\n" +
        esc(clip(event.adminReply || "", 1200));
    }
  } else {
    text =
      "🎫 <b>" +
      esc(ticket.ticketId) +
      "</b>\n" +
      "🟢 Open\n\n" +
      customerIdentity(ticket) +
      "\n\n" +
      "💬 <b>New customer message</b>\n" +
      esc(clip(event.customerMessage || "", 1400)) +
      "\n\n" +
      eventAiText(event);

    keyboard = [
      [
        {
          text: event.aiAnswered ? "Reply Anyway" : "Reply",
          callback_data: "/support_reply " + event.token
        },
        {
          text: "Close Ticket",
          callback_data: "/support_close " + event.token
        }
      ]
    ];
  }

  return {
    text: clip(text, 4000),
    keyboard: keyboard
  };
}

function editEvent(event, ticket) {
  var cfg = zsConfig();

  if (
    !cfg.adminTelegramId ||
    !event ||
    !ticket ||
    !event.adminMessageId
  ) {
    return;
  }

  var view = eventView(ticket, event);

  Api.editMessageText({
    chat_id: cfg.adminTelegramId,
    message_id: event.adminMessageId,
    text: view.text,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: view.keyboard
    }
  });
}

function sendAdminEvent(ticket, event) {
  var cfg = zsConfig();

  if (!cfg.adminTelegramId || !ticket || !event) {
    return;
  }

  if (event.adminMessageId) {
    editEvent(event, ticket);
    return;
  }

  var view = eventView(ticket, event);

  Api.sendMessage({
    chat_id: cfg.adminTelegramId,
    text: view.text,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: view.keyboard
    },
    on_result: "/support_admin_message_sent",
    on_error: "/support_admin_message_send_error",
    bb_options: {
      eventToken: event.token
    }
  });
}

function retirePreviousEvent(ticket) {
  if (!ticket || !ticket.activeEventToken) {
    return;
  }

  var previousToken =
    String(ticket.activeEventToken || "");

  var previous =
    getEvent(previousToken);

  if (!previous) {
    ticket.activeEventToken = "";
    saveTicket(ticket);
    return;
  }

  if (previous.status === "replying") {
    ticket.activeEventToken = "";
    saveTicket(ticket);
    return;
  }
  if (
    previous.status === "processing" ||
    previous.status === "waiting"
  ) {
    previous.status = "superseded";
    previous.pendingAdminReply = "";

    saveEvent(previous);

    if (previous.adminMessageId) {
      editEvent(previous, ticket);
    }
  }

  ticket.activeEventToken = "";
  saveTicket(ticket);
}

function configurationMessage(chatId) {
  Api.sendMessage({
    chat_id: chatId,
    text:
      "⚙️ <b>AI Support Ticket Bot setup required</b>\n\n" +
      "The Bots.Business bot property <code>zs_support_config</code> is missing or invalid.\n\n" +
      "Run the one-time <code>/setup_support</code> command after filling in:\n" +
      "• ZadoSource API Key\n" +
      "• ZadoSource AI Training Key\n" +
      "• Support admin Telegram ID\n" +
      "• Query maximum\n\n" +
      "Then delete or disable the setup command.",
    parse_mode: "HTML",
    disable_web_page_preview: true
  });
}

function parseJsonSafe(raw) {
  var text = String(raw === null || raw === undefined ? "" : raw).trim();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
}

function apiErrorText(data, raw) {
  var value = "";

  if (data && typeof data === "object") {
    value =
      data.message ||
      (data.error && data.error.message) ||
      data.error ||
      data.detail ||
      "";
  }

  if (!value) {
    value = raw || "";
  }

  if (value && typeof value === "object") {
    try {
      value = JSON.stringify(value);
    } catch (e) {
      value = "Unknown API error";
    }
  }

  return cleanAi(String(value || ""));
}

function classifyAiIssue(status, details, transportError) {
  var code = Number(status || 0);
  var lower = String(details || "").toLowerCase();

  if (transportError && !code) {
    return lower.indexOf("timeout") >= 0 ||
      lower.indexOf("timed out") >= 0
      ? "timeout"
      : "connection";
  }

  if (code === 401) {
    return "api_key";
  }

  if (code === 403) {
    return "training_key";
  }

  if (code === 429) {
    return "rate_limit";
  }

  if (code === 500 || code === 502 || code === 503) {
    return "service";
  }

  if (code === 504) {
    return "timeout";
  }

  if (code === 400) {
    if (
      lower.indexOf("ai_train") >= 0 ||
      lower.indexOf("training key") >= 0 ||
      lower.indexOf("train key") >= 0 ||
      lower.indexOf("ai key") >= 0
    ) {
      return "training_key";
    }

    return "bad_request";
  }

  if (
    lower.indexOf("api key") >= 0 ||
    lower.indexOf("unauthorized") >= 0 ||
    lower.indexOf("authentication") >= 0
  ) {
    return "api_key";
  }

  if (
    lower.indexOf("ai_train") >= 0 ||
    lower.indexOf("training key") >= 0 ||
    lower.indexOf("train key") >= 0 ||
    lower.indexOf("ai key") >= 0
  ) {
    return "training_key";
  }

  if (
    lower.indexOf("limit") >= 0 ||
    lower.indexOf("rate") >= 0
  ) {
    return "rate_limit";
  }

  return transportError ? "connection" : "request";
}

function shouldSendAiAlert(signature) {
  var alerts = Bot.getProp("zs_ai_alerts", {});
  alerts = alerts && typeof alerts === "object" ? alerts : {};

  var last = Number(alerts[signature] || 0);
  var now = Date.now();

  if (last && now - last < 300000) {
    return false;
  }

  alerts[signature] = now;
  Bot.setProp("zs_ai_alerts", alerts, "json");

  return true;
}

function notifyAdminAiIssue(type, status, details) {
  var cfg = zsConfig();

  if (!cfg.adminTelegramId) {
    return;
  }

  var signature =
    String(type || "request") +
    ":" +
    String(status || 0);

  if (!shouldSendAiAlert(signature)) {
    return;
  }

  var problem = "";
  var resolution = "";

  if (type === "api_key") {
    problem =
      "The ZadoSource AI API rejected the API Key.";

    resolution =
      "Open ZadoSource AI → Profile → API Key, create or copy a valid key, then update <code>zs_support_config.apiKey</code>.";
  } else if (type === "training_key") {
    problem =
      "ZadoSource AI rejected the configured AI Training Key.";

    resolution =
      "Open ZadoSource AI → Profile → AI Keys, verify the key and training data, then update <code>zs_support_config.trainKey</code>.";
  } else if (type === "bad_request") {
    problem =
      "ZadoSource AI rejected one or more request values.";

    resolution =
      "Verify the training key, query size, request body, and ZadoSource account configuration.";
  } else if (type === "rate_limit") {
    problem =
      "The ZadoSource AI account reached a request or plan limit.";

    resolution =
      "Review ZadoSource AI usage and plan limits, then retry after the applicable limit resets.";
  } else if (type === "service") {
    problem =
      "The ZadoSource AI service is temporarily unavailable.";

    resolution =
      "Human support will continue receiving messages. Retry later if the issue persists.";
  } else if (type === "timeout") {
    problem =
      "The ZadoSource AI request timed out.";

    resolution =
      "Human support will continue receiving messages. Retry later if timeouts continue.";
  } else if (type === "connection") {
    problem =
      "The bot could not connect to the ZadoSource AI API.";

    resolution =
      "Check the endpoint and outbound connectivity, then retry.";
  } else {
    problem =
      "ZadoSource AI could not process the request.";

    resolution =
      "Verify the ZadoSource keys, training data, query limit, and API endpoint.";
  }

  var diagnostic = "";

  if (status) {
    diagnostic +=
      "\n\n<b>HTTP Status</b>\n<code>" +
      esc(status) +
      "</code>";
  }

  if (details) {
    diagnostic +=
      "\n\n<b>API Response</b>\n<code>" +
      esc(clip(details, 1000)) +
      "</code>";
  }

  Api.sendMessage({
    chat_id: cfg.adminTelegramId,
    text:
      "⚠️ <b>AI Support Configuration Alert</b>\n\n" +
      "<b>Problem</b>\n" +
      problem +
      diagnostic +
      "\n\n<b>How to resolve it</b>\n" +
      resolution +
      "\n\n<b>Need assistance?</b>\n" +
      "Email: help@zadosource.com\n" +
      "Telegram: @ZadoSourceAssistant",
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Open ZadoSource AI",
            url: "https://ai.zadosource.com/"
          }
        ],
        [
          {
            text: "Telegram Support",
            url: "https://t.me/ZadoSourceAssistant"
          }
        ]
      ]
    }
  });
}

function isNoAnswer(answer) {
  var lower = String(answer || "").toLowerCase().trim();

  return Boolean(
    !answer ||
    answer.length < 2 ||
    lower === "no_answer" ||
    lower === "no answer" ||
    lower === "unknown" ||
    lower === "i don't know" ||
    lower === "i do not know" ||
    lower.indexOf("i don't have enough information") >= 0 ||
    lower.indexOf("i do not have enough information") >= 0 ||
    lower.indexOf("unable to answer based on") >= 0 ||
    lower.indexOf("cannot answer based on") >= 0 ||
    lower.indexOf("not enough information") >= 0
  );
}

function sendCustomerAiAnswer(ticket, answer) {
  Api.sendMessage({
    chat_id: ticket.userTelegramId,
    text:
      "🤖 <b>AI Support Ticket Bot</b>\n\n" +
      esc(clip(answer, 3400)) +
      "\n\n" +
      "<i>Your message and the AI response have also been sent to human support.</i>",
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Powered by ZadoSource AI",
            url: "https://ai.zadosource.com/"
          }
        ]
      ]
    }
  });
}

function sendCustomerHumanFallback(ticket, aiFailed) {
  var text = aiFailed
    ? "AI could not process this message at the moment."
    : "AI did not have a useful answer for this message.";

  Api.sendMessage({
    chat_id: ticket.userTelegramId,
    text:
      "👨‍💻 <b>Human Support</b>\n\n" +
      text +
      "\n\n" +
      "Your message has been sent to human support and an administrator can reply here.",
    parse_mode: "HTML"
  });
}

function finishAiFailure(event, ticket, type, status, details) {
  var wasSuperseded = event.status === "superseded";

  notifyAdminAiIssue(type, status, details);

  event.aiAnswered = false;
  event.aiFailed = true;
  event.aiAnswer = "";

  if (!wasSuperseded) {
    event.status = "waiting";
    ticket.activeEventToken = event.token;
  }

  saveEvent(event);
  saveTicket(ticket);

  if (!wasSuperseded) {
    sendCustomerHumanFallback(ticket, true);
  }

  sendAdminEvent(ticket, event);
}

function completeAiHttp(eventToken, status, rawContent, transportError) {
  var event = getEvent(eventToken);

  if (!event) {
    return;
  }

  var ticket = getTicket(event.ticketToken);

  if (!ticket || ticket.status === "closed") {
    return;
  }

  if (
    event.status !== "processing" &&
    event.status !== "superseded"
  ) {
    return;
  }

  var statusCode = Number(status || 0);
  var data = parseJsonSafe(rawContent);
  var details = apiErrorText(data, rawContent);

  if (
    transportError ||
    !statusCode ||
    statusCode < 200 ||
    statusCode >= 300
  ) {
    finishAiFailure(
      event,
      ticket,
      classifyAiIssue(
        statusCode,
        details,
        Boolean(transportError)
      ),
      statusCode,
      details
    );

    return;
  }

  if (!data || typeof data !== "object") {
    finishAiFailure(
      event,
      ticket,
      "request",
      statusCode,
      details || "Invalid JSON response from ZadoSource AI."
    );

    return;
  }

  if (data.success === false) {
    finishAiFailure(
      event,
      ticket,
      classifyAiIssue(statusCode, details, false),
      statusCode,
      details
    );

    return;
  }

  var answer = cleanAi(
    data.data && data.data.answer
      ? data.data.answer
      : ""
  );

  var conversationId =
    data.meta && data.meta.conv_id
      ? String(data.meta.conv_id)
      : String(ticket.conversationId || "");

  var wasSuperseded = event.status === "superseded";
  var answered = !isNoAnswer(answer);

  event.aiAnswered = answered;
  event.aiFailed = false;
  event.aiAnswer = answered ? answer : "";

  if (!wasSuperseded) {
    event.status = "waiting";
    ticket.activeEventToken = event.token;
  }

  if (conversationId) {
    ticket.conversationId = conversationId;
  }

  saveEvent(event);
  saveTicket(ticket);

  if (!wasSuperseded) {
    if (answered) {
      sendCustomerAiAnswer(ticket, answer);
    } else {
      sendCustomerHumanFallback(ticket, false);
    }
  }

  sendAdminEvent(ticket, event);
}

function startAiRequest(
  ticket,
  event,
  customerText
) {
  var cfg =
    zsConfig();

  if (
    !cfg.apiUrl ||
    !cfg.apiKey ||
    !cfg.trainKey
  ) {
    finishAiFailure(
      event,
      ticket,
      "configuration",
      0,
      "Missing ZadoSource configuration"
    );

    return;
  }

  var query =
    clip(
      String(customerText || ""),
      Number(cfg.queryMax || 500)
    );

  if (!query) {
    finishAiFailure(
      event,
      ticket,
      "bad_request",
      0,
      "Empty AI query"
    );

    return;
  }

  var body = {
    ai_train_key:
      String(cfg.trainKey),

    query:
      query
  };


  // Add previous conversation only when available
  if (ticket.conversationId) {
    body.conversation_id =
      String(ticket.conversationId);
  }


HTTP.post({
  url:
    cfg.apiUrl,

    headers: {
      "Authorization":
        "Bearer " +
        String(cfg.apiKey),

      "Content-Type":
        "application/json"
    },

    body:
      body,

    success:
      "/zs_ai_success " +
      event.token,

    error:
      "/zs_ai_error " +
      event.token,

    background:
      true
  });
}

function answerSupportCallback(text, showAlert) {
  if (
    !tgUpdate ||
    !tgUpdate.callback_query ||
    !tgUpdate.callback_query.id
  ) {
    return;
  }

  Api.answerCallbackQuery({
    callback_query_id: tgUpdate.callback_query.id,
    text: text || "",
    show_alert: Boolean(showAlert)
  });
}
