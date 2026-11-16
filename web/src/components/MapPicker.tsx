import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Loader2, MapPin, Navigation, Search, X } from "lucide-react";

// Fix default marker icons in bundlers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const COCHABAMBA: [number, number] = [-17.3935, -66.157];
// Cochabamba metro bbox (minLon, minLat, maxLon, maxLat)
const COCHA_BBOX = [-66.35, -17.55, -65.95, -17.25];

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
  name: string;
  address: string;
  category: string;
}

async function searchPhoton(q: string, signal: AbortSignal): Promise<Place[]> {
  const [lat, lon] = COCHABAMBA;
  const bbox = COCHA_BBOX.join(",");
  const url =
    `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}` +
    `&limit=10&lang=default&lat=${lat}&lon=${lon}&location_bias_scale=0.3&bbox=${bbox}`;

  const res = await fetch(url, { signal });
  if (!res.ok) return [];
  const data = await res.json();
  const feats: any[] = data.features ?? [];

  return feats
    .filter((f) => f.geometry?.coordinates?.length === 2)
    .map((f) => {
      const p = f.properties ?? {};
      const [lon, lat] = f.geometry.coordinates;
      const addrParts = [p.street, p.housenumber, p.district, p.city, p.state, p.country]
        .filter(Boolean);
      return {
        lat,
        lon,
        name: p.name || p.street || p.city || "Sin nombre",
        address: addrParts.join(", "),
        category: p.osm_value || p.osm_key || p.type || "",
      } as Place;
    });
}

