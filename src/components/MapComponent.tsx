
"use client"

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useAeroStore } from '@/hooks/use-aero-store';
import { getAQICategory } from '@/lib/aqi-utils';

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 12);
  }, [center, map]);
  return null;
}

export default function MapComponent() {
  const { userLocation, sensors, setSelectedSensor } = useAeroStore();
  
  const center: [number, number] = userLocation ? [userLocation.lat, userLocation.lng] : [19.0760, 72.8777]; // Mumbai Center

  return (
    <div className="w-full h-full relative">
      <MapContainer 
        center={center} 
        zoom={12} 
        scrollWheelZoom={true}
        zoomControl={false}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <ChangeView center={center} />

        {/* User Location Glow */}
        {userLocation && (
          <Circle
            center={[userLocation.lat, userLocation.lng]}
            radius={800}
            pathOptions={{ 
              fillColor: '#2BEFED', 
              color: 'white', 
              weight: 2, 
              fillOpacity: 0.4,
              dashArray: '5, 10'
            }}
          >
            <Popup>
              <div className="p-2">
                <p className="font-bold text-primary">Your Core Node</p>
                <p className="text-xs text-muted-foreground">{userLocation.city}</p>
              </div>
            </Popup>
          </Circle>
        )}

        {/* Regional Heatmap Shading */}
        {sensors.map((sensor) => {
          const cat = getAQICategory(sensor.aqi);
          const color = cat.color.replace('bg-', '');
          
          return (
            <React.Fragment key={sensor.id}>
              {/* Core Shading Layer */}
              <Circle
                center={[sensor.lat, sensor.lng]}
                radius={2500} // Large radius for regional shading
                pathOptions={{
                  fillColor: color,
                  color: 'transparent',
                  fillOpacity: 0.15,
                }}
                eventHandlers={{
                  click: () => setSelectedSensor(sensor)
                }}
              />
              {/* Inner High-Intensity Glow */}
              <Circle
                center={[sensor.lat, sensor.lng]}
                radius={1200}
                pathOptions={{
                  fillColor: color,
                  color: 'transparent',
                  fillOpacity: 0.25,
                }}
              >
                <Popup>
                  <div className="p-1">
                    <p className="font-extrabold text-sm uppercase tracking-tight">{sensor.name}</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className={`text-2xl font-black ${cat.text}`}>{sensor.aqi}</span>
                      <span className="text-[10px] text-muted-foreground font-bold uppercase">AQI Index</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-white/10 grid grid-cols-2 gap-x-4 gap-y-1">
                      <div className="flex flex-col">
                        <span className="text-[8px] uppercase text-muted-foreground">PM2.5</span>
                        <span className="text-[10px] font-mono">{sensor.pm25.toFixed(1)}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] uppercase text-muted-foreground">NO2</span>
                        <span className="text-[10px] font-mono">{sensor.no2.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Circle>
            </React.Fragment>
          );
        })}
      </MapContainer>
      
      {/* Visual Depth Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-background/40 via-transparent to-background/60 z-10"></div>
      
      {/* Decorative Science Overlay */}
      <div className="absolute bottom-6 right-6 z-[1000] pointer-events-none">
        <div className="liquid-glass-dark p-4 rounded-xl border border-white/10 max-w-xs backdrop-blur-3xl shadow-2xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Regional Heatmap Active</p>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Visualizing atmospheric density gradients across {sensors.length} urban micro-climates. Shading indicates localized redox concentration zones.
          </p>
        </div>
      </div>
    </div>
  );
}
