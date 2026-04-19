
"use client"

import { useEffect, useState, useCallback, useRef } from "react";
import { BrainCircuit, ShieldCheck, AlertCircle, RefreshCcw } from "lucide-react";
import { LiquidGlassCard } from "./LiquidGlassCard";
import { useAeroStore } from "@/hooks/use-aero-store";
import { assessPersonalizedRisk, PersonalizedRiskAssessmentOutput } from "@/ai/flows/personalized-risk-assessment";
import { Button } from "./ui/button";

export function AIPredictionCard() {
  const { userLocation, userType, currentReading } = useAeroStore();
  const [assessment, setAssessment] = useState<PersonalizedRiskAssessmentOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastAnalyzedReadingId = useRef<string | null>(null);

  const getAIPrediction = useCallback(async () => {
    if (!userLocation || !currentReading || loading) return;
    
    // Prevent re-analyzing the exact same data point
    if (lastAnalyzedReadingId.current === currentReading.id && assessment) return;

    setLoading(true);
    setError(null);
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
      lastAnalyzedReadingId.current = currentReading.id;
    } catch (err: any) {
      const errorMsg = err.message || "";
      if (errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
        setError("AI Quota Reached. Please wait ~60s before retrying.");
      } else {
        setError("AI analysis unavailable at this moment.");
      }
    } finally {
      setLoading(false);
    }
  }, [userLocation, userType, currentReading, loading, assessment]);

  useEffect(() => {
    // Longer debounce to avoid hitting limits
    const timer = setTimeout(() => {
      if (!assessment && !error && !loading && currentReading) {
        getAIPrediction();
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [getAIPrediction, assessment, error, loading, currentReading]);

  const handleManualRetry = () => {
    setError(null);
    setAssessment(null);
    lastAnalyzedReadingId.current = null;
    getAIPrediction();
  };

  if (loading) {
    return (
      <LiquidGlassCard className="mb-4 animate-pulse" suppressHydrationWarning>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-24 bg-white/10 rounded"></div>
            <div className="h-2 w-16 bg-white/5 rounded"></div>
          </div>
        </div>
        <div className="h-20 bg-white/5 rounded-xl border border-white/5"></div>
      </LiquidGlassCard>
    );
  }

  if (error) {
    return (
      <LiquidGlassCard className="mb-4 border-destructive/20 bg-destructive/5" suppressHydrationWarning>
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-5 h-5 text-destructive" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-destructive">Advisor Paused</h3>
        </div>
        <p className="text-[11px] text-muted-foreground mb-4 leading-relaxed">{error}</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleManualRetry}
          className="w-full text-[10px] h-8 gap-2 bg-white/5 border-white/10 hover:bg-white/10"
        >
          <RefreshCcw className="w-3 h-3" />
          RETRY ANALYSIS
        </Button>
      </LiquidGlassCard>
    );
  }

  if (!assessment) return null;

  const riskColors = {
    low: 'text-emerald-400',
    moderate: 'text-yellow-400',
    high: 'text-orange-400',
    severe: 'text-rose-500'
  };

  return (
    <LiquidGlassCard className="mb-4" suppressHydrationWarning>
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
        
        <button 
          onClick={handleManualRetry}
          className="w-full text-[9px] text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1 mt-2 uppercase font-bold tracking-widest"
        >
          <RefreshCcw className="w-2.5 h-2.5" />
          Refresh Analysis
        </button>
      </div>
    </LiquidGlassCard>
  );
}
