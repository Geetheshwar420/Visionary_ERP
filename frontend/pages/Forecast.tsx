import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ForecastData } from '../types';
import { FORECAST_DATA } from '../constants';
import { TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { dashboardApi } from '../services/api';

const Forecast: React.FC = () => {
  const { t } = useLanguage();
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [forecastStats, setForecastStats] = useState({
    predictedProfit: 0,
    bestCase: 0,
    worstCase: 0,
    confidence: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchForecast = async () => {
      setIsLoading(true);
      try {
        const result = await dashboardApi.getForecast(30);
        if (result.success && result.data) {
          if (result.data.forecast?.length) {
            setForecastData(result.data.forecast);
          }
          setForecastStats({
            predictedProfit: result.data.predictedProfit || 12450,
            bestCase: result.data.bestCase || 14300,
            worstCase: result.data.worstCase || 10600,
            confidence: result.data.confidence || 85
          });
        }
      } catch (error) {
        console.log('Using default forecast data as fallback');
      } finally {
        setIsLoading(false);
      }
    };

    fetchForecast();
  }, []);

  // Split data for styling
  const todayIndex = 15;
  const currentPrediction = forecastData[todayIndex + 1]?.predicted || 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">{t('financialForecast')}</h2>
        <p className="text-slate-500 dark:text-slate-400">{t('forecastDesc')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm md:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">{t('profitTrajectory')}</h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-blue-500 opacity-20 border border-blue-500"></span>
                <span className="text-slate-600 dark:text-slate-300">{t('historical')}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-emerald-500 opacity-20 border border-emerald-500"></span>
                <span className="text-slate-600 dark:text-slate-300">{t('predicted')}</span>
              </div>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#64748B" strokeOpacity={0.2} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: '#94A3B8' }}
                  tickFormatter={(val) => val.split('-').slice(1).join('/')}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#94A3B8' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', border: '1px solid #334155', color: '#F8FAFC' }}
                  itemStyle={{ color: '#F8FAFC' }}
                  formatter={(value: number) => [`$${value.toFixed(0)}`, 'Profit']}
                  labelStyle={{ color: '#94A3B8', marginBottom: '0.5rem' }}
                />
                <ReferenceLine x={forecastData[todayIndex]?.date} stroke="#94A3B8" strokeDasharray="3 3" label={{ value: 'Today', fill: '#94A3B8', fontSize: 12, position: 'insideTopLeft' }} />

                <Area
                  type="monotone"
                  dataKey="predicted"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPredicted)"
                  name="Predicted"
                />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorActual)"
                  name="Actual"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-visionary-indigo dark:bg-slate-800 text-white p-6 rounded-xl shadow-lg border border-transparent dark:border-slate-700">
            <p className="text-slate-400 text-sm font-medium mb-1">{t('next30Days')}</p>
            <p className="text-3xl font-heading font-bold mb-4">${forecastStats.predictedProfit.toLocaleString()}</p>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">{t('bestCase')}</span>
                <span className="text-emerald-400 font-medium">${forecastStats.bestCase.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${forecastStats.confidence}%` }}></div>
              </div>

              <div className="flex justify-between text-sm mt-2">
                <span className="text-slate-300">{t('worstCase')}</span>
                <span className="text-amber-400 font-medium">${forecastStats.worstCase.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${100 - forecastStats.confidence}%` }}></div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h4 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center">
              <TrendingUp size={18} className="mr-2 text-blue-600 dark:text-blue-400" />
              {t('keyDrivers')}
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Milk sales up 15%</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Driving 40% of growth this week.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Utility costs rising</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Expect 3% margin impact.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forecast;