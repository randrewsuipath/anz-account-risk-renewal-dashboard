# ANZ Account Risk & Renewal Dashboard
A production-quality executive dashboard for ANZ sales leadership that provides comprehensive visibility into account license consumption, renewal risk, and utilization across all UiPath product units.
[cloudflarebutton]
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
- **Data Fabric Integration**: Structured for seamless UiPath Data Fabric entity integration (see [Data Fabric Setup Guide](src/docs/DATA_FABRIC_SETUP.md))
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
- UiPath Cloud account (for OAuth authentication and Data Fabric integration)
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
VITE_UIPATH_SCOPE=OR.Execution DataFabric.Data.Read DataFabric.Schema.Read
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
│   └── DATA_FABRIC_SETUP.md  # Data Fabric integration guide
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
The application supports two data sources through a service abstraction layer:
### 1. Static JSON (Current Default)
Data is loaded from `src/data/accounts.json`. This is the current implementation and requires no additional setup.
### 2. UiPath Data Fabric (Optional)
For production deployments, the application can fetch data from a UiPath Data Fabric entity named `anzlicenseutilisation`.
**To enable Data Fabric integration:**
1. Read the comprehensive setup guide: [src/docs/DATA_FABRIC_SETUP.md](src/docs/DATA_FABRIC_SETUP.md)
2. Create the entity in Data Fabric with the specified schema
3. Import account data into the entity
4. Update page components to use `getDataService(true, sdk)` instead of `getDataService(false)`
5. Verify OAuth scopes include `DataFabric.Data.Read` and `DataFabric.Schema.Read`
The data service abstraction layer (`src/services/dataService.ts`) handles both sources transparently - no other code changes are needed.
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
[cloudflarebutton]
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
## Contributing
This is an internal UiPath project. For questions or issues, contact the development team.
## License
Proprietary - UiPath Internal Use Only
## Support
For technical support or questions:
- Internal Wiki: [Link to internal documentation]
- Slack Channel: #anz-dashboard-support
- Email: [team-email@uipath.com]