import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { UiPath } from '@uipath/uipath-typescript/core';
import type { UiPathSDKConfig } from '@uipath/uipath-typescript/core';
interface AuthContextType {
    sdk: UiPath | null;
    isAuthenticated: boolean;
    isInitializing: boolean;
    error: string | null;
    login: () => Promise<void>;
    logout: () => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
function getConfig(): UiPathSDKConfig {
    const pathname = window.location.pathname.replace(/\/$/, '');
    const redirectUri = import.meta.env.VITE_UIPATH_REDIRECT_URI || `${window.location.origin}${pathname}`;
    const config = {
        baseUrl: import.meta.env.VITE_UIPATH_BASE_URL || 'https://api.uipath.com',
        orgName: import.meta.env.VITE_UIPATH_ORG_NAME || '',
        tenantName: import.meta.env.VITE_UIPATH_TENANT_NAME || 'DefaultTenant',
        clientId: import.meta.env.VITE_UIPATH_CLIENT_ID || '',
        redirectUri,
        scope: import.meta.env.VITE_UIPATH_SCOPE || '',
    };
    console.group('[OAuth Config] SDK Configuration');
    console.table({
        baseUrl: config.baseUrl,
        orgName: config.orgName,
        tenantName: config.tenantName,
        clientId: config.clientId,
        redirectUri: config.redirectUri,
        scopeLength: config.scope.length + ' characters',
    });
    console.log('Full Scope String:', config.scope);
    console.groupEnd();
    return config;
}
export function AuthProvider({ children }: { children: ReactNode }) {
    const [sdk, setSdk] = useState<UiPath | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        const init = async () => {
            console.group('[OAuth Init] Starting Authentication Flow');
            try {
                const config = getConfig();
                console.log('[OAuth Init] Creating UiPath SDK instance...');
                const instance = new UiPath(config);
                console.log('[OAuth Init] ✓ SDK instance created');
                // Check if we're in OAuth callback
                console.log('[OAuth Init] Checking if in OAuth callback...');
                const isInCallback = instance.isInOAuthCallback();
                console.log('[OAuth Init] Is in OAuth callback:', isInCallback);
                if (isInCallback) {
                    console.log('[OAuth Init] Processing OAuth callback...');
                    console.log('[OAuth Init] Current URL:', window.location.href);
                    await instance.completeOAuth();
                    console.log('[OAuth Init] ✓ OAuth callback completed successfully');
                    // Verify token after OAuth completion
                    const token = instance.getToken?.();
                    if (token) {
                        console.log('[OAuth Init] ✓ Access token obtained (first 20 chars):', token.substring(0, 20) + '...');
                    } else {
                        console.error('[OAuth Init] ✗ No access token after OAuth completion');
                    }
                    if (!cancelled) {
                        setSdk(instance);
                        setIsAuthenticated(true);
                        setIsInitializing(false);
                        console.log('[OAuth Init] ✓ Authentication state updated: authenticated');
                    }
                    console.groupEnd();
                    return;
                }
                // Check if already authenticated
                console.log('[OAuth Init] Checking existing authentication...');
                const alreadyAuthenticated = instance.isAuthenticated();
                console.log('[OAuth Init] Already authenticated:', alreadyAuthenticated);
                if (alreadyAuthenticated) {
                    const token = instance.getToken?.();
                    if (token) {
                        console.log('[OAuth Init] ✓ Existing token found (first 20 chars):', token.substring(0, 20) + '...');
                    } else {
                        console.warn('[OAuth Init] ⚠ Authenticated but no token available');
                    }
                }
                if (!cancelled) {
                    setSdk(instance);
                    setIsAuthenticated(alreadyAuthenticated);
                    setIsInitializing(false);
                    console.log('[OAuth Init] ✓ Initialization complete');
                    console.log('[OAuth Init] Authentication status:', alreadyAuthenticated ? 'Authenticated' : 'Not authenticated');
                }
                console.groupEnd();
            } catch (err) {
                console.error('[OAuth Init] ✗ Initialization failed');
                console.error('[OAuth Init] Error:', err);
                if (err && typeof err === 'object') {
                    const errorObj = err as any;
                    console.group('[OAuth Init] Error Details');
                    console.log('Message:', errorObj.message || 'No message');
                    console.log('Name:', errorObj.name || 'Unknown');
                    console.log('Stack:', errorObj.stack || 'No stack trace');
                    console.groupEnd();
                }
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : String(err));
                    setIsInitializing(false);
                }
                console.groupEnd();
            }
        };
        init();
        return () => { cancelled = true; };
    }, []);
    const login = useCallback(async () => {
        if (!sdk) {
            console.error('[OAuth Login] ✗ Cannot login: SDK not initialized');
            return;
        }
        console.group('[OAuth Login] Starting Login Flow');
        console.log('[OAuth Login] Initiating OAuth redirect...');
        try {
            setError(null);
            await sdk.initialize();
            console.log('[OAuth Login] ✓ OAuth redirect initiated');
            console.log('[OAuth Login] User will be redirected to UiPath login page');
            const authenticated = sdk.isAuthenticated();
            setIsAuthenticated(authenticated);
            console.log('[OAuth Login] Post-initialization auth status:', authenticated);
            console.groupEnd();
        } catch (err) {
            console.error('[OAuth Login] ✗ Login failed');
            console.error('[OAuth Login] Error:', err);
            setError(err instanceof Error ? err.message : String(err));
            console.groupEnd();
        }
    }, [sdk]);
    const logout = useCallback(() => {
        if (!sdk) {
            console.warn('[OAuth Logout] SDK not initialized');
            return;
        }
        console.group('[OAuth Logout] Logging Out');
        console.log('[OAuth Logout] Clearing authentication state...');
        sdk.logout();
        setIsAuthenticated(false);
        setError(null);
        console.log('[OAuth Logout] ✓ Logout complete');
        console.log('[OAuth Logout] User must login again to access protected resources');
        console.groupEnd();
    }, [sdk]);
    return (
        <AuthContext.Provider value={{ sdk, isAuthenticated, isInitializing, error, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
export function useAuth(): AuthContextType {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return ctx;
}