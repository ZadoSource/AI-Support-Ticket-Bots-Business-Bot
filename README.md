# AI Support Ticket Bot

AI Support Ticket Bot combines automated AI customer support with a human admin support workflow for the Bots.Business platform.


![AI Support Ticket Bot](https://cdn.zadosource.com/uploads/codes/thumbnails/6a9d786863544_1788704872.png)

## Bot Properties

Set these values in Bot Settings:

| Property Name             | Value                    |
| ------------------------- | ------------------------ |
| `ZADOSOURCE_API_KEY`      | Your API key             |
| `ZADOSOURCE_AI_TRAIN_KEY` | Your AI training key     |
| `SUPPORT_ADMIN_ID`        | Numeric Telegram user ID |

---

## Overview

AI Support Ticket Bot uses ZadoSource AI to automatically answer customer questions while keeping a human administrator involved in the support process.

If the AI cannot answer a question, the bot can fall back to human support.


## Features

* AI-powered customer replies via ZadoSource AI
* Human administrator support
* Every customer message sent to administrator
* AI answer shown to administrator
* Human fallback when AI cannot answer
* Ticket tracking with unique IDs
* One active ticket per customer
* Same ticket ID throughout conversation
* Admin Reply workflow
* Close Ticket workflow
* AI conversation continuity
* New AI conversation after ticket closure
* Attachment forwarding support
* API authentication error handling
* AI Training Key/access error handling
* Rate-limit handling
* Timeout handling
* Service-error handling

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
Human admin receives the message
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

## Main Message Handler

The main message handler:

* Detects admin reply mode
* Forwards admin replies to customers
* Creates new tickets for new users
* Processes messages for existing tickets
* Handles AI processing
* Sends admin notifications

## AI Integration

The bot uses the ZadoSource AI Chat API.

Endpoint:

```text
https://api.zadosource.com/v1/ai/chat
```

Requirements:

* ZadoSource API Key
* AI Training Key
* `conversation_id` for conversation context

The bot also handles API errors and falls back to human support when required.


## Ticket System

Ticket format:

```text
SUP-XXX-XXXX
```

Ticket behavior:

* One active ticket per customer
* Ticket remains active throughout the conversation
* The same ticket ID is used for follow-up messages
* Ticket closes when the admin closes it
* A new ticket is created after the previous ticket is closed
* A new AI conversation starts after ticket closure


## Admin Notifications

Each new customer message creates an admin notification containing:

* Ticket ID
* Ticket status
* Customer username
* Customer Telegram ID
* Customer message
* AI response, if available
* Reply button
* Reply Anyway button when required
* Close Ticket button


## Admin Reply Mode

1. Admin clicks `Reply`
2. Bot enters reply mode
3. Admin sends a message
4. Bot forwards the message to the customer
5. Admin notification is updated
6. Reply buttons are removed
7. Ticket remains open


## AI Error Handling

| Error Type           | Action                    |
| -------------------- | ------------------------- |
| API Key invalid      | Notify admin              |
| Training Key invalid | Notify admin              |
| Rate limit           | Fallback to human support |
| Timeout              | Fallback to human support |
| Service unavailable  | Fallback to human support |


## Security

* Never publish real credentials
* Store credentials using Bot Properties
* Revoke and regenerate credentials if they are exposed
* Keep the admin Telegram ID private
* Do not hardcode API keys into public bot code


## Installation

1. Create a Telegram bot using BotFather
2. Open the Bots.Business platform
3. Create a new bot
4. Add the required Bot Properties
5. Add the message handler
6. Start the bot
7. Test AI support
8. Test human admin replies
9. Test ticket closing
10. Deploy the bot

## ZadoSource AI

Create and train your AI assistant:

Website:
https://ai.zadosource.com/

Documentation:
https://docs.zadosource.com/

Support:
`@ZadoSourceAssistant`


## Credits

AI: ZadoSource AI

Free Source: ZadoSource
