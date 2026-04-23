import * as React from "react";
import { motion, HTMLMotionProps } from "motion/react";
import { cn } from "@/src/lib/utils";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const variants = {
      primary: "bg-[#7c3aed] text-white hover:bg-[#8b5cf6] shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)]",
      secondary: "bg-white/10 text-white hover:bg-white/20 backdrop-blur-md border border-white/10",
      outline: "border border-white/20 text-white hover:bg-white/5",
      ghost: "text-white/60 hover:text-white hover:bg-white/5",
    };

    const sizes = {
      sm: "px-4 py-2 text-xs",
      md: "px-6 py-3",
      lg: "px-8 py-4 text-lg",
      icon: "p-3",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "inline-flex items-center justify-center rounded-2xl font-medium transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
