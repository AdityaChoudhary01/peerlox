"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function StatsCard({ icon, label, value, color, description, trend }) {
  return (
    <Card className="overflow-hidden border-secondary/20 shadow-sm transition-all hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center gap-5">
          <div className={cn(
            "p-4 rounded-2xl flex items-center justify-center text-2xl shadow-inner",
            color || "bg-primary/10 text-primary"
          )}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
              {label}
            </p>
            <div className="flex items-center gap-2">
              <h3 className="text-3xl font-black tracking-tight">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </h3>
              
              {/* Optional Trend Indicator (Growth/Decline) */}
              {trend !== undefined && (
                <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                    trend > 0 ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
                )}>
                    {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                </span>
              )}
            </div>
            {description && (
                <p className="text-[10px] text-muted-foreground mt-1 truncate">
                    {description}
                </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}