# Swades Customer Support AI

A multi-agent AI customer support system built as a Turborepo monorepo. A **router agent** classifies every incoming message and delegates it to a specialised sub-agent (Support, Order, or Billing), each with its own scoped database tools. Responses stream back to a React chat UI in real time.


## UI
<img width="3024" height="1822" alt="image" src="https://github.com/user-attachments/assets/703ae18b-33d8-417f-a509-37f881cb6516" />
<img width="3024" height="1818" alt="image" src="https://github.com/user-attachments/assets/b2da1c08-1e93-428a-8a41-03d3debdf7fc" />

## Workspace Structure

```
├── apps/
│   ├── api/          Hono REST API — routing, agents, streaming
│   └── web/          React + Vite chat UI
├── packages/
│   └── db/           Drizzle schema, migrations, seed data
├── turbo.json        Turborepo task config
└── .env.example      Environment variable template
```

### `apps/api` (Hono backend)

| Layer | Path | Responsibility |
|-------|------|----------------|
| Routes | `src/routes/` | HTTP method + path definitions |
| Controllers | `src/controllers/` | Request orchestration, response shaping |
| Services | `src/services/` | Persistence, context windowing, message save |
| Agents | `src/agents/` | Router intent classifier + three sub-agents |
| Tools | `src/agents/tools/` | Database-backed tool functions scoped per agent |
| Middleware | `src/middleware/` | Error handler, 404 handler |

### `apps/web` (React frontend)

A minimal but polished chat interface with:

- Conversation sidebar with customer switcher
- Active chat thread with message history
- Streaming assistant responses with typing indicator
- Agent badge showing which specialist handled each message
- Composer with send/abort support

### `packages/db` (Drizzle ORM)

Drizzle schema covering seven tables: `customers`, `conversations`, `messages`, `orders`, `order_events`, `invoices`, `refunds`. Includes migrations and a seed script with three realistic customer scenarios.

## Prerequisites

