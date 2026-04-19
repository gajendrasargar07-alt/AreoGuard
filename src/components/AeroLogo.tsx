import { Wind } from "lucide-react";

export function AeroLogo() {
  return (
    <div className="flex items-center gap-3 group cursor-default select-none">
      <div className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-primary/10 border border-primary/30 liquid-glass-dark neon-glow-primary group-hover:scale-105 transition-transform">
        <Wind className="w-6 h-6 text-primary" />
        <div className="absolute inset-0 bg-primary/5 rounded-xl blur-sm opacity-50"></div>
      </div>
      <div className="flex flex-col">
        <h1 className="text-xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary leading-none">
          AEROGUARD
        </h1>
        <span className="text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
          Atmospheric Integrity
        </span>
      </div>
    </div>
  );
}