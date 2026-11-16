import { useEffect, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons in bundlers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Cochabamba metropolitan area bbox approx
const COCHA_VIEWBOX = "-66.35,-17.25,-65.95,-17.55";
const COCHABAMBA: [number, number] = [-17.3935, -66.157];

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function Recenter({ center, zoom }: { center: [number, number] | null; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom ?? 16, { duration: 0.6 });
  }, [center, zoom, map]);
  return null;
}

export interface MapPickerProps {
  lat?: number;
  lng?: number;
  onChange: (pos: { lat: number; lng: number; label?: string }) => void;
  height?: string;
}

interface Place {
  lat: number;
  lon: number;
  display_name: string;
  name?: string;
  type?: string;
  class?: string;
}

async function searchPlaces(query: string): Promise<Place[]> {
  const q = query.trim();
  if (!q) return [];

  // Try: biased to Cochabamba metro, bounded
  const bbox = `viewbox=${COCHA_VIEWBOX}&bounded=1`;
  const base = "https://nominatim.openstreetmap.org/search";
  const url1 = `${base}?format=jsonv2&addressdetails=1&limit=8&countrycodes=bo&${bbox}&q=${encodeURIComponent(q)}`;

  const res1 = await fetch(url1, { headers: { "Accept-Language": "es" } });
  let data: Place[] = res1.ok ? await res1.json() : [];

  // Fallback: no bbox, all Bolivia
  if (data.length === 0) {
    const url2 = `${base}?format=jsonv2&addressdetails=1&limit=8&countrycodes=bo&q=${encodeURIComponent(q)}`;
    const res2 = await fetch(url2, { headers: { "Accept-Language": "es" } });
    data = res2.ok ? await res2.json() : [];
  }

  return data.map((d: any) => ({
    lat: parseFloat(d.lat),
    lon: parseFloat(d.lon),
    display_name: d.display_name,
    name: d.name || d.display_name.split(",")[0],
    type: d.type,
    class: d.class,
  }));
}

function parseGoogleMapsUrl(input: string): { lat: number; lng: number } | null {
  // Matches "@-17.3935,-66.157" or "?q=-17.3935,-66.157" or "/-17.3935,-66.157"
  const coord = input.match(/(-?\d{1,3}\.\d+)[,\s]+(-?\d{1,3}\.\d+)/);
  if (coord) {
    const lat = parseFloat(coord[1]);
    const lng = parseFloat(coord[2]);
    if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return { lat, lng };
  }
  return null;
}

export default function MapPicker({ lat, lng, onChange, height = "320px" }: MapPickerProps) {
  const [pos, setPos] = useState<[number, number] | null>(
    typeof lat === "number" && typeof lng === "number" ? [lat, lng] : null,
  );
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [searching, setSearching] = useState(false);
  const [geoBusy, setGeoBusy] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [focused, setFocused] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof lat === "number" && typeof lng === "number") setPos([lat, lng]);
  }, [lat, lng]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setShowResults(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // Live search with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (q.length < 3) {
      setResults([]);
      return;
    }

    // Google Maps URL paste shortcut
    const coords = parseGoogleMapsUrl(q);
    if (coords) {
      setResults([]);
      handlePick(coords.lat, coords.lng, "Coordenadas pegadas");
      setShowResults(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await searchPlaces(q);
        setResults(data);
        setShowResults(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function handlePick(la: number, lo: number, label?: string) {
    setPos([la, lo]);
    onChange({ lat: la, lng: lo, label });
  }

  function pickResult(r: Place) {
    handlePick(r.lat, r.lon, r.display_name);
    setShowResults(false);
    setQuery(r.name || r.display_name.split(",")[0]);
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setGeoError("Tu navegador no soporta geolocalización.");
      return;
    }
    setGeoError(null);
    setGeoBusy(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setGeoBusy(false);
        handlePick(p.coords.latitude, p.coords.longitude, "Mi ubicación actual");
      },
      (err) => {
        setGeoBusy(false);
        const msg =
          err.code === err.PERMISSION_DENIED ? "Permiso denegado. Activa la ubicación en el navegador." :
          err.code === err.POSITION_UNAVAILABLE ? "Ubicación no disponible." :
          err.code === err.TIMEOUT ? "Tiempo agotado buscando tu ubicación." :
          "No se pudo obtener tu ubicación.";
        setGeoError(msg);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  const openDropdown = focused && (results.length > 0 || (searching && query.length >= 3));

  return (
    <div className="space-y-2">
      <div ref={boxRef} className="relative">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">🔍</div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              placeholder="Buscar venue, dirección o pega coords de Google Maps"
              className="w-full border border-gray-300 rounded-lg pl-9 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gBlue/40 focus:border-gBlue"
              autoComplete="off"
              spellCheck={false}
            />
            {searching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs animate-pulse">…</div>
            )}
            {query && !searching && (
              <button
                type="button"
                onClick={() => { setQuery(""); setResults([]); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-sm w-5 h-5 rounded-full hover:bg-gray-100"
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={useCurrentLocation}
            disabled={geoBusy}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 whitespace-nowrap disabled:opacity-60"
            title="Usar mi ubicación actual"
          >
            {geoBusy ? "⏳" : "📍"} Mi ubicación
          </button>
        </div>

        {openDropdown && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-72 overflow-y-auto">
            {searching && results.length === 0 && (
              <div className="px-3 py-3 text-sm text-gray-500">Buscando "{query}" en Cochabamba…</div>
            )}
            {!searching && results.length === 0 && query.length >= 3 && (
              <div className="px-3 py-3 text-sm text-gray-500">
                Sin resultados para "{query}". Prueba otro término o clickea directo en el mapa.
              </div>
            )}
            {results.map((r, i) => (
              <button
                key={i}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); pickResult(r); }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 border-b border-gray-100 last:border-0 flex items-start gap-2"
              >
                <span className="text-gray-400 mt-0.5">📍</span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-gray-900 truncate">{r.name}</div>
                  <div className="text-xs text-gray-500 line-clamp-2">{r.display_name}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {geoError && (
        <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {geoError}
        </div>
      )}

      <div className="rounded-lg overflow-hidden border border-gray-300" style={{ height }}>
        <MapContainer
          center={pos ?? COCHABAMBA}
          zoom={pos ? 16 : 13}
          style={{ width: "100%", height: "100%" }}
          scrollWheelZoom
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <ClickHandler onPick={handlePick} />
          <Recenter center={pos} zoom={16} />
          {pos && <Marker position={pos} />}
        </MapContainer>
      </div>

      <p className="text-xs text-gray-500">
        Escribe para buscar en Cochabamba · Click en el mapa para marcar · "Mi ubicación" para usar tu GPS · También acepta coordenadas pegadas ("-17.3935, -66.157").
      </p>
    </div>
  );
}
