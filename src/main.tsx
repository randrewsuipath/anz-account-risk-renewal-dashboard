import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { getAppBase } from '@uipath/uipath-typescript'
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthProvider } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import '@/index.css'
import { LoginPage } from '@/pages/LoginPage'
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
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/accounts" element={<ProtectedRoute><AccountsListPage /></ProtectedRoute>} />
            <Route path="/account/:accountId" element={<ProtectedRoute><AccountDetailPage /></ProtectedRoute>} />
            <Route path="/risk-analysis" element={<ProtectedRoute><RiskAnalysisPage /></ProtectedRoute>} />
            <Route path="/expiry" element={<ProtectedRoute><ExpiryViewPage /></ProtectedRoute>} />
            <Route path="/recommendations" element={<ProtectedRoute><RecommendationsPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)