"use client"

import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Rectangle, Popup, useMap, Circle, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAeroStore } from '@/hooks/use-aero-store';
import { getAQICategory } from '@/lib/aqi-utils';

// Fix for default marker icons in Leaflet with Next.js
const userIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div class="w-6 h-6 bg-primary rounded-full border-4 border-white shadow-2xl pulse-animation neon-glow-primary"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

export default function MapComponent() {
  const { userLocation, sensors, setSelectedSensor } = useAeroStore();
  
  const center: [number, number] = userLocation ? [userLocation.lat, userLocation.lng] : [19.0760, 72.8777];

  // High-Resolution Atmospheric Mesh (Proper Choropleth)
  const atmosphericMesh = useMemo(() => {
    if (!userLocation || sensors.length === 0) return [];

    const gridSize = 35; // Fine resolution
    const spread = 0.6; // Wider regional coverage
    
    const startLat = userLocation.lat - spread/2;
    const startLng = userLocation.lng - spread/2;
    const cellSize = spread / gridSize;

    const cells = [];
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const cellLat = startLat + i * cellSize;
        const cellLng = startLng + j * cellSize;
        const midLat = cellLat + cellSize / 2;
        const midLng = cellLng + cellSize / 2;
        
        // Find nearest station for accurate regional influence
        let nearestSensor = sensors[0];
        let minDist = Infinity;
        
        sensors.forEach(s => {
          const d = Math.sqrt(Math.pow(s.lat - midLat, 2) + Math.pow(s.lng - midLng, 2));
          if (d < minDist) {
            minDist = d;
            nearestSensor = s;
          }
        });

        cells.push({
          bounds: [
            [cellLat, cellLng],
            [cellLat + cellSize, cellLng + cellSize]
          ] as [[number, number], [number, number]],
          aqi: nearestSensor.aqi,
          sensorName: nearestSensor.name
        });
      }
    }
    return cells;
  }, [userLocation, sensors]);

  return (
    <div className="w-full h-full relative" suppressHydrationWarning>
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={true}
        zoomControl={false}
        className="z-0"
        style={{ height: '100vh', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <ChangeView center={center} />

        {/* Proper High-Resolution Choropleth Layer */}
        {atmosphericMesh.map((cell, idx) => {
          const cat = getAQICategory(cell.aqi);
          return (
            <Rectangle
              key={`mesh-cell-${idx}`}
              bounds={cell.bounds}
              pathOptions={{
                fillColor: cat.hex,
                color: 'transparent', 
                weight: 0,
                fillOpacity: 0.35,
              }}
            >
              <Popup>
                <div className="p-1" suppressHydrationWarning>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Grid Segment</p>
                  <p className="font-bold text-xs">Node Influence: {cell.sensorName}</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className={`text-2xl font-black ${cat.text}`}>{cell.aqi}</span>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase">AQI</span>
                  </div>
                </div>
              </Popup>
            </Rectangle>
          );
        })}

        {/* Node Indicators */}
        {sensors.map((sensor) => {
          const cat = getAQICategory(sensor.aqi);
          return (
            <Circle
              key={`node-${sensor.id}`}
              center={[sensor.lat, sensor.lng]}
              radius={80}
              pathOptions={{
                fillColor: 'white',
                color: cat.hex,
                weight: 3,
                fillOpacity: 0.8,
              }}
              eventHandlers={{
                click: () => setSelectedSensor(sensor)
              }}
            />
          );
        })}

        {/* Exact User Location Marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="p-2 text-center">
                <p className="text-[10px] font-bold text-primary uppercase">Your Exact Location</p>
                <p className="text-sm font-black mt-1">{userLocation.city}</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
      
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-background/40 via-transparent to-background/60 z-10"></div>
      
      {/* Legend */}
      <div className="absolute bottom-6 right-6 z-[1000] pointer-events-none">
        <div className="liquid-glass-dark p-4 rounded-xl border border-white/10 max-w-xs backdrop-blur-3xl shadow-2xl" suppressHydrationWarning>
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${sensors.length > 0 ? 'bg-primary' : 'bg-muted'} animate-pulse`}></div>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
              {sensors.length > 0 ? 'Regional Grid Active' : 'Initializing Atmospheric Mesh...'}
            </p>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Real-time WAQI data mapped via 35x35 mesh interpolation. Shading intensity reflects regional pollution zones.
          </p>
        </div>
      </div>
    </div>
  );
}
