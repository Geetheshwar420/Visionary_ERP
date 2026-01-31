import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, AlertTriangle, Sparkles, TrendingUp, DollarSign, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell } from 'recharts';
import { Product, Insight } from '../types';
import { useProducts, useInsights } from '../hooks/useQueries';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: productsData, isLoading: productsLoading } = useProducts({ limit: 100 });
  const { data: insights = [], isLoading: insightsLoading } = useInsights({ limit: 50 });

  const product = productsData?.products.find(p => p.id === id);

  if (productsLoading || insightsLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-full" />
          <div className="h-10 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="h-[400px] bg-slate-200 dark:bg-slate-700 rounded-3xl" />
            <div className="h-[300px] bg-slate-200 dark:bg-slate-700 rounded-3xl" />
          </div>
          <div className="space-y-6">
            <div className="h-[200px] bg-slate-200 dark:bg-slate-700 rounded-3xl" />
            <div className="h-[200px] bg-slate-200 dark:bg-slate-700 rounded-3xl" />
            <div className="h-[200px] bg-slate-200 dark:bg-slate-700 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  // Generate history data
  const historyData = useMemo(() => {
    if (!product) return [];
    return Array.from({ length: 14 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (13 - i));
      const variance = (Math.random() * 0.4 - 0.2) * product.velocity;
      return {
        date: date.toISOString().split('T')[0].slice(5),
        sales: Math.max(0, Math.round(product.velocity + variance))
      };
    });
  }, [product]);

  if (!product) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Product not found</h2>
        <button onClick={() => navigate('/inventory')} className="mt-4 text-blue-600 dark:text-blue-400 hover:underline">
          Back to Inventory
        </button>
      </div>
    );
  }

  const margin = product.sellingPrice - product.costPrice;
  const marginPercent = ((margin / product.sellingPrice) * 100).toFixed(1);
  const expiryDate = new Date(product.expiryDate);
  const daysToExpiry = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const productInsights = insights.filter(i => i.relatedProductId === product.id);

  // Data for Cost vs Price Chart
  const priceData = [
    {
      name: 'Breakdown',
      Cost: product.costPrice,
      Profit: margin,
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <button
        onClick={() => navigate('/inventory')}
        className="flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors group"
      >
        <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Inventory
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-heading font-bold text-slate-900 dark:text-white">{product.name}</h1>
            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-mono text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">{product.sku}</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{product.category} • Last sold on {product.lastSold}</p>
        </div>
        <div className="flex gap-3">
          {daysToExpiry < 7 ? (
            <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm font-medium flex items-center border border-red-200 dark:border-red-800">
              <AlertTriangle size={16} className="mr-1.5" />
              Expires in {daysToExpiry} days
            </span>
          ) : (
            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-medium flex items-center border border-emerald-200 dark:border-emerald-800">
              <Sparkles size={16} className="mr-1.5" />
              Fresh Stock
            </span>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Stock Level</p>
          <div className="flex items-baseline">
            <span className="text-2xl font-mono font-bold text-slate-900 dark:text-white">{product.quantity}</span>
            <span className="ml-1 text-sm text-slate-400">units</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className={`h-full rounded-full ${product.quantity < 10 ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(100, (product.quantity / 50) * 100)}%` }}></div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Selling Price</p>
          <div className="flex items-baseline">
            <span className="text-2xl font-mono font-bold text-slate-900 dark:text-white">${product.sellingPrice.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Cost Price</p>
          <div className="flex items-baseline">
            <span className="text-2xl font-mono font-bold text-slate-900 dark:text-white">${product.costPrice.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Profit Margin</p>
          <div className="flex items-baseline">
            <span className={`text-2xl font-mono font-bold ${Number(marginPercent) > 20 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {marginPercent}%
            </span>
            <span className="ml-1 text-sm text-slate-400">(${margin.toFixed(2)})</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales History Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading font-bold text-lg text-slate-800 dark:text-white flex items-center">
              <Activity size={20} className="mr-2 text-blue-600 dark:text-blue-400" />
              Sales History
            </h3>
            <span className="text-sm px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300 font-medium">
              Avg. Velocity: {product.velocity}/day
            </span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#64748B" strokeOpacity={0.1} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: '#94A3B8' }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#94A3B8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderRadius: '8px',
                    border: '1px solid #334155',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    color: '#F8FAFC'
                  }}
                  itemStyle={{ color: '#F8FAFC' }}
                  formatter={(value) => [`${value} units`, 'Sales']}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  name="Units Sold"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  fill="url(#colorSales)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Panel: Price Analysis & Insights */}
        <div className="space-y-6">

          {/* Price Analysis Chart */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="font-heading font-bold text-lg text-slate-800 dark:text-white mb-4 flex items-center">
              <DollarSign size={20} className="mr-2 text-emerald-600 dark:text-emerald-400" />
              Unit Economics
            </h3>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priceData} layout="vertical" barSize={30}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" hide />
                  <Tooltip
                    cursor={false}
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderRadius: '8px',
                      border: '1px solid #334155',
                      color: '#F8FAFC'
                    }}
                    itemStyle={{ color: '#F8FAFC' }}
                  />
                  <Legend />
                  <Bar dataKey="Cost" stackId="a" fill="#94A3B8" radius={[4, 0, 0, 4]} />
                  <Bar dataKey="Profit" stackId="a" fill="#10B981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
              Profit margin is <span className="font-bold text-emerald-600 dark:text-emerald-400">{marginPercent}%</span> of the selling price.
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="font-heading font-bold text-lg text-slate-800 dark:text-white mb-4 flex items-center">
              <Sparkles size={18} className="mr-2 text-visionary-amber" />
              Active Insights
            </h3>
            <div className="space-y-4">
              {productInsights.length > 0 ? (
                productInsights.map(insight => (
                  <div key={insight.id} className={`p-4 rounded-lg border relative overflow-hidden ${insight.type === 'critical' ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800' :
                    insight.type === 'important' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800'
                    }`}>
                    <div className="flex items-center justify-between mb-1 relative z-10">
                      <p className={`text-xs font-bold uppercase ${insight.type === 'critical' ? 'text-red-700 dark:text-red-400' :
                        insight.type === 'important' ? 'text-amber-700 dark:text-amber-400' : 'text-blue-700 dark:text-blue-400'
                        }`}>{insight.type}</p>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {new Date(insight.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1 leading-tight relative z-10">{insight.title}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 relative z-10">{insight.description}</p>
                    {insight.action && (
                      <button className="text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 px-3 py-1.5 rounded shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors w-full text-slate-700 dark:text-slate-300 relative z-10">
                        {insight.action}
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-center border border-dashed border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-500 dark:text-slate-400">No active AI insights for this product.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Product Attributes Footer */}
      <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
        <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Product Attributes</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400">SKU</p>
            <p className="font-mono text-sm font-medium dark:text-slate-200">{product.sku}</p>
          </div>
          <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400">Category</p>
            <p className="text-sm font-medium dark:text-slate-200">{product.category}</p>
          </div>
          <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400">Expiry</p>
            <p className="text-sm font-medium dark:text-slate-200">{product.expiryDate}</p>
          </div>
          <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400">Velocity</p>
            <p className="text-sm font-medium dark:text-slate-200">{product.velocity}/day</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;