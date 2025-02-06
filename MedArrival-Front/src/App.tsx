import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthGuard from "./AuthGuard";
import { Suspense } from "react";
import { adminRoutes, publicRoutes } from "./routes/routes";
import Layout from "./layout/Layout";
import { Toaster } from "react-hot-toast";
import { DarkModeProvider } from "./contexts/DarkModeContext";

import "./i18n/config";
import { PageLoader } from "./components/layout/PageLoader";

function App() {

  return (
    <DarkModeProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>

          {/* Public Routes */}
          {publicRoutes.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={
                <Suspense fallback={<PageLoader />}>
                  {element}
                </Suspense>
              }
            />
          ))}

          {/* Admin Routes */}
          {adminRoutes.map(({ path, element, role }) => (
            <Route
              key={path}
              path={path}
              element={
                <AuthGuard allowedRoles={[role]}>
                  <Layout>
                    <Suspense fallback={<PageLoader />}>
                      {element}
                    </Suspense>
                  </Layout>
                </AuthGuard>
              }
            />
          ))}

          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </BrowserRouter>
    </DarkModeProvider>
  );
}

export default App;