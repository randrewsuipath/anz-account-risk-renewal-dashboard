import React, { useMemo, useState, useEffect } from 'react';
import { Calendar, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppLayout } from '@/components/layout/AppLayout';
import { getDataService } from '../services/dataService';
import { calculateAccountRiskProfile } from '../utils/riskCalculations';
import type { AccountData } from '../types/account';
import { format } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
interface ExpiryItem {
  accountId: string;
  accountName: string;
  csm: string;
  accountDirector: string;
  unitType: string;
  expiryDate: string;
  daysUntilExpiry: number;
  utilization: number;
  purchased: number;
  consumed: number;
}
export function ExpiryViewPage() {
  const { sdk } = useAuth();
  const [expiryWindow, setExpiryWindow] = useState<number>(90);
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
  const expiryItems = useMemo(() => {
    const items: ExpiryItem[] = [];
    riskProfiles.forEach(profile => {
      if (profile.robots && profile.robots.daysUntilExpiry <= expiryWindow) {
        items.push({
          accountId: profile.accountId,
          accountName: profile.accountName,
          csm: profile.csm,
          accountDirector: profile.accountDirector,
          unitType: 'Robots',
          expiryDate: profile.robots.expiryDate,
          daysUntilExpiry: profile.robots.daysUntilExpiry,
          utilization: profile.robots.utilization24x7,
          purchased: profile.robots.robots,
          consumed: profile.robots.monthlyHoursConsumed,
        });
      }
      if (profile.agenticUnits && profile.agenticUnits.daysUntilExpiry <= expiryWindow) {
        items.push({
          accountId: profile.accountId,
          accountName: profile.accountName,
          csm: profile.csm,
          accountDirector: profile.accountDirector,
          unitType: 'Agentic Units',
          expiryDate: profile.agenticUnits.expiryDate,
          daysUntilExpiry: profile.agenticUnits.daysUntilExpiry,
          utilization: profile.agenticUnits.utilization,
          purchased: profile.agenticUnits.purchased,
          consumed: profile.agenticUnits.consumed,
        });
      }
      if (profile.aiUnits && profile.aiUnits.daysUntilExpiry <= expiryWindow) {
        items.push({
          accountId: profile.accountId,
          accountName: profile.accountName,
          csm: profile.csm,
          accountDirector: profile.accountDirector,
          unitType: 'AI Units',
          expiryDate: profile.aiUnits.expiryDate,
          daysUntilExpiry: profile.aiUnits.daysUntilExpiry,
          utilization: profile.aiUnits.utilization,
          purchased: profile.aiUnits.purchased,
          consumed: profile.aiUnits.consumed,
        });
      }
      if (profile.platformUnits && profile.platformUnits.daysUntilExpiry <= expiryWindow) {
        items.push({
          accountId: profile.accountId,
          accountName: profile.accountName,
          csm: profile.csm,
          accountDirector: profile.accountDirector,
          unitType: 'Platform Units',
          expiryDate: profile.platformUnits.expiryDate,
          daysUntilExpiry: profile.platformUnits.daysUntilExpiry,
          utilization: profile.platformUnits.utilization,
          purchased: profile.platformUnits.purchased,
          consumed: profile.platformUnits.consumed,
        });
      }
      if (profile.duUnits && profile.duUnits.daysUntilExpiry <= expiryWindow) {
        items.push({
          accountId: profile.accountId,
          accountName: profile.accountName,
          csm: profile.csm,
          accountDirector: profile.accountDirector,
          unitType: 'DU Units',
          expiryDate: profile.duUnits.expiryDate,
          daysUntilExpiry: profile.duUnits.daysUntilExpiry,
          utilization: profile.duUnits.utilization,
          purchased: profile.duUnits.purchased,
          consumed: profile.duUnits.consumed,
        });
      }
    });
    return items.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  }, [riskProfiles, expiryWindow]);
  const getUrgencyColor = (days: number) => {
    if (days <= 30) return 'bg-red-100 text-red-700 border-red-200';
    if (days <= 60) return 'bg-orange-100 text-orange-700 border-orange-200';
    if (days <= 90) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-blue-100 text-blue-700 border-blue-200';
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
          <h1 className="text-2xl font-semibold text-gray-900">Expiry Timeline</h1>
          <p className="text-sm text-gray-500 mt-1">Upcoming license expirations across all unit types</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Expiry Window</label>
              <Select value={String(expiryWindow)} onValueChange={(value) => setExpiryWindow(Number(value))}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">Next 30 Days</SelectItem>
                  <SelectItem value="60">Next 60 Days</SelectItem>
                  <SelectItem value="90">Next 90 Days</SelectItem>
                  <SelectItem value="180">Next 180 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <div className="text-sm text-gray-700">
                <span className="font-semibold text-2xl text-gray-900">{expiryItems.length}</span>
                <span className="ml-2">expiring licenses</span>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {expiryItems.map((item, idx) => (
            <Card key={`${item.accountId}-${item.unitType}-${idx}`} className={`p-4 border ${getUrgencyColor(item.daysUntilExpiry)}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-sm font-semibold text-gray-900">{item.accountName}</h3>
                    <span className="text-xs px-2 py-0.5 bg-white rounded border border-gray-200 text-gray-700">
                      {item.unitType}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">CSM</p>
                      <p className="font-medium text-gray-900">{item.csm}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Account Director</p>
                      <p className="font-medium text-gray-900">{item.accountDirector}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Expiry Date</p>
                      <p className="font-medium text-gray-900">{format(new Date(item.expiryDate), 'MMM dd, yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Utilization</p>
                      <p className="font-medium text-gray-900">{isNaN(item.utilization) || item.utilization == null ? '—' : Math.round(item.utilization * 100) + '%'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Consumed / Purchased</p>
                      <p className="font-medium text-gray-900">{item.consumed == null ? '—' : item.consumed.toLocaleString()} / {item.purchased == null ? '—' : item.purchased.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {item.daysUntilExpiry <= 30 && (
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  )}
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{item.daysUntilExpiry}</p>
                    <p className="text-xs text-gray-500">days left</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
        {expiryItems.length === 0 && (
          <Card className="p-12 border border-gray-200 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No licenses expiring in the selected window</p>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}