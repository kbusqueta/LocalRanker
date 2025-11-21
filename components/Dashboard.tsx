import React from 'react';
import { Business, StatMetric } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  business: Business;
  stats: StatMetric[];
}

export const Dashboard: React.FC<DashboardProps> = ({ business, stats }) => {
  const totalViews = stats.reduce((acc, curr) => acc + curr.views, 0);
  const totalClicks = stats.reduce((acc, curr) => acc + curr.clicks, 0);
  const totalCalls = stats.reduce((acc, curr) => acc + curr.calls, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Vues totales (7j)</p>
          <p className="text-3xl font-bold text-blue-600">{totalViews}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Clics site web</p>
          <p className="text-3xl font-bold text-green-600">{totalClicks}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Appels</p>
          <p className="text-3xl font-bold text-orange-600">{totalCalls}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
        <h3 className="text-lg font-semibold mb-4">Performance de la semaine</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={stats} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="date" />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <Tooltip />
            <Area type="monotone" dataKey="views" stroke="#3B82F6" fillOpacity={1} fill="url(#colorViews)" name="Vues" />
            <Area type="monotone" dataKey="clicks" stroke="#10B981" fillOpacity={1} fill="url(#colorClicks)" name="Clics" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
