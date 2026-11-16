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

const COCHABAMBA: [number, number] = [-17.3935, -66.157];

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function Recenter({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 16, { animate: true });
  }, [center, map]);
  return null;
}

export interface MapPickerProps {
  lat?: number;
  lng?: number;
  onChange: (pos: { lat: number; lng: number; label?: string }) => void;
  height?: string;
}

interface SearchResult {
  lat: number;
  lon: number;
  display_name: string;
}

export default function MapPicker({ lat, lng, onChange, height = "280px" }: MapPickerProps) {
  const [pos, setPos] = useState<[number, number] | null>(
    typeof lat === "number" && typeof lng === "number" ? [lat, lng] : null,
  );
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

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

  function handlePick(la: number, lo: number, label?: string) {
    setPos([la, lo]);
    onChange({ lat: la, lng: lo, label });
  }

  async function search(e?: React.FormEvent) {
    e?.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setGeoError(null);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=6&q=${encodeURIComponent(query.trim() + ", Cochabamba, Bolivia")}`;
      const res = await fetch(url, { headers: { "Accept-Language": "es" } });
      const json = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
      setResults(json.map((r) => ({ lat: parseFloat(r.lat), lon: parseFloat(r.lon), display_name: r.display_name })));
      setShowResults(true);
    } catch {
      setGeoError("No se pudo buscar. Inténtalo de nuevo.");
    } finally {
      setSearching(false);
    }
  }

  function pickResult(r: SearchResult) {
    handlePick(r.lat, r.lon, r.display_name);
    setShowResults(false);
    setQuery(r.display_name.split(",")[0]);
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setGeoError("Tu navegador no soporta geolocalización.");
      return;
    }
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (p) => handlePick(p.coords.latitude, p.coords.longitude),
      (err) => {
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

  return (
    <div className="space-y-2">
      <div ref={boxRef} className="relative">
        <form onSubmit={search} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar lugar (ej: Universidad Católica Cochabamba)"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <button type="submit" disabled={searching} className="px-3 py-2 bg-gray-800 text-white rounded-lg text-sm disabled:opacity-60">
            {searching ? "…" : "Buscar"}
          </button>
          <button
            type="button"
            onClick={useCurrentLocation}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 whitespace-nowrap"
            title="Usar mi ubicación actual"
          >
            📍 Yo
          </button>
        </form>

        {showResults && results.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-md z-40 max-h-64 overflow-y-auto">
            {results.map((r, i) => (
              <button
                key={i}
                type="button"
                onClick={() => pickResult(r)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-0"
              >
                {r.display_name}
              </button>
            ))}
          </div>
        )}

        {showResults && results.length === 0 && !searching && query && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-md z-40 px-3 py-2 text-xs text-gray-500">
            Sin resultados. Prueba otro término o pon el pin manualmente.
          </div>
        )}
      </div>

      {geoError && <div className="text-xs text-red-700">{geoError}</div>}

      <div className="rounded-lg overflow-hidden border border-gray-300" style={{ height }}>
        <MapContainer
          center={pos ?? COCHABAMBA}
          zoom={pos ? 15 : 13}
          style={{ width: "100%", height: "100%" }}
          scrollWheelZoom
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <ClickHandler onPick={handlePick} />
          <Recenter center={pos} />
          {pos && <Marker position={pos} />}
        </MapContainer>
      </div>

      <p className="text-xs text-gray-500">
        Busca un lugar, usa tu ubicación actual, o haz click directamente en el mapa.
      </p>
    </div>
  );
}
