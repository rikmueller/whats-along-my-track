import { ChangeEvent, useEffect, useRef } from 'react'
import { JobStatus } from '../api'
import { TileSource } from './InteractiveMap'
import './SettingsSheet.css'

const meterFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 })

function formatDistance(km: number | null | undefined) {
  if (km == null) return '—'
  return `${meterFormatter.format(km)} km`
}

type Props = {
  open: boolean
  onToggle: () => void
  settings: {
    projectName: string
    radiusKm: number
    includes: string[]
    excludes: string[]
    presets: string[]
  }
  onSettingsChange: (changes: Partial<Props['settings']>) => void
  onFileSelected: (file: File | null) => void
  selectedFile: File | null
  onStart: () => void
  status: JobStatus | null
  error: string | null
  onReset: () => void
  onOpenPresetModal: () => void
  onOpenIncludeModal: () => void
  onOpenExcludeModal: () => void
  tileSource: TileSource
  onTileChange: (id: string) => void
}

export default function SettingsSheet({
  open,
  onToggle,
  settings,
  onSettingsChange,
  onFileSelected,
  selectedFile,
  onStart,
  status,
  error,
  onReset,
  onOpenPresetModal,
  onOpenIncludeModal,
  onOpenExcludeModal,
  tileSource,
  onTileChange,
}: Props) {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    onFileSelected(file || null)
  }

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Clear native file input when selectedFile is reset to null
  useEffect(() => {
    if (!selectedFile && fileInputRef.current) {
      try {
        fileInputRef.current.value = ''
      } catch (e) {
        // ignore
      }
    }
  }, [selectedFile])

  return (
    <>
      {!open && (
        <button
          className="sheet-toggle"
          onClick={onToggle}
          aria-label={open ? 'Collapse controls' : 'Expand controls'}
          title={open ? 'Collapse controls' : 'Expand controls'}
        >
          {open ? '›' : '‹'}
        </button>
      )}

      <aside className={`sheet ${open ? 'open' : 'closed'}`}>
        {open && (
          <button
            className="sheet-collapse-btn in-panel"
            onClick={onToggle}
            aria-label="Collapse controls"
            title="Collapse controls"
          >
            ›
          </button>
        )}
        <div className="sheet-grabber" onClick={onToggle} aria-label="Toggle controls">
          <div className="grab-handle" />
        </div>

        <div className="sheet-content">
        <div className="sheet-header compact">
          {status && (
            <div className="status-chip small">
              {status.state === 'processing' && 'Processing...'}
              {status.state === 'completed' && 'Done'}
              {status.state === 'failed' && 'Failed'}
            </div>
          )}
        </div>

        {error && <div className="alert">{error}</div>}

        <section className="sheet-section">
          <div className="section-head">
            <h3>Upload GPX</h3>
            {selectedFile && <span className="pill">{selectedFile.name}</span>}
          </div>
          <label className="upload-tile">
            <input ref={fileInputRef} type="file" accept=".gpx" onChange={handleFileChange} />
            <div className="upload-body">
              <div className="upload-icon">^</div>
              <div>
                <div className="upload-title">Drop or click to upload</div>
                <div className="muted">GPX only, max 50MB</div>
              </div>
            </div>
          </label>
        </section>

        <section className="sheet-section">
          <div className="section-head">
            <h3>General</h3>
            <span className="pill">Radius: {settings.radiusKm} km</span>
          </div>
          <div className="field">
            <label htmlFor="projectName">Project name</label>
            <input
              id="projectName"
              value={settings.projectName}
              onChange={(e) => onSettingsChange({ projectName: e.target.value })}
              placeholder="My adventure"
            />
          </div>
          <div className="field">
            <label htmlFor="radius">Search radius (km)</label>
            <div className="slider-row">
              <input
                id="radius"
                type="range"
                min={1}
                max={50}
                step={1}
                value={settings.radiusKm}
                onChange={(e) => onSettingsChange({ radiusKm: Number(e.target.value) })}
              />
              <span className="pill">{settings.radiusKm} km</span>
            </div>
          </div>
          
        </section>

        <section className="sheet-section">
          <div className="section-head">
            <h3>Presets</h3>
            <button className="ghost" onClick={onOpenPresetModal}>
              +
            </button>
          </div>
          <div className="chips">
            {settings.presets.length === 0 && <span className="muted">No presets selected</span>}
            {settings.presets.map((p) => (
              <span key={p} className="chip">
                {p}
              </span>
            ))}
          </div>
        </section>

        <section className="sheet-section">
          <div className="section-head">
            <h3>Include filters</h3>
            <button className="ghost" onClick={onOpenIncludeModal}>
              +
            </button>
          </div>
          <div className="chips">
            {settings.includes.length === 0 && <span className="muted">No include filters</span>}
            {settings.includes.map((f) => (
              <span key={f} className="chip">
                {f}
              </span>
            ))}
          </div>
        </section>

        <section className="sheet-section">
          <div className="section-head">
            <h3>Exclude filters</h3>
            <button className="ghost" onClick={onOpenExcludeModal}>
              +
            </button>
          </div>
          <div className="chips">
            {settings.excludes.length === 0 && <span className="muted">No exclude filters</span>}
            {settings.excludes.map((f) => (
              <span key={f} className="chip muted-chip">
                {f}
              </span>
            ))}
          </div>
        </section>

        <section className="sheet-section">
          <div className="section-head">
            <h3>Downloads</h3>
            <span className="muted">Available after processing</span>
          </div>
          <div className="download-row">
            <a
              className={`btn ${status?.excel_file ? 'btn-primary' : 'btn-disabled'}`}
              href={status?.excel_file ? `/api/download/excel/${status.excel_file}` : undefined}
              target="_blank"
              rel="noreferrer"
            >
              Excel
            </a>
            <a
              className={`btn ${status?.html_file ? 'btn-secondary' : 'btn-disabled'}`}
              href={status?.html_file ? `/api/download/html/${status.html_file}` : undefined}
              target="_blank"
              rel="noreferrer"
            >
              Map (Folium)
            </a>
          </div>
        </section>

        <div className="actions">
          <div className="progress">
            <div className="labels">
              <span>{status?.message || 'Ready'}</span>
              <span>{status ? `${status.percent}%` : ''}</span>
            </div>
            <div className="bar">
              <div className="fill" style={{ width: `${status?.percent || 0}%` }} />
            </div>
            <div className="summary">
              <span>Rows: {status?.rows_count ?? '—'}</span>
              <span>Track: {formatDistance(status?.track_length_km)}</span>
            </div>
          </div>
          <div className="action-buttons">
            <button className="btn btn-secondary" onClick={onReset}>
              Reset
            </button>
            <button className="btn btn-primary" onClick={onStart}>
              {status?.state === 'processing' ? 'Processing...' : 'Process'}
            </button>
          </div>
        </div>
      </div>
    </aside>
    </>
  )
}
