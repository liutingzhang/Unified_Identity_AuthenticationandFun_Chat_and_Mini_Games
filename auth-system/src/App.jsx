import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import AddUser from './pages/AddUser';
import BatchImport from './pages/BatchImport';
import PermissionManagement from './pages/PermissionManagement';
import RoleManagement from './pages/RoleManagement';
import SystemLog from './pages/SystemLog';
import SystemManagement from './pages/SystemManagement';

import EditUser from './pages/EditUser';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './pages/Profile';
import RandomDrawPage from './pages/RandomDrawPage';
import RollCallPage from './pages/RollCallPage';
import VoteSystem from './pages/VoteSystem';
import { useAuth } from './context/AuthContext';


function App() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === '超级管理员';

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={<ProtectedRoute />}>
        <Route path="" element={isSuperAdmin ? <Dashboard /> : <Navigate to="/profile" replace />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="users/add" element={<AddUser />} />
        <Route path="users/edit/:userId" element={<EditUser />} />
        <Route path="users/import" element={<BatchImport />} />
        <Route path="roles" element={<RoleManagement />} />
        <Route path="permissions" element={<PermissionManagement />} />
        <Route path="logs" element={<SystemLog />} />
        <Route path="system" element={<SystemManagement />} />
        <Route path="random-draw" element={<RandomDrawPage />} />
        <Route path="roll-call" element={<RollCallPage />} />
        <Route path="vote-system" element={<VoteSystem />} />

        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
