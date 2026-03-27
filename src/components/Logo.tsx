import React from 'react';
import { Bird } from 'lucide-react';

interface LogoProps {
  className?: string;
  iconSize?: number;
}

export function Logo({ className = "w-8 h-8", iconSize = 20 }: LogoProps) {
  return (
    <div className={`flex items-center justify-center bg-emerald-500 text-slate-900 rounded-lg shadow-sm ${className}`}>
      <Bird size={iconSize} strokeWidth={2.5} />
    </div>
  );
}
