# AlongGPX

**Find OpenStreetMap POIs along your GPX tracks. Plan smarter: campsites, water sources, shelters, restaurants—everything you need along your route.**

<div align="center">

[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://github.com/rikmueller/alonggpx/pkgs/container/alonggpx)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

</div>

---

## 🎯 What It Does

Upload a GPX track from your bike computer, phone, or mapping app. AlongGPX searches OpenStreetMap for points of interest along your route and generates:

- **📊 Excel spreadsheet** - Names, contact info, opening hours, distances from track
- **🗺️ Interactive map** - Color-coded markers by POI type, multiple tile layers
- **📍 Real-time visualization** - Watch POIs appear as the search progresses

Perfect for planning bikepacking trips, long-distance hikes, road trips, or any adventure where you need to know what's nearby.

---

## 🚀 Quick Start

### Docker

Deploy using Docker Compose:

```bash
# Clone repository
git clone https://github.com/rikmueller/alonggpx.git
cd alonggpx/deployment

# Copy .env template
cp .env.example .env

# Build and start services
docker compose up --build -d
```

Open your browser to **http://localhost:3000**

📖 **Full configuration options:** [deployment/QUICKSTART.md](deployment/QUICKSTART.md)

### Other Options

- **🔧 Development setup** - Local Vite dev server, hot reload → [docs/quickstart-dev.md](docs/quickstart-dev.md)
- **⌨️ CLI** - Command-line batch processing → [docs/quickstart-cli.md](docs/quickstart-cli.md)

---

## 💡 How to Use

### 1. Upload Your GPX Track

- Drag and drop your `.gpx` file onto the map
- Your track appears instantly (blue line with start/end markers)
- Map automatically centers on your route

### 2. Choose What to Find

**Quick presets:**
- 🏕️ Campsites
- 💧 Drinking water
- 🏠 Accommodation (hotels, hostels, B&Bs)
- 🍴 Food & restaurants
- 🏪 Shops & supermarkets
- 🚽 Public toilets
- ⛺ Shelters

**Custom filters:**
Build your own using OpenStreetMap tags (e.g., `amenity=restaurant`, `shop=bicycle`)

### 3. Generate Results

- Set your search radius (1-50 km from track)
- Click **Generate Results**
- Watch POIs appear on the map in real-time
- Download Excel spreadsheet or interactive HTML map

### 4. Explore Results

- **Interactive map** - Click markers for details (name, distance, website, hours)
- **Excel export** - Sorted by distance from start, with all metadata
- **Multiple tile layers** - OpenStreetMap, OpenTopoMap, CyclOSM
- **Mobile-friendly** - Works on phones and tablets

---

## ✨ Key Features

- **🗺️ Map-first interface** - See your track and POIs continuously
- **⚡ Real-time updates** - POIs appear as they're found
- **📱 Mobile responsive** - Collapsible settings, touch-friendly
- **🎨 Smart coloring** - Different colors for different POI types
- **🎯 Accurate distances** - WGS84 geodesic calculations
- **📦 Self-contained** - Runs offline after setup (uses public Overpass API)
- **🔒 Privacy-focused** - Your GPX files never leave your device/server

---

## 🏗️ Architecture

AlongGPX queries OpenStreetMap via the Overpass API:

1. **Parse GPX** - Extract track coordinates and calculate total distance
2. **Query Overpass** - Search for POIs in circles along your route
3. **Filter results** - Apply include/exclude rules, calculate distances
4. **Export** - Generate Excel spreadsheet and interactive Folium map

All processing happens server-side. Results are cached for quick downloads.

---

## ⚙️ Configuration

AlongGPX is configured via environment variables. See [deployment/.env](deployment/.env) for available options:

| Variable | Default | Description |
|----------|---------|-------------|
| `ALONGGPX_RADIUS_KM` | `5` | Search radius around track (km) |
| `ALONGGPX_BATCH_KM` | `50` | Track distance per Overpass query |
| `ALONGGPX_TIMEZONE` | `UTC` | Timezone for output timestamps |
| `ALONGGPX_PROJECT_NAME` | `AlongGPX` | Default project name |

**Filter presets** are defined in [data/presets.yaml](data/presets.yaml). Add your own!

---

## 📖 Documentation

- **[Quick Start (Docker)](deployment/QUICKSTART.md)** - Production deployment with local builds
- **[Development Setup](docs/quickstart-dev.md)** - Local dev with Vite & Docker
- **[CLI Usage](docs/quickstart-cli.md)** - Command-line batch processing
- **[Frontend Architecture](docs/FRONTEND.md)** - React/TypeScript details
- **[Quick Reference](FRONTEND_QUICKREF.md)** - Developer cheat sheet

---

## 🤝 Contributing

Contributions welcome! Please open an issue first to discuss major changes.

### Development

```bash
# Clone repository
git clone https://github.com/rikmueller/alonggpx.git
cd alonggpx/deployment

# Configure environment
cp .env.example .env

# Start development environment with hot reload
docker compose -f docker-compose.dev.yml up
```

See [docs/quickstart-dev.md](docs/quickstart-dev.md) for detailed setup instructions.

---

## 📜 License

MIT License - see [LICENSE](LICENSE) for details

---

## 🙏 Credits

Built with amazing open-source projects:

- **[OpenStreetMap](https://www.openstreetmap.org/)** - Community-driven map data
- **[Overpass API](https://overpass-api.de/)** - OSM query infrastructure
- **[React](https://react.dev/)** + **[TypeScript](https://www.typescriptlang.org/)** - Modern web framework
- **[Leaflet](https://leafletjs.com/)** - Interactive maps
- **[Flask](https://flask.palletsprojects.com/)** - Python web framework
- **[pandas](https://pandas.pydata.org/)** + **[openpyxl](https://openpyxl.readthedocs.io/)** - Data processing
- **[Folium](https://python-visualization.github.io/folium/)** - Python → Leaflet maps

Inspired by **[GPX Studio](https://gpx.studio/)** ❤️

---

## ⚠️ Development Status

This project is under active development. Features and APIs may change. Documentation may lag behind implementation. Use at your own risk for production workloads.

**Current focus:** Stabilizing Docker deployment and improving UI/UX.

