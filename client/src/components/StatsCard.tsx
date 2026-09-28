import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string; // Tailwind text color class
  trend?: string;
}

export function StatsCard({ title, value, icon: Icon, color = "text-primary", trend }: StatsCardProps) {
  return (
    <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow overflow-visible">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
            <h3 className="text-xl sm:text-2xl font-bold mt-1 sm:mt-2 font-display">{value}</h3>
            {trend && <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 truncate">{trend}</p>}
          </div>
          <div className={`p-2 sm:p-3 rounded-xl bg-muted/50 shrink-0 ${color}`}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
