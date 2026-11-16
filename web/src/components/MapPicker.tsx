import { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
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

export interface MapPickerProps {
  lat?: number;
  lng?: number;
  onChange: (pos: { lat: number; lng: number }) => void;
  height?: string;
}

export default function MapPicker({ lat, lng, onChange, height = "260px" }: MapPickerProps) {
  const [pos, setPos] = useState<[number, number] | null>(
    typeof lat === "number" && typeof lng === "number" ? [lat, lng] : null,
  );

  useEffect(() => {
    if (typeof lat === "number" && typeof lng === "number") setPos([lat, lng]);
  }, [lat, lng]);

  function handlePick(la: number, lo: number) {
    setPos([la, lo]);
    onChange({ lat: la, lng: lo });
  }

  return (
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
        {pos && <Marker position={pos} />}
      </MapContainer>
    </div>
  );
}
