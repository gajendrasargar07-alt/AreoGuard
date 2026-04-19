"use client"

import { create } from 'zustand';

export type UserType = 'normal' | 'patient';

interface SensorData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  aqi: number;
  pm25: number;
  no2: number;
  o3: number;
  co: number;
  so2: number;
  timestamp: string;
}

interface AeroState {
  userLocation: { lat: number; lng: number; city: string } | null;
  userType: UserType;
  sensors: SensorData[];
  selectedSensor: SensorData | null;
  isLocationLoading: boolean;
  
  setUserLocation: (loc: { lat: number; lng: number; city: string }) => void;
  setUserType: (type: UserType) => void;
  setSensors: (sensors: SensorData[]) => void;
  setSelectedSensor: (sensor: SensorData | null) => void;
  setLocationLoading: (loading: boolean) => void;
  simulateNewReading: () => void;
}

export const useAeroStore = create<AeroState>((set) => ({
  userLocation: null,
  userType: 'normal',
  sensors: [],
  selectedSensor: null,
  isLocationLoading: false,

  setUserLocation: (userLocation) => set({ userLocation }),
  setUserType: (userType) => set({ userType }),
  setSensors: (sensors) => set({ sensors }),
  setSelectedSensor: (selectedSensor) => set({ selectedSensor }),
  setLocationLoading: (isLocationLoading) => set({ isLocationLoading }),

  simulateNewReading: () => set((state) => {
    if (!state.userLocation) return state;
    
    // Logic to add a new simulated sensor near user
    const newSensor: SensorData = {
      id: `sim-${Date.now()}`,
      name: `Mobile Sensor Node #${Math.floor(Math.random() * 1000)}`,
      lat: state.userLocation.lat + (Math.random() - 0.5) * 0.01,
      lng: state.userLocation.lng + (Math.random() - 0.5) * 0.01,
      aqi: Math.floor(Math.random() * 180) + 20,
      pm25: Math.random() * 50,
      no2: Math.random() * 40,
      o3: Math.random() * 120,
      co: Math.random() * 5,
      so2: Math.random() * 20,
      timestamp: new Date().toISOString(),
    };

    return { sensors: [newSensor, ...state.sensors.slice(0, 9)] };
  }),
}));