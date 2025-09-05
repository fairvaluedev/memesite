"use client";

import { useTheme } from "./theme-provider";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-center w-14 h-8 rounded-full border transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-20"
      style={{
        backgroundColor: 'rgb(var(--color-muted))',
        borderColor: 'rgb(var(--color-border))'
      }}
      aria-label="Toggle theme"
    >
      {/* Toggle Circle */}
      <motion.div
        className="absolute w-6 h-6 rounded-full flex items-center justify-center"
        style={{
          backgroundColor: 'rgb(var(--color-foreground))'
        }}
        animate={{
          x: theme === "light" ? -12 : 12,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      >
        <motion.div
          animate={{
            rotate: theme === "light" ? 0 : 180,
          }}
          transition={{
            duration: 0.3,
          }}
        >
          {theme === "light" ? (
            <Sun className="w-3 h-3" style={{ color: 'rgb(var(--color-background))' }} />
          ) : (
            <Moon className="w-3 h-3" style={{ color: 'rgb(var(--color-background))' }} />
          )}
        </motion.div>
      </motion.div>

      {/* Background Icons */}
      <div className="absolute inset-0 flex items-center justify-between px-2">
        <Sun className="w-3 h-3" style={{ color: 'rgb(var(--color-muted-foreground) / 0.5)' }} />
        <Moon className="w-3 h-3" style={{ color: 'rgb(var(--color-muted-foreground) / 0.5)' }} />
      </div>
    </button>
  );
} 