import type { AccountData } from '../types/account';
import type { UiPath } from '@uipath/uipath-typescript/core';
import { Entities } from '@uipath/uipath-typescript/entities';
import type { EntityRecord } from '@uipath/uipath-typescript/entities';
import accountsData from '../data/accounts.json';
/**
 * Data service interface for account data retrieval
 * Supports both static JSON and UiPath Data Fabric entity sources
 */
export interface DataService {
  getAllAccounts(): Promise<AccountData[]>;
}
/**
 * Static data service implementation
 * Returns account data from local JSON file
 */
export class StaticDataService implements DataService {
  async getAllAccounts(): Promise<AccountData[]> {
    return Promise.resolve(accountsData as AccountData[]);
  }
}
/**
 * Helper function to convert DateTime objects to ISO 8601 strings
 * Handles null/undefined, string, Date, and UiPath DateTime objects
 */
function toISOString(value: unknown): string {
  if (value == null) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  // Handle UiPath DateTime objects by constructing a new Date
  if (typeof value === 'object' && value !== null) {
    try {
      return new Date(value as any).toISOString();
    } catch {
      return '';
    }
  }
  return '';
}

/**
 * Data Fabric service implementation
 * Fetches account data from UiPath Data Fabric entity 'anzlicenseutilisation'
 */
export class DataFabricService implements DataService {
  private entities: Entities;
  constructor(sdk: UiPath) {
    this.entities = new Entities(sdk);
  }
  async getAllAccounts(): Promise<AccountData[]> {
    try {
      // Fetch all records from the anzlicenseutilisation entity
      const records = await this.entities.getAllRecords('anzlicenseutilisation');
      // Map entity records to AccountData interface
      // Field names in the entity match the AccountData interface exactly
      const accounts: AccountData[] = records.map((record: EntityRecord) => ({
        accountName: record.accountName as string,
        accountId: record.accountId as string,
        csm: record.csm as string,
        accountDirector: record.accountDirector as string,
        robots: record.robots as number,
        robotExpiry: toISOString(record.robotExpiry),
        monthlyRobotHoursConsumed: record.monthlyRobotHoursConsumed as number,
        agenticUnits: record.agenticUnits as number,
        agenticUnitsConsumed: record.agenticUnitsConsumed as number,
        agenticUnitExpiry: toISOString(record.agenticUnitExpiry),
        aiUnits: record.aiUnits as number,
        aiUnitsConsumed: record.aiUnitsConsumed as number,
        aiUnitExpiry: toISOString(record.aiUnitExpiry),
        platformUnits: record.platformUnits as number,
        platformUnitsConsumed: record.platformUnitsConsumed as number,
        platformUnitExpiry: toISOString(record.platformUnitExpiry),
        duUnits: record.duUnits as number,
        duUnitsConsumed: record.duUnitsConsumed as number,
        duUnitExpiry: toISOString(record.duUnitExpiry),
      }));
      return accounts;
    } catch (error) {
      console.error('Error fetching accounts from Data Fabric:', error);
      throw new Error(
        `Failed to fetch accounts from Data Fabric: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }
}
/**
 * Factory function to get the appropriate data service
 * @param useFabric - Whether to use Data Fabric (true) or static JSON (false)
 * @param sdk - UiPath SDK instance (required if useFabric is true)
 * @returns DataService implementation
 */
export function getDataService(
  useFabric: boolean,
  sdk?: UiPath | null
): DataService {
  if (useFabric) {
    if (!sdk) {
      throw new Error('SDK instance is required for Data Fabric service');
    }
    return new DataFabricService(sdk);
  }
  return new StaticDataService();
}