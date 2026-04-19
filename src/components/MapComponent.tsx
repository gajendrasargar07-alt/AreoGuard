
"use client"

import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Rectangle, Popup, useMap, Circle, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAeroStore, SensorData } from '@/hooks/use-aero-store';
import { getAQICategory } from '@/lib/aqi-utils';

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

  const atmosphericMesh = useMemo(() => {
    if (!userLocation || sensors.length === 0) return [];

    const gridSize = 30; 
    const spread = 0.5; 
    
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
          sensorName: nearestSensor.name,
          stats: nearestSensor.pm25 > 0 ? {
            pm25: nearestSensor.pm25,
            no2: nearestSensor.no2,
            o3: nearestSensor.o3
          } : null
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
                <div className="p-2 w-48" suppressHydrationWarning>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Atmospheric Segment</p>
                  <p className="font-bold text-xs leading-tight mb-2">Source: {cell.sensorName}</p>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className={`text-3xl font-black tracking-tighter ${cat.text}`}>{cell.aqi}</span>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">AQI</span>
                  </div>
                  
                  {cell.stats ? (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-muted-foreground uppercase">PM2.5</span>
                        <span className="text-[10px] font-black text-white">{cell.stats.pm25.toFixed(1)}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-muted-foreground uppercase">NO2</span>
                        <span className="text-[10px] font-black text-white">{cell.stats.no2.toFixed(1)}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[9px] text-muted-foreground italic">Regional AQI estimation based on nearest neighbor interpolation.</p>
                  )}
                </div>
              </Popup>
            </Rectangle>
          );
        })}

        {sensors.map((sensor) => {
          const cat = getAQICategory(sensor.aqi);
          return (
            <Circle
              key={`node-${sensor.id}`}
              center={[sensor.lat, sensor.lng]}
              radius={100}
              pathOptions={{
                fillColor: 'white',
                color: cat.hex,
                weight: 4,
                fillOpacity: 1,
              }}
              eventHandlers={{
                click: () => setSelectedSensor(sensor)
              }}
            >
              <Popup>
                <div className="p-2 w-56" suppressHydrationWarning>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Active Sensor Node</span>
                  </div>
                  <h4 className="font-black text-sm mb-3 uppercase tracking-tight">{sensor.name}</h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Current Index</span>
                      <span className={`text-2xl font-black ${cat.text}`}>{sensor.aqi}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 p-2 bg-white/5 rounded-lg border border-white/5">
                      <div>
                        <p className="text-[8px] font-bold text-muted-foreground uppercase">Redox NO2</p>
                        <p className="text-xs font-black text-primary">{sensor.no2 > 0 ? sensor.no2.toFixed(2) : '--'}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-muted-foreground uppercase">PM 2.5</p>
                        <p className="text-xs font-black text-secondary">{sensor.pm25 > 0 ? sensor.pm25.toFixed(1) : '--'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Popup>
            </Circle>
          );
        })}

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="p-2 text-center" suppressHydrationWarning>
                <p className="text-[10px] font-bold text-primary uppercase">Your Exact Location</p>
                <p className="text-sm font-black mt-1 leading-tight">{userLocation.city}</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
      
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-background/40 via-transparent to-background/60 z-10" suppressHydrationWarning></div>
      
      <div className="absolute bottom-6 right-6 z-[1000] pointer-events-none" suppressHydrationWarning>
        <div className="liquid-glass-dark p-4 rounded-xl border border-white/10 max-w-xs backdrop-blur-3xl shadow-2xl" suppressHydrationWarning>
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${sensors.length > 0 ? 'bg-primary' : 'bg-muted'} animate-pulse`}></div>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
              {sensors.length > 0 ? 'Global Mesh Active' : 'Initializing Atmospheric Grid...'}
            </p>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Mesh interpolation calculates statistics between certified WAQI nodes and simulated local redox sensors. Click any region for detailed metrics.
          </p>
        </div>
      </div>
    </div>
  );
}
