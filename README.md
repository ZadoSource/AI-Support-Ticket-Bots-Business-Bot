# AI Support Ticket Bot

A complete **AI + human customer-support workflow** for the **Bots.Business** platform, powered by **ZadoSource AI**.

This bot demonstrates how a Telegram support bot can automatically answer customer questions using a trained AI assistant while allowing a human administrator to monitor conversations, reply manually, manage tickets, receive attachments, and take over whenever AI cannot provide a suitable answer.


![AI Support Ticket Bot](https://cdn.zadosource.com/uploads/codes/thumbnails/6a9d786863544_1788704872.png)

---

## Features

- AI-powered customer replies through ZadoSource AI
- Human administrator support
- Every customer request visible to the administrator
- AI response shown to the administrator
- Human fallback when AI cannot answer
- Unique support ticket IDs
- One active ticket per customer
- Same ticket ID throughout an active conversation
- Admin Reply workflow
- Close Ticket workflow
- AI conversation continuity
- New AI conversation after ticket closure
- Attachment forwarding
- API authentication error handling
- AI Training Key/access error handling
- Rate-limit handling
- Timeout handling
- Service-error handling
- AI-to-human support escalation

---

## Important Requirements

This bot uses **ZadoSource AI as an external AI service**.

Before AI-powered replies can work, you must:

1. Create a ZadoSource account.
2. Create a ZadoSource AI assistant.
3. Train the assistant with your business or support information.
4. Obtain your ZadoSource API Key.
5. Obtain the AI Training Key for your assistant.
6. Know the numeric Telegram user ID of the support administrator.
7. Run `/setup_support` inside the bot.

> [!IMPORTANT]
> A separate ZadoSource account is required.
>
> Installing this Bots.Business demo does **not** automatically create a ZadoSource account or AI assistant.

---

## Quick Start

```text
1. Install the bot in Bots.Business
2. Create an account at ai.zadosource.com
3. Create and train a ZadoSource AI assistant
4. Get your ZadoSource API Key
5. Get your AI Training Key
6. Get your support admin Telegram ID
7. Run /setup_support
8. Complete configuration
9. Send a test customer message
10. Test Reply + Close Ticket
```

---

## Setup

This demo uses **ZadoSource AI as an external AI service**.

A separate ZadoSource account and trained ZadoSource AI assistant are required.

### 1. Create Your ZadoSource AI

Visit:

[https://ai.zadosource.com/](https://ai.zadosource.com/)

Create an account, create and train an AI assistant, then obtain:

- ZadoSource API Key
- ZadoSource AI Training Key

### 2. Configure `/setup_support`

After installing the bot in Bots.Business, open the `/setup_support` command in the Bots.Business editor.

At the top of the command, configure the setup object:

```js
var setup = {
  apiUrl: "https://api.zadosource.com/v1/ai/chat",
  apiKey: "PUT_YOUR_API_KEY_HERE",
  trainKey: "PUT_YOUR_TRAIN_KEY_HERE",
  adminTelegramId: 123456789,
  queryMax: 500
};

```

Replace:

- `PUT_YOUR_API_KEY_HERE` with your ZadoSource API Key
- `PUT_YOUR_TRAIN_KEY_HERE` with your ZadoSource AI Training Key
- `123456789` with the numeric Telegram ID of the support administrator

Save the command.

### 3. Run `/setup_support`

From the Telegram account configured as `adminTelegramId`, run:

```text
/setup_support

```

The command creates the bot configuration used by the rest of the project:

```text
zs_support_config

```

The bot reads its ZadoSource and support configuration from this property.

### 4. Remove the Setup Command

After setup is completed successfully, delete or disable `/setup_support` so credentials are not left inside an executable setup command.

> **Important:** Do not publish real API credentials in your GitHub repository or Bots.Business demo source.

---

## Create Your ZadoSource AI

### 1. Create a ZadoSource Account

Visit:

**https://ai.zadosource.com/**

Create a new account or sign in.

### 2. Create an AI Assistant

Create an AI assistant for your:

- Business
- Service
- Product
- Community
- Store
- Project
- Support team
- Knowledge base
- Other use case

### 3. Train Your AI

Add the information your support assistant should know.

Examples:

- Frequently asked questions
- Product information
- Pricing
- Delivery information
- Refund policies
- Company information
- Support documentation
- Service details
- Instructions
- Knowledge-base content

The quality of the AI responses depends on the information used to train the ZadoSource AI assistant.

### 4. Get Your Credentials

You will need:

```text
ZadoSource API Key
AI Training Key
```

Keep these credentials private.

### 5. Configure the Telegram Bot

Return to your Telegram bot and run:

```text
/setup_support
```

Complete the setup process.

---

## Overview

AI Support Ticket Bot combines automated AI support with a complete human-support workflow for Bots.Business.

Instead of being a simple example that only sends a prompt to an AI API, this project demonstrates a practical support system containing:

- AI responses
- Human fallback
- Ticket management
- Conversation continuity
- Admin monitoring
- Manual replies
- Attachment support
- Error handling
- Ticket closing
- AI conversation lifecycle management

---

## Support Flow

```text
Customer sends a message
        |
        v
ZadoSource AI processes it
        |
        v
+-------------------------+
| Does AI have an answer? |
+-------------------------+
       |             |
      YES            NO
       |             |
       v             v
 AI replies       Human support
 to customer      fallback
       |             |
       +------+------+
              |
              v
Human admin receives the request
              |
              v
Admin can reply manually
              |
              v
Same ticket remains open
              |
              v
Customer sends another message
              |
              v
New admin notification
Same ticket ID
              |
              v
Admin closes ticket
              |
              v
Ticket + AI conversation end
              |
              v
Next request creates a new ticket
```

---

## Main Message Handler

The main message handler is responsible for:

- Detecting customer messages
- Detecting administrator reply mode
- Forwarding administrator replies to customers
- Creating new tickets when required
- Loading existing active tickets
- Processing customer messages with ZadoSource AI
- Maintaining AI conversation context
- Sending AI replies
- Triggering human fallback
- Sending administrator notifications
- Processing supported attachments

---

## AI Integration

The bot uses the **ZadoSource AI Chat API**.

The integration requires:

- ZadoSource API Key
- ZadoSource AI Training Key

The bot also uses the ZadoSource AI `conversation_id` to maintain context during an active support ticket.

This allows follow-up questions to stay in the same AI conversation instead of treating every customer message as unrelated.

---

## AI Conversation Lifecycle

```text
New customer request
        |
        v
New ticket
        |
        v
New ZadoSource AI conversation
        |
        v
Customer continues talking
        |
        v
Same ticket
Same AI conversation
        |
        v
Ticket closed
        |
        v
AI conversation ends
        |
        v
Next request
        |
        v
New ticket
New AI conversation
```

This keeps separate customer-support sessions isolated.

---

## Ticket System

Tickets use a unique format similar to:

```text
SUP-XXX-XXXX
```

Rules:

- One active support ticket per customer
- The ticket remains active throughout the conversation
- New messages do not create unnecessary new tickets
- The same ticket ID is shown to the administrator
- Closing the ticket ends the active support session
- The customer's next request creates a new ticket
- A new AI conversation begins with the new ticket

---

## Admin Notifications

For each new customer request, the support administrator receives information such as:

- Ticket ID
- Ticket status
- Customer username, when available
- Customer Telegram ID
- Customer message
- AI response, when available
- Support actions

Available actions can include:

```text
[Reply]
```

or:

```text
[Reply Anyway]
```

and:

```text
[Close Ticket]
```

---

## Admin Reply Mode

The administrator can manually take over a customer conversation.

Typical flow:

1. Administrator receives a ticket notification.
2. Administrator presses **Reply**.
3. The bot enters reply mode for that customer/ticket.
4. Administrator sends a message.
5. The message is delivered to the customer.
6. The notification is updated where applicable.
7. Reply controls are updated or removed as appropriate.
8. The ticket remains active until it is explicitly closed.

The active administrator reply must remain associated with the selected support conversation.

If the customer sends another message while the administrator is preparing a reply, the administrator's active reply must **not** be silently cancelled.

This prevents newer customer messages from breaking an already active administrator reply workflow.

---

## Human Fallback

AI should assist the support workflow, not prevent customers from reaching a human.

If ZadoSource AI cannot provide a suitable answer, the bot can fall back to the human support administrator.

Fallback can also occur when there is:

- AI service timeout
- Rate limit
- Authentication problem
- Invalid AI Training Key
- Temporary API failure
- Service unavailability

The administrator still receives the customer request and can reply manually.

---

## Attachments

The bot can forward supported customer attachments to the administrator where implemented.

Examples may include:

- Photos
- Documents
- Other supported Telegram attachments

Attachments remain available to the human-support workflow even when the AI service cannot process the content itself.

---

## AI Error Handling

| Error Type | Action |
| --- | --- |
| API Key invalid | Notify administrator / configuration error |
| AI Training Key invalid | Notify administrator / configuration error |
| AI access problem | Notify administrator |
| Rate limit reached | Fall back to human support |
| Request timeout | Fall back to human support |
| Service unavailable | Fall back to human support |
| Temporary API error | Fall back to human support where appropriate |

The customer-support workflow should remain usable even when the external AI service is temporarily unavailable.

---

## Security

Never publish your real ZadoSource credentials.

Keep these values private:

- ZadoSource API Key
- AI Training Key
- Other sensitive integration credentials

If credentials are accidentally exposed, revoke or regenerate them through the appropriate ZadoSource account controls.

Administrator access should be based on the configured numeric Telegram user ID.

Do not use a Telegram username, first name, or display name as an authentication mechanism.

---

## Installation

### 1. Create a Telegram Bot

Create your Telegram bot using **BotFather**.

### 2. Add the Bot to Bots.Business

Create or add the Telegram bot on the Bots.Business platform.

### 3. Install This Demo

Install or import the AI Support Ticket Bot commands.

### 4. Create a ZadoSource Account

Visit:

**https://ai.zadosource.com/**

A ZadoSource account is required for the AI functionality.

### 5. Create and Train Your ZadoSource AI

Create an AI assistant and train it using information your customers may ask about.

### 6. Obtain Your ZadoSource Credentials

Get:

```text
API Key
AI Training Key
```

### 7. Get the Administrator Telegram ID

Get the numeric Telegram ID of the person who should receive and manage support tickets.

### 8. Run Setup

Open the Telegram bot and run:

```text
/setup_support
```

Enter the requested ZadoSource and administrator information.

### 9. Test the Bot

Verify:

- AI processing works
- Customer receives the AI response
- Administrator receives the ticket notification
- Manual Reply works
- A new customer message does not cancel an active admin reply
- Multiple messages stay on the same ticket
- Attachments work
- Human fallback works
- Close Ticket works
- A new ticket is created after closure

### 10. Deploy

Once testing is complete, the support bot is ready to use.

---

## ZadoSource AI

ZadoSource AI provides the external AI service used by this integration.

### Website

https://ai.zadosource.com/

### Documentation

https://docs.zadosource.com/

### Support

```text
@ZadoSourceAssistant
```

Users must create their own ZadoSource account and configure their own AI assistant before using the AI features of this bot.

---

## External Service Notice

This demo depends on the external **ZadoSource AI** service.

Installing the Bots.Business bot alone does not create a ZadoSource account or AI assistant.

```text
Create ZadoSource account
        |
        v
Create AI assistant
        |
        v
Train AI
        |
        v
Get API Key
        |
        v
Get AI Training Key
        |
        v
Run /setup_support
        |
        v
Start using AI support
```

ZadoSource pricing, service limits, account requirements, API behavior, availability, and policies are managed by ZadoSource and are separate from Bots.Business plans and limits.

---

## Demo Purpose

This project is intended as a practical Bots.Business integration example demonstrating:

- External AI API integration
- AI-assisted customer support
- Human escalation
- Ticket state management
- AI conversation state
- Administrator workflows
- Telegram attachments
- Error handling
- Real-world support automation

It is intentionally more complete than a basic "send a message to AI and return the response" example.

Developers can study and adapt the source code for their own Bots.Business projects.

---

## Credits

### AI Service

**ZadoSource AI**

https://ai.zadosource.com/

### Bot Platform

**Bots.Business**

### Integration / Source Code

**ZadoSource**

This project demonstrates an independent integration between the two services.

---

If you publish your own version, do not include private API credentials in the repository.
