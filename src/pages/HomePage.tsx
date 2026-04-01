import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingDown, AlertTriangle, Calendar, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppLayout } from '@/components/layout/AppLayout';
import { calculateAccountRiskProfile, getRiskColor } from '../utils/riskCalculations';
import { getDataService } from '../services/dataService';
import { useAuth } from '../hooks/useAuth';
import type { AccountData, RiskLevel, FilterState } from '../types/account';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
const RISK_COLORS = {
  high: '#dc2626',
  medium: '#ca8a04',
  low: '#16a34a',
};
export function HomePage() {
  const { sdk } = useAuth();
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    csm: 'all',
    riskType: 'all',
    expiryWindow: 'all',
    accountName: '',
    unitType: 'all',
    accountDirector: 'all',
  });
  React.useEffect(() => {
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
  const filteredProfiles = useMemo(() => {
    return riskProfiles.filter(profile => {
      if (filters.csm !== 'all' && profile.csm !== filters.csm) return false;
      if (filters.accountDirector !== 'all' && profile.accountDirector !== filters.accountDirector) return false;
      if (filters.riskType !== 'all' && profile.overallRisk !== filters.riskType) return false;
      if (filters.accountName && !profile.accountName.toLowerCase().includes(filters.accountName.toLowerCase())) return false;
      if (filters.expiryWindow !== 'all') {
        const hasExpiringUnit = [
          profile.robots,
          profile.agenticUnits,
          profile.aiUnits,
          profile.platformUnits,
          profile.duUnits,
        ].some(unit => unit && unit.daysUntilExpiry <= filters.expiryWindow);
        if (!hasExpiringUnit) return false;
      }
      return true;
    });
  }, [riskProfiles, filters]);
  const kpis = useMemo(() => {
    const totalAccounts = riskProfiles.length;
    const atRisk = riskProfiles.filter(p => p.overallRisk === 'high' || p.overallRisk === 'medium').length;
    const expiringSoon = riskProfiles.filter(p => {
      return [p.robots, p.agenticUnits, p.aiUnits, p.platformUnits, p.duUnits]
        .some(u => u && u.daysUntilExpiry <= 90);
    }).length;
    const robotRisk = riskProfiles.filter(p => p.robots && (p.robots.overallRisk === 'high' || p.robots.overallRisk === 'medium')).length;
    const agenticRisk = riskProfiles.filter(p => p.agenticUnits && (p.agenticUnits.overallRisk === 'high' || p.agenticUnits.overallRisk === 'medium')).length;
    const aiRisk = riskProfiles.filter(p => p.aiUnits && (p.aiUnits.overallRisk === 'high' || p.aiUnits.overallRisk === 'medium')).length;
    const platformRisk = riskProfiles.filter(p => p.platformUnits && (p.platformUnits.overallRisk === 'high' || p.platformUnits.overallRisk === 'medium')).length;
    const duRisk = riskProfiles.filter(p => p.duUnits && (p.duUnits.overallRisk === 'high' || p.duUnits.overallRisk === 'medium')).length;
    return {
      totalAccounts,
      atRisk,
      expiringSoon,
      robotRisk,
      agenticRisk,
      aiRisk,
      platformRisk,
      duRisk,
    };
  }, [riskProfiles]);
  const riskDistributionData = useMemo(() => {
    const highRisk = filteredProfiles.filter(p => p.overallRisk === 'high').length;
    const mediumRisk = filteredProfiles.filter(p => p.overallRisk === 'medium').length;
    const lowRisk = filteredProfiles.filter(p => p.overallRisk === 'low').length;
    return [
      { name: 'High Risk', value: highRisk, color: RISK_COLORS.high },
      { name: 'Medium Risk', value: mediumRisk, color: RISK_COLORS.medium },
      { name: 'Low Risk', value: lowRisk, color: RISK_COLORS.low },
    ];
  }, [filteredProfiles]);
  const unitRiskData = useMemo(() => {
    const robotRisk = filteredProfiles.filter(p => p.robots && (p.robots.overallRisk === 'high' || p.robots.overallRisk === 'medium')).length;
    const agenticRisk = filteredProfiles.filter(p => p.agenticUnits && (p.agenticUnits.overallRisk === 'high' || p.agenticUnits.overallRisk === 'medium')).length;
    const aiRisk = filteredProfiles.filter(p => p.aiUnits && (p.aiUnits.overallRisk === 'high' || p.aiUnits.overallRisk === 'medium')).length;
    const platformRisk = filteredProfiles.filter(p => p.platformUnits && (p.platformUnits.overallRisk === 'high' || p.platformUnits.overallRisk === 'medium')).length;
    const duRisk = filteredProfiles.filter(p => p.duUnits && (p.duUnits.overallRisk === 'high' || p.duUnits.overallRisk === 'medium')).length;
    return [
      { name: 'Robots', risk: robotRisk },
      { name: 'Agentic', risk: agenticRisk },
      { name: 'AI Units', risk: aiRisk },
      { name: 'Platform', risk: platformRisk },
      { name: 'DU Units', risk: duRisk },
    ];
  }, [filteredProfiles]);
  const topRiskAccounts = useMemo(() => {
    return [...filteredProfiles]
      .filter(p => p.overallRisk === 'high' || p.overallRisk === 'medium')
      .sort((a, b) => {
        if (a.overallRisk === 'high' && b.overallRisk !== 'high') return -1;
        if (a.overallRisk !== 'high' && b.overallRisk === 'high') return 1;
        return 0;
      })
      .slice(0, 10);
  }, [filteredProfiles]);
  const uniqueCSMs = useMemo(() => {
    return Array.from(new Set(accounts.map(a => a.csm))).sort();
  }, [accounts]);
  const uniqueAccountDirectors = useMemo(() => {
    return Array.from(new Set(accounts.map(a => a.accountDirector))).sort();
  }, [accounts]);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">ANZ Account Risk Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Executive overview of license consumption and renewal risk</p>
          </div>
        </div>
        {/* KPI Summary Cards - Moved above filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Accounts</p>
                <p className="text-3xl font-bold text-gray-900">{kpis.totalAccounts}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Accounts at Risk</p>
                <p className="text-3xl font-bold text-gray-900">{kpis.atRisk}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Expiring Soon</p>
                <p className="text-3xl font-bold text-gray-900">{kpis.expiringSoon}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingDown className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Robot Risk</p>
                <p className="text-3xl font-bold text-gray-900">{kpis.robotRisk}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border border-gray-200">
            <div>
              <p className="text-xs text-gray-500 mb-1">Agentic Risk</p>
              <p className="text-2xl font-bold text-gray-900">{kpis.agenticRisk}</p>
            </div>
          </Card>
          <Card className="p-4 border border-gray-200">
            <div>
              <p className="text-xs text-gray-500 mb-1">AI Units Risk</p>
              <p className="text-2xl font-bold text-gray-900">{kpis.aiRisk}</p>
            </div>
          </Card>
          <Card className="p-4 border border-gray-200">
            <div>
              <p className="text-xs text-gray-500 mb-1">Platform Risk</p>
              <p className="text-2xl font-bold text-gray-900">{kpis.platformRisk}</p>
            </div>
          </Card>
          <Card className="p-4 border border-gray-200">
            <div>
              <p className="text-xs text-gray-500 mb-1">DU Units Risk</p>
              <p className="text-2xl font-bold text-gray-900">{kpis.duRisk}</p>
            </div>
          </Card>
        </div>
        {/* Filters Section - Moved below KPI cards */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">CSM</label>
              <Select value={filters.csm} onValueChange={(value) => setFilters(prev => ({ ...prev, csm: value }))}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All CSMs</SelectItem>
                  {uniqueCSMs.map(csm => (
                    <SelectItem key={csm} value={csm}>{csm}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Account Director</label>
              <Select value={filters.accountDirector} onValueChange={(value) => setFilters(prev => ({ ...prev, accountDirector: value }))}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Directors</SelectItem>
                  {uniqueAccountDirectors.map(director => (
                    <SelectItem key={director} value={director}>{director}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Risk Level</label>
              <Select value={filters.riskType} onValueChange={(value) => setFilters(prev => ({ ...prev, riskType: value as RiskLevel | 'all' }))}>
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
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Expiry Window</label>
              <Select value={String(filters.expiryWindow)} onValueChange={(value) => setFilters(prev => ({ ...prev, expiryWindow: value === 'all' ? 'all' : Number(value) }))}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="60">60 Days</SelectItem>
                  <SelectItem value="90">90 Days</SelectItem>
                  <SelectItem value="180">180 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Account Name</label>
              <Input
                placeholder="Search accounts..."
                value={filters.accountName}
                onChange={(e) => setFilters(prev => ({ ...prev, accountName: e.target.value }))}
                className="bg-white"
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Risk Distribution</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={riskDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {riskDistributionData.map((entry, index) => (
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
              <BarChart data={unitRiskData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#6b7280" />
                <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                <Tooltip />
                <Bar dataKey="risk" fill="#dc2626" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
        <Card className="border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Top Risk Accounts</h3>
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
                {topRiskAccounts.map((profile) => (
                  <tr key={profile.accountId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium whitespace-nowrap">
                      <Link
                        to={`/account/${profile.accountId}`}
                        className="text-gray-900 hover:text-blue-600 hover:underline"
                      >
                        {profile.accountName}
                      </Link>
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