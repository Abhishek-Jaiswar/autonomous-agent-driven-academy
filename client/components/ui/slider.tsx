"use client";

import * as React from "react";

interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  value?: number[];
  onValueChange?: (value: number[]) => void;
  className?: string;
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ min = 1, max = 60, step = 1, value = [14], onValueChange, className = "" }, ref) => {
    const currentValue = value[0] ?? min;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const num = Number(e.target.value);
      if (onValueChange) {
        onValueChange([num]);
      }
    };

    return (
      <div className={`relative flex w-full touch-none select-none items-center ${className}`}>
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onChange={handleChange}
          className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
        />
      </div>
    );
  }
);
Slider.displayName = "Slider";
