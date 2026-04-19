"use client"

import { useEffect, useState } from "react";
import { BrainCircuit, ShieldCheck } from "lucide-react";
import { LiquidGlassCard } from "./LiquidGlassCard";
import { useAeroStore } from "@/hooks/use-aero-store";
import { assessPersonalizedRisk, PersonalizedRiskAssessmentOutput } from "@/ai/flows/personalized-risk-assessment";

export function AIPredictionCard() {
  const { userLocation, userType, currentReading } = useAeroStore();
  const [assessment, setAssessment] = useState<PersonalizedRiskAssessmentOutput | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function getAIPrediction() {
      if (!userLocation || !currentReading) return;
      
      setLoading(true);
      try {
        const result = await assessPersonalizedRisk({
          userType,
          city: userLocation.city,
          aqi: currentReading.aqi,
          predictedAqiTrend: currentReading.aqi > 100 ? "expected to rise slightly" : "stable with slight improvement",
          pm25: currentReading.pm25,
          no2: currentReading.no2,
          o3: currentReading.o3,
          co: currentReading.co,
          so2: currentReading.so2,
        });
        setAssessment(result);
      } catch (error) {
        console.error("AI assessment failed", error);
      } finally {
        setLoading(false);
      }
    }

    // Debounce AI call to avoid spamming on every simulation click
    const timer = setTimeout(getAIPrediction, 1500);
    return () => clearTimeout(timer);
  }, [userLocation, userType, currentReading]);

  if (loading || !assessment) {
    return (
      <LiquidGlassCard className="mb-4 animate-pulse">
        <div className="h-4 w-1/3 bg-white/10 rounded mb-4"></div>
        <div className="h-20 bg-white/5 rounded-xl"></div>
      </LiquidGlassCard>
    );
  }

  const riskColors = {
    low: 'text-emerald-400',
    moderate: 'text-yellow-400',
    high: 'text-orange-400',
    severe: 'text-rose-500'
  };

  return (
    <LiquidGlassCard className="mb-4">
      <div className="flex items-center gap-3 mb-4" suppressHydrationWarning>
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <BrainCircuit className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider">AI Health Advisor</h3>
          <p className="text-[10px] text-muted-foreground">Neural Risk Modeling</p>
        </div>
      </div>

      <div className="space-y-4" suppressHydrationWarning>
        <div suppressHydrationWarning>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase">Risk Level</span>
            <span className={`text-xs font-black uppercase tracking-widest ${riskColors[assessment.riskLevel]}`}>
              {assessment.riskLevel}
            </span>
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000`}
              style={{ width: assessment.riskLevel === 'low' ? '25%' : assessment.riskLevel === 'moderate' ? '50%' : assessment.riskLevel === 'high' ? '75%' : '100%' }}
            ></div>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-3 border border-white/5" suppressHydrationWarning>
          <p className="text-xs text-muted-foreground leading-relaxed italic">
            "{assessment.assessment}"
          </p>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20" suppressHydrationWarning>
          <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
          <div suppressHydrationWarning>
            <p className="text-[11px] font-bold text-primary uppercase mb-1">Actionable Advice</p>
            <p className="text-[11px] text-primary/80 leading-relaxed font-medium">
              {assessment.actionableAdvice}
            </p>
          </div>
        </div>
      </div>
    </LiquidGlassCard>
  );
}
