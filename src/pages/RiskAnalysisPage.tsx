import React, { useMemo, useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppLayout } from '@/components/layout/AppLayout';
import { getDataService } from '../services/dataService';
import { calculateAccountRiskProfile, getRiskColor } from '../utils/riskCalculations';
import type { AccountData, RiskLevel, UnitType } from '../types/account';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../hooks/useAuth';
const RISK_COLORS = {
  high: '#dc2626',
  medium: '#ca8a04',
  low: '#16a34a',
};
export function RiskAnalysisPage() {
  const { sdk } = useAuth();
  const [selectedUnit, setSelectedUnit] = useState<UnitType | 'all'>('all');
  const [selectedRisk, setSelectedRisk] = useState<RiskLevel | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<AccountData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const dataService = getDataService(true, sdk);
        const data = await dataService.getAllAccounts();
        setAccounts(data);
      } catch (error) {
        console.error('Error loading accounts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [sdk]);
  const riskProfiles = useMemo(() => {
    return accounts.map(calculateAccountRiskProfile);
  }, [accounts]);
  const unitRiskBreakdown = useMemo(() => {
    const breakdown = {
      robots: { high: 0, medium: 0, low: 0 },
      agenticUnits: { high: 0, medium: 0, low: 0 },
      aiUnits: { high: 0, medium: 0, low: 0 },
      platformUnits: { high: 0, medium: 0, low: 0 },
      duUnits: { high: 0, medium: 0, low: 0 },
    };
    riskProfiles.forEach(profile => {
      if (profile.robots) breakdown.robots[profile.robots.overallRisk]++;
      if (profile.agenticUnits) breakdown.agenticUnits[profile.agenticUnits.overallRisk]++;
      if (profile.aiUnits) breakdown.aiUnits[profile.aiUnits.overallRisk]++;
      if (profile.platformUnits) breakdown.platformUnits[profile.platformUnits.overallRisk]++;
      if (profile.duUnits) breakdown.duUnits[profile.duUnits.overallRisk]++;
    });
    return breakdown;
  }, [riskProfiles]);
  const chartData = useMemo(() => {
    return [
      { name: 'Robots', high: unitRiskBreakdown.robots.high, medium: unitRiskBreakdown.robots.medium, low: unitRiskBreakdown.robots.low },
      { name: 'Agentic', high: unitRiskBreakdown.agenticUnits.high, medium: unitRiskBreakdown.agenticUnits.medium, low: unitRiskBreakdown.agenticUnits.low },
      { name: 'AI Units', high: unitRiskBreakdown.aiUnits.high, medium: unitRiskBreakdown.aiUnits.medium, low: unitRiskBreakdown.aiUnits.low },
      { name: 'Platform', high: unitRiskBreakdown.platformUnits.high, medium: unitRiskBreakdown.platformUnits.medium, low: unitRiskBreakdown.platformUnits.low },
      { name: 'DU Units', high: unitRiskBreakdown.duUnits.high, medium: unitRiskBreakdown.duUnits.medium, low: unitRiskBreakdown.duUnits.low },
    ];
  }, [unitRiskBreakdown]);
  const filteredAccounts = useMemo(() => {
    return riskProfiles.filter(profile => {
      if (selectedRisk !== 'all' && profile.overallRisk !== selectedRisk) return false;
      if (selectedUnit !== 'all') {
        const unit = profile[selectedUnit];
        if (!unit) return false;
      }
      return true;
    });
  }, [riskProfiles, selectedRisk, selectedUnit]);
  const overallRiskDistribution = useMemo(() => {
    const high = riskProfiles.filter(p => p.overallRisk === 'high').length;
    const medium = riskProfiles.filter(p => p.overallRisk === 'medium').length;
    const low = riskProfiles.filter(p => p.overallRisk === 'low').length;
    return [
      { name: 'High Risk', value: high, color: RISK_COLORS.high },
      { name: 'Medium Risk', value: medium, color: RISK_COLORS.medium },
      { name: 'Low Risk', value: low, color: RISK_COLORS.low },
    ];
  }, [riskProfiles]);
  if (loading) {
    return (
      <AppLayout container>
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Loading accounts...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout container>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Risk Analysis</h1>
          <p className="text-sm text-gray-500 mt-1">Detailed risk breakdowns and comparative analysis</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Unit Type</label>
              <Select value={selectedUnit} onValueChange={(value) => setSelectedUnit(value as UnitType | 'all')}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Units</SelectItem>
                  <SelectItem value="robots">Robots</SelectItem>
                  <SelectItem value="agenticUnits">Agentic Units</SelectItem>
                  <SelectItem value="aiUnits">AI Units</SelectItem>
                  <SelectItem value="platformUnits">Platform Units</SelectItem>
                  <SelectItem value="duUnits">DU Units</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Risk Level</label>
              <Select value={selectedRisk} onValueChange={(value) => setSelectedRisk(value as RiskLevel | 'all')}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risks</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Overall Risk Distribution</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={overallRiskDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {overallRiskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
          <Card className="p-6 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Risk by Unit Type</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#6b7280" />
                <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Bar dataKey="high" fill={RISK_COLORS.high} name="High Risk" />
                <Bar dataKey="medium" fill={RISK_COLORS.medium} name="Medium Risk" />
                <Bar dataKey="low" fill={RISK_COLORS.low} name="Low Risk" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
        <Card className="border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Accounts by Risk Level</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CSM</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account Director</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Level</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Driver</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAccounts.map((profile) => (
                  <tr key={profile.accountId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {profile.accountName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                      {profile.csm}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                      {profile.accountDirector}
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(profile.overallRisk)}`}>
                        {profile.overallRisk.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {profile.primaryRiskDriver}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}