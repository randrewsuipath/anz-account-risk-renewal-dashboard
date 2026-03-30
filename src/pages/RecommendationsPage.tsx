import React, { useMemo, useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '../hooks/useAuth';
import { getDataService } from '../services/dataService';
import { calculateAccountRiskProfile } from '../utils/riskCalculations';
import { generateAccountRecommendations } from '../utils/recommendations';
import type { AccountData, Recommendation } from '../types/account';
interface RecommendationWithAccount extends Recommendation {
  accountId: string;
  accountName: string;
  csm: string;
  accountDirector: string;
}
export function RecommendationsPage() {
  const { sdk } = useAuth();
  const [selectedPriority, setSelectedPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [selectedCSM, setSelectedCSM] = useState<string>('all');
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
  const allRecommendations = useMemo(() => {
    const recs: RecommendationWithAccount[] = [];
    riskProfiles.forEach(profile => {
      const accountRecs = generateAccountRecommendations(profile);
      accountRecs.recommendations.forEach(rec => {
        recs.push({
          ...rec,
          accountId: profile.accountId,
          accountName: profile.accountName,
          csm: profile.csm,
          accountDirector: profile.accountDirector,
        });
      });
    });
    return recs;
  }, [riskProfiles]);
  const filteredRecommendations = useMemo(() => {
    return allRecommendations.filter(rec => {
      if (selectedPriority !== 'all' && rec.priority !== selectedPriority) return false;
      if (selectedCSM !== 'all' && rec.csm !== selectedCSM) return false;
      return true;
    });
  }, [allRecommendations, selectedPriority, selectedCSM]);
  const uniqueCSMs = useMemo(() => {
    return Array.from(new Set(accounts.map(a => a.csm))).sort();
  }, [accounts]);
  const priorityCounts = useMemo(() => {
    return {
      high: allRecommendations.filter(r => r.priority === 'high').length,
      medium: allRecommendations.filter(r => r.priority === 'medium').length,
      low: allRecommendations.filter(r => r.priority === 'low').length,
    };
  }, [allRecommendations]);
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
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
          <h1 className="text-2xl font-semibold text-gray-900">Recommendations</h1>
          <p className="text-sm text-gray-500 mt-1">Actionable recommendations for all accounts</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 border border-red-200 bg-red-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-red-600">High Priority</p>
                <p className="text-2xl font-bold text-red-900">{priorityCounts.high}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border border-yellow-200 bg-yellow-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-yellow-600">Medium Priority</p>
                <p className="text-2xl font-bold text-yellow-900">{priorityCounts.medium}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border border-blue-200 bg-blue-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-blue-600">Low Priority</p>
                <p className="text-2xl font-bold text-blue-900">{priorityCounts.low}</p>
              </div>
            </div>
          </Card>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
              <Select value={selectedPriority} onValueChange={(value) => setSelectedPriority(value as 'all' | 'high' | 'medium' | 'low')}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">CSM</label>
              <Select value={selectedCSM} onValueChange={(value) => setSelectedCSM(value)}>
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
          </div>
        </div>
        <div className="space-y-4">
          {filteredRecommendations.map((rec, idx) => (
            <Card key={`${rec.accountId}-${rec.unitType}-${idx}`} className={`p-6 border ${getPriorityColor(rec.priority)}`}>
              <div className="flex items-start gap-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white border ${rec.priority === 'high' ? 'border-red-300 text-red-700' : rec.priority === 'medium' ? 'border-yellow-300 text-yellow-700' : 'border-blue-300 text-blue-700'}`}>
                  {rec.priority.toUpperCase()}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-gray-900">{rec.accountName}</h3>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500">{rec.csm}</span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs px-2 py-0.5 bg-white rounded border border-gray-200 text-gray-700">
                      {rec.unitType}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 mb-2">{rec.message}</p>
                  <p className="text-xs text-gray-600">{rec.reason}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
        {filteredRecommendations.length === 0 && (
          <Card className="p-12 border border-gray-200 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No recommendations match the selected filters</p>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}