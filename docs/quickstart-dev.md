# AlongGPX - Development Setup

This guide covers setting up AlongGPX for local development and testing.

## 🎯 Overview

AlongGPX offers multiple development workflows:

1. **Local Vite + Flask** - Fastest hot reload, best for frontend development
2. **Docker Compose Dev** - Closest to production, includes hot reload
3. **Build from Dockerfile** - Test production builds locally

Choose based on what you're working on:
- **Frontend only** → Local Vite
- **Full stack** → Docker Compose Dev
- **Testing deployment** → Build from Dockerfile

---

## Option 1: Local Vite + Flask (Recommended for Development)

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

### Setup

**1. Clone repository**
```bash
git clone https://github.com/rikmueller/alonggpx.git
cd alonggpx
```

**2. Start Flask backend**
```bash
# Create virtual environment
python3 -m venv venv-web
source venv-web/bin/activate  # Windows: venv-web\Scripts\activate

# Install dependencies
pip install -r backend/api/requirements.txt

# Start Flask
python3 backend/api/app.py
```

Flask runs on **http://localhost:5000**

**3. Start Vite dev server (new terminal)**
```bash
cd frontend
npm install
npm run dev
```

Vite runs on **http://localhost:3000** with hot module replacement

### Development Workflow

- **Frontend changes** → Instant hot reload in browser
- **Backend changes** → Restart Flask manually (`Ctrl+C`, then `python3 backend/api/app.py`)
- **API calls** → Automatically proxied from `:3000` to `:5000` (see `frontend/vite.config.ts`)

### Environment Variables

**⚠️ Important:** Both Flask backend and Vite dev server read configuration from **`cli/.env`** by default.

This single file controls all local development settings:

**Shared configuration** (`cli/.env`):
```bash
# Vite HMR hostname (for remote development)
ALONGGPX_HOSTNAME=localhost

# Project defaults
ALONGGPX_PROJECT_NAME=MyProject
ALONGGPX_OUTPUT_PATH=data/output
ALONGGPX_RADIUS_KM=5

# Search filters (semicolon-separated)
ALONGGPX_SEARCH_INCLUDE=
ALONGGPX_SEARCH_EXCLUDE=

# Overpass API settings
ALONGGPX_BATCH_KM=50
```

**Optional overrides:**
- Create `frontend/.env.local` to override Vite-specific settings (e.g., `VITE_BACKEND_URL`)
- `frontend/.env.local` is git-ignored and has highest priority for frontend settings
- Flask always uses `cli/.env` (no separate backend .env file needed)

---

## Option 2: Docker Compose Dev Mode

### Prerequisites
- Docker
- Docker Compose

### Setup

**1. Clone repository**
```bash
git clone https://github.com/rikmueller/alonggpx.git
cd alonggpx/deployment
```

**2. Start development containers**
```bash
docker-compose -f docker-compose.dev.yml up
```

Services:
- **Frontend**: http://localhost:3000 (with Vite HMR)
- **Backend**: http://localhost:5000

### Development Workflow

- **Frontend changes** → Hot reload via Vite
- **Backend changes** → Container restarts automatically
- **Volume mounts** → Local code synced to containers
- **Configuration** → Edit `deployment/.env` for defaults

### Stop containers
```bash
docker compose -f docker-compose.dev.yml down
```

### Rebuild after dependency changes
```bash
docker compose -f docker-compose.dev.yml up --build
```

---

## Option 3: Build Production Images Locally

Test the production Docker setup before deployment:

**1. Configure environment**
```bash
cd deployment
cp .env.example .env
nano .env  # Edit configuration
```

**2. Build images from source**
```bash
docker compose build
```

**3. Run production mode**
```bash
docker compose up -d
```

**4. Access**
- Frontend: http://localhost:3000 (Nginx serves static build)
- Backend: Accessible via Nginx reverse proxy

**5. Stop**
```bash
docker compose down
```

---

## 🧪 Testing
   - Processing begins immediately

### 4. **Watch Real-Time Progress**
   - Progress bar animates smoothly (0-100%)
   - Status messages update: "Querying Overpass", "Filtering results", etc.
   - **POI markers appear live** on map as they're discovered
   - Markers color-coded by filter rank:
     - 1st filter = Red
     - 2nd filter = Orange
     - 3rd filter = Purple
     - 4th+ filters cycle through palette
   - Hover over markers for quick tooltips

