# ANZ Account Risk & Renewal Dashboard
A production-quality executive dashboard for ANZ sales leadership that provides comprehensive visibility into account license consumption, renewal risk, and utilization across all UiPath product units.
[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/randrewsuipath/anz-account-risk-renewal-dashboard)
## Overview
This application implements sophisticated risk scoring for Agentic Units, AI Units, Platform Units, DU Units, and Robots (with dual utilization models), delivering actionable recommendations to drive renewal conversations and adoption strategies. Built with enterprise-grade design principles, the dashboard features clean information architecture, table-based data display, and professional aesthetics that match UiPath's corporate standards.
## Key Features
- **Executive Dashboard**: KPI cards showing total accounts, risk counts by unit type, and overall health metrics with risk distribution charts
- **Comprehensive Risk Analysis**: Independent risk calculations for each unit type (Agentic, AI, Platform, DU, Robots)
- **Dual Robot Utilization Models**: 24/7/30 and Business Hours (8/5/20) utilization tracking
- **Account Drill-Down**: Detailed view of individual accounts with unit-specific risk ratings and recommendations
- **Expiry Timeline View**: Calendar-style visualization of upcoming license expirations
- **Actionable Recommendations**: Unit-specific, sales-oriented recommendations for each account
- **Advanced Filtering**: Filter by CSM, Account Director, risk type, expiry window, and account name
- **Flexible Data Sources**: Supports both static JSON and UiPath Data Fabric entity integration
## Technology Stack
### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **React Router** for navigation
- **Tailwind CSS 4** for styling
- **shadcn/ui** component library
- **Recharts** for data visualization
- **date-fns** for date calculations
### State Management
- **Zustand** for global state management
### Backend & Deployment
- **Cloudflare Pages** for static site hosting
- **UiPath TypeScript SDK** for Data Fabric integration
### Development Tools
- **Bun** runtime and package manager
- **ESLint** for code quality
- **TypeScript 5.8** for type safety
## Prerequisites
- [Bun](https://bun.sh/) v1.0 or higher
- Node.js 18+ (for compatibility)
- UiPath Cloud account (for OAuth authentication and optional Data Fabric integration)
## Installation
1. Clone the repository:
```bash
git clone <repository-url>
cd anz-account-risk-dashboard
```
2. Install dependencies:
```bash
bun install
```
3. Configure environment variables:
Create a `.env` file in the root directory (or use the provided template):
```env
VITE_UIPATH_BASE_URL=https://api.uipath.com
VITE_UIPATH_ORG_NAME=your-org-name
VITE_UIPATH_TENANT_NAME=your-tenant-name
VITE_UIPATH_CLIENT_ID=your-client-id
VITE_UIPATH_REDIRECT_URI=http://localhost:3000
VITE_UIPATH_SCOPE=OR.Administration.Read OR.Assets.Read OR.Execution.Read OR.Folders OR.Jobs OR.Queues.Read OR.Tasks PIMS Traces.Api DataFabric.Data.Read DataFabric.Data.Write DataFabric.Schema.Read ConversationalAgents
```
Replace the placeholder values with your UiPath Cloud credentials.
## Development
Start the development server:
```bash
bun run dev
```
The application will be available at `http://localhost:3000`.
### Available Scripts
- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run preview` - Preview production build locally
- `bun run lint` - Run ESLint
## Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── layout/         # Layout components
├── docs/               # Documentation
│   └── DATA_FABRIC_SETUP.md  # Detailed Data Fabric integration guide
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── pages/              # Page components
├── services/           # Data service abstraction layer
│   └── dataService.ts  # Static JSON and Data Fabric implementations
├── utils/              # Business logic utilities
│   ├── riskCalculations.ts    # Risk scoring engine
│   └── recommendations.ts     # Recommendation generator
├── data/               # Static data (accounts.json)
└── main.tsx           # Application entry point
```
## Data Sources
The application supports two data sources through a data service abstraction layer:
### 1. Static JSON (Current Default)
Data is loaded from `src/data/accounts.json`. This is the current implementation and requires no additional setup beyond the basic OAuth configuration.
**Advantages:**
- No additional setup required
- Works immediately after installation
- Perfect for development and testing
- No external dependencies
### 2. UiPath Data Fabric (Production Option)
For production deployments, the application can fetch data from a UiPath Data Fabric entity named `anzlicenseutilisation`.
**Advantages:**
- Live data updates
- Centralized data management
- Integration with UiPath ecosystem
- Scalable for large datasets
## Data Fabric Integration
This application supports seamless integration with UiPath Data Fabric through a data service abstraction layer.
### Current Configuration
By default, the application uses static JSON data from `src/data/accounts.json`. To switch to Data Fabric, follow the steps below.
### Step 1: Create the Entity in Data Fabric
Navigate to **UiPath Automation Cloud > Data Service > Entities** and create a new entity named `anzlicenseutilisation` with the following schema:
| Field Name | Data Type | Required | Description |
|------------|-----------|----------|-------------|
| accountName | String | Yes | Account name |
| accountId | String | Yes | Unique account identifier (Primary Key) |
| csm | String | Yes | Customer Success Manager name |
| accountDirector | String | Yes | Account Director name |
| robots | Integer | Yes | Number of robot licenses |
| robotExpiry | DateTime | Yes | Robot license expiry date (ISO 8601 format) |
| monthlyRobotHoursConsumed | Integer | Yes | Monthly robot hours consumed |
| agenticUnits | Integer | Yes | Number of Agentic Units |
| agenticUnitsConsumed | Integer | Yes | Agentic Units consumed |
| agenticUnitExpiry | DateTime | Yes | Agentic Units expiry date (ISO 8601 format) |
| aiUnits | Integer | Yes | Number of AI Units |
| aiUnitsConsumed | Integer | Yes | AI Units consumed |
| aiUnitExpiry | DateTime | Yes | AI Units expiry date (ISO 8601 format) |
| platformUnits | Integer | Yes | Number of Platform Units |
| platformUnitsConsumed | Integer | Yes | Platform Units consumed |
| platformUnitExpiry | DateTime | Yes | Platform Units expiry date (ISO 8601 format) |
| duUnits | Integer | Yes | Number of DU Units |
| duUnitsConsumed | Integer | Yes | DU Units consumed |
| duUnitExpiry | DateTime | Yes | DU Units expiry date (ISO 8601 format) |
**Important Notes:**
- Set `accountId` as the primary key
- All date fields must be in ISO 8601 format (e.g., "2025-05-15T00:00:00Z")
- Field names are case-sensitive and must match exactly
- All numeric fields should be stored as integers, not strings
### Step 2: Import Data into the Entity
You can import the sample data from `src/data/accounts.json` into your Data Fabric entity using:
- **Data Service bulk import feature** (recommended for initial setup)
- **UiPath Data Service API** (for programmatic imports)
- **Manual entry through the UI** (for small datasets)
**Data Transformation Notes:**
- Convert date strings to ISO 8601 format if needed
- Ensure all numeric values are integers
- Verify field names match exactly (case-sensitive)
### Step 3: Update OAuth Scopes
Ensure your `.env` file includes the required Data Fabric scopes:
```env
VITE_UIPATH_SCOPE=OR.Administration.Read OR.Assets.Read OR.Execution.Read OR.Folders OR.Jobs OR.Queues.Read OR.Tasks PIMS Traces.Api DataFabric.Data.Read DataFabric.Data.Write DataFabric.Schema.Read ConversationalAgents
```
The critical scopes for Data Fabric are:
- `DataFabric.Data.Read` - Read entity records
- `DataFabric.Schema.Read` - Read entity schema
- `DataFabric.Data.Write` - (Optional) Write entity records if you plan to update data from the app
### Step 4: Switch to Data Fabric in Code
Update each page component to use Data Fabric instead of static JSON.
**In the following files:**
- `src/pages/HomePage.tsx`
- `src/pages/AccountDetailPage.tsx`
- `src/pages/AccountsListPage.tsx`
- `src/pages/RiskAnalysisPage.tsx`
- `src/pages/ExpiryViewPage.tsx`
- `src/pages/RecommendationsPage.tsx`
**Change:**
```typescript
const dataService = getDataService(false);
```
**To:**
```typescript
const { sdk } = useAuth();
const dataService = getDataService(true, sdk);
```
**Example (HomePage.tsx):**
```typescript
import { useAuth } from '../hooks/useAuth';
import { getDataService } from '../services/dataService';
export function HomePage() {
  const { sdk } = useAuth();  // Add this line
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const dataService = getDataService(true, sdk);  // Change false to true, add sdk
        const data = await dataService.getAllAccounts();
        setAccounts(data);
      } catch (error) {
        console.error('Error loading accounts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [sdk]);  // Add sdk to dependency array
  // ... rest of component
}
```
### Step 5: Deploy and Test
Build and preview the application:
```bash
bun run build
bun run preview
```
Verify:
- ✅ All accounts load correctly from Data Fabric
- ✅ Filters work as expected (CSM, Account Director, Risk Level, etc.)
- ✅ Risk calculations are accurate
- ✅ All dashboards display data properly
- ✅ Navigation between pages works smoothly
- ✅ No console errors related to data fetching
### Data Service Architecture
The application uses a data service abstraction layer (`src/services/dataService.ts`) that provides:
- **`DataService` interface**: Common contract for data access
- **`StaticDataService`**: Reads from `accounts.json` (current default)
- **`DataFabricService`**: Reads from UiPath Data Fabric entity `anzlicenseutilisation`
- **`getDataService(useFabric, sdk?)`**: Factory function to create the appropriate service
This architecture allows seamless switching between data sources without changing business logic or UI components. The abstraction ensures:
- **Type Safety**: Both services implement the same TypeScript interface
- **Consistent API**: All pages use the same `getAllAccounts()` method
- **Easy Testing**: Switch to static JSON for development/testing
- **Production Ready**: Switch to Data Fabric for live deployments
### Troubleshooting Data Fabric Integration
#### Error: "SDK instance is required for Data Fabric service"
**Cause**: The SDK instance is not being passed to `getDataService()`
**Solution**:
- Ensure you're passing the SDK instance: `getDataService(true, sdk)`
- Verify `useAuth()` hook is imported: `import { useAuth } from '../hooks/useAuth'`
- Check that `const { sdk } = useAuth()` is called at the component level
#### Error: "Failed to fetch accounts from Data Fabric"
**Cause**: OAuth scopes, entity name, or entity configuration issue
**Solution**:
- Check OAuth scopes include `DataFabric.Data.Read` and `DataFabric.Schema.Read`
- Verify entity name is exactly `anzlicenseutilisation` (case-sensitive)
- Confirm entity exists in Data Service and contains records
- Check browser console for detailed error messages
- Verify you're logged in to the correct UiPath organization and tenant
#### Data not displaying or incorrect
**Cause**: Field name mismatch, data type issues, or date format problems
**Solution**:
- Verify all field names match exactly (case-sensitive)
- Ensure date fields are in ISO 8601 format (e.g., "2025-05-15T00:00:00Z")
- Check that numeric fields are stored as integers, not strings
- Verify the entity has the correct primary key set (`accountId`)
- Use browser DevTools Network tab to inspect the API response
#### Authentication Issues
**Cause**: OAuth token expired or invalid scopes
**Solution**:
- Log out and log back in to refresh the OAuth token
- Verify all required scopes are in your `.env` file
- Check that the OAuth client ID has the necessary permissions
- Ensure the redirect URI matches your deployment URL
#### Performance Issues
**Cause**: Large dataset or network latency
**Solution**:
- The Data Fabric service fetches all records at once (no pagination in current implementation)
- For large datasets (>1000 records), consider implementing pagination in `DataFabricService`
- Use browser DevTools to monitor network request times
- Consider caching strategies for frequently accessed data
### Rollback to Static JSON
If you need to revert to static JSON data, simply change back to:
```typescript
const dataService = getDataService(false);
```
No other code changes are required. The abstraction layer handles both sources transparently.
**When to use Static JSON:**
- Development and testing
- Demo environments
- When Data Fabric is unavailable
- For offline development
**When to use Data Fabric:**
- Production deployments
- When data needs to be updated frequently
- When integrating with other UiPath processes
- For centralized data management
### Additional Resources
For more detailed information about Data Fabric integration, see:
- [src/docs/DATA_FABRIC_SETUP.md](src/docs/DATA_FABRIC_SETUP.md) - Comprehensive setup guide
- [UiPath Data Service Documentation](https://docs.uipath.com/data-service) - Official documentation
- [UiPath TypeScript SDK Reference](https://www.npmjs.com/package/@uipath/uipath-typescript) - SDK documentation
## Usage
### Dashboard Navigation
1. **Executive Dashboard**: Landing page with KPI summary and risk distribution charts
2. **Accounts List**: Comprehensive table view of all accounts with sortable columns
3. **Account Detail**: Drill-down view showing unit-specific risk analysis
4. **Risk Analysis**: Detailed risk breakdowns by unit type with comparative charts
5. **Expiry View**: Timeline of upcoming license expirations
6. **Recommendations**: Consolidated view of all account recommendations
### Risk Calculation Logic
The application implements independent risk scoring for each unit type:
**Standard Units (Agentic, AI, Platform, DU)**:
- Utilization % = Consumed / Purchased
- High Risk: < 40% utilization
- Medium Risk: 40-70% utilization
- Low Risk: > 70% utilization
**Robots (Dual Model)**:
- 24/7/30 Model: 5,040 hours/month capacity per robot
- Business Hours Model: 160 hours/month capacity per robot
- Combined risk uses worst of both models
**Expiry Risk**:
- High Risk: < 90 days to expiry
- Medium Risk: 90-180 days to expiry
- Low Risk: > 180 days to expiry
## Deployment
### Cloudflare Pages
[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/randrewsuipath/anz-account-risk-renewal-dashboard)
#### Manual Deployment
1. Build the application:
```bash
bun run build
```
2. Deploy to Cloudflare Pages:
```bash
npx wrangler pages deploy dist
```
3. Configure environment variables in Cloudflare Pages dashboard:
   - Navigate to Settings > Environment Variables
   - Add all `VITE_*` variables from your `.env` file
#### Automatic Deployment
Connect your repository to Cloudflare Pages for automatic deployments:
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to Pages > Create a project
3. Connect your Git repository
4. Configure build settings:
   - Build command: `bun run build`
   - Build output directory: `dist`
   - Root directory: `/`
5. Add environment variables
6. Deploy
### Environment Variables for Production
Ensure the following variables are set in your Cloudflare Pages environment:
- `VITE_UIPATH_BASE_URL`: UiPath API base URL
- `VITE_UIPATH_ORG_NAME`: Your organization name
- `VITE_UIPATH_TENANT_NAME`: Your tenant name
- `VITE_UIPATH_CLIENT_ID`: OAuth client ID
- `VITE_UIPATH_REDIRECT_URI`: Production redirect URI
- `VITE_UIPATH_SCOPE`: Required OAuth scopes (include `DataFabric.Data.Read DataFabric.Schema.Read` if using Data Fabric)
## Authentication
The application uses OAuth 2.0 authentication with UiPath Cloud:
1. User clicks login button
2. Redirected to UiPath OAuth consent page
3. After consent, redirected back with authorization code
4. SDK exchanges code for access token
5. Token stored in sessionStorage for session persistence
## Future Enhancements
- **Real-time Updates**: Implement polling for live data refresh
- **Export Functionality**: CSV/Excel export for recommendations
- **Advanced Filtering**: Additional filter dimensions and saved filter presets
- **Mobile Optimization**: Enhanced responsive design for tablet/mobile devices
- **User Preferences**: Customizable dashboard layouts and default views
- **Data Fabric Write Operations**: Enable updating account data from the dashboard
- **Pagination**: Implement pagination for large datasets in Data Fabric mode
## Contributing
This is an internal UiPath project. For questions or issues, contact the development team.
## License
Proprietary - UiPath Internal Use Only
## Support
For technical support or questions:
- Internal Wiki: [Link to internal documentation]
- Slack Channel: #anz-dashboard-support
- Email: [team-email@uipath.com]