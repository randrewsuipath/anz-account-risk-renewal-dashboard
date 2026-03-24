# Data Fabric Integration Guide
## Overview
This application supports both static JSON data and UiPath Data Fabric entity integration through a data service abstraction layer.
## Entity Schema: anzlicenseutilisation
### Entity Configuration
- **Entity Name**: `anzlicenseutilisation`
- **Entity Type**: Standard Entity
- **Purpose**: Store ANZ account license utilization and risk data
### Field Definitions
| Field Name | Data Type | Required | Description |
|------------|-----------|----------|-------------|
| accountName | String | Yes | Account name |
| accountId | String | Yes | Unique account identifier (Primary Key) |
| csm | String | Yes | Customer Success Manager name |
| accountDirector | String | Yes | Account Director name |
| robots | Integer | Yes | Number of robot licenses |
| robotExpiry | DateTime | Yes | Robot license expiry date |
| monthlyRobotHoursConsumed | Integer | Yes | Monthly robot hours consumed |
| agenticUnits | Integer | Yes | Number of Agentic Units |
| agenticUnitsConsumed | Integer | Yes | Agentic Units consumed |
| agenticUnitExpiry | DateTime | Yes | Agentic Units expiry date |
| aiUnits | Integer | Yes | Number of AI Units |
| aiUnitsConsumed | Integer | Yes | AI Units consumed |
| aiUnitExpiry | DateTime | Yes | AI Units expiry date |
| platformUnits | Integer | Yes | Number of Platform Units |
| platformUnitsConsumed | Integer | Yes | Platform Units consumed |
| platformUnitExpiry | DateTime | Yes | Platform Units expiry date |
| duUnits | Integer | Yes | Number of DU Units |
| duUnitsConsumed | Integer | Yes | DU Units consumed |
| duUnitExpiry | DateTime | Yes | DU Units expiry date |
## Migration Steps
### 1. Create Entity in Data Fabric
1. Log in to UiPath Automation Cloud
2. Navigate to Data Service > Entities
3. Click "Create Entity"
4. Name: `anzlicenseutilisation`
5. Add all fields from the table above with correct data types
6. Set `accountId` as the primary key
### 2. Import Data
1. Export current data from `src/data/accounts.json`
2. Transform date fields to ISO 8601 format if needed
3. Use Data Service bulk import or API to load records
4. Verify all 10 accounts are imported correctly
### 3. Update Application Configuration
In `src/services/dataService.ts`, the factory function is already configured:
```typescript
export function getDataService(useFabric: boolean, sdk?: UiPath | null): DataService {
  if (useFabric) {
    if (!sdk) {
      throw new Error('SDK instance is required for Data Fabric service');
    }
    return new DataFabricService(sdk);
  }
  return new StaticDataService();
}
```
In each page component, change:
```typescript
// From:
const dataService = getDataService(false);
// To:
const { sdk } = useAuth();
const dataService = getDataService(true, sdk);
```
### 4. Verify OAuth Scopes
Ensure `.env` includes:
```
VITE_UIPATH_SCOPE=... DataFabric.Data.Read DataFabric.Schema.Read ...
```
### 5. Test Integration
1. Deploy the application
2. Verify data loads correctly
3. Test all filters and views
4. Confirm risk calculations work with live data
## Troubleshooting
### Error: "SDK instance is required"
- Ensure `sdk` is passed to `getDataService(true, sdk)`
- Verify `useAuth()` hook is providing valid SDK instance
### Error: "Failed to fetch accounts from Data Fabric"
- Check OAuth scopes include `DataFabric.Data.Read`
- Verify entity name is exactly `anzlicenseutilisation`
- Confirm entity exists and has records
### Data not displaying
- Check browser console for errors
- Verify field names match exactly (case-sensitive)
- Ensure date fields are in ISO 8601 format
## Rollback to Static JSON
If needed, revert to static JSON by changing:
```typescript
const dataService = getDataService(false);
```
No other code changes required - the abstraction layer handles both sources transparently.
## Current Implementation Status
The application currently uses **static JSON data** (`src/data/accounts.json`) by default. All pages call `getDataService(false)` which returns the `StaticDataService` implementation.
To enable Data Fabric integration:
1. Complete steps 1-2 above (create entity and import data)
2. Update each page component to pass `sdk` and set `useFabric: true`
3. Test thoroughly before deploying to production
The data service abstraction layer (`src/services/dataService.ts`) is fully implemented and ready for Data Fabric integration - no changes to the service layer are needed.