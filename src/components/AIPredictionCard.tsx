"use client"

import { useEffect, useState } from "react";
import { BrainCircuit, AlertCircle, ShieldCheck } from "lucide-react";
import { LiquidGlassCard } from "./LiquidGlassCard";
import { useAeroStore } from "@/hooks/use-aero-store";
import { assessPersonalizedRisk, PersonalizedRiskAssessmentOutput } from "@/ai/flows/personalized-risk-assessment";

export function AIPredictionCard() {
  const { userLocation, userType, sensors } = useAeroStore();
  const [assessment, setAssessment] = useState<PersonalizedRiskAssessmentOutput | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function getAIPrediction() {
      if (!userLocation) return;
      
      setLoading(true);
      try {
        const result = await assessPersonalizedRisk({
          userType,
          city: userLocation.city,
          aqi: sensors[0]?.aqi || 42,
          predictedAqiTrend: "stable with slight improvement overnight",
          pm25: sensors[0]?.pm25,
          no2: sensors[0]?.no2,
          o3: sensors[0]?.o3,
          co: sensors[0]?.co,
          so2: sensors[0]?.so2,
        });
        setAssessment(result);
      } catch (error) {
        console.error("AI assessment failed", error);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(getAIPrediction, 1000);
    return () => clearTimeout(timer);
  }, [userLocation, userType, sensors]);

  if (loading || !assessment) {
    return (
      <LiquidGlassCard className="mb-4 animate-pulse">
        <div className="h-24 bg-white/5 rounded-xl"></div>
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
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <BrainCircuit className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider">AI Health Advisor</h3>
          <p className="text-[10px] text-muted-foreground">Neural Risk Modeling</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
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

        <div className="bg-white/5 rounded-xl p-3 border border-white/5">
          <p className="text-xs text-muted-foreground leading-relaxed italic">
            "{assessment.assessment}"
          </p>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20">
          <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
          <div>
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