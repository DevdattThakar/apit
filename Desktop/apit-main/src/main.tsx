import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { toast } from "@/components/ui/sonner";

// ═══════════════════════════════════════════════════════════════════════════════
// Session Initialization & Error Handling
// ═══════════════════════════════════════════════════════════════════════════════

// Get Supabase URL from environment
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const getAuthTokenKey = () => 'sb-' + SUPABASE_URL.split('://')[1] + '-auth-token';

// Check and clear invalid/expired sessions on startup
const initializeSession = async () => {
    const tokenKey = getAuthTokenKey();
    const storedData = localStorage.getItem(tokenKey);

    if (storedData) {
        try {
            const parsed = JSON.parse(storedData);
            // Check if we have a refresh token
            if (!parsed?.refresh_token) {
                // No refresh token, session is invalid - clear it
                console.log('Clearing invalid session (no refresh token)');
                localStorage.removeItem(tokenKey);
                return;
            }

            // Check if the token is expired
            const expiresAt = parsed?.expires_at;
            if (expiresAt && parseInt(expiresAt) * 1000 < Date.now()) {
                console.log('Session expired, clearing...');
                localStorage.removeItem(tokenKey);
                toast.info('Your previous session has expired. Please log in again.');
            }
        } catch (e) {
            // Invalid JSON, clear it
            console.warn('Clearing corrupted session data');
            localStorage.removeItem(tokenKey);
        }
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// PERFORMANCE OPTIMIZATION: Conditional & Deferred Loading
// ═══════════════════════════════════════════════════════════════════════════════

// Listen for Supabase auth errors and show notification
window.addEventListener('supabase:auth:error', (event: Event) => {
    const customEvent = event as CustomEvent;
    toast.error(customEvent.detail?.message || 'Session expired. Please log in again.');
});

// Initialize session on app load
initializeSession();

// Register Service Worker for PWA and offline support
const registerServiceWorker = () => {
    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            navigator.serviceWorker
                .register("/sw.js")
                .then((registration) => {
                    console.log("SW registered:", registration.scope);
                })
                .catch((error) => {
                    console.log("SW registration failed:", error);
                });
        });
    }
};

// Load Bootstrap asynchronously to avoid render-blocking
// Only load on devices that need it (not recommended for this app, but kept for compatibility)
const loadBootstrap = () => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css";
    link.integrity = "sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH";
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js";
    script.integrity = "sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz";
    script.crossOrigin = "anonymous";
    document.body.appendChild(script);
};

// Lazy load Bootstrap only when needed (after initial page load)
if (typeof window !== "undefined") {
    registerServiceWorker();
    if (requestIdleCallback) {
        requestIdleCallback(() => loadBootstrap(), { timeout: 2000 });
    } else {
        setTimeout(() => loadBootstrap(), 2000);
    }
}

createRoot(document.getElementById("root")!).render(<App />);
