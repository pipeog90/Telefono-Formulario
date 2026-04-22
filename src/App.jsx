import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { ListsProvider } from './context/ListsContext';
import Layout from './components/Layout';
import { AuthProvider } from './context/AuthContext';

// Lazy-loaded pages for code splitting
const Login = React.lazy(() => import('./pages/Login'));
const Registro = React.lazy(() => import('./pages/Registro'));
const Admin = React.lazy(() => import('./pages/Admin'));
const Reportes = React.lazy(() => import('./pages/Reportes'));
const Users = React.lazy(() => import('./pages/Users'));

const PageLoader = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
        <div style={{ width: '2rem', height: '2rem', border: '3px solid #E8F5E9', borderTopColor: '#66BB6A', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
);

function App() {
    return (
        <AuthProvider>
            <ListsProvider>
                <Router>
                    <Suspense fallback={<PageLoader />}>
                        <Routes>
                            <Route path="/login" element={<Login />} />

                            {/* Protected Routes wrapped in Layout */}
                            <Route element={<Layout />}>
                                <Route path="/" element={
                                    <ProtectedRoute>
                                        <Registro />
                                    </ProtectedRoute>
                                } />

                                <Route path="/admin" element={
                                    <ProtectedRoute adminOnly={true}>
                                        <Admin />
                                    </ProtectedRoute>
                                } />

                                <Route path="/reportes" element={
                                    <ProtectedRoute>
                                        <Reportes />
                                    </ProtectedRoute>
                                } />

                                <Route path="/users" element={
                                    <ProtectedRoute adminOnly={true}>
                                        <Users />
                                    </ProtectedRoute>
                                } />
                            </Route>

                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </Suspense>
                </Router>
            </ListsProvider>
        </AuthProvider>
    );
}

export default App;
