import { cn } from "@/lib/utils";
import React from "react";

interface LiquidGlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export function LiquidGlassCard({ children, className, glow = false }: LiquidGlassCardProps) {
  return (
    <div className={cn(
      "liquid-glass p-6 rounded-2xl relative group",
      glow && "neon-glow-primary",
      className
    )}>
      {/* Refraction effect lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
        <div className="refraction-line" style={{ top: '10%', animationDelay: '0s' }}></div>
        <div className="refraction-line" style={{ top: '30%', animationDelay: '2s' }}></div>
        <div className="refraction-line" style={{ top: '70%', animationDelay: '5s' }}></div>
      </div>
      
      {/* Ambient glass light */}
      <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-primary/5 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}