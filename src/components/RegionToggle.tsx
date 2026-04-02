import React from 'react';
import { REGIONS, setRegion, getStoredRegion } from '@/lib/regions';
import { cn } from './ui';
import { ChevronDown, Globe } from 'lucide-react';

export const RegionToggle = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const currentRegion = getStoredRegion();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-blue-300 group",
          isOpen ? "ring-2 ring-blue-100 border-blue-400" : ""
        )}
      >
        <span className="text-lg">{currentRegion.flag}</span>
        <span className="text-[11px] font-semibold tracking-wide text-slate-700 hidden md:block uppercase">{currentRegion.name}</span>
        <ChevronDown 
          size={14} 
          className={cn(
            "text-slate-400 transition-transform duration-300",
            isOpen ? "rotate-180" : ""
          )} 
        />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-2xl border border-slate-200 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.1)] overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="p-2 space-y-1">
              {Object.values(REGIONS).map((region) => (
                <button
                  key={region.code}
                  onClick={() => {
                    setRegion(region.code);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group",
                    currentRegion.code === region.code
                      ? "bg-blue-50 text-blue-600"
                      : "hover:bg-slate-50 text-slate-600"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{region.flag}</span>
                    <span className="text-[13px] font-semibold tracking-tight">{region.name}</span>
                  </div>
                  {currentRegion.code === region.code && (
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