async function searchNominatim(q: string, signal: AbortSignal): Promise<Place[]> {
  const bbox = `viewbox=${COCHA_BBOX[0]},${COCHA_BBOX[3]},${COCHA_BBOX[2]},${COCHA_BBOX[1]}`;
  const url =
    `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=10&countrycodes=bo&${bbox}&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { signal, headers: { "Accept-Language": "es" } });
  if (!res.ok) return [];
  const data: any[] = await res.json();

  return data.map((d) => {
    const a = d.address ?? {};
    const addrParts = [a.road, a.house_number, a.neighbourhood, a.suburb, a.city || a.town, a.state, a.country].filter(Boolean);
    return {
      lat: parseFloat(d.lat),
      lon: parseFloat(d.lon),
      name: d.name || a.road || a.city || d.display_name.split(",")[0],
      address: addrParts.join(", ") || d.display_name,
      category: d.type || d.class || "",
    } as Place;
  });
}

async function searchPlaces(query: string, signal: AbortSignal): Promise<Place[]> {
  const q = query.trim();
  if (!q) return [];

  // Try Photon (fast, POI-strong, typo-tolerant)
  let results: Place[] = [];
  try {
    results = await searchPhoton(q, signal);
  } catch {
    // ignore
  }
  if (signal.aborted) return [];

  // Fallback to Nominatim (better for street names, addresses, lesser-known POIs)
  if (results.length === 0) {
    try {
      results = await searchNominatim(q, signal);
    } catch {
      // ignore
    }
  }

  // Dedupe by rounded coords
  const seen = new Set<string>();
  return results.filter((r) => {
    const k = `${r.lat.toFixed(5)},${r.lon.toFixed(5)}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function parseCoords(input: string): { lat: number; lng: number } | null {
  const coord = input.match(/(-?\d{1,3}\.\d+)[,\s]+(-?\d{1,3}\.\d+)/);
  if (coord) {
    const lat = parseFloat(coord[1]);
    const lng = parseFloat(coord[2]);
    if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return { lat, lng };
  }
  return null;
}

const categoryLabel: Record<string, string> = {
  university: "Universidad",
  school: "Escuela",
  college: "Colegio",
  restaurant: "Restaurante",
  cafe: "Café",
  hospital: "Hospital",
  hotel: "Hotel",
  bank: "Banco",
  pharmacy: "Farmacia",
  supermarket: "Supermercado",
  mall: "Centro comercial",
  stadium: "Estadio",
  theatre: "Teatro",
  cinema: "Cine",
  park: "Parque",
  square: "Plaza",
  church: "Iglesia",
  building: "Edificio",
  house: "Casa",
  residential: "Residencial",
};

export default function MapPicker({ lat, lng, onChange, height = "320px" }: MapPickerProps) {
  const [pos, setPos] = useState<[number, number] | null>(
    typeof lat === "number" && typeof lng === "number" ? [lat, lng] : null,
  );
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [searching, setSearching] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [geoBusy, setGeoBusy] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof lat === "number" && typeof lng === "number") setPos([lat, lng]);
  }, [lat, lng]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();

    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    const coords = parseCoords(q);
    if (coords) {
      setResults([]);
      handlePick(coords.lat, coords.lng, "Coordenadas pegadas");
      setOpen(false);
      return;
    }

    setSearching(true);
    setOpen(true);
    debounceRef.current = setTimeout(async () => {
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const data = await searchPlaces(q, ctrl.signal);
        if (!ctrl.signal.aborted) {
          setResults(data);
          setHighlighted(0);
        }
      } catch {
        if (!ctrl.signal.aborted) setResults([]);
      } finally {
        if (!ctrl.signal.aborted) setSearching(false);
      }
    }, 200);

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
    handlePick(r.lat, r.lon, r.address || r.name);
    setOpen(false);
    setQuery(r.name);
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

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      if (results[highlighted]) pickResult(results[highlighted]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    }
  }

  const showEmpty = useMemo(
    () => open && !searching && results.length === 0 && query.trim().length >= 2,
    [open, searching, results, query],
  );

  return (
    <div className="space-y-2">
      <div ref={boxRef} className="relative">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.trim().length >= 2 && setOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar venue, dirección o POI en Cochabamba"
              className="w-full border border-gray-300 rounded-lg pl-9 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gBlue/40 focus:border-gBlue"
              autoComplete="off"
              spellCheck={false}
              role="combobox"
              aria-expanded={open}
              aria-autocomplete="list"
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 animate-spin" />
            )}
            {query && !searching && (
              <button
                type="button"
                onClick={() => { setQuery(""); setResults([]); setOpen(false); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 w-6 h-6 inline-flex items-center justify-center rounded-full hover:bg-gray-100"
                aria-label="Limpiar"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={useCurrentLocation}
            disabled={geoBusy}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 whitespace-nowrap disabled:opacity-60 inline-flex items-center gap-1.5"
            title="Usar mi ubicación actual"
          >
            {geoBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
            <span className="hidden sm:inline">Mi ubicación</span>
          </button>
        </div>

        {open && (results.length > 0 || showEmpty) && (
          <ul
            role="listbox"
            style={{ zIndex: 1000 }}
            className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
          >
            {showEmpty && (
              <li className="px-3 py-3 text-sm text-gray-500">
                Sin resultados para "{query}". Prueba otro término o clickea directo en el mapa.
              </li>
            )}
            {results.map((r, i) => (
              <li
                key={`${r.lat},${r.lon},${i}`}
                role="option"
                aria-selected={i === highlighted}
              >
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); pickResult(r); }}
                  onMouseEnter={() => setHighlighted(i)}
                  className={`w-full text-left px-3 py-2.5 text-sm border-b border-gray-100 last:border-0 flex items-start gap-2 ${
                    i === highlighted ? "bg-blue-50" : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 truncate">{r.name}</span>
                      {categoryLabel[r.category] && (
                        <span className="text-[10px] uppercase tracking-wide text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                          {categoryLabel[r.category]}
                        </span>
                      )}
                    </div>
                    {r.address && <div className="text-xs text-gray-500 line-clamp-2">{r.address}</div>}
                  </div>
                </button>
              </li>
            ))}
          </ul>
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
        Escribe para buscar · ↑↓ navegar · Enter elegir · Esc cerrar · Click en mapa para pin manual · La ubicación se guarda al pulsar <span className="font-medium">Guardar cambios</span>.
      </p>
    </div>
  );
}
