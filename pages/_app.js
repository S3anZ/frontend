import Head from 'next/head';
import Script from 'next/script';
import { useEffect } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Initialize any global JavaScript that needs to run after React hydration
    if (typeof window !== 'undefined') {
      // Add any global initialization code here

      // Dev-only: Suppress noisy React DOM client stack traces in console
      if (process.env.NODE_ENV === 'development') {
        const ENABLE_SUPPRESSION = false; // set to true to re-enable filtering
        if (ENABLE_SUPPRESSION) {
          const originalError = console.error;
          const originalWarn = console.warn;

          // Patterns that frequently appear in React DOM dev stacks for commit/mutation phases
          const IGNORED_PATTERNS = [
            /react-dom-client\.development\.js/i,
            /scheduler\.development\.js/i,
            /commit(Delete|Mutation)EffectsOnFiber/i,
            /recursivelyTraverse(Mutation|Deletion)Effects/i,
            /flushMutationEffects/i,
          ];

          const shouldIgnore = (args) => {
            try {
              const combined = args
                .map((a) =>
                  typeof a === 'string'
                    ? a
                    : a && (a.stack || a.message || JSON.stringify(a))
                )
                .join(' ');
              return IGNORED_PATTERNS.some((re) => re.test(combined));
            } catch (_) {
              return false;
            }
          };

          console.error = (...args) => {
            if (shouldIgnore(args)) return;
            originalError(...args);
          };

          console.warn = (...args) => {
            if (shouldIgnore(args)) return;
            originalWarn(...args);
          };

          // Cleanup: restore original console methods on unmount or hot-reload
          return () => {
            console.error = originalError;
            console.warn = originalWarn;
          };
        }
      }
    }
  }, []);

  return (
    <AuthProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="generator" content="Next.js" />
      </Head>
      
      <Component {...pageProps} />
    </AuthProvider>
  );
}
