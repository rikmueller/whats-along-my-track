# AlongGPX Docker Quick Start

## Which Compose File Do I Need?

```
START HERE
    │
    ├─ Production deployment with local build? ────────► docker-compose.yml ✅
    │
    └─ Developing frontend with hot reload? ───────────► docker-compose.dev.yml
```

## Setup Commands

### Option 1: Production Deployment (Recommended)

```bash
# 1. Clone repository
git clone https://github.com/rikmueller/alonggpx.git
cd alonggpx/deployment

# 2. Copy .env template
cp .env.example .env

# 3. Build and start
docker compose up --build -d
```

Open: **http://localhost:3000**

---

### Option 2: Development Mode

```bash
# 1. Clone repository
git clone https://github.com/rikmueller/alonggpx.git
cd alonggpx/deployment

# 2. Copy .env template
cp .env.example .env

# 3. Start with hot reload
docker compose -f docker-compose.dev.yml up
```

Frontend with HMR: **http://localhost:3000**

---

## Common Commands

```bash
# View logs
docker compose logs -f

# Stop services
docker compose down

# Rebuild local images
docker compose up --build -d
```

---

## Full Documentation

See [README.md](README.md) for detailed information about different deployment scenarios.
