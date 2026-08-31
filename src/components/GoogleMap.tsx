import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const CENTER: [number, number] = [12.977330236100165, 80.23049540620549];
const DIRECTIONS_URL =
  'https://www.google.com/maps/dir/?api=1&destination=12.977330236100165,80.23049540620549';

const pinkIcon = L.divIcon({
  className: 'map-pin-pink',
  iconSize: [28, 40],
  iconAnchor: [14, 40],
  popupAnchor: [0, -40],
  html: `<svg width="28" height="40" viewBox="0 0 28 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.268 21.732 0 14 0z" fill="#f08bab"/>
    <circle cx="14" cy="14" r="6" fill="#fff"/>
  </svg>`,
});

function ScrollZoom() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();

    const onWheel = (e: WheelEvent) => {
      if (e.metaKey || e.ctrlKey) {
        e.preventDefault();
        if (e.deltaY < 0) map.zoomIn();
        else map.zoomOut();
      }
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, [map]);

  return null;
}

interface GoogleMapProps {
  className?: string;
}

export default function GoogleMap({ className }: GoogleMapProps) {
  return (
    <div className={className}>
      <MapContainer
        center={CENTER}
        zoom={17}
        zoomControl={false}
        attributionControl={false}
        scrollWheelZoom={false}
        doubleClickZoom={true}
        touchZoom={true}
        keyboard={false}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          url={`https://api.maptiler.com/maps/dataviz-light/{z}/{x}/{y}.png?key=${import.meta.env.VITE_MAPTILER_API_KEY}`}
          tileSize={512}
          zoomOffset={-1}
          maxZoom={20}
        />
        <ScrollZoom />
        <Marker
          position={CENTER}
          icon={pinkIcon}
          eventHandlers={{
            click: () => {
              window.open(DIRECTIONS_URL, '_blank', 'noopener,noreferrer');
            },
          }}
        />
      </MapContainer>

      <a
        href={DIRECTIONS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="map-location-card"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f08bab" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        <div>
          <span className="map-location-card-name">SK Fashion Studio, Velachery</span>
          <span className="map-location-card-action">Get directions</span>
        </div>
      </a>
    </div>
  );
}
