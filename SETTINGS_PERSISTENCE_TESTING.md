# Settings Persistence Testing Guide

## What Was Implemented

Settings and track data now persist across page navigation using browser localStorage. When users navigate away from the App page and return, their settings are restored.

### Key Changes to [frontend/src/DevApp.tsx](frontend/src/DevApp.tsx)

1. **Added localStorage helper functions** (lines 44-98):
   - `loadSettings()` - Loads saved settings from localStorage
   - `saveSettings(settings)` - Persists settings to localStorage  
   - `loadTrackData()` - Loads saved track data from localStorage
   - `saveTrackData(trackData)` - Persists track coordinates to localStorage
   - `clearPersistedSettings()` - Clears all persisted data

2. **Added Settings TypeScript type** (line 149-156):
   - Proper typing for settings state with projectName, radiusKm, includes[], excludes[], presets[]

3. **Modified state initialization** (lines 159, 166-176):
   - `settings` state now loads from localStorage first, falls back to config defaults
   - `trackData` state now loads from localStorage first, falls back to empty array

4. **Added auto-save useEffect hooks** (lines 277-302):
   - Settings auto-save whenever they change
   - Track data auto-save whenever it changes (cleared if empty)

5. **Modified config loading** (lines 240-256):
   - Only applies config defaults if localStorage doesn't have saved settings
   - Prevents overwriting user settings on page reload

6. **Enhanced Reset button** (lines 417-436):
   - Now calls `clearPersistedSettings()` to clear localStorage
   - Only explicit Reset button click clears localStorage (not page navigation)

### What Persists

✅ Project name
✅ Radius (km)
✅ Include filters (list)
✅ Exclude filters (list)
✅ Selected presets
✅ Uploaded GPX track data / coordinates

### What Does NOT Persist (By Design)

❌ Processing state (jobId, jobStatus) - Clears between sessions for fresh start
❌ Results (POI markers) - Recalculated when needed
❌ Uploaded File object - Only track coordinates retained (file is too large)

---

## Manual Testing Steps

### Test 1: Settings Persist Across Page Navigation

1. Open http://localhost:3000/app in your browser
2. Configure some settings:
   - Enter project name: "Test Trip"
   - Set radius to 10 km
   - Add a filter: `amenity=drinking_water`
   - Add a preset: "Camp Basic"
3. Click "How it works" link (navigate to `/how-it-works`)
4. Click "Open App" link (navigate back to `/app`)
5. **Expected**: All settings are restored exactly as they were

### Test 2: Track Data Persists

1. Open http://localhost:3000/app
2. Upload a GPX file from `data/input/example.gpx`
3. Wait for track to render on map
4. Navigate to "How it works" page
5. Navigate back to "/app"
6. **Expected**: Track appears on map immediately (same coordinates)

### Test 3: Settings Survive Browser Refresh

1. Open app and configure settings (project name, radius, filters)
2. Upload a GPX file
3. Press browser refresh (F5 or Cmd+R)
4. **Expected**: Settings and track persist after page reload

### Test 4: Reset Button Clears Everything

1. Open app, configure settings, upload GPX
2. Click "Reset" button (in settings panel)
3. **Expected**: 
   - All settings reset to defaults from config
   - Track data cleared
   - Settings sheet opens
   - localStorage is cleared
4. Navigate away and back to `/app`
5. **Expected**: Settings are now defaults (not the old values)

### Test 5: Fresh Install (No localStorage)

1. Open DevTools (F12) → Application tab → Local Storage → clear all
2. Navigate to http://localhost:3000/app
3. **Expected**: App loads with config defaults, not empty values

### Test 6: Multiple Filter Management

1. Add custom filters: `tourism=camp_site` and `amenity=drinking_water`
2. Select preset: "Accommodation"
3. Navigate away and back
4. **Expected**: 
   - Custom filters preserved
   - Preset preserved
   - Combined filter list restored

### Test 7: Marker Mode Persistence

1. In the app, switch to "Map Marker" mode
2. Set radius and filters
3. Navigate away and back
4. **Expected**: Marker mode is set, settings preserved (Note: marker position on map won't persist, but settings do)

---

## Browser DevTools Verification

To verify localStorage is working:

1. Open DevTools (F12)
2. Go to "Application" tab
3. Expand "Local Storage" → select `http://localhost:3000`
4. Look for these keys:
   - `whatsaround.settings` - Contains JSON of all user settings
   - `whatsaround.trackData` - Contains JSON array of [lon, lat] coordinates
   - `whatsaround.tile` - Map tile preference (was already persisted before)

5. You should see the stored JSON data that updates in real-time as you change settings

---

## Expected localStorage Structure

```json
// whatsaround.settings
{
  "projectName": "My Bikepacking Trip",
  "radiusKm": 8,
  "includes": [
    "amenity=drinking_water",
    "tourism=camp_site"
  ],
  "excludes": ["tents=no"],
  "presets": ["camp_basic"]
}

// whatsaround.trackData
[
  [-8.5, 52.3],
  [-8.51, 52.31],
  [-8.52, 52.32],
  ...
]
```

---

## Notes

- localStorage has a size limit (~5-10MB depending on browser), but track data with reasonable GPX files should not exceed this
- Settings are saved AFTER every change (useEffect with dependency on settings state)
- Track data is saved AFTER upload or when it changes
- If localStorage quota is exceeded, console will show warnings but app won't crash
- Settings work across tabs - if you open the app in another tab, both tabs share the same localStorage

---

## Troubleshooting

**Settings not persisting after page navigation:**
- Open DevTools → Application → check if localStorage keys exist
- Check browser console for any errors (useEffect might be logging warnings)
- Try manually clearing localStorage (DevTools → Application → Clear Site Data)

**Track not showing after navigation:**
- Check `whatsaround.trackData` key in localStorage
- If empty, the GPX may be too large or parsing failed
- Check browser console for parsing errors

**Reset button not working:**
- Verify localStorage keys are being removed (should disappear in DevTools)
- Check console for warnings in `clearPersistedSettings()` function

---

## Code References

- **Settings persistence logic**: [DevApp.tsx lines 44-98](frontend/src/DevApp.tsx#L44-L98)
- **Auto-save useEffects**: [DevApp.tsx lines 277-302](frontend/src/DevApp.tsx#L277-L302)
- **Reset button with localStorage clear**: [DevApp.tsx lines 417-436](frontend/src/DevApp.tsx#L417-L436)
- **State initialization from localStorage**: [DevApp.tsx lines 159, 166-176](frontend/src/DevApp.tsx#L159-L176)
