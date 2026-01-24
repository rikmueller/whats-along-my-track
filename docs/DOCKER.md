# Docker Guide

Deploy AlongGPX as a web API container.

## Quick Start

### Prerequisites
- Docker >= 20.10
- Docker Compose >= 1.29

### Run
```bash
cd docker
docker-compose up -d
```

Health check:
```bash
curl http://localhost:5000/health
```

---

## Web API Endpoints

### POST /api/process
Upload and process a GPX file.

**Request:**
```bash
curl -F "file=@track.gpx" \
     -F "project_name=MyTrip" \
     -F "radius_km=5" \
     http://localhost:5000/api/process
```

**Parameters:**
- `file` (required): GPX file
- `project_name` (optional): Output filename prefix
- `radius_km` (optional): Search radius in km
- `step_km` (optional): Distance between query points
- `include` (optional): Include filter (e.g., `amenity=drinking_water`)
- `exclude` (optional): Exclude filter (e.g., `tents=no`)

**Response:**
```json
{
  "success": true,
  "excel_file": "MyTrip_20260124_120000.xlsx",
  "html_file": "MyTrip_20260124_120000.html",
  "excel_path": "/app/data/output/MyTrip_20260124_120000.xlsx",
  "html_path": "/app/data/output/MyTrip_20260124_120000.html",
  "rows_count": 42,
  "track_length_km": 125.5
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{"status": "healthy", "service": "AlongGPX"}
```

---

## Configuration

### Method 1: Environment Variables (.env)
Create `docker/.env`:
```
FLASK_ENV=production
ALONGGPX_PROJECT_NAME=WebProject
ALONGGPX_RADIUS_KM=5
ALONGGPX_BATCH_KM=50
ALONGGPX_OVERPASS_RETRIES=3
ALONGGPX_TIMEZONE=Europe/Berlin
```

### Method 2: docker-compose.yml
Edit environment section:
```yaml
environment:
  - ALONGGPX_RADIUS_KM=5
  - ALONGGPX_BATCH_KM=50
```

### Method 3: Mount config.yaml
Uncomment in `docker-compose.yml`:
```yaml
volumes:
  - ../config.yaml:/app/config.yaml:ro
```

**Priority (high → low):**
1. Web API form parameters
2. Environment variables (docker/.env)
3. config.yaml defaults

---

## Supported Environment Variables

**Project:**
- `ALONGGPX_PROJECT_NAME` – Output filename prefix
- `ALONGGPX_OUTPUT_PATH` – Output directory (default: `/app/data/output`)
- `ALONGGPX_TIMEZONE` – Timezone for timestamps

**Search:**
- `ALONGGPX_RADIUS_KM` – Search radius (default: 5)
- `ALONGGPX_STEP_KM` – Distance between query points
- `ALONGGPX_BATCH_KM` – Overpass batch size (default: 50)

**Overpass:**
- `ALONGGPX_OVERPASS_RETRIES` – Retry attempts (default: 3)

**Flask:**
- `FLASK_ENV` – production or development
- `FLASK_PORT` – Port (default: 5000)

---

## Build & Run Manually

```bash
cd docker
docker build -t alonggpx:latest ..
docker run -p 5000:5000 \
  -v "$(pwd)/../data/input:/app/data/input" \
  -v "$(pwd)/../data/output:/app/data/output" \
  alonggpx:latest
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 5000 in use | Change in `docker-compose.yml`: `ports: ["5001:5000"]` |
| Upload fails | Check `ALONGGPX_OUTPUT_PATH` has write permissions; max file size is 50MB |
| No results | Verify filter syntax (`key=value`), check [overpass-turbo.eu](https://overpass-turbo.eu/) |
| Overpass timeout | Increase `ALONGGPX_BATCH_KM` to reduce API calls |
| Container won't start | Check logs: `docker-compose logs` |

---

## Production Deployment

### Use Gunicorn
Edit `docker/Dockerfile`:
```dockerfile
RUN pip install gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "docker.app:app"]
```

Rebuild: `docker-compose up -d --build`

### Use Nginx Reverse Proxy
```nginx
upstream alonggpx {
    server localhost:5000;
}

