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
    return <div className="max-w-7xl mx-auto px-6 py-16 text-center text-xs text-slate-400 font-medium animate-pulse">Loading budget analytics...</div>;
  }

  if (!budgetData || !tripOverview) {
    return <div className="max-w-7xl mx-auto px-6 py-16 text-center text-xs text-slate-400 italic">Trip budget data unavailable.</div>;
  }

  const chartData = [
    { name: 'Accommodation / Stay Cost', value: budgetData.calculated_stay_cost, color: '#3b82f6' },
    { name: 'Scheduled Activities Cost', value: budgetData.calculated_activity_cost, color: '#0d9488' },
    { name: 'Unallocated Balance', value: Math.max(0, budgetData.net_balance), color: '#10b981' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6 animate-scale-up">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-2">
        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-full border border-blue-200">
          Financial Breakdown & Budget Analytics
        </span>
        <h1 className="text-2xl font-bold text-slate-900">{tripOverview.title}</h1>
        <p className="text-xs text-slate-500 font-medium">{tripOverview.city_name || 'Multi-City Trip'} • {tripOverview.duration_days} Days Duration</p>
      </div>

      {budgetData.is_over_budget ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center space-x-3 text-rose-700 shadow-xs">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <div>
            <h4 className="text-xs font-bold">Budget Overrun Warning Alert</h4>
            <p className="text-[11px] text-rose-600 font-medium">
              Total calculated expenses (${budgetData.total_calculated_cost}) exceed target budget (${budgetData.total_budget_target}) by ${Math.abs(budgetData.net_balance).toFixed(2)}.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center space-x-3 text-emerald-700 shadow-xs">
          <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <div>
            <h4 className="text-xs font-bold">Trip Budget on Track</h4>
            <p className="text-[11px] text-emerald-600 font-medium">
              Remaining unallocated balance: ${budgetData.net_balance.toFixed(2)} out of ${budgetData.total_budget_target} target.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Target Budget</span>
          <span className="text-2xl font-bold text-slate-900">${budgetData.total_budget_target.toLocaleString()}</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Stay Cost</span>
          <span className="text-2xl font-bold text-blue-600">${budgetData.calculated_stay_cost.toLocaleString()}</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Activity Expenses</span>
          <span className="text-2xl font-bold text-teal-600">${budgetData.calculated_activity_cost.toLocaleString()}</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Total Calculated Cost</span>
          <span className={`text-2xl font-bold ${budgetData.is_over_budget ? 'text-rose-600' : 'text-slate-900'}`}>
            ${budgetData.total_calculated_cost.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <PieIcon className="w-4 h-4 text-blue-600" />
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
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', color: '#0f172a', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px', color: '#64748b', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
