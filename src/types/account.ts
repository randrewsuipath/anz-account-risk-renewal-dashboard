export interface AccountData {
  accountName: string;
  accountId: string;
  csm: string;
  accountDirector: string;
  robots: number;
  robotExpiry: string;
  monthlyRobotHoursConsumed: number;
  agenticUnits: number;
  agenticUnitsConsumed: number;
  agenticUnitExpiry: string;
  aiUnits: number;
  aiUnitsConsumed: number;
  aiUnitExpiry: string;
  platformUnits: number;
  platformUnitsConsumed: number;
  platformUnitExpiry: string;
  duUnits: number;
  duUnitsConsumed: number;
  duUnitExpiry: string;
}
export type RiskLevel = 'high' | 'medium' | 'low' | 'none';
export interface UnitUtilization {
  purchased: number;
  consumed: number;
  utilization: number;
  utilizationRisk: RiskLevel;
  expiryDate: string;
  expiryRisk: RiskLevel;
  daysUntilExpiry: number;
  overallRisk: RiskLevel;
}
export interface RobotUtilization {
  robots: number;
  monthlyHoursConsumed: number;
  utilization24x7: number;
  utilizationBusiness: number;
  utilizationRisk24x7: RiskLevel;
  utilizationRiskBusiness: RiskLevel;
  expiryDate: string;
  expiryRisk: RiskLevel;
  daysUntilExpiry: number;
  overallRisk: RiskLevel;
}
export interface AccountRiskProfile {
  accountId: string;
  accountName: string;
  csm: string;
  accountDirector: string;
  robots?: RobotUtilization;
  agenticUnits?: UnitUtilization;
  aiUnits?: UnitUtilization;
  platformUnits?: UnitUtilization;
  duUnits?: UnitUtilization;
  overallRisk: RiskLevel;
  primaryRiskDriver: string;
}
export interface Recommendation {
  unitType: string;
  priority: 'high' | 'medium' | 'low';
  message: string;
  reason: string;
}
export interface AccountRecommendations {
  accountId: string;
  accountName: string;
  recommendations: Recommendation[];
}
export type UnitType = 'robots' | 'agenticUnits' | 'aiUnits' | 'platformUnits' | 'duUnits';
export interface FilterState {
  csm: string;
  accountDirector: string;
  riskType: RiskLevel | 'all';
  expiryWindow: number | 'all';
  accountName: string;
  unitType: UnitType | 'all';
}