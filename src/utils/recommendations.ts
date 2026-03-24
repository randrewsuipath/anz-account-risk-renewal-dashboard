import type { RiskLevel, UnitUtilization, RobotUtilization, AccountRiskProfile, Recommendation, AccountRecommendations } from '../types/account';
function generateUnitRecommendation(
  unitType: string,
  utilization: UnitUtilization
): Recommendation | null {
  const isLowUtilization = utilization.utilizationRisk === 'high' || utilization.utilizationRisk === 'medium';
  const isNearExpiry = utilization.expiryRisk === 'high' || utilization.expiryRisk === 'medium';
  let message = '';
  let reason = '';
  let priority: 'high' | 'medium' | 'low' = 'low';
  if (isLowUtilization && isNearExpiry) {
    priority = 'high';
    reason = `Low consumption (${Math.round(utilization.utilization * 100)}%) with expiry in ${utilization.daysUntilExpiry} days`;
    if (unitType === 'Agentic Units') {
      message = 'Critical: Agentic Units show low adoption and upcoming expiry. Prioritize immediate value demonstration and renewal strategy discussion.';
    } else if (unitType === 'AI Units') {
      message = 'Critical: AI Units underutilized with near-term expiry. Schedule urgent review to demonstrate ROI and secure renewal.';
    } else if (unitType === 'Platform Units') {
      message = 'Critical: Platform Units at risk due to low usage and upcoming expiry. Engage customer success to drive adoption before renewal.';
    } else if (unitType === 'DU Units') {
      message = 'Critical: DU Units show low consumption with expiry approaching. Review workload distribution and renewal timeline urgently.';
    }
  } else if (isLowUtilization) {
    priority = utilization.utilizationRisk === 'high' ? 'high' : 'medium';
    reason = `Utilization at ${Math.round(utilization.utilization * 100)}%`;
    if (unitType === 'Agentic Units') {
      message = 'Increase Agentic Unit adoption by identifying automation use cases aligned to current workloads. Schedule enablement session.';
    } else if (unitType === 'AI Units') {
      message = 'AI Units underutilized. Conduct discovery workshop to identify high-value AI automation opportunities across departments.';
    } else if (unitType === 'Platform Units') {
      message = 'Platform Units show low consumption. Review user onboarding and identify barriers to adoption. Consider training refresh.';
    } else if (unitType === 'DU Units') {
      message = 'Review DU workload distribution and identify opportunities to increase usage across processes. Optimize document pipeline.';
    }
  } else if (isNearExpiry) {
    priority = utilization.expiryRisk === 'high' ? 'high' : 'medium';
    reason = `Expiry in ${utilization.daysUntilExpiry} days with ${Math.round(utilization.utilization * 100)}% utilization`;
    if (utilization.utilization >= 0.7) {
      message = `${unitType} are well utilized. Initiate early renewal discussions to secure expansion opportunity.`;
    } else {
      message = `${unitType} expiring soon with moderate usage. Schedule renewal conversation and discuss optimization strategies.`;
    }
  } else {
    return null;
  }
  return {
    unitType,
    priority,
    message,
    reason,
  };
}
function generateRobotRecommendation(
  robots: RobotUtilization
): Recommendation | null {
  const isLowUtilizationBusiness = robots.utilizationRiskBusiness === 'high' || robots.utilizationRiskBusiness === 'medium';
  const isNearExpiry = robots.expiryRisk === 'high' || robots.expiryRisk === 'medium';
  let message = '';
  let reason = '';
  let priority: 'high' | 'medium' | 'low' = 'low';
  if (isLowUtilizationBusiness && isNearExpiry) {
    priority = 'high';
    reason = `Business hours utilization: ${Math.round(robots.utilizationBusiness * 100)}%, Expiry: ${robots.daysUntilExpiry} days`;
    message = 'Critical: Robot capacity significantly underutilized with upcoming expiry. Urgent review needed to assess automation pipeline and renewal strategy.';
  } else if (isLowUtilizationBusiness) {
    priority = 'high';
    reason = `Business hours utilization at ${Math.round(robots.utilizationBusiness * 100)}%`;
    message = 'Robot capacity underutilized during business hours. Review attended automation opportunities and workload distribution across business operations.';
  } else if (isNearExpiry) {
    priority = robots.expiryRisk === 'high' ? 'high' : 'medium';
    reason = `Expiry in ${robots.daysUntilExpiry} days with strong utilization`;
    message = 'Robots are well utilized. Initiate early renewal discussions and explore expansion opportunities based on automation pipeline.';
  } else {
    return null;
  }
  return {
    unitType: 'Robots',
    priority,
    message,
    reason,
  };
}
export function generateAccountRecommendations(
  profile: AccountRiskProfile
): AccountRecommendations {
  const recommendations: Recommendation[] = [];
  if (profile.robots) {
    const rec = generateRobotRecommendation(profile.robots);
    if (rec) recommendations.push(rec);
  }
  if (profile.agenticUnits) {
    const rec = generateUnitRecommendation('Agentic Units', profile.agenticUnits);
    if (rec) recommendations.push(rec);
  }
  if (profile.aiUnits) {
    const rec = generateUnitRecommendation('AI Units', profile.aiUnits);
    if (rec) recommendations.push(rec);
  }
  if (profile.platformUnits) {
    const rec = generateUnitRecommendation('Platform Units', profile.platformUnits);
    if (rec) recommendations.push(rec);
  }
  if (profile.duUnits) {
    const rec = generateUnitRecommendation('DU Units', profile.duUnits);
    if (rec) recommendations.push(rec);
  }
  const highPriorityCount = recommendations.filter(r => r.priority === 'high').length;
  if (highPriorityCount >= 2) {
    recommendations.unshift({
      unitType: 'Overall Account',
      priority: 'high',
      message: 'Account shows multi-product underutilization. Recommend coordinated adoption plan across all unit types with dedicated customer success engagement.',
      reason: `${highPriorityCount} high-priority risks identified`,
    });
  }
  return {
    accountId: profile.accountId,
    accountName: profile.accountName,
    recommendations: recommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }),
  };
}