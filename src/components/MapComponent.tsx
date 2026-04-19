"use client"

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useAeroStore } from '@/hooks/use-aero-store';
import { getAQICategory } from '@/lib/aqi-utils';

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

export default function MapComponent() {
  const { userLocation, sensors, setSelectedSensor } = useAeroStore();
  
  const center: [number, number] = userLocation ? [userLocation.lat, userLocation.lng] : [18.9894, 73.1175]; // Panvel default

  return (
    <div className="w-full h-full relative">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <ChangeView center={center} />

        {/* User Location Marker */}
        {userLocation && (
          <CircleMarker
            center={[userLocation.lat, userLocation.lng]}
            radius={12}
            pathOptions={{ 
              fillColor: '#2BEFED', 
              color: 'white', 
              weight: 3, 
              fillOpacity: 1 
            }}
            className="neon-glow-primary pulse-animation"
          >
            <Popup>
              <div className="p-2">
                <p className="font-bold text-primary">Your Location</p>
                <p className="text-xs text-muted-foreground">{userLocation.city}</p>
              </div>
            </Popup>
          </CircleMarker>
        )}

        {/* Sensor Markers */}
        {sensors.map((sensor) => {
          const cat = getAQICategory(sensor.aqi);
          return (
            <CircleMarker
              key={sensor.id}
              center={[sensor.lat, sensor.lng]}
              radius={Math.max(15, sensor.aqi / 10)}
              pathOptions={{
                fillColor: cat.color.replace('bg-', ''),
                color: 'white',
                weight: 1,
                fillOpacity: 0.6
              }}
              eventHandlers={{
                click: () => setSelectedSensor(sensor)
              }}
            >
              <Popup>
                <div className="p-1">
                  <p className="font-bold">{sensor.name}</p>
                  <p className={`text-lg font-black ${cat.text}`}>AQI: {sensor.aqi}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Electrochemical Node</p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
      
      {/* Decorative Science Overlay */}
      <div className="absolute bottom-6 right-6 z-[1000] pointer-events-none">
        <div className="liquid-glass-dark p-4 rounded-xl border border-white/10 max-w-xs backdrop-blur-3xl">
          <p className="text-[10px] font-bold text-primary mb-1 uppercase tracking-widest">Active Sensor Network</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Electro-redox analysis active. Visualizing current flow from {sensors.length} localized sensor cells.
          </p>
        </div>
      </div>
    </div>
  );
}