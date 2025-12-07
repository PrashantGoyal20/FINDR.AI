import React from 'react';
import { Search } from 'lucide-react';

export default function FindrLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      <div className="relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-blue-500/20 animate-ping" style={{ animationDuration: '2s' }}></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-blue-400/30 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.3s' }}></div>
        </div>
        
        <div className="relative z-10 bg-slate-800 rounded-full p-8 shadow-2xl border border-blue-500/30">
          <div className="animate-bounce" style={{ animationDuration: '1.5s' }}>
            <Search className="w-12 h-12 text-blue-400" strokeWidth={2.5} />
          </div>
        </div>
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 pointer-events-none">
          <div className="absolute inset-0 border-t-4 border-blue-400/60 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
        </div>
        
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <p className="text-blue-400 text-xl font-bold tracking-wide">
            FINDR
          </p>
          <div className="flex items-center justify-center gap-1 mt-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}