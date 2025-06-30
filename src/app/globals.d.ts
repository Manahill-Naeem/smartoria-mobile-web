// globals.d.ts

// Extend the Window interface to include global properties,
// which are typically accessed as window.__app_id etc.
// This is good practice for browser-specific globals.
interface Window {
  __app_id: string | undefined;
  __firebase_config: string | undefined;
  __initial_auth_token: string | undefined;
}

// Additionally, declare them as global 'var' if they are sometimes accessed
// directly without the 'window.' prefix (as is the case in CartContext.tsx and API routes).
// This tells TypeScript that these variables exist directly in the global scope.
declare var __app_id: string | undefined;
declare var __firebase_config: string | undefined;
declare var __initial_auth_token: string | undefined;
