import { MapContainer, Marker, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface Props {
  lat: number;
  lng: number;
  height?: string;
}

export default function MapView({ lat, lng, height = "220px" }: Props) {
  return (
    <div className="rounded-lg overflow-hidden border border-gray-300" style={{ height }}>
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <Marker position={[lat, lng]} />
      </MapContainer>
    </div>
  );
}
