# Instructions

## Prerequisites

- Node.js >= 18, npm >= 10
- PostgreSQL >= 14
- [Google AI API key](https://aistudio.google.com/apikey)

## Setup

```bash
npm install
cp .env.example .env   # then fill in DATABASE_URL and GOOGLE_GENERATIVE_AI_API_KEY
```

## Database

```bash
createdb swades
npm run db:migrate --workspace @swades/db
npm run db:seed --workspace @swades/db
```

## Run

```bash
npm run dev
```

API starts on **http://localhost:3001**, UI on **http://localhost:3000**.

## Tests

```bash
npm test
```
