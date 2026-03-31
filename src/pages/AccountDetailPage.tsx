import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '../hooks/useAuth';
import { getDataService } from '../services/dataService';
import { calculateAccountRiskProfile, getRiskColor } from '../utils/riskCalculations';
import { generateAccountRecommendations } from '../utils/recommendations';
import type { AccountData, UnitUtilization, RobotUtilization } from '../types/account';
function UnitCard({ title, unit }: { title: string; unit: UnitUtilization }) {
  return (
    <Card className="p-6 border border-gray-200">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(unit.overallRisk)}`}>
            {unit.overallRisk.toUpperCase()}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Purchased</p>
            <p className="text-xl font-bold text-gray-900">{unit.purchased == null ? '—' : unit.purchased.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Consumed</p>
            <p className="text-xl font-bold text-gray-900">{unit.consumed == null ? '—' : unit.consumed.toLocaleString()}</p>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Utilization</span>
            <span className="text-sm font-semibold text-gray-900">{isNaN(unit.utilization) || unit.utilization == null ? '—' : Math.round(unit.utilization * 100) + '%'}</span>
          </div>
          <Progress value={isNaN(unit.utilization) || unit.utilization == null ? 0 : unit.utilization * 100} className="h-2" />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700">Expires in {unit.daysUntilExpiry} days</span>
          <span className={`ml-auto inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRiskColor(unit.expiryRisk)}`}>
            {unit.expiryRisk.toUpperCase()}
          </span>
        </div>
      </div>
    </Card>
  );
}
function RobotCard({ robots }: { robots: RobotUtilization }) {
  return (
    <Card className="p-6 border border-gray-200">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Robots</h3>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(robots.overallRisk)}`}>
            {robots.overallRisk.toUpperCase()}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Robot Licenses</p>
            <p className="text-xl font-bold text-gray-900">{robots.robots}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Monthly Hours</p>
            <p className="text-xl font-bold text-gray-900">{robots.monthlyHoursConsumed == null ? '—' : robots.monthlyHoursConsumed.toLocaleString()}</p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">24/7 Utilization</span>
              <span className="text-sm font-semibold text-gray-900">{isNaN(robots.utilization24x7) || robots.utilization24x7 == null ? '—' : Math.round(robots.utilization24x7 * 100) + '%'}</span>
            </div>
            <Progress value={isNaN(robots.utilization24x7) || robots.utilization24x7 == null ? 0 : robots.utilization24x7 * 100} className="h-2" />
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-400">Capacity: {robots.robots == null ? '—' : (robots.robots * 5040).toLocaleString()} hrs/mo</span>
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getRiskColor(robots.utilizationRisk24x7)}`}>
                {robots.utilizationRisk24x7.toUpperCase()}
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">Business Hours (8/5/20)</span>
              <span className="text-sm font-semibold text-gray-900">{isNaN(robots.utilizationBusiness) || robots.utilizationBusiness == null ? '—' : Math.round(robots.utilizationBusiness * 100) + '%'}</span>
            </div>
            <Progress value={isNaN(robots.utilizationBusiness) || robots.utilizationBusiness == null ? 0 : robots.utilizationBusiness * 100} className="h-2" />
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-400">Capacity: {robots.robots == null ? '—' : (robots.robots * 160).toLocaleString()} hrs/mo</span>
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getRiskColor(robots.utilizationRiskBusiness)}`}>
                {robots.utilizationRiskBusiness.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700">Expires in {robots.daysUntilExpiry} days</span>
          <span className={`ml-auto inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRiskColor(robots.expiryRisk)}`}>
            {robots.expiryRisk.toUpperCase()}
          </span>
        </div>
      </div>
    </Card>
  );
}
export function AccountDetailPage() {
  const { accountId } = useParams<{ accountId: string }>();
  const { sdk } = useAuth();
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

  const account = useMemo(() => {
    const found = accounts.find(a => a.accountId === accountId);
    return found;
  }, [accounts, accountId]);
  const profile = useMemo(() => {
    if (!account) return null;
    return calculateAccountRiskProfile(account);
  }, [account]);
  const recommendations = useMemo(() => {
    if (!profile) return null;
    return generateAccountRecommendations(profile);
  }, [profile]);
  if (loading) {
    return (
      <AppLayout container>
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Loading accounts...</p>
        </div>
      </AppLayout>
    );
  }

  if (!account || !profile) {
    return (
      <AppLayout container>
        <div className="text-center py-12">
          <p className="text-gray-500">Account not found</p>
          <Link to="/">
            <Button variant="outline" className="mt-4">Return to Dashboard</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }
  return (
    <AppLayout container>
      <div className="space-y-6">
        <div>
          <Link to="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{profile.accountName}</h1>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-sm text-gray-500">Account ID: {profile.accountId}</p>
                <p className="text-sm text-gray-500">CSM: {profile.csm}</p>
                <p className="text-sm text-gray-500">Account Director: {profile.accountDirector}</p>
              </div>
            </div>
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getRiskColor(profile.overallRisk)}`}>
              {profile.overallRisk.toUpperCase()} RISK
            </span>
          </div>
        </div>
        <Card className="p-6 border border-gray-200 bg-blue-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Primary Risk Driver</h3>
              <p className="text-sm text-gray-700">{profile.primaryRiskDriver}</p>
            </div>
          </div>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profile.robots && <RobotCard robots={profile.robots} />}
          {profile.agenticUnits && <UnitCard title="Agentic Units" unit={profile.agenticUnits} />}
          {profile.aiUnits && <UnitCard title="AI Units" unit={profile.aiUnits} />}
          {profile.platformUnits && <UnitCard title="Platform Units" unit={profile.platformUnits} />}
          {profile.duUnits && <UnitCard title="DU Units" unit={profile.duUnits} />}
        </div>
        {recommendations && recommendations.recommendations.length > 0 && (
          <Card className="border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">Recommendations</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {recommendations.recommendations.map((rec, idx) => (
                <div key={idx} className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium mt-0.5 ${
                      rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                      rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {rec.priority.toUpperCase()}
                    </span>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-500 mb-1">{rec.unitType}</p>
                      <p className="text-sm text-gray-900 mb-1">{rec.message}</p>
                      <p className="text-xs text-gray-500">{rec.reason}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}