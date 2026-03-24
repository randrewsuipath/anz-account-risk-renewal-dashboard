import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { getAppBase } from '@uipath/uipath-typescript'
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthProvider } from '@/hooks/useAuth';
import '@/index.css'
import { HomePage } from '@/pages/HomePage'
import { AccountDetailPage } from '@/pages/AccountDetailPage'
import { AccountsListPage } from '@/pages/AccountsListPage'
import { RiskAnalysisPage } from '@/pages/RiskAnalysisPage'
import { ExpiryViewPage } from '@/pages/ExpiryViewPage'
import { RecommendationsPage } from '@/pages/RecommendationsPage'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter basename={getAppBase()}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/accounts" element={<AccountsListPage />} />
            <Route path="/account/:accountId" element={<AccountDetailPage />} />
            <Route path="/risk-analysis" element={<RiskAnalysisPage />} />
            <Route path="/expiry" element={<ExpiryViewPage />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)