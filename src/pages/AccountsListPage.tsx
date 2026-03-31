import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '../hooks/useAuth';
import { getDataService } from '../services/dataService';
import { calculateAccountRiskProfile, getRiskColor } from '../utils/riskCalculations';
import type { AccountData, RiskLevel } from '../types/account';
type SortField = 'accountName' | 'csm' | 'overallRisk';
type SortDirection = 'asc' | 'desc';
export function AccountsListPage() {
  const { sdk } = useAuth();
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [filters, setFilters] = useState({
    csm: 'all',
    riskType: 'all' as RiskLevel | 'all',
    accountName: '',
    accountDirector: 'all',
  });
  const [sortField, setSortField] = useState<SortField>('accountName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

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
  const filteredAndSorted = useMemo(() => {
    let result = riskProfiles.filter(profile => {
      if (filters.csm !== 'all' && profile.csm !== filters.csm) return false;
      if (filters.accountDirector !== 'all' && profile.accountDirector !== filters.accountDirector) return false;
      if (filters.riskType !== 'all' && profile.overallRisk !== filters.riskType) return false;
      if (filters.accountName && !profile.accountName.toLowerCase().includes(filters.accountName.toLowerCase())) return false;
      return true;
    });
    result.sort((a, b) => {
      let compareValue = 0;
      if (sortField === 'accountName') {
        compareValue = a.accountName.localeCompare(b.accountName);
      } else if (sortField === 'csm') {
        compareValue = a.csm.localeCompare(b.csm);
      } else if (sortField === 'overallRisk') {
        const riskOrder = { high: 0, medium: 1, low: 2, none: 3 };
        compareValue = riskOrder[a.overallRisk] - riskOrder[b.overallRisk];
      }
      return sortDirection === 'asc' ? compareValue : -compareValue;
    });
    return result;
  }, [riskProfiles, filters, sortField, sortDirection]);
  const uniqueCSMs = useMemo(() => {
    return Array.from(new Set(accounts.map(a => a.csm))).sort();
  }, [accounts]);

  const uniqueAccountDirectors = useMemo(() => {
    return Array.from(new Set(accounts.map(a => a.accountDirector))).sort();
  }, [accounts]);
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
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
          <h1 className="text-2xl font-semibold text-gray-900">All Accounts</h1>
          <p className="text-sm text-gray-500 mt-1">Comprehensive view of all ANZ accounts</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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
        <Card className="border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('accountName')}
                      className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase hover:text-gray-700"
                    >
                      Account
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('csm')}
                      className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase hover:text-gray-700"
                    >
                      CSM
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account Director</th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('overallRisk')}
                      className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase hover:text-gray-700"
                    >
                      Risk Level
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Driver</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Robots</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agentic</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">AI Units</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Platform</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">DU Units</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSorted.map((profile) => (
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
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                      {profile.robots && !isNaN(profile.robots.utilization24x7) && profile.robots.utilization24x7 != null ? `${Math.round(profile.robots.utilization24x7 * 100)}%` : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                      {profile.agenticUnits && !isNaN(profile.agenticUnits.utilization) && profile.agenticUnits.utilization != null ? `${Math.round(profile.agenticUnits.utilization * 100)}%` : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                      {profile.aiUnits && !isNaN(profile.aiUnits.utilization) && profile.aiUnits.utilization != null ? `${Math.round(profile.aiUnits.utilization * 100)}%` : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                      {profile.platformUnits && !isNaN(profile.platformUnits.utilization) && profile.platformUnits.utilization != null ? `${Math.round(profile.platformUnits.utilization * 100)}%` : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                      {profile.duUnits && !isNaN(profile.duUnits.utilization) && profile.duUnits.utilization != null ? `${Math.round(profile.duUnits.utilization * 100)}%` : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Link to={`/account/${profile.accountId}`}>
                        <Button variant="outline" size="sm">View Details</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <div className="text-sm text-gray-500">
          Showing {filteredAndSorted.length} of {riskProfiles.length} accounts
        </div>
      </div>
    </AppLayout>
  );
}