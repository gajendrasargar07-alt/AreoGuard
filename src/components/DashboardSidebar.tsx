
"use client"

import { AeroLogo } from "./AeroLogo";
import { CurrentLocationCard } from "./CurrentLocationCard";
import { AIPredictionCard } from "./AIPredictionCard";
import { useAeroStore } from "@/hooks/use-aero-store";
import { ScrollArea } from "./ui/scroll-area";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { FlaskConical, Radio, Settings2, Info } from "lucide-react";
import { Button } from "./ui/button";
import { getChemistryExplainer } from "@/lib/aqi-utils";
import { useState } from "react";

export function DashboardSidebar() {
  const { userType, setUserType, simulateNewReading } = useAeroStore();
  const [showScience, setShowScience] = useState(false);

  return (
    <div 
      className="w-[380px] h-screen fixed left-0 top-0 z-[1000] p-6 flex flex-col liquid-glass border-r border-white/10 shadow-[20px_0_40px_rgba(0,0,0,0.5)]"
      suppressHydrationWarning
    >
      <div className="mb-8" suppressHydrationWarning>
        <AeroLogo />
      </div>

      <ScrollArea className="flex-1 -mx-2 px-2" suppressHydrationWarning>
        <div className="space-y-6 pb-6" suppressHydrationWarning>
          <CurrentLocationCard />

          <div className="bg-white/5 p-4 rounded-2xl border border-white/10" suppressHydrationWarning>
            <div className="flex items-center justify-between" suppressHydrationWarning>
              <div className="flex items-center gap-3" suppressHydrationWarning>
                <Settings2 className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="patient-mode" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Patient Sensitivity
                </Label>
              </div>
              <Switch 
                id="patient-mode" 
                checked={userType === 'patient'}
                onCheckedChange={(checked) => setUserType(checked ? 'patient' : 'normal')}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
              {userType === 'patient' 
                ? "Stricter WHO-standard health thresholds active for respiratory vulnerability."
                : "Standard AQI thresholds for healthy adults active."}
            </p>
          </div>

          <AIPredictionCard />

          <div className="space-y-4" suppressHydrationWarning>
            <div className="flex items-center justify-between px-1" suppressHydrationWarning>
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Sensor Simulation</h3>
              <Radio className="w-3 h-3 text-secondary animate-pulse" />
            </div>
            <Button 
              onClick={simulateNewReading}
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold rounded-xl h-12 gap-2 neon-glow-secondary border-none"
            >
              <FlaskConical className="w-5 h-5" />
              GENERATE SENSOR DATA
            </Button>
            <p className="text-[9px] text-center text-muted-foreground px-4">
              Simulates a local electrochemical sensor node at your coordinates via redox current analysis.
            </p>
          </div>

          <div 
            className="p-4 rounded-2xl border border-white/5 bg-black/20 cursor-help group transition-all"
            onClick={() => setShowScience(!showScience)}
            suppressHydrationWarning
          >
            <div className="flex items-center gap-2 mb-2" suppressHydrationWarning>
              <Info className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-bold text-primary uppercase">Science Behind Redox</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Electro-sensors generate pA-scale current via gas reduction. Click to see the chemical data flow.
            </p>
            {showScience && (
              <div className="mt-4 pt-4 border-t border-white/10 text-[10px] text-primary/80 animate-in fade-in slide-in-from-top-2">
                {getChemistryExplainer('no2')}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between text-[10px] font-medium text-muted-foreground" suppressHydrationWarning>
        <span className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          Node Network Sync: Active
        </span>
        <span>v2.1 Full-Stack</span>
      </div>
    </div>
  );
}
