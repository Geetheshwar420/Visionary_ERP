import React from 'react';
import { TrendingUp, TrendingDown, Minus, Clock } from 'lucide-react';

interface VelocityCardProps {
  category: string;
  avgVelocity: number;
  trend: number; // percentage
  status: 'FAST' | 'MEDIUM' | 'SLOW';
  daysToStockout: number;
}

const VelocityCard: React.FC<VelocityCardProps> = ({ category, avgVelocity, trend, status, daysToStockout }) => {
  const statusConfig = {
    FAST: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/10',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-100 dark:border-emerald-900/30',
      dot: 'bg-emerald-500',
      label: 'High Demand'
    },
    MEDIUM: {
      bg: 'bg-amber-50 dark:bg-amber-900/10',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-100 dark:border-amber-900/30',
      dot: 'bg-amber-500',
      label: 'Steady'
    },
    SLOW: {
      bg: 'bg-slate-50 dark:bg-slate-800/50',
      text: 'text-slate-600 dark:text-slate-400',
      border: 'border-slate-100 dark:border-slate-700',
      dot: 'bg-slate-400',
      label: 'Low Motion'
    },
  };

  const config = statusConfig[status];

  return (
    <div className="group bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 relative overflow-hidden">
      {/* Background decoration on hover */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/0 to-blue-500/5 dark:to-blue-500/10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <h3 className="font-heading font-bold text-slate-800 dark:text-slate-100 text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{category}</h3>
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 uppercase tracking-wide ${config.bg} ${config.text} ${config.border}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
          {config.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5 relative z-10">
        <div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold mb-1">Velocity</p>
          <p className="text-2xl font-mono font-bold text-slate-900 dark:text-white tracking-tight">
            {avgVelocity}
            <span className="text-xs text-slate-400 font-normal ml-1">/day</span>
          </p>
        </div>
        <div>
           <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold mb-1 flex items-center gap-1">
             <Clock size={10} /> Stockout
           </p>
          <p className={`text-2xl font-mono font-bold tracking-tight ${daysToStockout < 7 ? 'text-red-500 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
            {daysToStockout}
            <span className="text-xs text-slate-400 font-normal ml-1">days</span>
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-50 dark:border-slate-700/50 flex items-center justify-between text-xs font-medium relative z-10">
        <span className="text-slate-400 dark:text-slate-500">7-day trend</span>
        <div className={`flex items-center ${trend > 0 ? 'text-emerald-600 dark:text-emerald-400' : trend < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-500'}`}>
          {trend > 0 ? (
            <TrendingUp size={14} className="mr-1" />
          ) : trend < 0 ? (
            <TrendingDown size={14} className="mr-1" />
          ) : (
            <Minus size={14} className="mr-1" />
          )}
          <span>{Math.abs(trend)}%</span>
        </div>
      </div>
    </div>
  );
};

export default VelocityCard;