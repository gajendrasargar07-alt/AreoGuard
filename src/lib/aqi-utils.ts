export const calculateAQI = (pm25: number, no2: number, o3: number, co: number, so2: number) => {
  // US-EPA Simplified Sub-Index Calculation for Prototype
  // Real calculation uses piecewise linear functions; this is a high-fidelity linear approximation for viva demos
  const iPm25 = (pm25 / 12) * 50;   // 12 ug/m3 is the Good threshold
  const iNo2 = (no2 / 53) * 50;    // 53 ppb is the Good threshold
  const iO3 = (o3 / 54) * 50;      // 54 ppb is the Good threshold
  const iCo = (co / 4.4) * 50;     // 4.4 ppm is the Good threshold
  const iSo2 = (so2 / 35) * 50;    // 35 ppb is the Good threshold
  
  return Math.round(Math.max(iPm25, iNo2, iO3, iCo, iSo2, 10)); // Floor at 10 for realism
};

export const getAQICategory = (aqi: number) => {
  if (aqi <= 50) return { label: 'Good', color: 'bg-emerald-500', text: 'text-emerald-400', hex: '#10b981' };
  if (aqi <= 100) return { label: 'Moderate', color: 'bg-yellow-500', text: 'text-yellow-400', hex: '#f97316' }; // Using orange for moderate to pop better on dark
  if (aqi <= 150) return { label: 'Unhealthy for Sensitive Groups', color: 'bg-orange-500', text: 'text-orange-400', hex: '#f97316' };
  if (aqi <= 200) return { label: 'Unhealthy', color: 'bg-red-500', text: 'text-red-400', hex: '#ef4444' };
  if (aqi <= 300) return { label: 'Very Unhealthy', color: 'bg-purple-500', text: 'text-purple-400', hex: '#a855f7' };
  return { label: 'Hazardous', color: 'bg-rose-900', text: 'text-rose-500', hex: '#e11d48' };
};

export const getChemistryExplainer = (pollutant: string) => {
  const data: Record<string, string> = {
    pm25: "Fine particles detected by laser scattering, often mimicking the scattering of photons in specialized electrochemical cell windows.",
    no2: "Electrochemical sensors detect Nitrogen Dioxide via a reduction reaction at the working electrode. NO₂ + 2H⁺ + 2e⁻ → NO + H₂O. The resulting current flow is directly proportional to concentration.",
    o3: "Ozone is measured through an oxidation-reduction cycle. High reactivity causes a distinct potential change in the sensor's electrolyte.",
    co: "Carbon Monoxide is oxidized at the sensing electrode: CO + H₂O → CO₂ + 2H⁺ + 2e⁻. This redox process generates a micro-ampere signal.",
    so2: "Sulfur Dioxide sensors utilize a specific gold-based catalyst to facilitate oxidation, ensuring high selectivity over other gases."
  };
  return data[pollutant] || "Sensors utilize specialized redox chemistry to generate electrical signals from ambient gases.";
};
