import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";

import { routesData } from "./data/routesData";

export default function App() {
  
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>

      <Routes>

        <Route element={<Layout />}>

          {routesData.map((route) => {

            const Component = route.component;

            return (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <ProtectedRoute
                    permission={route.permission}
                  >
                    <Component />
                  </ProtectedRoute>
                }
              />
            );

          })}

        </Route>

        <Route
          path="/login"
          element={<Login />}
        />

      </Routes>

    </BrowserRouter>
  );
}