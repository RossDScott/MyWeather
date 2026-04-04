import { useState, useRef, useCallback, useEffect } from 'react';
import { searchLocations, reverseGeocode } from '../utils/api';
import styles from './ManageLocations.module.css';

export default function ManageLocations({ locations, activeId, onChange, onActiveChange, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searchError, setSearchError] = useState(null);
  const [dragIdx, setDragIdx] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const debounceRef = useRef(null);

  const doSearch = useCallback(async (q) => {
    if (q.length < 2) { setResults([]); setSearchError(null); return; }
    try {
      setSearchError(null);
      const res = await searchLocations(q);
      setResults(res.length > 0 ? res : []);
      if (res.length === 0) setSearchError('No locations found');
    } catch {
      setResults([]);
      setSearchError('Search unavailable');
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, doSearch]);

  const addLocation = (loc) => {
    if (!locations.find((l) => l.id === loc.id)) {
      onChange([...locations, loc]);
    }
    setQuery('');
    setResults([]);
    setSearchError(null);
  };

  const removeLocation = (id) => {
    if (locations.length <= 1) return;
    const next = locations.filter((l) => l.id !== id);
    onChange(next);
    if (activeId === id) onActiveChange(next[0].id);
  };

  const handleDrop = (toIdx) => {
    if (dragIdx === null || dragIdx === toIdx) return;
    const next = [...locations];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(toIdx, 0, moved);
    onChange(next);
    setDragIdx(null);
  };

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) { setQuery('My Location'); return; }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Math.round(pos.coords.latitude * 10000) / 10000;
        const lon = Math.round(pos.coords.longitude * 10000) / 10000;
        try {
          const name = await reverseGeocode(lat, lon);
          setQuery(name);
        } catch {
          setQuery('My Location');
        }
        setGeoLoading(false);
      },
      () => {
        setQuery('My Location');
        setGeoLoading(false);
      },
      { timeout: 10000 },
    );
  }, []);

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <span className={styles.headerTitle}>Manage Locations</span>
        <button className={styles.doneBtn} onClick={onClose}>Done</button>
      </div>

      <div className={styles.searchWrap}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search for a city..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles.searchInput}
          />
          <button
            className={styles.locateBtn}
            onClick={handleLocate}
            disabled={geoLoading}
            title="Use current location"
          >
            {geoLoading ? '...' : '\uD83D\uDCCD'}
          </button>
        </div>

        {results.length > 0 && (
          <div className={styles.searchResults}>
            {results.map((r) => (
              <div key={r.id} className={styles.searchRow} onClick={() => addLocation(r)}>
                <span className={styles.searchName}>{r.name}</span>
                <span className={styles.searchPlus}>+</span>
              </div>
            ))}
          </div>
        )}

        {searchError && results.length === 0 && query.length >= 2 && (
          <p className={styles.searchMsg}>{searchError}</p>
        )}
      </div>

      <div className={styles.savedWrap}>
        <p className={styles.savedLabel}>Saved · drag to reorder · top = default</p>
        {locations.map((loc, i) => (
          <div
            key={loc.id}
            draggable
            onDragStart={() => setDragIdx(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(i)}
            className={styles.manageRow}
            style={{
              background: i === 0 ? 'rgba(91,156,245,0.12)' : 'transparent',
              borderColor: i === 0 ? 'rgba(91,156,245,0.2)' : 'rgba(255,255,255,0.06)',
            }}
          >
            <div className={styles.rowLeft}>
              <span className={styles.dragHandle}>≡</span>
              <div>
                <span className={styles.locName}>{loc.name}</span>
                {i === 0 && <span className={styles.defaultBadge}>Default</span>}
              </div>
            </div>
            <button
              className={styles.deleteBtn}
              style={{ opacity: locations.length <= 1 ? 0.2 : 1 }}
              onClick={(e) => { e.stopPropagation(); removeLocation(loc.id); }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
