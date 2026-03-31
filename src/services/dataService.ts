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
      // Debug logging for SDK configuration and authentication
      console.log('[DataFabric Debug] SDK Configuration:', {
        baseUrl: (this.entities as any).sdk?.config?.baseUrl || 'N/A',
        orgName: (this.entities as any).sdk?.config?.orgName || 'N/A',
        tenantName: (this.entities as any).sdk?.config?.tenantName || 'N/A',
      });
      
      console.log('[DataFabric Debug] Authentication Status:', 
        typeof (this.entities as any).sdk?.isAuthenticated === 'function' 
          ? (this.entities as any).sdk.isAuthenticated() 
          : 'Unable to determine'
      );
      
      // Log access token (first 20 chars only for security)
      const accessToken = (this.entities as any).sdk?.config?.accessToken || 
                         (this.entities as any).sdk?.accessToken;
      console.log('[DataFabric Debug] Access Token (first 20 chars):', 
        accessToken ? accessToken.substring(0, 20) + '...' : 'No token found'
      );
      
      const entityName = 'anzlicenseutilisation';
      console.log('[DataFabric Debug] Searching for entity:', entityName);
      
      // Step 1: Get all entities
      const allEntities = await this.entities.getAll();
      console.log('[DataFabric Debug] Number of entities found:', allEntities.length);
      
      // Step 2: Find the entity with name 'anzlicenseutilisation' (case-insensitive)
      const targetEntity = allEntities.find(
        (entity: any) => entity.name?.toLowerCase() === entityName.toLowerCase()
      );
      
      if (!targetEntity) {
        console.error('[DataFabric Debug] Entity not found. Available entities:', 
          allEntities.map((e: any) => e.name || 'unnamed').join(', ')
        );
        throw new Error(
          `Entity '${entityName}' not found in Data Fabric. Available entities: ${
            allEntities.map((e: any) => e.name || 'unnamed').join(', ')
          }`
        );
      }
      
      // Step 3: Extract the entity UUID
      const entityId = targetEntity.id;
      console.log('[DataFabric Debug] Entity found:', {
        name: targetEntity.name,
        id: entityId
      });
      
      // Step 4: Fetch all records using the entity UUID
      console.log('[DataFabric Debug] Fetching records for entity UUID:', entityId);
      const records = await this.entities.getAllRecords(entityId);
      console.log('[DataFabric Debug] Number of records retrieved:', records.items?.length || 0);
      // Map entity records to AccountData interface
      // Field names in the entity match the AccountData interface exactly
      const accounts: AccountData[] = (records.items || []).map((record: EntityRecord) => ({
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
      console.error('[DataFabric Debug] Error fetching accounts from Data Fabric:', error);
      
      // Extract and log detailed error information
      if (error && typeof error === 'object') {
        const errorObj = error as any;
        
        console.error('[DataFabric Debug] Error Details:', {
          message: errorObj.message || 'No message',
          statusCode: errorObj.statusCode || errorObj.status || 'No status code',
          name: errorObj.name || 'Unknown error type',
        });
        
        // Log response body if available
        if (errorObj.response) {
          console.error('[DataFabric Debug] Response Body:', errorObj.response);
        }
        
        // Log response data if available
        if (errorObj.data) {
          console.error('[DataFabric Debug] Response Data:', errorObj.data);
        }
        
        // Log headers if available
        if (errorObj.headers) {
          console.error('[DataFabric Debug] Response Headers:', errorObj.headers);
        }
        
        // Log full error object for comprehensive debugging
        console.error('[DataFabric Debug] Full Error Object:', JSON.stringify(errorObj, null, 2));
      }
      
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