import React, { useState } from 'react';
import { AlertTriangle, Sparkles, RefreshCw, ArrowRight, TrendingUp, Package, DollarSign } from 'lucide-react';
import VelocityCard from '../components/VelocityCard';
import { SpoilageRisk, RiskLevel } from '../types';
import { generateInventoryInsights } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { useDashboardOverview, useProducts } from '../hooks/useQueries';

import { DashboardSkeleton } from '../components/Skeleton';

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const [isGenerating, setIsGenerating] = useState(false);
  const [manuallyGeneratedInsights, setManuallyGeneratedInsights] = useState<any[]>([]);

  // Use React Query hooks instead of Props and useEffect
  const { data: overview, isLoading: overviewLoading } = useDashboardOverview();
  const { data: productsData, isLoading: productsLoading } = useProducts({ limit: 100 });

  if (overviewLoading || productsLoading) return <DashboardSkeleton />;

  const products = productsData?.products || [];

  // High Level Stats from overview or calculated from products
  const totalStock = products.reduce((acc, p) => acc + p.quantity, 0);
  const lowStockCount = overview?.stats.lowStock ?? products.filter(p => p.quantity < 10).length;

  const risks = overview?.spoilageRisks || [];
  const dashboardStats = overview ? {
    predictedProfit: overview.stats.predictedProfit,
    profitTrend: 12.4, // Trend would ideally come from backend history comparison
    confidence: overview.stats.confidenceScore,
  } : null;

  const insights = [...manuallyGeneratedInsights, ...(overview?.recentInsights || [])];

  const handleGenerateInsights = async () => {
    setIsGenerating(true);
    try {
      const newInsights = await generateInventoryInsights(products);
      if (newInsights && newInsights.length > 0) {
        setManuallyGeneratedInsights(prev => [...newInsights, ...prev]);
      }
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Calculate velocity metrics by category
  const categoryVelocities = products.reduce((acc: Record<string, { total: number; count: number }>, p) => {
    if (!acc[p.category]) {
      acc[p.category] = { total: 0, count: 0 };
    }
    acc[p.category].total += p.velocity;
    acc[p.category].count += 1;
    return acc;
  }, {});

  const velocityMetrics = Object.entries(categoryVelocities).map(([category, data]) => {
    const avgVelocity = Math.round((data.total / data.count) * 10) / 10;
    return {
      category,
      avgVelocity,
      status: avgVelocity > 15 ? 'FAST' : avgVelocity > 5 ? 'MEDIUM' : 'SLOW',
      trend: Math.round((avgVelocity / 10) * 5),
      daysToStockout: Math.ceil(30 / (avgVelocity || 1))
    };
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Stats Section - Bento Grid Style */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* Main Hero Card - Gradient Mesh Style */}
        <div className="md:col-span-12 lg:col-span-6 xl:col-span-5 bg-slate-900 relative overflow-hidden rounded-3xl p-8 shadow-xl shadow-indigo-900/20 text-white group">
          <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-indigo-500/30 blur-[60px] rounded-full mix-blend-screen group-hover:bg-indigo-500/40 transition-colors duration-700"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-500/30 blur-[50px] rounded-full mix-blend-screen group-hover:bg-purple-500/40 transition-colors duration-700"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2 text-indigo-200">
                <Sparkles size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">{t('aiProjection')}</span>
              </div>
              <p className="text-slate-300 text-sm font-medium">{t('predictedProfit')}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h2 className="text-5xl font-heading font-bold tracking-tight text-white">
                  ${dashboardStats?.predictedProfit?.toLocaleString() || '0'}
                </h2>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/10 text-sm font-medium text-white flex items-center">
                  <TrendingUp size={14} className="mr-2 text-emerald-400" />
                  +{dashboardStats?.profitTrend || 0}% {t('vsLastMonth')}
                </div>
                <span className="text-xs text-slate-400 font-medium">{dashboardStats?.confidence || 0}% {t('confidence')}</span>
              </div>
              <div className="w-full bg-slate-800/50 h-2 rounded-full overflow-hidden border border-white/5">
                <div
                  className="bg-gradient-to-r from-indigo-400 to-purple-400 h-full rounded-full shadow-[0_0_10px_rgba(129,140,248,0.5)] transition-all duration-1000"
                  style={{ width: `${dashboardStats?.confidence || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Stat Cards */}
        <div className="md:col-span-6 lg:col-span-3 xl:col-span-3 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col justify-between group">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-2xl group-hover:scale-105 transition-transform">
                <DollarSign className="text-emerald-600 dark:text-emerald-400" size={24} />
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full">+8%</span>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{t('inventoryValue')}</p>
              <p className="text-3xl font-heading font-bold text-slate-900 dark:text-white tracking-tight">
                ${products.reduce((acc, p) => acc + (p.quantity * p.costPrice), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="md:col-span-6 lg:col-span-3 xl:col-span-4 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col justify-between group">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-2xl group-hover:scale-105 transition-transform">
                <Package className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{t('activeProducts')}</p>
                <p className="text-3xl font-heading font-bold text-slate-900 dark:text-white tracking-tight">{products.length}</p>
              </div>
              <div className="text-right">
                <p className="text-amber-500 font-bold text-xl">{lowStockCount}</p>
                <p className="text-xs text-slate-400 font-medium">{t('lowStock')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Velocity & Alerts */}
        <div className="lg:col-span-2 space-y-8">

          <section>
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white">{t('velocityWidget')}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {velocityMetrics.length > 0 ? (
                velocityMetrics.map((metric) => (
                  <VelocityCard
                    key={metric.category}
                    category={metric.category}
                    avgVelocity={metric.avgVelocity}
                    trend={metric.trend}
                    status={metric.status as 'FAST' | 'MEDIUM' | 'SLOW'}
                    daysToStockout={metric.daysToStockout}
                  />
                ))
              ) : (
                <div className="col-span-2 p-8 text-center bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500">
                  Add products to see velocity metrics
                </div>
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white flex items-center">
                <div className="bg-amber-100 dark:bg-amber-900/30 p-1.5 rounded-lg mr-3">
                  <AlertTriangle className="text-amber-600 dark:text-amber-400" size={18} />
                </div>
                {t('spoilageRisks')}
              </h2>
              <button className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors">{t('viewReport')}</button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              {risks.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                  <Sparkles className="mx-auto mb-2 text-slate-300" size={24} />
                  <p>No critical risks detected. Good job!</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {risks.map((risk, idx) => (
                    <div key={risk.productId} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                      <div className="flex items-start gap-4">
                        <span className="text-slate-300 font-mono text-sm font-medium mt-1">{(idx + 1).toString().padStart(2, '0')}</span>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{risk.productName}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${risk.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                              }`}>
                              {risk.riskLevel}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              Expires in {risk.daysToExpiry} days
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 pl-8 sm:pl-0">
                        <div className="text-right hidden sm:block">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{t('potentialLoss')}</p>
                          <p className="font-mono text-slate-700 dark:text-slate-300 font-medium">${risk.potentialLoss.toFixed(2)}</p>
                        </div>
                        <button className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl shadow-lg shadow-slate-900/10 dark:shadow-white/5 hover:scale-105 transition-transform">
                          {risk.recommendation}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: AI Insights - Feed Style */}
        <div className="lg:col-span-1">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-lg mr-3">
                <Sparkles className="text-blue-600 dark:text-blue-400" size={18} />
              </div>
              {t('aiFeed')}
            </h2>
            <button
              onClick={handleGenerateInsights}
              disabled={isGenerating}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all shadow-sm hover:shadow border border-transparent hover:border-slate-200 dark:hover:border-slate-700 disabled:opacity-50"
            >
              <RefreshCw size={18} className={isGenerating ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="space-y-4">
            {insights.map((insight) => (
              <div key={insight.id} className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                {/* Decorative Accent */}
                <div className={`absolute top-0 left-0 w-full h-1 ${insight.type === 'critical' ? 'bg-red-500' :
                  insight.type === 'important' ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />

                <div className="flex justify-between items-start mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg ${insight.type === 'critical' ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                    insight.type === 'important' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    }`}>
                    {insight.type}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 font-mono">
                    {new Date(insight.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{insight.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">{insight.description}</p>

                {insight.action && (
                  <button className="w-full py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center group-hover:border-blue-200 dark:group-hover:border-blue-800">
                    {insight.action} <ArrowRight size={12} className="ml-1.5 opacity-50 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
            ))}

            {insights.length === 0 && (
              <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">{t('noInsights')}</p>
                <button onClick={handleGenerateInsights} className="text-blue-600 dark:text-blue-400 text-sm font-bold hover:underline">
                  {t('generateAnalysis')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;