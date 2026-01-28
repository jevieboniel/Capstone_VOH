import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAllRoutes } from '../config/routes';
import MainLayout from './Layout/MainLayout';
import Login from './Pages/Login';
import Dashboard from './Pages/Dashboard';
import Users from './Pages/Users';
import Children from './Pages/Children';
import Development from './Pages/Development';
import Alerts from './Pages/Alerts';
import Donations from './Pages/Donations';
import Reports from './Pages/Reports';


// Placeholder components for other routes
// const Users = () => <div className="p-6"><h1 className="text-2xl font-bold">Users Management</h1></div>;
const Settings = () => <div className="p-6"><h1 className="text-2xl font-bold">Settings</h1></div>;
const Profile = () => <div className="p-6"><h1 className="text-2xl font-bold">User Profile</h1></div>;

// Component mapping
const componentMap = {
  Dashboard,
  Children,
  Development,
  Alerts,
  Donations,
  Reports,
  Users,
  Settings,
  Profile
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  return !user ? children : <Navigate to="/dashboard" />;
};

const AppRouter = () => {
  const allRoutes = getAllRoutes();

  return (
    <MainLayout>
      <Routes>
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        
        {allRoutes.map((route) => {
          const Component = componentMap[route.component];
          
          return (
            <Route 
              key={route.path}
              path={route.path} 
              element={
                <ProtectedRoute>
                  {Component ? <Component /> : <div>Component not found: {route.component}</div>}
                </ProtectedRoute>
              } 
            />
          );
        })}
        
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </MainLayout>
  );
};

export default AppRouter;
