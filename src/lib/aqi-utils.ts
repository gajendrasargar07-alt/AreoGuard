export const getAQICategory = (aqi: number) => {
  if (aqi <= 50) return { label: 'Good', color: 'bg-emerald-500', text: 'text-emerald-400', ring: 'ring-emerald-500/50' };
  if (aqi <= 100) return { label: 'Moderate', color: 'bg-yellow-500', text: 'text-yellow-400', ring: 'ring-yellow-500/50' };
  if (aqi <= 150) return { label: 'Unhealthy for Sensitive Groups', color: 'bg-orange-500', text: 'text-orange-400', ring: 'ring-orange-500/50' };
  if (aqi <= 200) return { label: 'Unhealthy', color: 'bg-red-500', text: 'text-red-400', ring: 'ring-red-500/50' };
  if (aqi <= 300) return { label: 'Very Unhealthy', color: 'bg-purple-500', text: 'text-purple-400', ring: 'ring-purple-500/50' };
  return { label: 'Hazardous', color: 'bg-rose-900', text: 'text-rose-500', ring: 'ring-rose-900/50' };
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
