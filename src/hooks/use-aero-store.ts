"use client"

import { create } from 'zustand';
import { calculateAQI } from '@/lib/aqi-utils';

export type UserType = 'normal' | 'patient';

export interface SensorData {
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
  currentReading: SensorData | null;
  selectedSensor: SensorData | null;
  isLocationLoading: boolean;
  
  setUserLocation: (loc: { lat: number; lng: number; city: string }) => void;
  setUserType: (type: UserType) => void;
  setSensors: (sensors: SensorData[]) => void;
  setCurrentReading: (reading: SensorData | null) => void;
  setSelectedSensor: (sensor: SensorData | null) => void;
  setLocationLoading: (loading: boolean) => void;
  simulateNewReading: () => void;
}

export const useAeroStore = create<AeroState>((set) => ({
  userLocation: null,
  userType: 'normal',
  sensors: [],
  currentReading: null,
  selectedSensor: null,
  isLocationLoading: false,

  setUserLocation: (userLocation) => set({ userLocation }),
  setUserType: (userType) => set({ userType }),
  setSensors: (sensors) => set({ sensors }),
  setCurrentReading: (currentReading) => set({ currentReading }),
  setSelectedSensor: (selectedSensor) => set({ selectedSensor }),
  setLocationLoading: (isLocationLoading) => set({ isLocationLoading }),

  simulateNewReading: () => set((state) => {
    if (!state.userLocation) return state;
    
    const genData = () => {
      const pm25 = 5 + Math.random() * 45;
      const no2 = 10 + Math.random() * 60;
      const o3 = 20 + Math.random() * 80;
      const co = 0.1 + Math.random() * 3;
      const so2 = 1 + Math.random() * 15;
      return { pm25, no2, o3, co, so2, aqi: calculateAQI(pm25, no2, o3, co, so2) };
    };

    const localData = genData();
    const currentReading: SensorData = {
      id: `local-${Date.now()}`,
      name: "Local Virtual Sensor",
      lat: state.userLocation.lat,
      lng: state.userLocation.lng,
      ...localData,
      timestamp: new Date().toISOString(),
    };

    const newSensorData = genData();
    const newSensor: SensorData = {
      id: `sim-${Date.now()}`,
      name: `Mobile Sensor Node #${Math.floor(Math.random() * 1000)}`,
      lat: state.userLocation.lat + (Math.random() - 0.5) * 0.01,
      lng: state.userLocation.lng + (Math.random() - 0.5) * 0.01,
      ...newSensorData,
      timestamp: new Date().toISOString(),
    };

    return { 
      currentReading,
      sensors: [newSensor, ...state.sensors.slice(0, 9)] 
    };
  }),
}));