server {
    listen 80;
    server_name gpx.example.com;

    location / {
        proxy_pass http://alonggpx;
        client_max_body_size 50M;
    }
}
```

---

## Logs & Debugging

```bash
# View logs
docker-compose logs -f

# Real-time logs from container
docker logs -f alonggpx-web

# Check container status
docker ps | grep alonggpx
```
#   "excel_file": "MyTrip_20260124_120000.xlsx",
#   "html_file": "MyTrip_20260124_120000.html",
#   "excel_path": "/app/data/output/MyTrip_20260124_120000.xlsx",
#   "html_path": "/app/data/output/MyTrip_20260124_120000.html",
#   "rows_count": 42,
#   "track_length_km": 125.5
# }
```

## Web API Endpoints

### Health Check
```bash
GET /health
```
Response: `{"status": "healthy", "service": "AlongGPX"}`

### Process GPX File
```bash
POST /api/process
```

**Request (multipart/form-data):**
- `file` (required): GPX file (*.gpx)
- `project_name` (optional): Name for output files
- `radius_km` (optional): Search radius in km
- `step_km` (optional): Distance between query points
- `include` (optional): Include filter(s) - e.g., `amenity=drinking_water`
- `exclude` (optional): Exclude filter(s) - e.g., `tents=no`

**Response (JSON):**
```json
{
  "success": true,
  "excel_file": "filename.xlsx",
  "html_file": "filename.html",
  "excel_path": "/app/data/output/filename.xlsx",
  "html_path": "/app/data/output/filename.html",
  "rows_count": 42,
  "track_length_km": 125.5
}
```

### Download Results
```bash
GET /api/download/excel/<filename>
GET /api/download/html/<filename>
```

## Configuration

### Method 1: Environment Variables (.env)
Create a `.env` file (copy from `.env.example`):
```bash
FLASK_ENV=production
ALONGGPX_PROJECT_NAME=MyProject
ALONGGPX_RADIUS_KM=5
ALONGGPX_BATCH_KM=50
ALONGGPX_OVERPASS_RETRIES=3
```

### Method 2: YAML Config (config.yaml)
Edit or mount `config.yaml`:
```yaml
search:
  radius_km: 5
  step_km: 3
  include:
    - "tourism=camp_site"
  exclude:
    - "tents=no"
```

### Method 3: Web API Parameters
Pass directly in form fields (highest precedence):
```bash
curl -F "radius_km=10" -F "include=amenity=drinking_water" ...
```

**Precedence (highest to lowest):**
1. Web API form parameters
2. Environment variables (.env)
3. config.yaml defaults

## Docker Compose Configuration

### Customization
Edit `docker-compose.yml` to adjust:

```yaml
services:
  alonggpx:
    ports:
      - "5000:5000"              # Change port
    volumes:
      - ../data/input:/app/data/input:ro    # GPX input directory
      - ../data/output:/app/data/output:rw  # Results directory
    environment:
      - ALONGGPX_RADIUS_KM=5     # Default search radius
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
```

### Volume Mounts
- **../data/input** → Read-only access to GPX files (mounted to `/app/data/input`)
- **../data/output** → Write results (Excel, HTML maps) (mounted to `/app/data/output`)
- **config.yaml** → Optional: Mount custom config (read-only)

## Logging & Debugging

### View Container Logs
```bash
# Real-time logs
docker-compose logs -f alonggpx

# Last 100 lines
docker-compose logs --tail=100 alonggpx

# With timestamps
docker-compose logs --timestamps alonggpx
```

### Enable Debug Mode
```bash
# In docker-compose.yml
environment:
  - FLASK_ENV=development
```

Or start manually:
```bash
docker-compose run --rm -e FLASK_ENV=development alonggpx \
    python -m flask --app web run --host 0.0.0.0
```

