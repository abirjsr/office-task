// import {StrictMode} from 'react';
// import {createRoot} from 'react-dom/client';
// import { ClerkProvider } from '@clerk/clerk-react';
// import App from './App.tsx';
// import './index.css';

// const PUBLISHABLE_KEY = "pk_test_bG92ZWQtc2tpbmstMTQuY2xlcmsuYWNjb3VudHMuZGV2JA";
// console.log("Clerk Publishable Key detected:", PUBLISHABLE_KEY ? "Present" : "Missing");
// const isValidKey = PUBLISHABLE_KEY && (PUBLISHABLE_KEY.startsWith('pk_test_') || PUBLISHABLE_KEY.startsWith('pk_live_'));

// const MissingKeyOverlay = () => (
//   <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
//     <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
//       <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
//         <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
//       </div>
//       <h1 className="text-2xl font-bold text-white mb-4">Invalid Configuration</h1>
//       <p className="text-slate-400 mb-8 leading-relaxed">
//         The <strong>Clerk Publishable Key</strong> is missing or invalid. 
//         Please update your environment variables in the platform settings:
//       </p>
//       <div className="bg-slate-950 rounded-lg p-4 mb-8 font-mono text-sm text-indigo-400 border border-slate-800 break-all text-left">
//         <span className="text-slate-500"># Expected format:</span><br/>
//         VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
//       </div>
//       {PUBLISHABLE_KEY && !isValidKey && (
//         <div className="mb-8 p-3 bg-rose-500/5 border border-rose-500/20 rounded-lg text-xs text-rose-400">
//           Current value: <code className="bg-rose-500/10 px-1 rounded">{PUBLISHABLE_KEY}</code>
//         </div>
//       )}
//       <a 
//         href="https://dashboard.clerk.com/last-active?path=api-keys" 
//         target="_blank" 
//         rel="noopener noreferrer"
//         className="inline-flex items-center justify-center w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all"
//       >
//         Get Your Clerk Key
//       </a>
//     </div>
//   </div>
// );

// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     {isValidKey ? (
//       <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
//         <App />
//       </ClerkProvider>
//     ) : (
//       <MissingKeyOverlay />
//     )}
//   </StrictMode>,
// );
// import {StrictMode} from 'react';
// import {createRoot} from 'react-dom/client';
// import { ClerkProvider } from '@clerk/clerk-react';
// import App from './App.tsx';
// import './index.css';

// const PUBLISHABLE_KEY = "pk_test_bG92ZWQtc2tpbmstMTQuY2xlcmsuYWNjb3VudHMuZGV2JA";
// console.log("Clerk Publishable Key detected:", PUBLISHABLE_KEY ? "Present" : "Missing");
// const isValidKey = PUBLISHABLE_KEY && (PUBLISHABLE_KEY.startsWith('pk_test_') || PUBLISHABLE_KEY.startsWith('pk_live_'));

// const MissingKeyOverlay = () => (
//   <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
//     <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
//       <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
//         <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
//       </div>
//       <h1 className="text-2xl font-bold text-white mb-4">Invalid Configuration</h1>
//       <p className="text-slate-400 mb-8 leading-relaxed">
//         The <strong>Clerk Publishable Key</strong> is missing or invalid. 
//       </p>
//       <div className="bg-slate-950 rounded-lg p-4 mb-8 font-mono text-sm text-indigo-400 border border-slate-800 break-all text-left">
//         <span className="text-slate-500"># Expected format:</span><br/>
//         VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
//       </div>
//       <a 
//         href="https://dashboard.clerk.com/last-active?path=api-keys" 
//         target="_blank" 
//         rel="noopener noreferrer"
//         className="inline-flex items-center justify-center w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all"
//       >
//         Get Your Clerk Key
//       </a>
//     </div>
//   </div>
// );

// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     {isValidKey ? (
//       <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
//         <App />
//       </ClerkProvider>
//     ) : (
//       <MissingKeyOverlay />
//     )}
//   </StrictMode>,
// );


import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App.tsx';
import './index.css';

const PUBLISHABLE_KEY = "pk_test_bG92ZWQtc2tpbmstMTQuY2xlcmsuYWNjb3VudHMuZGV2JA";
console.log("Clerk Publishable Key detected:", PUBLISHABLE_KEY ? "Present" : "Missing");
const isValidKey = PUBLISHABLE_KEY && (PUBLISHABLE_KEY.startsWith('pk_test_') || PUBLISHABLE_KEY.startsWith('pk_live_'));

const MissingKeyOverlay = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
    <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
      <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
      </div>
      <h1 className="text-2xl font-bold text-white mb-4">Invalid Configuration</h1>
      <p className="text-slate-400 mb-8 leading-relaxed">
        The <strong>Clerk Publishable Key</strong> is missing or invalid. 
        Please update your environment variables in the platform settings:
      </p>
      <div className="bg-slate-950 rounded-lg p-4 mb-8 font-mono text-sm text-indigo-400 border border-slate-800 break-all text-left">
        <span className="text-slate-500"># Expected format:</span><br/>
        VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
      </div>
      {PUBLISHABLE_KEY && !isValidKey && (
        <div className="mb-8 p-3 bg-rose-500/5 border border-rose-500/20 rounded-lg text-xs text-rose-400">
          Current value: <code className="bg-rose-500/10 px-1 rounded">{PUBLISHABLE_KEY}</code>
        </div>
      )}
      <a 
        href="https://dashboard.clerk.com/last-active?path=api-keys" 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all"
      >
        Get Your Clerk Key
      </a>
    </div>
  </div>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isValidKey ? (
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <App />
      </ClerkProvider>
    ) : (
      <MissingKeyOverlay />
    )}
  </StrictMode>,
);