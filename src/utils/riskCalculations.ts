import { differenceInDays, parseISO } from 'date-fns';
import type { RiskLevel, UnitUtilization, RobotUtilization, AccountData, AccountRiskProfile } from '../types/account';
const UTILIZATION_THRESHOLDS = {
  HIGH_RISK: 0.4,
  MEDIUM_RISK: 0.7,
};
const EXPIRY_THRESHOLDS = {
  HIGH_RISK: 90,
  MEDIUM_RISK: 180,
};
const ROBOT_CAPACITY = {
  HOURS_24_7: 24 * 7 * 30,
  HOURS_BUSINESS: 8 * 5 * 4,
};
export function calculateUtilizationRisk(utilization: number): RiskLevel {
  if (utilization < UTILIZATION_THRESHOLDS.HIGH_RISK) return 'high';
  if (utilization < UTILIZATION_THRESHOLDS.MEDIUM_RISK) return 'medium';
  return 'low';
}
export function calculateExpiryRisk(expiryDate: string): { risk: RiskLevel; daysUntil: number } {
  const days = differenceInDays(parseISO(expiryDate), new Date());
  let risk: RiskLevel = 'low';
  if (days < 0) {
    risk = 'high';
  } else if (days <= EXPIRY_THRESHOLDS.HIGH_RISK) {
    risk = 'high';
  } else if (days <= EXPIRY_THRESHOLDS.MEDIUM_RISK) {
    risk = 'medium';
  }
  return { risk, daysUntil: Math.max(0, days) };
}
export function calculateUnitUtilization(
  purchased: number,
  consumed: number,
  expiryDate: string
): UnitUtilization | null {
  if (purchased <= 0) return null;
  const utilization = consumed / purchased;
  const utilizationRisk = calculateUtilizationRisk(utilization);
  const { risk: expiryRisk, daysUntil } = calculateExpiryRisk(expiryDate);
  const overallRisk = getWorstRisk([utilizationRisk, expiryRisk]);
  return {
    purchased,
    consumed,
    utilization,
    utilizationRisk,
    expiryDate,
    expiryRisk,
    daysUntilExpiry: daysUntil,
    overallRisk,
  };
}
export function calculateRobotUtilization(
  robots: number,
  monthlyHoursConsumed: number,
  expiryDate: string
): RobotUtilization | null {
  if (robots <= 0) return null;
  const capacity24x7 = robots * ROBOT_CAPACITY.HOURS_24_7;
  const capacityBusiness = robots * ROBOT_CAPACITY.HOURS_BUSINESS;
  const utilization24x7 = monthlyHoursConsumed / capacity24x7;
  const utilizationBusiness = monthlyHoursConsumed / capacityBusiness;
  const utilizationRisk24x7 = calculateUtilizationRisk(utilization24x7);
  const utilizationRiskBusiness = calculateUtilizationRisk(utilizationBusiness);
  const { risk: expiryRisk, daysUntil } = calculateExpiryRisk(expiryDate);
  const overallRisk = getWorstRisk([utilizationRisk24x7, utilizationRiskBusiness, expiryRisk]);
  return {
    robots,
    monthlyHoursConsumed,
    utilization24x7,
    utilizationBusiness,
    utilizationRisk24x7,
    utilizationRiskBusiness,
    expiryDate,
    expiryRisk,
    daysUntilExpiry: daysUntil,
    overallRisk,
  };
}
export function getWorstRisk(risks: RiskLevel[]): RiskLevel {
  if (risks.includes('high')) return 'high';
  if (risks.includes('medium')) return 'medium';
  if (risks.includes('low')) return 'low';
  return 'none';
}
export function calculateAccountRiskProfile(account: AccountData): AccountRiskProfile {
  const robots = calculateRobotUtilization(
    account.robots,
    account.monthlyRobotHoursConsumed,
    account.robotExpiry
  );
  const agenticUnits = calculateUnitUtilization(
    account.agenticUnits,
    account.agenticUnitsConsumed,
    account.agenticUnitExpiry
  );
  const aiUnits = calculateUnitUtilization(
    account.aiUnits,
    account.aiUnitsConsumed,
    account.aiUnitExpiry
  );
  const platformUnits = calculateUnitUtilization(
    account.platformUnits,
    account.platformUnitsConsumed,
    account.platformUnitExpiry
  );
  const duUnits = calculateUnitUtilization(
    account.duUnits,
    account.duUnitsConsumed,
    account.duUnitExpiry
  );
  const allRisks: Array<{ risk: RiskLevel; type: string }> = [];
  if (robots) allRisks.push({ risk: robots.overallRisk, type: 'Robots' });
  if (agenticUnits) allRisks.push({ risk: agenticUnits.overallRisk, type: 'Agentic Units' });
  if (aiUnits) allRisks.push({ risk: aiUnits.overallRisk, type: 'AI Units' });
  if (platformUnits) allRisks.push({ risk: platformUnits.overallRisk, type: 'Platform Units' });
  if (duUnits) allRisks.push({ risk: duUnits.overallRisk, type: 'DU Units' });
  const overallRisk = getWorstRisk(allRisks.map(r => r.risk));
  const highRiskUnits = allRisks.filter(r => r.risk === 'high');
  const primaryRiskDriver = highRiskUnits.length > 0
    ? highRiskUnits.map(r => r.type).join(', ')
    : allRisks.length > 0
    ? allRisks[0].type
    : 'No risk';
  return {
    accountId: account.accountId,
    accountName: account.accountName,
    csm: account.csm,
    accountDirector: account.accountDirector,
    robots: robots || undefined,
    agenticUnits: agenticUnits || undefined,
    aiUnits: aiUnits || undefined,
    platformUnits: platformUnits || undefined,
    duUnits: duUnits || undefined,
    overallRisk,
    primaryRiskDriver,
  };
}
export function getRiskColor(risk: RiskLevel): string {
  switch (risk) {
    case 'high':
      return 'bg-red-600 text-white';
    case 'medium':
      return 'bg-yellow-600 text-white';
    case 'low':
      return 'bg-green-600 text-white';
    default:
      return 'bg-gray-400 text-white';
  }
}
export function getRiskTextColor(risk: RiskLevel): string {
  switch (risk) {
    case 'high':
      return 'text-red-600';
    case 'medium':
      return 'text-yellow-600';
    case 'low':
      return 'text-green-600';
    default:
      return 'text-gray-600';
  }
}
export function getProgressBarColor(utilization: number): string {
  if (utilization < UTILIZATION_THRESHOLDS.HIGH_RISK) return 'bg-red-600';
  if (utilization < UTILIZATION_THRESHOLDS.MEDIUM_RISK) return 'bg-yellow-600';
  return 'bg-green-600';
}