import React, { useState, useEffect } from 'react';
import { auth, firestore, doc, setDoc } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { Phone, User, Shield, Check } from 'lucide-react';
import CallForm from '../../angel-phone/src/components/CallForm';
import Button from '../components/ui/Button'; // Assuming Button component exists or import from correct path
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

import { useAuth } from '../context/AuthContext';

const Registro = () => {
    const navigate = useNavigate();
    const { user } = useAuth(); // User is already loaded by ProtectedRoute

    // Redundant check, but safe
    if (!user) return null;

    return (
        <div className="registro-page">
            <div className="registro-container">

                {/* Header */}
                <header className="registro-header">
                    <div className="header-left">
                        <div className="header-icon">
                            <Phone size={24} />
                        </div>
                        <div>
                            <h1 className="page-title">Registro de Llamadas</h1>
                            <p className="user-welcome">Bienvenido, <span className="user-name">{user.name}</span></p>
                        </div>
                    </div>
                </header>

                {/* Main Form Integrated */}
                <CallForm user={user} />
            </div>
        </div>
    );
};

export default Registro;