- **Node.js** >= 18
- **npm** >= 10
- **PostgreSQL** >= 14 (local install, Docker, or a managed instance)
- **Google Generative AI API key** ([Get one here](https://aistudio.google.com/apikey))

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd swades-assignment
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Yes | — | Google AI Studio API key |
| `AI_MODEL` | No | `gemini-3.1-flash-lite-preview` | Gemini model identifier |
| `PORT` | No | `3001` | API server port |

### 3. Set up the database

Create the database and run migrations + seed:

```bash
# Create the database (if it doesn't exist yet)
createdb swades

# Run Drizzle migrations
npm run db:migrate --workspace @swades/db

# Seed with demo data
npm run db:seed --workspace @swades/db
```

### 4. Start development

```bash
npm run dev
```

This starts both the API (port 3001) and the web app (port 3000) in parallel. Open **http://localhost:3000** in your browser.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check with database status |
| `POST` | `/api/chat/messages` | Send a message; returns a streamed AI response |
| `GET` | `/api/chat/conversations` | List conversations (optional `?customerId=`) |
| `GET` | `/api/chat/conversations/:id` | Get conversation with full message history |
| `DELETE` | `/api/chat/conversations/:id` | Delete a conversation |
| `GET` | `/api/agents/agents` | List all agent definitions |
| `GET` | `/api/agents/:type/capabilities` | Get capabilities for a specific agent type |

### `POST /api/chat/messages`

**Request body:**

```json
{
  "customerId": "11111111-1111-1111-1111-111111111111",
  "content": "Where is my order SW-1001?",
  "conversationId": "optional-uuid"
}
```

**Response:** Vercel AI SDK data stream with custom headers:

- `X-Conversation-Id` — the conversation UUID (created if new)
- `X-Agent-Type` — which agent handled the message (`support`, `order`, or `billing`)

## How Routing Works

Every incoming user message goes through a two-stage pipeline:

```
User message
    │
    ▼
┌───────────────────┐
│   Router Agent    │  classifies intent using the last 20 messages
│  (generateObject) │  as context → returns "support" | "order" | "billing"
└────────┬──────────┘
         │
    ┌────┴────┬───────────┐
    ▼         ▼           ▼
 Support    Order      Billing
  Agent     Agent       Agent
    │         │           │
    ▼         ▼           ▼
  Tools     Tools       Tools
(history,  (orders,   (invoices,
 profile)  events)    refunds)
```

1. **Intent classification** — The router agent receives the recent conversation context and uses `generateObject` with a structured Zod schema to classify the message as `support`, `order`, or `billing`. On failure it defaults to `support`.

2. **Agent invocation** — The selected agent is called with `streamText`, receiving only its own scoped tools. Each agent has a specialised system prompt and tool set:

   | Agent | Tools | Max Steps |
   |-------|-------|-----------|
   | Support | `getConversationHistory`, `getCustomerInfo` | 3 |
   | Order | `getCustomerOrders`, `getOrderDetails`, `getOrderEvents` | 5 |
   | Billing | `getCustomerInvoices`, `getInvoiceDetails`, `getCustomerRefunds`, `getRefundDetails` | 5 |

3. **Tool isolation** — Each agent can only call its own tools. The order agent cannot access billing data and vice versa. This enforces least-privilege access at the agent level.

4. **Streaming** — The response streams back to the client as a Vercel AI SDK data stream. The assistant's final text is persisted asynchronously after the stream completes.

## Seed Data Overview

The seed script populates three customers with interconnected support scenarios:

| Customer | ID | Scenario |
|----------|-----|----------|
| **Maya Patel** | `111...111` | Delayed sofa order (SW-1001) with tracking events |
| **Lucas Chen** | `222...222` | Delivered lamp with completed refund (RFD-2001) |
| **Olivia Brooks** | `333...333` | Overdue invoice (INV-3001) with pending refund |

Each customer has orders, invoices, order events, and conversation history pre-populated to exercise all three agent types.

## Running Tests

```bash
# From the repo root
npm test

# Or from the API workspace directly
cd apps/api
npx vitest run
```

### Test Coverage

| Test File | What It Covers |
|-----------|----------------|
| `router.agent.test.ts` | Intent classification: order/billing/support routing, error fallback, context passing |
| `capabilities.test.ts` | Agent definitions: listing, field validation, tool assignment per agent |
| `chat.service.test.ts` | `buildContextMessages` conversion and ordering |
| `tools.test.ts` | Tool creation: correct tools exposed per agent, tool isolation between agents |
| `integration.test.ts` | Hono app: health endpoint, agent listing, capabilities lookup, message validation, 404 handling |

## Demo Scenarios

These three flows exercise the full system — router classification, tool calls, streaming, and persistence. They work out of the box with the seeded data.

### 1. Order Tracking (Maya Patel)

> **Message:** "Where is my sofa order? It was supposed to arrive yesterday."

- Router classifies as `order`
- Order agent calls `getCustomerOrders` then `getOrderDetails` for SW-1001
- Response includes the delay event from Newark and the updated delivery estimate

### 2. Refund Inquiry (Lucas Chen)

> **Message:** "Has my refund for the damaged lamp been processed?"

- Router classifies as `billing`
- Billing agent calls `getCustomerRefunds` and finds RFD-2001 (completed)
- Response confirms the refund amount and processing date

### 3. Overdue Invoice (Olivia Brooks)

> **Message:** "Why is invoice INV-3001 marked overdue? I thought autopay would handle it."

- Router classifies as `billing`
- Billing agent calls `getInvoiceDetails` for INV-3001
- Response explains the overdue status and the outstanding balance

### 4. General Support (any customer)

> **Message:** "Hello, what can you help me with?"

- Router classifies as `support`
- Support agent calls `getCustomerInfo` and provides a personalised greeting
- Demonstrates the fallback/general support path

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | Turborepo + npm workspaces |
| Backend | Hono (Node.js) |
| AI | Vercel AI SDK + Google Gemini |
| Database | PostgreSQL + Drizzle ORM |
| Frontend | React 19 + Vite 7 |
| Testing | Vitest |
| Language | TypeScript (strict) |