## Troubleshooting

### "Connection refused" on /api/process
- Wait 5-10 seconds after `docker-compose up -d` (health check startup)
- Check container is running: `docker ps | grep alonggpx`
- View logs: `docker-compose logs alonggpx`

### "No such file or directory: ../data/input/track.gpx"
- Ensure GPX file exists in local `../data/input/` directory (when running from docker/)
- Web API expects upload via multipart form-data
- CLI mode reads from path in `config.yaml`

### "Overpass API timeout"
- Increase `batch_km` in `.env` or `config.yaml` to reduce query load
- Check Overpass server status at https://overpass-api.de/

### Large output files (>100MB)
- Adjust `MAX_CONTENT_LENGTH` in `web.py` if needed
- Results are stored in `../data/output/` (check disk space)

## Production Deployment

### With Gunicorn (Recommended)
Edit `Dockerfile` entrypoint:
```dockerfile
# Replace Flask dev server with Gunicorn
RUN pip install gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "web:app"]
```

Rebuild:
```bash
docker-compose build
docker-compose up -d
```

### Environment Setup
Create `.env`:
```bash
FLASK_ENV=production
ALONGGPX_RADIUS_KM=5
ALONGGPX_BATCH_KM=50
```

### Reverse Proxy (Nginx)
```nginx
upstream alonggpx {
    server localhost:5000;
}

server {
    listen 80;
    server_name gpx.example.com;

    location / {
        proxy_pass http://alonggpx;
        client_max_body_size 50M;
    }
}
```

## Architecture Notes

### Multi-Stage Docker Build
- **Base stage**: Installs all dependencies, keeps intermediate layers
- **Production stage**: Only copies runtime libraries (smaller image ~300MB)
- **Health check**: Polls `/health` endpoint every 30s

### Non-Root User
- Container runs as user `alonggpx` (UID 1000) for security
- Output directory (`/app/data/output`) has write permissions

### Volume Mounts
- **../data/input:ro** (read-only): Protects source GPX files
- **../data/output:rw** (read-write): Container writes results to host

## Development Workflow

### Local Testing
```bash
# Test CLI mode
python3 cli/main.py --gpx-file ./data/input/track.gpx --radius-km 5

# Test web API locally (development)
export FLASK_ENV=development
python -m flask --app web run --port 5000

# Test web API with cURL
curl -F "file=@./data/input/track.gpx" \
     -F "project_name=Test" \
     http://localhost:5000/api/process
```

### Building Docker Image Manually
```bash
cd docker
docker build -t alonggpx:latest ..
docker run -p 5000:5000 \
  -v "$(pwd)/../data/input:/app/data/input" \
  -v "$(pwd)/../data/output:/app/data/output" \
  alonggpx:latest
```

## Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| gpxpy | 1.6.2 | Parse GPX tracks |
| shapely | 2.0.2 | Geometric operations |
| pyproj | 3.6.1 | Geodetic distance (WGS84) |
| requests | 2.31.0 | HTTP queries to Overpass API |
| folium | 0.14.0 | Interactive map generation |
| pandas | 2.1.4 | Data processing & Excel export |
| Flask | 3.0.0 | REST API framework |
| python-dotenv | 1.0.0 | Environment variable loading |

## Migration from Pure CLI

If you were using the CLI, containerization adds:
1. **Consistency**: Same dependencies across dev/prod
2. **Scalability**: Easy horizontal scaling with container orchestration
3. **Isolation**: No conflicts with system Python/packages
4. **Flexibility**: Run CLI or web API from same codebase

**Backward compatibility maintained**: `python3 main.py` still works locally.

## Support & Debugging

For issues:
1. Check logs: `docker-compose logs -f`
2. Verify GPX file format: https://overpass-turbo.eu/
3. Test Overpass API: https://overpass-api.de/api/interpreter
4. Confirm filter syntax (key=value): [OSM wiki](https://wiki.openstreetmap.org/wiki/Map_features)

