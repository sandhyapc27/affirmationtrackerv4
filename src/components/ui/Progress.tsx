import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";

interface ProgressProps {
  value: number;
  max: number;
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({ value, max, className }) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn("h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5", className)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1, ease: "circOut" }}
        className="h-full bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] rounded-full shadow-[0_0_10px_rgba(124,58,237,0.5)]"
      />
    </div>
  );
};
