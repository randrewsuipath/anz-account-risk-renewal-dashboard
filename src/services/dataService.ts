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
  private sdk: UiPath;
  constructor(sdk: UiPath) {
    this.sdk = sdk;
    this.entities = new Entities(sdk);
    console.log('[DataFabric Init] ✓ DataFabricService initialized');
  }
  async getAllAccounts(): Promise<AccountData[]> {
    const entityName = 'anzlicenseutilisation';
    console.group('[DataFabric] Starting account fetch from entity: ' + entityName);
    try {
      // Step 1: Verify SDK Configuration
      console.log('[DataFabric] Step 1: Verifying SDK Configuration');
      const config = {
        baseUrl: this.sdk.config?.baseUrl || 'N/A',
        orgName: this.sdk.config?.orgName || 'N/A',
        tenantName: this.sdk.config?.tenantName || 'N/A',
        clientId: this.sdk.config?.clientId || 'N/A',
        redirectUri: this.sdk.config?.redirectUri || 'N/A',
      };
      console.table(config);
      // Step 2: Verify Authentication Status
      console.log('[DataFabric] Step 2: Verifying Authentication Status');
      const isAuthenticated = typeof this.sdk.isAuthenticated === 'function' 
        ? this.sdk.isAuthenticated() 
        : 'Unable to determine';
      console.log('  ✓ SDK Authenticated:', isAuthenticated);
      // Step 3: Check Access Token Presence
      console.log('[DataFabric] Step 3: Checking Access Token');
      const accessToken = this.sdk.getToken?.() || (this.sdk as any).accessToken || (this.sdk.config as any)?.accessToken;
      if (accessToken) {
        console.log('  ✓ Access Token Present: Yes (first 20 chars):', accessToken.substring(0, 20) + '...');
        console.log('  ✓ Token Length:', accessToken.length, 'characters');
      } else {
        console.error('  ✗ Access Token Present: NO - This will cause API calls to fail');
      }
      // Step 4: Verify OAuth Scopes (if available)
      console.log('[DataFabric] Step 4: Verifying OAuth Scopes');
      const requiredScopes = ['DataFabric.Data.Read', 'DataFabric.Schema.Read'];
      const configuredScope = this.sdk.config?.scope || import.meta.env.VITE_UIPATH_SCOPE || '';
      console.log('  Configured Scope String:', configuredScope);
      requiredScopes.forEach(scope => {
        const hasScope = configuredScope.includes(scope);
        console.log(`  ${hasScope ? '✓' : '✗'} ${scope}:`, hasScope ? 'Present' : 'MISSING');
      });
      // Step 5: Fetch All Entities
      console.log('[DataFabric] Step 5: Fetching All Entities');
      console.log('  API Call: GET /entities');
      const allEntities = await this.entities.getAll();
      console.log('  ✓ Total Entities Found:', allEntities.length);
      console.log('  Available Entity Names:', allEntities.map((e: any) => e.name || 'unnamed').join(', '));
      // Step 6: Find Target Entity
      console.log('[DataFabric] Step 6: Searching for Target Entity');
      console.log('  Looking for entity name (case-insensitive):', entityName);
      const targetEntity = allEntities.find(
        (entity: any) => entity.name?.toLowerCase() === entityName.toLowerCase()
      );
      if (!targetEntity) {
        console.error('  ✗ Entity NOT FOUND');
        console.error('  Available entities:', allEntities.map((e: any) => e.name || 'unnamed'));
        console.groupEnd();
        throw new Error(
          `Entity '${entityName}' not found in Data Fabric. Available entities: ${
            allEntities.map((e: any) => e.name || 'unnamed').join(', ')
          }`
        );
      }
      console.log('  ✓ Entity Found:', targetEntity.name);
      console.log('  Entity Details:', {
        id: targetEntity.id,
        name: targetEntity.name,
        displayName: (targetEntity as any).displayName || 'N/A',
        type: (targetEntity as any).type || 'N/A',
      });
      // Step 7: Fetch Entity Records
      const entityId = targetEntity.id;
      console.log('[DataFabric] Step 7: Fetching Entity Records');
      console.log('  Entity UUID:', entityId);
      console.log('  API Call: GET /entities/' + entityId + '/records');
      const records = await this.entities.getAllRecords(entityId);
      console.log('  ✓ Records Retrieved Successfully');
      console.log('  Total Records:', records.items?.length || 0);
      if (records.items && records.items.length > 0) {
        console.log('  Sample Record Fields:', Object.keys(records.items[0]).join(', '));
        console.log('  First Record Preview:', {
          accountName: records.items[0].accountName,
          accountId: records.items[0].accountId,
          csm: records.items[0].csm,
        });
      } else {
        console.warn('  ⚠ No records found in entity');
      }
      // Step 8: Map Records to AccountData
      console.log('[DataFabric] Step 8: Mapping Records to AccountData Interface');
      const accounts: AccountData[] = (records.items || []).map((record: EntityRecord, index: number) => {
        if (index === 0) {
          console.log('  Mapping first record as example...');
        }
        return {
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
        };
      });
      console.log('  ✓ Successfully Mapped', accounts.length, 'accounts');
      console.log('[DataFabric] ✓✓✓ FETCH COMPLETED SUCCESSFULLY ✓✓✓');
      console.groupEnd();
      return accounts;
    } catch (error) {
      console.error('[DataFabric] ✗✗✗ FETCH FAILED ✗✗✗');
      console.error('[DataFabric] Error Type:', error?.constructor?.name || 'Unknown');
      if (error && typeof error === 'object') {
        const errorObj = error as any;
        // Log all available error properties
        console.group('[DataFabric] Detailed Error Information');
        console.log('Message:', errorObj.message || 'No message');
        console.log('Name:', errorObj.name || 'Unknown');
        console.log('Status Code:', errorObj.statusCode || errorObj.status || errorObj.code || 'No status code');
        console.log('Status Text:', errorObj.statusText || 'No status text');
        // Log response details if available
        if (errorObj.response) {
          console.group('Response Object');
          console.log('Status:', errorObj.response.status);
          console.log('Status Text:', errorObj.response.statusText);
          console.log('Headers:', errorObj.response.headers);
          console.log('Data:', errorObj.response.data);
          console.groupEnd();
        }
        // Log request details if available
        if (errorObj.config) {
          console.group('Request Configuration');
          console.log('URL:', errorObj.config.url);
          console.log('Method:', errorObj.config.method);
          console.log('Headers:', errorObj.config.headers);
          console.groupEnd();
        }
        // Log raw error data
        if (errorObj.data) {
          console.log('Error Data:', errorObj.data);
        }
        // Log error body if available
        if (errorObj.body) {
          console.log('Error Body:', errorObj.body);
        }
        // Log stack trace
        if (errorObj.stack) {
          console.log('Stack Trace:', errorObj.stack);
        }
        // Log full error object for comprehensive debugging
        console.group('Full Error Object (JSON)');
        try {
          console.log(JSON.stringify(errorObj, null, 2));
        } catch (stringifyError) {
          console.log('Unable to stringify error object:', stringifyError);
          console.log('Raw error object:', errorObj);
        }
        console.groupEnd();
        console.groupEnd();
      }
      console.groupEnd();
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
      console.error('[DataService Factory] ✗ SDK instance is required for Data Fabric service but was not provided');
      throw new Error('SDK instance is required for Data Fabric service');
    }
    console.log('[DataService Factory] ✓ Creating DataFabricService instance');
    return new DataFabricService(sdk);
  }
  console.log('[DataService Factory] ✓ Using StaticDataService (JSON file)');
  return new StaticDataService();
}