### 5. **Explore Results**
   - **Map interactions**:
     - Click markers for detailed popups (name, distance, website, phone, hours)
     - Switch tile layers (OSM, OpenTopoMap, CyclOSM) via layer control
     - Use geolocation button to center on your position
     - Scale control shows distance reference
     - Recenter button fits all POIs and track in view
   - **Downloads**:
     - **Download Excel**: Detailed spreadsheet with all POI data
     - **Download Map**: Standalone HTML Folium map
   - **Reset**: Click "🔄 Reset" to clear everything and start new search

---

## Architecture

```
┌─────────────────────────────────────┐
│   Frontend (React/Vite)             │
│   http://localhost:3000             │
└─────────────┬───────────────────────┘
              │
              │ HTTP/API calls
              │
┌─────────────▼───────────────────────┐
│   Backend (Flask)                   │
│   http://localhost:5000             │
│                                     │
│   /api/config        - Get settings │
│   /api/process       - Start job    │
│   /api/status/{id}   - Check status │
│   /api/download/*    - Get files    │
└─────────────┬───────────────────────┘
              │
              │ Overpass queries
              │
┌─────────────▼───────────────────────┐
│   AlongGPX Core Pipeline            │
│   - GPX parsing                     │
│   - Overpass API calls              │
│   - Filter + distance calc          │
│   - Excel + Folium export           │
└─────────────────────────────────────┘
```

---

## 🧪 Testing & Debugging

### Testing Local Backend

```bash
# Health check
curl http://localhost:5000/health

# Get config
curl http://localhost:5000/api/config

# Test processing (with example GPX)
curl -X POST http://localhost:5000/api/process \
  -F "file=@data/input/example.gpx" \
  -F "project_name=TestRun" \
  -F "radius_km=5" \
  -F "preset=camp_sites_tent"

# Check job status (use job_id from previous response)
curl http://localhost:5000/api/status/<job_id>
```

### Frontend Debugging

Open browser DevTools (F12) and check:

1. **Network Tab** - See API requests/responses
2. **Console Tab** - View logs and errors
3. **React DevTools** - Inspect component state (install browser extension)

Common issues:
- **CORS errors**: Vite proxy not configured - check `vite.config.ts`
- **404 on API calls**: Backend not running or wrong port
- **WebSocket failed**: Normal - app falls back to polling automatically

### Docker Dev Mode Debugging

```bash
# View backend logs
docker-compose -f deployment/docker-compose.dev.yml logs -f app

# View frontend build logs
docker-compose -f deployment/docker-compose.dev.yml logs -f frontend

# Restart specific service
docker-compose -f deployment/docker-compose.dev.yml restart app

# Rebuild after code changes
docker-compose -f deployment/docker-compose.dev.yml up -d --build
```

---

## 🔧 Troubleshooting

### Backend Issues

**"ModuleNotFoundError"**
```bash
# Verify virtual environment activated
which python  # Should show venv path

# Reinstall dependencies
pip install -r backend/api/requirements.txt
```

**"Port 5000 already in use"**
```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>

# Or use different port
export FLASK_PORT=5001
python backend/api/app.py
```

**"Job stuck in processing"**
- Large GPX files (>500km) may take 5-10 minutes
- Check backend logs for Overpass API errors
- Increase `ALONGGPX_BATCH_KM` to reduce API calls
- Very dense areas (cities) may timeout - try smaller radius

### Frontend Issues

**"Can't connect to backend"**
```bash
# Check backend is running
curl http://localhost:5000/health

# Check Vite proxy config
cat frontend/vite.config.ts | grep proxy

# Restart both services
# Terminal 1:
python backend/api/app.py

# Terminal 2:
cd frontend && npm run dev
```

**"npm install fails"**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf frontend/node_modules frontend/package-lock.json
cd frontend && npm install
```

**"Blank page after build"**
```bash
# Check build output
cd frontend && npm run build

# Preview production build locally
npm run preview

# Check for console errors in browser DevTools
```

### Docker Issues

**"Build fails with EACCES error"**
```bash
# Fix permissions on data directories
sudo chown -R $(id -u):$(id -g) data/
chmod 755 data/output
```

**"Container exits immediately"**
```bash
# Check logs for error message
cd deployment
docker compose logs app

# For dev mode:
docker compose -f docker-compose.dev.yml logs app

