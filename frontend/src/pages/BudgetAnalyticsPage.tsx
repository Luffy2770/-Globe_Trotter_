import React, { useState, useEffect } from 'react';
import { itineraryApi, tripsApi } from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AlertTriangle, CheckCircle, PieChart as PieIcon } from 'lucide-react';

interface BudgetAnalyticsPageProps {
  tripId: number;
}

export const BudgetAnalyticsPage: React.FC<BudgetAnalyticsPageProps> = ({ tripId }) => {
  const [budgetData, setBudgetData] = useState<any>(null);
  const [tripOverview, setTripOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBudget = async () => {
      setLoading(true);
      try {
        const [bRes, tRes] = await Promise.all([
          itineraryApi.getBudget(tripId),
          tripsApi.getOverview(tripId),
        ]);
        setBudgetData(bRes.data);
        setTripOverview(tRes.data);
      } catch (err) {
        console.error('Failed to load budget analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    loadBudget();
  }, [tripId]);

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-400">Loading budget analytics...</div>;
  }

  if (!budgetData || !tripOverview) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-400">Trip budget data unavailable.</div>;
  }

  const chartData = [
    { name: 'Accommodation / Stay Cost', value: budgetData.calculated_stay_cost, color: '#10b981' },
    { name: 'Scheduled Activities Cost', value: budgetData.calculated_activity_cost, color: '#06b6d4' },
    { name: 'Unallocated Remaining Budget', value: Math.max(0, budgetData.net_balance), color: '#3b82f6' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-2">
        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/30">
          Trip Financial Breakdown & Budget Analytics
        </span>
        <h1 className="text-2xl font-extrabold text-white">{tripOverview.title}</h1>
        <p className="text-xs text-slate-400">{tripOverview.city_name || 'Multi-City Trip'} • {tripOverview.duration_days} Days Duration</p>
      </div>

      {budgetData.is_over_budget ? (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-center space-x-3 text-rose-300">
          <AlertTriangle className="w-6 h-6 flex-shrink-0 text-rose-400" />
          <div>
            <h4 className="text-sm font-bold">Budget Overrun Warning Alert</h4>
            <p className="text-xs text-rose-300/80">
              Total calculated expenses (${budgetData.total_calculated_cost}) exceed target budget (${budgetData.total_budget_target}) by ${Math.abs(budgetData.net_balance).toFixed(2)}.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center space-x-3 text-emerald-300">
          <CheckCircle className="w-6 h-6 flex-shrink-0 text-emerald-400" />
          <div>
            <h4 className="text-sm font-bold">Trip Budget on Track</h4>
            <p className="text-xs text-emerald-300/80">
              Remaining unallocated balance: ${budgetData.net_balance.toFixed(2)} out of ${budgetData.total_budget_target} target.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Target Budget</span>
          <span className="text-2xl font-extrabold text-white">${budgetData.total_budget_target.toLocaleString()}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Stay / Accommodation Cost</span>
          <span className="text-2xl font-extrabold text-emerald-400">${budgetData.calculated_stay_cost.toLocaleString()}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Activity Expenses</span>
          <span className="text-2xl font-extrabold text-cyan-400">${budgetData.calculated_activity_cost.toLocaleString()}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Total Calculated Cost</span>
          <span className={`text-2xl font-extrabold ${budgetData.is_over_budget ? 'text-rose-400' : 'text-blue-400'}`}>
            ${budgetData.total_calculated_cost.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <PieIcon className="w-5 h-5 text-emerald-400" />
          <span>Expense Distribution Visualization</span>
        </h3>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px', color: '#94a3b8' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
