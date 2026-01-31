# AlongGPX - Docker Quickstart

Deploy AlongGPX using Docker Compose. **Two deployment options** available - choose the one that fits your needs.

## 🎯 Which Setup Should I Use?

| Scenario | Compose File | Purpose |
|----------|--------------|---------|
| **Production deployment** ✅ | `docker-compose.yml` | Build from local source |
| Frontend development | `docker-compose.dev.yml` | Hot reload for frontend changes |

---

## 📖 Table of Contents

- [Production Setup (Standard)](#production-setup-standard)
- [Configuration](#-configuration)
- [Common Operations](#-common-operations)
- [Data Directories](#-data-directories)
- [Customizing Presets](#-customizing-presets)
- [Troubleshooting](#-troubleshooting)

---

## Production Setup (Standard)

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- 2GB free disk space
- Git

### Quick Start

```bash
# Clone repository
git clone https://github.com/rikmueller/alonggpx.git
cd alonggpx/deployment

# Copy environment template
cp .env.example .env

# Optional: Edit configuration
nano .env

# Build and start services
docker compose up --build -d
```

**Open:** http://localhost:3000

### Rebuild After Code Changes

```bash
cd deployment
docker compose up --build -d
```

---

## ⚙️ Configuration

Configuration is managed through the `.env` file in your deployment directory.

### Basic Settings

Edit `.env`:

```bash
# Project Settings
ALONGGPX_PROJECT_NAME=MyProject    # Default output filename prefix
ALONGGPX_TIMEZONE=UTC              # Timezone for timestamps

# Search Parameters
ALONGGPX_RADIUS_KM=5               # Default search radius (km)

# Optional: Default Presets (semicolon-separated)
ALONGGPX_PRESETS=camp_sites_tent;drinking_water

# Optional: Default Filters (semicolon-separated, key=value format)
ALONGGPX_SEARCH_INCLUDE=amenity=shelter
ALONGGPX_SEARCH_EXCLUDE=
```

### Advanced Settings

```bash
# Overpass API
ALONGGPX_BATCH_KM=50                    # km per API call (higher = fewer calls, faster)
ALONGGPX_OVERPASS_RETRIES=3            # Retry attempts for failed queries

# Cleanup
ALONGGPX_CLEANUP_INTERVAL_SECONDS=600   # Cleanup job interval (10 minutes)
ALONGGPX_JOB_TTL_SECONDS=21600         # Keep completed jobs for 6 hours
ALONGGPX_OUTPUT_RETENTION_DAYS=10       # Delete output files after 10 days
```

### Apply Configuration Changes

After editing `.env`, restart services:

```bash
docker compose down
docker compose up -d
```

---

## 🔄 Common Operations

### View Logs

```bash
docker compose logs -f

# Last 100 lines only
docker compose logs --tail=100

# Backend only
docker compose logs -f backend
```

### Stop Services

```bash
docker compose down
```

### Restart Services

```bash
docker compose restart
```

### Check Status

```bash
docker compose ps
```

---

## 📂 Data Directories

AlongGPX uses these directories (automatically created by Docker if they don't exist):

### data/input/
- **Purpose:** GPX track files
- **Included:** `example.gpx` (baked into Docker image)
- **Optional:** Mount your own directory for CLI mode
- **Volume mount:** Read-only

### data/output/
- **Purpose:** Generated Excel and HTML files
- **Required:** Yes (results are written here)
- **Volume mount:** Read-write
- **Auto-cleanup:** Files older than 10 days deleted (configurable)

### data/presets.yaml
- **Purpose:** Filter preset definitions
- **Included:** Baked into Docker image
- **Optional:** Mount custom file to override built-in presets
- **Volume mount:** Read-only

**No manual directory creation needed!** Docker creates what's necessary. The image includes `presets.yaml` and `example.gpx` by default.

### Using Your Own Presets

If you want to customize presets:

```bash
# Download default presets as starting point
curl -o presets.yaml https://raw.githubusercontent.com/rikmueller/alonggpx/main/data/presets.yaml

# Edit presets.yaml
nano presets.yaml

# Uncomment the presets volume mount in docker-compose file:
# volumes:
#   - ./presets.yaml:/app/data/presets.yaml:ro  # <-- Uncomment this line
```

---

## 🎨 Customizing Presets

The Docker image includes default presets. To add your own:

### 1. Download Default Presets

```bash
curl -o presets.yaml https://raw.githubusercontent.com/rikmueller/alonggpx/main/data/presets.yaml
```

### 2. Add Custom Preset

Edit `presets.yaml`:

```yaml
my_custom_preset:
  name: "My Custom Preset"
  category: "Accommodation"
  info: "Find affordable hostels"
  include:
    - "tourism=hostel"
    - "backpacker=yes"
  exclude:
    - "smoking=yes"
```

### 3. Mount Custom Presets

Edit `docker-compose.yml`:

```yaml
volumes:
  - ../data/output:/app/data/output
  - ./presets.yaml:/app/data/presets.yaml:ro  # Add this line
```

### 4. Restart Services

```bash
docker compose down
docker compose up -d
```

Your custom presets will now appear in the web UI dropdown!

---

## 🌐 Production Deployment

### Behind Nginx Reverse Proxy

```nginx
upstream alonggpx {
    server localhost:3000;
}

server {
    listen 443 ssl http2;
    server_name gpx.example.com;
    
    ssl_certificate /etc/ssl/certs/gpx.example.com.crt;
    ssl_certificate_key /etc/ssl/private/gpx.example.com.key;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # Max upload size for GPX files
    client_max_body_size 50M;
    
    location / {
        proxy_pass http://alonggpx;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support (for SocketIO)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Resource Limits

Edit `docker-compose.yml`:

```yaml
services:
  backend:
    # ... existing config
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 512M
```

---

## 🐛 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker compose logs backend

# Check if port 3000 is in use
sudo netstat -tulpn | grep 3000

# Try different port (edit compose file):
# Change "3000:80" to "8080:80"
```

### Permission Denied on Volumes

```bash
# Fix output directory permissions
sudo chmod 755 data/output
sudo chown -R $(id -u):$(id -g) data/output
```

### Overpass API Timeouts

**Symptoms:** Job fails with "Overpass timeout" error

**Solutions:**
1. Increase `ALONGGPX_BATCH_KM` in `.env` to reduce API calls
2. Check Overpass API status: https://overpass-api.de/api/status
3. Wait a few minutes and retry

### No Results Found

**Check:**
- Filter syntax is `key=value` format
- POIs exist in your area (check OpenStreetMap)
- Search radius is large enough
- Test filters at https://overpass-turbo.eu/

### Job Stuck in Processing

```bash
# View backend logs for errors
docker compose logs -f backend | grep ERROR
```

**Common causes:**
- Very large GPX files take time
- Dense urban areas need higher `ALONGGPX_BATCH_KM`
- Network issues with Overpass API

---

## ❓ FAQ

### Which compose file should I use?

- **Production:** `docker-compose.yml` (standard deployment)
- **Frontend development:** `docker-compose.dev.yml` (hot reload)
- See [deployment/README.md](../deployment/README.md) for detailed comparison

### Do I need to create data directories?

**No!** Docker creates them automatically. The image includes `example.gpx` and `presets.yaml` by default.

### Do I need to download presets.yaml?

**No!** It's already in the Docker image. Only download if you want to customize presets.

### How do I customize presets?

See [Customizing Presets](#-customizing-presets) section above.

### How do I update to latest version?

```bash
docker compose up --build -d
```

### Can I run this on a VPS/cloud server?

Yes! See [Production Deployment](#-production-deployment) section.

### Where are my output files?

In `data/output/` directory. Files are named with your project name and timestamp.

---

## 📚 Next Steps

- **Development workflow:** [quickstart-dev.md](quickstart-dev.md)
- **CLI usage:** [quickstart-cli.md](quickstart-cli.md)
- **Compose file comparison:** [../deployment/README.md](../deployment/README.md)
- **API documentation:** Coming soon

---

## 🔗 Additional Resources

- **GitHub Repository:** https://github.com/rikmueller/alonggpx
- **Docker Hub:** https://github.com/rikmueller/alonggpx/pkgs/container/alonggpx
- **OpenStreetMap Wiki:** https://wiki.openstreetmap.org/wiki/Map_features
- **Overpass API:** https://overpass-api.de/

