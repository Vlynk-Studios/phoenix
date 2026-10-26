# Phoenix

Outlook email sending and reply tracking system. It sends emails using HTML templates, logs them in PostgreSQL, and notifies you when a reply arrives.

![Status](https://img.shields.io/badge/status-in%20development-orange)
![Node](https://img.shields.io/badge/node-%3E%3D24-green)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)

> ⚠️ **Work in progress.** There is no usable version yet. This document describes what the project will do and where it currently stands.

---

## What is it?

Phoenix is a command-line tool that automates the full lifecycle of an email: **send it, log it, and know when someone replies**.

Its core rule is an **allowlist**: the system only notifies you about emails it sent and logged itself. Everything else in your inbox is ignored: not notified, not stored, not processed.

> **Note:** this rule is a logical restriction of the application, not a Microsoft security boundary. With the required permissions, the token can technically read the entire mailbox, so the token and the database must be protected as credentials.

---

## What you will be able to do

### Send
- Send emails through Outlook using **3 predefined HTML templates**.
- Choose recipients (To), copies (CC), subject, and template for each send.
- Use **variable fields** (`{{name}}`, `{{company}}`…) in both the body and the subject.
- See a **preview** and confirm before sending.
- Get a warning if you already sent the same email in the last 24 hours.

### Log
- Store every send in PostgreSQL with its recipients, template, data, and status.
- Track the lifecycle of each email: `draft`, `sending`, `waiting`, `replied`, `bounced`, `failed`, and `unknown_result`.
- **Reconcile** sends with an uncertain outcome (for example, after a timeout) so an email is never wrongly marked as failed or sent twice.

### Track replies
- Poll the inbox periodically (every 5 minutes by default).
- Detect replies using email headers and, when that is not possible, the conversation ID.
- Tell apart real replies, **bounces**, and **automatic replies** (out of office).
- Also record later replies from other recipients.
- Track each email for a configurable period (30 days by default).

### Notify
- Notifications through the **console** always, and through **Telegram** if you configure it.
- Notification policy: first reply only, or every reply.
- Automatic retries if a notification fails, without affecting the email's status.
- Notifications never include the body of the received email.

### Query
- View the send history with the status of each email.
- Filter by status and see pending or failed notifications.

---

## Planned commands

```
send         Sends an email using a template and logs it
track        Watches the inbox and notifies you of replies (continuous or single pass)
reconcile    Resolves sends with an uncertain outcome
list         Shows the history and pending notifications
```

If you omit details when sending (To, CC, subject, or template), the system asks for them interactively.

---

## Tech stack

- **Node.js 24+** with TypeScript (direct `.ts` execution and type checking with `tsc`)
- **Microsoft Graph API v1.0** with authentication through `@azure/msal-node`
- **PostgreSQL** (`pg`)
- `commander` for the CLI and `zod` for input validation

---

## Project status

The project is in the **finalized design and implementation kickoff** stage. The specification (v2) is complete and the work plan is split into phases.

| Phase | Description | Status |
|---|---|---|
| 0 | Project creation and external access setup | 🔲 Pending |
| 1 | Environment, project, and database | 🔲 Pending |
| 2 | Verifying assumptions with Microsoft Graph | 🔲 Pending |
| 3 | Configuration, logging, and base utilities | 🔲 Pending |
| 4 | Persistence | 🔲 Pending |
| 5 | Authentication | 🔲 Pending |
| 6 | Templates | 🔲 Pending |
| 7 | Sending | 🔲 Pending |
| 8 | Reconciliation | 🔲 Pending |
| 9 | Inbox tracking | 🔲 Pending |
| 10 | Notifications | 🔲 Pending |
| 11 | CLI and history | 🔲 Pending |
| 12 | End-to-end testing | 🔲 Pending |
| 13 | Hardening (security and performance) | 🔲 Pending |
| 14 | Documentation and go-live | 🔲 Pending |

Legend: ✅ Done · 🚧 In progress · 🔲 Pending

---

## Out of scope (for now)

- Graphical or web interface (will be added later on top of the same core).
- Reading or classifying emails unrelated to the log.
- Scheduled bulk sending or campaigns.
- Attachments.

---

## Future ideas

- Graph delta query for more efficient tracking.
- Reminder if nobody replies after N days.
- Fixed attachments per template.
- Import recipients from CSV.
- Per-template statistics (reply rate and response time).
- Graph webhooks for real-time notifications.
- Web or desktop interface.

---

## Security

- Credentials and the token cache are never committed to the repository.
- Logs never include email bodies or tokens.
- The database containing sends and recipients is treated as sensitive information.

---

## License

MIT - License