# Verify .env file syntax (no spaces around =)
cat .env
```

**"Hot reload not working"**
- Ensure volumes are correctly mounted in `docker-compose.dev.yml`
- On Windows/WSL2: Try enabling polling in `vite.config.ts`
- Restart Docker service: `sudo systemctl restart docker`

---

## 📦 Project Structure Reference

```
AlongGPX/
├── backend/                    # Python backend
│   ├── api/                   # Flask REST API
│   │   ├── app.py            # Main Flask app with job tracking
│   │   └── requirements.txt  # Backend dependencies
│   └── core/                 # Shared pipeline modules
│       ├── config.py         # Environment-based configuration
│       ├── presets.py        # Filter preset handling
│       ├── gpx_processing.py # GPX parsing & metrics
│       ├── overpass.py       # Overpass API queries
│       ├── filtering.py      # Result filtering
│       ├── export.py         # Excel export
│       └── folium_map.py     # Interactive map generation
├── cli/                       # Command-line interface
│   ├── main.py               # CLI entry point
│   └── requirements-cli.txt  # CLI dependencies
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── DevApp.tsx        # Main app component
│   │   ├── api.ts            # Typed API client
│   │   ├── components/       # UI components
│   │   └── hooks/            # Custom React hooks
│   ├── package.json
│   └── vite.config.ts        # Vite configuration
├── deployment/                # Docker deployment
│   ├── docker-compose.yml    # Production setup
│   ├── docker-compose.dev.yml # Development setup
│   ├── Dockerfile            # Backend image
│   ├── Dockerfile.nginx      # Frontend image
│   └── nginx.conf            # Reverse proxy config
├── data/
│   ├── presets.yaml          # Filter presets
│   ├── input/                # GPX files (mounted read-only)
│   └── output/               # Generated Excel/HTML
└── docs/                      # Documentation
    ├── quickstart-dev.md     # This file
    ├── quickstart-docker.md  # Production deployment
    ├── quickstart-cli.md     # CLI usage
    └── FRONTEND.md           # Frontend architecture
```

---

## 🔄 Common Development Workflows

### Adding Custom Preset

1. Edit `data/presets.yaml`:
```yaml
my_custom_preset:
  name: "My Custom Search"
  category: "Custom"
  info: "Description shown in UI"
  include:
    - "amenity=restaurant"
    - "cuisine=pizza"
  exclude:
    - "wheelchair=no"
```

2. Restart backend (preset loads automatically)
3. Appears in web UI preset dropdown

### Creating New Component

1. Create `frontend/src/components/MyComponent.tsx`:
```typescript
import './MyComponent.css'

interface MyComponentProps {
  title: string
}

function MyComponent({ title }: MyComponentProps) {
  return <div className="my-component">{title}</div>
}

export default MyComponent
```

2. Create `frontend/src/components/MyComponent.css`:
```css
.my-component {
  padding: var(--spacing-md);
  background: var(--color-bg-secondary);
}
```

3. Import in parent component:
```typescript
import MyComponent from './components/MyComponent'

// Use in JSX
<MyComponent title="Hello" />
```

### Adding API Endpoint

1. Add route in `backend/api/app.py`:
```python
@app.route('/api/my-endpoint', methods=['GET'])
def my_endpoint():
    return jsonify({'data': 'value'}), 200
```

2. Add client method in `frontend/src/api.ts`:
```typescript
export const apiClient = {
  async getMyData(): Promise<{ data: string }> {
    const response = await axios.get(`${API_BASE}/my-endpoint`)
    return response.data
  },
}
```

3. Use in component:
```typescript
const data = await apiClient.getMyData()
```

---

## 📚 Additional Resources

- **Frontend Architecture**: [docs/FRONTEND.md](FRONTEND.md)
- **CLI Usage**: [docs/quickstart-cli.md](quickstart-cli.md)
- **Production Deployment**: [docs/quickstart-docker.md](quickstart-docker.md)
- **OSM Tag Reference**: https://wiki.openstreetmap.org/wiki/Map_features
- **Overpass API**: https://overpass-api.de/
- **React Documentation**: https://react.dev/
- **Flask Documentation**: https://flask.palletsprojects.com/

---

## 🚀 Next Steps

1. ✅ Choose your development setup (Option 1, 2, or 3)
2. 🧪 Test with your own GPX files
3. 🎨 Customize presets and UI styling
4. 🔧 Extend API or add new features
5. 📦 Deploy to production with [quickstart-docker.md](quickstart-docker.md)

---

Happy developing! 🗺️
