import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Admin from './pages/Admin';
import Reportes from './pages/Reportes';
import Users from './pages/Users';
import ProtectedRoute from './components/ProtectedRoute';

import { ListsProvider } from './context/ListsContext';

import Layout from './components/Layout';

import { AuthProvider } from './context/AuthContext';

function App() {
    return (
        <AuthProvider>
            <ListsProvider>
                <Router>
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
                </Router>
            </ListsProvider>
        </AuthProvider>
    );
}

export default App;
