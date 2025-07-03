// src/types/next-router.d.ts

declare module 'next/server' {
  interface RequestContext {
    params: {
      id: string; // Add any other dynamic segments here, e.g., slug: string
    };
  }
}