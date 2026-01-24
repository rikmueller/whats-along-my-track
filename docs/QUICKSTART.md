# Quick Start Guide

Get AlongGPX running in 5 minutes.

## Prerequisites

**CLI:** Python 3.8+ (test: `python3 --version`)  
**Docker:** Docker + Docker Compose (test: `docker --version`)

## Option 1: CLI (Local)

### 1. Install
```bash
cd /home/rik/AlongGPX
pip install -r requirements-base.txt
```

### 2. Run
```bash
python3 cli/main.py --preset camp_basic
```

Your output files are in `data/output/`.

### 3. Customize
```bash
# Different search radius
python3 cli/main.py --radius-km 10 --preset camp_basic

# Multiple filters
python3 cli/main.py \
  --preset camp_basic \
  --include amenity=drinking_water \
  --include amenity=shelter \
  --radius-km 5 \
  --project-name MyTrip
```

See `python3 cli/main.py --help` for all options.

---

## Option 2: Docker (Web API)

### 1. Start
```bash
cd docker
docker-compose up -d
```

### 2. Check Health
```bash
curl http://localhost:5000/health
```

Response: `{"status": "healthy", "service": "AlongGPX"}`

### 3. Process GPX
```bash
curl -F "file=@../data/input/track.gpx" \
     -F "project_name=MyTrip" \
     -F "radius_km=5" \
     http://localhost:5000/api/process
```

Response:
```json
{
  "success": true,
  "excel_file": "MyTrip_20260124_120000.xlsx",
  "html_file": "MyTrip_20260124_120000.html",
  "rows_count": 42,
  "track_length_km": 125.5
}
```

### 4. View Results
Files are in `data/output/`.

---

## Configuration

### CLI: Via Environment (.env)
Create `cli/.env`:
```
ALONGGPX_RADIUS_KM=8
ALONGGPX_BATCH_KM=50
ALONGGPX_TIMEZONE=Europe/Berlin
```

### CLI: Via Command Line
```bash
python3 cli/main.py --radius-km 10 --preset drinking_water
```

### Docker: Via docker-compose.yml
Edit `docker/docker-compose.yml` environment section:
```yaml
environment:
  - ALONGGPX_RADIUS_KM=5
  - ALONGGPX_BATCH_KM=50
```

### Both: Via config.yaml
Edit `config.yaml` for permanent defaults.

---

## Common Filters (Presets)

```bash
python3 cli/main.py --preset camp_basic        # Campsites (tents allowed)
python3 cli/main.py --preset accommodation     # Hotels, B&Bs, guest houses
python3 cli/main.py --preset drinking_water    # Water sources
python3 cli/main.py --preset shelters          # Emergency shelters
```

Create custom filters in `presets.yaml`.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| CLI won't start | Run from repo root: `cd /home/rik/AlongGPX` |
| No results | Check filter syntax: `key=value`, verify OSM data at [overpass-turbo.eu](https://overpass-turbo.eu/) |
| Docker won't build | `docker system prune -f` then retry |
| Port 5000 in use | Change in `docker/docker-compose.yml`: `ports: ["5001:5000"]` |

See [DOCKER.md](DOCKER.md) for Docker-specific issues.

---

## Next Steps

- Adjust `config.yaml` for your preferred defaults
- Add custom GPX files to `data/input/`
- Create custom filter presets in `presets.yaml`
- Read [DOCKER.md](DOCKER.md) for web API details
