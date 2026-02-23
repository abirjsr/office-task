// import React from 'react';
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { Toaster } from 'react-hot-toast';
// import { SignedIn, SignedOut, SignIn, SignUp } from '@clerk/clerk-react';
// import { AuthProvider } from './context/AuthContext';
// import { Layout } from './components/Layout';
// import { Dashboard } from './pages/Dashboard';
// import { Admins } from './pages/Admins';
// import { Departments } from './pages/Departments';
// import { Memorandums } from './pages/Memorandums';
// import { HRManagement } from './pages/HRManagement';
// import { Tasks } from './pages/Tasks';
// import { Employees } from './pages/Employees';
// import { EmailSystem } from './pages/EmailSystem';

// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       refetchOnWindowFocus: false,
//       retry: 1,
//     },
//   },
// });

// export default function App() {
//   return (
//     <QueryClientProvider client={queryClient}>
//       <AuthProvider>
//         <BrowserRouter>
//           <Routes>
//             <Route 
//               path="/sign-in/*" 
//               element={
//                 <div className="min-h-screen flex items-center justify-center bg-slate-950">
//                   <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
//                 </div>
//               } 
//             />
//             <Route 
//               path="/sign-up/*" 
//               element={
//                 <div className="min-h-screen flex items-center justify-center bg-slate-950">
//                   <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
//                 </div>
//               } 
//             />
//             <Route
//               path="/"
//               element={
//                 <>
//                   <SignedIn>
//                     <Layout />
//                   </SignedIn>
//                   <SignedOut>
//                     <Navigate to="/sign-in" replace />
//                   </SignedOut>
//                 </>
//               }
//             >
//               <Route index element={<Dashboard />} />
//               <Route path="admins" element={<Admins />} />
//               <Route path="departments" element={<Departments />} />
//               <Route path="memorandums" element={<Memorandums />} />
//               <Route path="hr" element={<HRManagement />} />
//               <Route path="tasks" element={<Tasks />} />
//               <Route path="employees" element={<Employees />} />
//               <Route path="email" element={<EmailSystem />} />
//             </Route>
//           </Routes>
//         </BrowserRouter>
//         <Toaster 
//           position="top-right"
//           toastOptions={{
//             style: {
//               background: '#0f172a',
//               color: '#f8fafc',
//               border: '1px solid #1e293b',
//             },
//           }}
//         />
//       </AuthProvider>
//     </QueryClientProvider>
//   );
// }
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { SignedIn, SignedOut, SignIn, SignUp } from '@clerk/clerk-react';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Admins } from './pages/Admins';
import { Departments } from './pages/Departments';
import { Memorandums } from './pages/Memorandums';
import { HRManagement } from './pages/HRManagement';
import { Tasks } from './pages/Tasks';
import { Employees } from './pages/Employees';
import { EmailSystem } from './pages/EmailSystem';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route 
              path="/sign-in/*" 
              element={
                <div className="min-h-screen flex items-center justify-center bg-slate-950">
                  <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
                </div>
              } 
            />
            <Route 
              path="/sign-up/*" 
              element={
                <div className="min-h-screen flex items-center justify-center bg-slate-950">
                  <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
                </div>
              } 
            />
            <Route
              path="/"
              element={
                <>
                  <SignedIn>
                    <Layout />
                  </SignedIn>
                  <SignedOut>
                    <Navigate to="/sign-in" replace />
                  </SignedOut>
                </>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="admins" element={<Admins />} />
              <Route path="departments" element={<Departments />} />
              <Route path="memorandums" element={<Memorandums />} />
              <Route path="hr" element={<HRManagement />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="employees" element={<Employees />} />
              <Route path="email" element={<EmailSystem />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#0f172a',
              color: '#f8fafc',
              border: '1px solid #1e293b',
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}