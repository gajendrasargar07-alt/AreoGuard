
"use client"

import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Rectangle, Popup, useMap, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useAeroStore, SensorData } from '@/hooks/use-aero-store';
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
  
  const center: [number, number] = userLocation ? [userLocation.lat, userLocation.lng] : [19.0760, 72.8777];

  // Generate a Choropleth Grid based on current location
  const atmosphericGrid = useMemo(() => {
    if (!userLocation || sensors.length === 0) return [];

    const gridSize = 10; // 10x10 grid for high density
    const spread = 0.12; // Degrees of coverage (~12km)
    
    const startLat = userLocation.lat - spread/2;
    const startLng = userLocation.lng - spread/2;
    const cellSize = spread / gridSize;

    const cells = [];
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const cellLat = startLat + i * cellSize;
        const cellLng = startLng + j * cellSize;
        
        // Find nearest sensor for this cell (Voronoi/Interpolation simulation)
        let nearestSensor = sensors[0];
        let minDist = Infinity;
        
        sensors.forEach(s => {
          const d = Math.sqrt(Math.pow(s.lat - (cellLat + cellSize/2), 2) + Math.pow(s.lng - (cellLng + cellSize/2), 2));
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

        {/* Choropleth Grid Shading */}
        {atmosphericGrid.map((cell, idx) => {
          const cat = getAQICategory(cell.aqi);
          return (
            <Rectangle
              key={`cell-${idx}`}
              bounds={cell.bounds}
              pathOptions={{
                fillColor: cat.hex,
                color: 'rgba(255,255,255,0.05)',
                weight: 0.5,
                fillOpacity: 0.35,
              }}
            >
              <Popup>
                <div className="p-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Atmospheric Zone</p>
                  <p className="font-bold text-sm">Influence: {cell.sensorName}</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className={`text-2xl font-black ${cat.text}`}>{cell.aqi}</span>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase">Zone AQI</span>
                  </div>
                </div>
              </Popup>
            </Rectangle>
          );
        })}

        {/* Sensor Markers (Subtle Indicators) */}
        {sensors.map((sensor) => {
          const cat = getAQICategory(sensor.aqi);
          return (
            <Rectangle
              key={`node-${sensor.id}`}
              bounds={[
                [sensor.lat - 0.001, sensor.lng - 0.001],
                [sensor.lat + 0.001, sensor.lng + 0.001]
              ]}
              pathOptions={{
                fillColor: 'white',
                color: cat.hex,
                weight: 2,
                fillOpacity: 0.8,
              }}
              eventHandlers={{
                click: () => setSelectedSensor(sensor)
              }}
            />
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
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Regional Choropleth Active</p>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Interpolating electrochemical sensor data across localized atmospheric grids. Shading represents regional pollution density.
          </p>
        </div>
      </div>
    </div>
  );
}
