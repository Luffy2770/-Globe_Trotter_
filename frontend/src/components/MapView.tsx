import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapMarker {
  id: number;
  name: string;
  country?: string;
  latitude: number;
  longitude: number;
  image_url?: string;
}

interface MapViewProps {
  markers: MapMarker[];
  zoom?: number;
  height?: string;
}

export const MapView: React.FC<MapViewProps> = ({
  markers,
  zoom = 2,
  height = '350px',
}) => {
  const validMarkers = markers.filter((m) => m.latitude != null && m.longitude != null);

  const centerLat = validMarkers.length > 0 ? validMarkers[0].latitude : 20.0;
  const centerLng = validMarkers.length > 0 ? validMarkers[0].longitude : 0.0;

  return (
    <div style={{ height }} className="w-full rounded-3xl overflow-hidden border border-slate-200 shadow-xs relative z-0">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validMarkers.map((m) => (
          <Marker key={m.id} position={[m.latitude, m.longitude]}>
            <Popup>
              <div className="p-1 max-w-xs space-y-1">
                {m.image_url && (
                  <img src={m.image_url} alt={m.name} className="w-full h-20 object-cover rounded-lg" />
                )}
                <h4 className="font-bold text-xs text-slate-900">{m.name}</h4>
                {m.country && <p className="text-[11px] text-slate-500">{m.country}</p>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
