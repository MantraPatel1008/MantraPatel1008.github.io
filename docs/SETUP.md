# JARVIS OS Setup Guide

## Prerequisites

- Node.js 18+
- npm or yarn
- Docker (optional, for containerization)
- Git

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/MantraPatel1008/jarvis---os.git
cd jarvis---os
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy `.env.example` to `.env` and fill in your API keys:

```bash
cp .env.example .env
```

**Required API Keys:**
- Gemini API Key (Google Cloud)
- Supabase URL & Key
- ElevenLabs API Key (optional)
- Pinecone API Key (optional)

### 4. Initialize Database

Set up Supabase tables:

```bash
npm run db:init
```

### 5. Start Development Server

```bash
npm run dev
```

JARVIS Core should now be running on `http://localhost:3000`

## Configuration

### Database Setup

Create tables in Supabase:

```sql
-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  phone VARCHAR,
  website VARCHAR,
  industry VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Leads table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  phone VARCHAR,
  website VARCHAR,
  industry VARCHAR NOT NULL,
  confidence FLOAT,
  source_type VARCHAR,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_type VARCHAR NOT NULL,
  status VARCHAR NOT NULL,
  input JSONB,
  result JSONB,
  error TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
```

### API Keys Configuration

**Gemini API:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Gemini API
4. Create API key
5. Add to `.env` as `GEMINI_API_KEY`

**Supabase:**
1. Sign up at [Supabase](https://supabase.com/)
2. Create a new project
3. Copy URL and API key
4. Add to `.env`

**ElevenLabs (for Voice):**
1. Sign up at [ElevenLabs](https://elevenlabs.io/)
2. Create API key
3. Add to `.env`

## Running Tests

```bash
npm test
```

## Deployment

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Deploy to Railway

```bash
npm install -g railway
railway link
railway deploy
```

### Docker Deployment

```bash
docker build -t jarvis-os .
docker run -p 3000:3000 jarvis-os
```

## Troubleshooting

### Port Already in Use

```bash
lsof -i :3000
kill -9 <PID>
```

### API Key Issues

Ensure `.env` file is in the root directory and not committed to git.

### Memory Errors

Increase Node.js memory:

```bash
node --max-old-space-size=4096 src/index.ts
```

## Next Steps

1. Configure your first agent
2. Set up integrations (n8n, Zapier)
3. Create your first workflow
4. Test with sample data

See [ARCHITECTURE.md](./ARCHITECTURE.md) for system design details.
