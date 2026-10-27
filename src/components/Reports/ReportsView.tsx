import React from 'react';
import { Itinerary } from '../../types';
import { BarChart3, TrendingUp, DollarSign, Compass, Users, FileCheck2 } from 'lucide-react';

interface ReportsViewProps {
  itineraries: Itinerary[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ itineraries }) => {
  const totalRevenue = itineraries.reduce((acc, i) => acc + i.pricing.finalSellingPrice, 0);
  const totalProfit = itineraries.reduce((acc, i) => acc + i.pricing.grossProfit, 0);
  const avgMargin = Math.round(
    itineraries.reduce((acc, i) => acc + i.pricing.targetMarginPercent, 0) / (itineraries.length || 1)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-600" /> Commercial Reports & Performance Analytics
        </h2>
        <p className="text-slate-500 text-xs mt-1">
          Sales pipeline value, proposal conversion rates, gross profit margins, and consultant productivity.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-slate-500 text-xs font-semibold">Total Pipeline Value</span>
          <div className="text-2xl font-black text-slate-900">₹{totalRevenue.toLocaleString()}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-slate-500 text-xs font-semibold">Gross Profit Margin</span>
          <div className="text-2xl font-black text-emerald-600">₹{totalProfit.toLocaleString()}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-slate-500 text-xs font-semibold">Average Margin %</span>
          <div className="text-2xl font-black text-purple-600">{avgMargin}%</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-slate-500 text-xs font-semibold">Total Proposals Generated</span>
          <div className="text-2xl font-black text-slate-900">{itineraries.length} Proposals</div>
        </div>
      </div>

      {/* Breakdown Tables */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
        <h3 className="font-bold text-slate-900 text-sm">Proposal Commercial Breakdown</h3>

        <table className="w-full text-left border-collapse border border-slate-200">
          <thead>
            <tr className="bg-slate-900 text-white font-bold">
              <th className="p-2.5">ITN Ref</th>
              <th className="p-2.5">Client Name</th>
              <th className="p-2.5">Consultant</th>
              <th className="p-2.5">Status</th>
              <th className="p-2.5">Cost</th>
              <th className="p-2.5">Selling Price</th>
              <th className="p-2.5">Profit</th>
              <th className="p-2.5">Margin</th>
            </tr>
          </thead>
          <tbody>
            {itineraries.map((it) => (
              <tr key={it.id} className="border-b border-slate-100 font-medium">
                <td className="p-2.5 font-bold font-mono text-indigo-600">{it.itineraryNumber}</td>
                <td className="p-2.5 text-slate-900 font-bold">{it.customerName}</td>
                <td className="p-2.5 text-slate-600">{it.consultantName}</td>
                <td className="p-2.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">
                    {it.status}
                  </span>
                </td>
                <td className="p-2.5 font-mono text-slate-600">₹{it.pricing.totalCost.toLocaleString()}</td>
                <td className="p-2.5 font-mono font-bold text-slate-900">₹{it.pricing.finalSellingPrice.toLocaleString()}</td>
                <td className="p-2.5 font-mono font-bold text-emerald-600">₹{it.pricing.grossProfit.toLocaleString()}</td>
                <td className="p-2.5 font-bold text-purple-700">{it.pricing.targetMarginPercent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
