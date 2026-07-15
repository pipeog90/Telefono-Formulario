import React, { useState, useEffect } from 'react';
import { problemCategories } from '../data/initialData';
import { fieldConfig } from '../data/fieldConfig';
import { useLists } from '../hooks/useLists';
import Card from './ui/Card';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';
import { db, firestore, doc, getDoc, onSnapshot } from '../../../src/services/firebase';
import { getFieldStatus, RULE_OBL, RULE_OPC, RULE_NH, GLOBAL_OBLIGATORIOS, isTerceroRequired, isRelacionadoRequired } from '../../../src/config/fieldRules';

const CallForm = ({ user }) => {
    const { lists: rawLists, loading: listsLoading } = useLists();

    // Filter out inactive items for the form
    const initialDropdowns = React.useMemo(() => {
        if (!rawLists) return {};
        const filtered = {};
        const isOrientador = user && user.role === 'user';

        Object.keys(rawLists).forEach(key => {
            let items = rawLists[key].filter(item => item.active !== false);

            if (key === 'MEDIO_CONTACTO' && isOrientador) {
                // Filter out 'Atendido en sede' (2) and 'Por correo' (4 in user spec, but check list)
                // Current list: 2 - Atendido en sede, 3 - Por email. Reference said 4 is something else?
                // Wait, initialData says 3 is Email. 
                // Previous logic filtered '2' and '4'. In my new seedData, 4 is missing from MedioContacto?
                // CSV has: 1, 2, 3, 7, 8. No 4.
                // So filtering '4' might be legacy. Filtering '2' is definitely Sede.
                // I'll filter by checking if it starts with "2".
                items = items.filter(item => !item.value.startsWith('2'));
            }

            filtered[key] = items;
        });
        return filtered;
    }, [rawLists, user]);

    // Blank form template – used for reset and as default state
    const blankForm = () => ({
        L_ID_Llamada: 'Cargando...',
        L_Orientador: '',
        L_Medio_Contacto: '',
        L_Como_Conoce: '',
        U_Sexo: '',
        U_Edad: '',
        U_Estado_Civil: '',
        U_Convive: '',
        U_Asiduidad: '',
        U_Problematica_1: '', U_Problema_1: '',
        U_Problematica_2: '', U_Problema_2: '',
        U_Problematica_3: '', U_Problema_3: '',
        U_Naturaleza: '',
        U_Inicio: '',
        U_Actitud_Orientador: '',
        U_Presentacion: '',
        U_Paralenguaje: '',
        U_Procedencia: '',
        U_Peticion: '',
        U_Actitud_Problema_1: '',
        U_Actitud_Problema_2: '',
        U_Cond_Socioeconomica: '',
        L_Llamada_Derivada: '',
        T_Sexo_Tercero: '',
        T_Edad_Tercero: '',
        T_Estado_Civil_Tercero: '',
        T_Convive: '',
        T_Relacion: '',
        R_Sexo_Relacionado: '',
        R_Edad_Relacionado: '',
        R_Estado_Civil_Relacionado: '',
        R_Convive: '',
        R_Relacion: '',
        T_Problematica_1: '', T_Problema_1: '',
        T_Problematica_2: '', T_Problema_2: '',
        T_Problematica_3: '', T_Problema_3: '',
        R_Problematica_1: '', R_Problema_1: '',
        R_Problematica_2: '', R_Problema_2: '',
        R_Problematica_3: '', R_Problema_3: '',
        T_Actitud_Problema_1: '',
        T_Actitud_Problema_2: '',
        L_Hora: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        L_Fecha: new Date().toISOString().split('T')[0],
        L_Resultado: '',
        L_Duracion: '',
        O_Clave: '',
        O_Autoevaluacion: '',
        O_Volvera_Llamar: '',
        O_Nivel_Ayuda_1: '', O_Nivel_Ayuda_2: '',
        O_Sentimientos_1: '', O_Sentimientos_2: '', O_Sentimientos_3: '',
        O_Actitud_Equivocada_1: '', O_Actitud_Equivocada_2: '',
        O_Satisfaccion_1: '', O_Satisfaccion_2: '',
        L_Sintesis: ''
    });

    // State for form data — restore draft from localStorage if one exists
    const [formData, setFormData] = useState(() => {
        try {
            const draft = sessionStorage.getItem('callFormDraft');
            if (draft) return { ...blankForm(), ...JSON.parse(draft) };
        } catch (_) { }
        return blankForm();
    });

    // Persist form data to localStorage on every change (except user-specific fields)
    useEffect(() => {
        const { L_Orientador, O_Clave, ...draftData } = formData;
        sessionStorage.setItem('callFormDraft', JSON.stringify(draftData));
    }, [formData]);

    // Always keep user-dependent fields in sync with logged-in user
    useEffect(() => {
        if (user && user.name) {
            setFormData(prev => ({
                ...prev,
                L_Orientador: user.name,
                O_Clave: user.Clave || ''
            }));
        }
    }, [user]);

    useEffect(() => {
        const counterRef = doc(firestore, "counters", "calls");
        
        const unsubscribe = onSnapshot(counterRef, (snapshot) => {
            if (snapshot.exists()) {
                const nextId = snapshot.data().nextId || 1;
                
                const currentYear = new Date().getFullYear();
                const offset = currentYear - 2026;
                const index = 10 + Math.max(0, offset); // 10 is 'AK'
                const firstLetter = String.fromCharCode(65 + Math.floor(index / 26));
                const secondLetter = String.fromCharCode(65 + (index % 26));
                const prefix = `${firstLetter}${secondLetter}`;
                const formattedId = `${prefix}${String(nextId).padStart(4, '0')}`;
                
                setFormData(prev => ({ ...prev, L_ID_Llamada: formattedId }));
            }
        }, (error) => {
            console.error("Error watching counter:", error);
        });

        return () => unsubscribe();
    }, []);

    // Clear values of fields that become disabled (NH) when the problem changes
    useEffect(() => {
        const problemCode = formData.U_Problema_1;
        
        // Reset missing fields highlight when the problem changes
        setMissingFieldsList([]);
        if (errorMessage) setErrorMessage('');
        
        setFormData(prev => {
            let changed = false;
            const nextData = { ...prev };
            
            const excludedFields = [
                'O_Clave', 'L_ID_Llamada',
                'U_Problematica_1', 'U_Problema_1', 'U_Problematica_2', 'U_Problema_2', 'U_Problematica_3', 'U_Problema_3',
                'T_Problematica_1', 'T_Problema_1', 'T_Problematica_2', 'T_Problema_2', 'T_Problematica_3', 'T_Problema_3',
                'R_Problematica_1', 'R_Problema_1', 'R_Problematica_2', 'R_Problema_2', 'R_Problematica_3', 'R_Problema_3'
            ];

            Object.keys(nextData).forEach(field => {
                // Only evaluate dynamic U_ and O_ fields (exclude global ones)
                if ((field.startsWith('U_') || field.startsWith('O_') || field.startsWith('T_') || field.startsWith('R_')) && !excludedFields.includes(field)) {
                    const status = getFieldStatus(problemCode, field);
                    if (status === RULE_NH && nextData[field] !== '') {
                        nextData[field] = '';
                        changed = true;
                    }
                }
            });
            
            return changed ? nextData : prev;
        });
    }, [formData.U_Problema_1]);

    // Reset all fields (with confirmation)
    const handleReset = () => {
        if (window.confirm('¿Está seguro de que desea iniciar una nueva llamada? Se perderán todos los datos no guardados.')) {
            sessionStorage.removeItem('callFormDraft');
            setFormData({
                ...blankForm(),
                L_Orientador: user?.name || '',
                O_Clave: user?.Clave || ''
            });
            setErrorMessage('');
            setMissingFieldsList([]);
            setSuccessMessage('');
            window.scrollTo(0, 0);
        }
    };

    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [missingFieldsList, setMissingFieldsList] = useState([]);

    // Helper to get tooltip text for a field
    const tip = (fieldId) => fieldConfig[fieldId]?.description || '';

    const handleChange = React.useCallback((e) => {
        const { id, value } = e.target;
        
        // Clear validation highlights and errors on any manual user change
        setMissingFieldsList(prev => prev.length > 0 ? [] : prev);
        setErrorMessage(prev => prev ? '' : prev);
        
        const config = fieldConfig[id];
        let sanitized = value;
        if (config && config.maxLength && typeof value === 'string') {
            sanitized = value.slice(0, config.maxLength);
        }
        setFormData(prev => {
            const nextData = { ...prev, [id]: sanitized };
            // Clear dependent problems when problematica changes
            if (id === 'U_Problematica_1') nextData.U_Problema_1 = '';
            if (id === 'U_Problematica_2') nextData.U_Problema_2 = '';
            if (id === 'U_Problematica_3') nextData.U_Problema_3 = '';
            if (id === 'T_Problematica_1') nextData.T_Problema_1 = '';
            if (id === 'T_Problematica_2') nextData.T_Problema_2 = '';
            if (id === 'T_Problematica_3') nextData.T_Problema_3 = '';
            if (id === 'R_Problematica_1') nextData.R_Problema_1 = '';
            if (id === 'R_Problematica_2') nextData.R_Problema_2 = '';
            if (id === 'R_Problematica_3') nextData.R_Problema_3 = '';
            return nextData;
        });
    }, []);

    // Helper to get problems based on selected problematica category
    const getProblems = (categoryCode, excludeProblems = []) => {
        if (!categoryCode || !initialDropdowns['PROBLEMA']) return [];
        return initialDropdowns['PROBLEMA']
            .filter(item => item.value.startsWith(categoryCode) && !excludeProblems.includes(item.value))
            .map(item => ({
                value: item.value,
                label: item.label
            }));
    };

    // Generic helper to get options and exclude previously selected ones
    const getFilteredOptions = (listName, excludeItems = []) => {
        if (!initialDropdowns[listName]) return [];
        return initialDropdowns[listName]
            .filter(item => !excludeItems.includes(item.value))
            .map(item => ({
                value: item.value,
                label: item.label
            }));
    };

    // Helper to get problematica options
    const problematicaOptions = (initialDropdowns['PROBLEMATICA'] || []).map(item => ({
        value: item.value,
        label: item.label
    }));

    const handleSubmit = async (e) => {
        e.preventDefault();

        const problemCode = formData.U_Problema_1; // The main problem dictates the rules
        const missingFields = [];

        // 1. Check GLOBAL_OBLIGATORIOS
        GLOBAL_OBLIGATORIOS.forEach(field => {
            if (!formData[field]) missingFields.push(field);
        });

        // 2. Check dynamic fields based on fieldRules
        const allKeys = Object.keys(blankForm());
        allKeys.forEach(field => {
            if (!GLOBAL_OBLIGATORIOS.includes(field) && !['L_Orientador', 'O_Clave'].includes(field)) {
                if (field.startsWith('U_') || field.startsWith('O_')) {
                    const status = getFieldStatus(problemCode, field);
                    if (status === RULE_OBL && !formData[field]) {
                        missingFields.push(field);
                    }
                }
            }
        });

        // 3. Check Tercero and Relacionado mandatory blocks
        if (isTerceroRequired(problemCode)) {
            ['T_Sexo_Tercero', 'T_Edad_Tercero', 'T_Estado_Civil_Tercero', 'T_Convive', 'T_Relacion', 'T_Problematica_1', 'T_Problema_1'].forEach(f => {
                if (!formData[f]) missingFields.push(f);
            });
        }

        if (isRelacionadoRequired(problemCode)) {
            ['R_Sexo_Relacionado', 'R_Edad_Relacionado', 'R_Estado_Civil_Relacionado', 'R_Convive', 'R_Relacion', 'R_Problematica_1', 'R_Problema_1'].forEach(f => {
                if (!formData[f]) missingFields.push(f);
            });
        }

        if (missingFields.length > 0) {
            setErrorMessage(`Para registrar la llamada es necesario completar los campos obligatorios. Faltan: ${missingFields.length} campos.`);
            setMissingFieldsList(missingFields);
            window.scrollTo(0, 0);
            return;
        }

        // Clear error state on successful validation
        setErrorMessage('');
        setMissingFieldsList([]);

        setLoading(true);
        try {
            // Strip empty fields to save Firestore space
            const cleanData = {};
            for (const [key, value] of Object.entries(formData)) {
                if (value !== '' && value !== null && value !== undefined) {
                    cleanData[key] = value;
                }
            }
            // Add the L_Orientador UID for future reporting/filtering
            if (user && user.uid) {
                cleanData.orientadorUid = user.uid;
            }
            if (user && (user.Código_Orientador || user.codigo_orientador)) {
                cleanData.L_Codigo_Orientador = user.Código_Orientador || user.codigo_orientador;
            }

            const result = await db.addCall(cleanData);
            const callId = result?.L_ID_Llamada;
            setSuccessMessage(`Llamada registrada correctamente.${callId ? ` ID: ${callId}` : ''}`);
            sessionStorage.removeItem('callFormDraft');

            // Reset form to initial state
            setFormData({
                ...blankForm(),
                L_Orientador: user?.name || '',
                O_Clave: user?.Clave || ''
            });

            window.scrollTo(0, 0);
        } catch (error) {
            console.error("Error adding document: ", error);
            alert("Error al registrar la llamada: " + (error.message || 'Intente de nuevo.'));
        } finally {
            setLoading(false);
        }
    };

    if (listsLoading) {
        return <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>Cargando formulario...</div>;
    }

    const problemCode = formData.U_Problema_1;
    const isFieldOBL = (field) => getFieldStatus(problemCode, field) === RULE_OBL;
    const isFieldNH = (field) => getFieldStatus(problemCode, field) === RULE_NH;

    // Helper wrapper to avoid writing disabled={isFieldNH('...')} required={isFieldOBL('...')} everywhere
    const getFieldProps = (fieldName) => {
        return {
            disabled: (fieldName === 'L_Hora' || fieldName === 'L_Fecha') ? false : isFieldNH(fieldName),
            required: isFieldOBL(fieldName),
            error: missingFieldsList.includes(fieldName)
        };
    };

    return (
        <form onSubmit={handleSubmit} className="animate-fade-in">
            {successMessage && (
                <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1rem', borderColor: 'var(--color-success)', color: 'var(--color-success)' }}>
                    {successMessage}
                </div>
            )}

            {errorMessage && (
                <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1rem', borderColor: '#EF4444', color: '#EF4444', backgroundColor: '#FEF2F2' }}>
                    <strong>{errorMessage}</strong>
                </div>
            )}

            {/* HEADER SECTION */}
            <Card
                title="Datos Generales"
                headerAction={
                    <button
                        type="button"
                        onClick={handleReset}
                        style={{
                            background: 'linear-gradient(135deg, var(--sub-color-primary), var(--sub-color-secondary))',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '6px 14px',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(34,197,94,0.3)',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        ＋ Nueva llamada
                    </button>
                }
            >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ flex: '0 0 140px' }}>
                        <Input id="L_Codigo_Orientador" label="Código Orientador" value={user?.Código_Orientador || user?.codigo_orientador || ''} disabled />
                    </div>
                    <div style={{ flex: '0 0 120px' }}>
                        <Input id="L_ID" label="ID" value={formData.L_ID_Llamada} disabled tooltip="ID único de la llamada" />
                    </div>
                    <div style={{ flex: '1 1 200px' }}>
                        <Input id="L_Orientador" label="Orientador" value={formData.L_Orientador} disabled tooltip={tip('L_Orientador')} />
                    </div>
                    <div style={{ flex: '1 1 200px' }}>
                        <Select
                            id="L_Medio_Contacto"
                            label="Medio de Contacto"
                            options={initialDropdowns['MEDIO_CONTACTO']}
                            value={formData.L_Medio_Contacto}
                            onChange={handleChange}
                            required
                            error={missingFieldsList.includes('L_Medio_Contacto')}
                            tooltip={tip('L_Medio_Contacto')}
                        />
                    </div>
                    <div style={{ flex: '1 1 200px' }}>
                        <Select
                            id="L_Como_Conoce"
                            label="Cómo conoció el teléfono"
                            options={initialDropdowns['COMO_CONOCE']}
                            value={formData.L_Como_Conoce}
                            onChange={handleChange}
                            required
                            error={missingFieldsList.includes('L_Como_Conoce')}
                            tooltip={tip('L_Como_Conoce')}
                        />
                    </div>
                </div>
            </Card>

            {/* LLAMANTE SECTION */}
            <Card title="Llamante">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    <div style={{ flex: '1 1 200px' }}>
                        <Select id="U_Sexo" label={`Sexo ${isFieldOBL('U_Sexo') ? '*' : ''}`} options={initialDropdowns['SEXO']} value={formData.U_Sexo} onChange={handleChange} tooltip={tip('U_Sexo')} {...getFieldProps('U_Sexo')} />
                    </div>
                    <div style={{ flex: '1 1 200px' }}>
                        <Select id="U_Edad" label={`Edad ${isFieldOBL('U_Edad') ? '*' : ''}`} options={initialDropdowns['EDAD']} value={formData.U_Edad} onChange={handleChange} tooltip={tip('U_Edad')} {...getFieldProps('U_Edad')} />
                    </div>
                    <div style={{ flex: '1 1 200px' }}>
                        <Select id="U_Estado_Civil" label={`Estado Civil ${isFieldOBL('U_Estado_Civil') ? '*' : ''}`} options={initialDropdowns['ESTADO_CIVIL']} value={formData.U_Estado_Civil} onChange={handleChange} tooltip={tip('U_Estado_Civil')} {...getFieldProps('U_Estado_Civil')} />
                    </div>
                    <div style={{ flex: '1 1 200px' }}>
                        <Select id="U_Convive" label={`Convive ${isFieldOBL('U_Convive') ? '*' : ''}`} options={initialDropdowns['CONVIVE']} value={formData.U_Convive} onChange={handleChange} tooltip={tip('U_Convive')} {...getFieldProps('U_Convive')} />
                    </div>
                    <div style={{ flex: '1 1 200px' }}>
                        <Select id="U_Asiduidad" label={`Asiduidad ${isFieldOBL('U_Asiduidad') ? '*' : ''}`} options={initialDropdowns['ASIDUIDAD']} value={formData.U_Asiduidad} onChange={handleChange} tooltip={tip('U_Asiduidad')} {...getFieldProps('U_Asiduidad')} />
                    </div>
                </div>

                <div className="glass-panel mobile-scroll-wrapper" style={{ marginTop: '1px', padding: 'var(--card-padding)' }}>
                    <div className="mobile-min-w-600" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', alignItems: 'start' }}>
                        <h4 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Problemática (Máx 3)</h4>
                        <h4 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Problema (Máx 3)</h4>

                        <Select id="U_Problematica_1" options={problematicaOptions} value={formData.U_Problematica_1} onChange={handleChange} placeholder="Seleccionar..." required error={missingFieldsList.includes('U_Problematica_1')} />
                        <Select id="U_Problema_1" options={getProblems(formData.U_Problematica_1, [formData.U_Problema_2, formData.U_Problema_3])} value={formData.U_Problema_1} onChange={handleChange} placeholder="Seleccionar..." disabled={!formData.U_Problematica_1} required error={missingFieldsList.includes('U_Problema_1')} />

                        <Select id="U_Problematica_2" options={problematicaOptions} value={formData.U_Problematica_2} onChange={handleChange} placeholder="Seleccionar..." />
                        <Select id="U_Problema_2" options={getProblems(formData.U_Problematica_2, [formData.U_Problema_1, formData.U_Problema_3])} value={formData.U_Problema_2} onChange={handleChange} placeholder="Seleccionar..." disabled={!formData.U_Problematica_2} />

                        <Select id="U_Problematica_3" options={problematicaOptions} value={formData.U_Problematica_3} onChange={handleChange} placeholder="Seleccionar..." />
                        <Select id="U_Problema_3" options={getProblems(formData.U_Problematica_3, [formData.U_Problema_1, formData.U_Problema_2])} value={formData.U_Problema_3} onChange={handleChange} placeholder="Seleccionar..." disabled={!formData.U_Problematica_3} />
                    </div>
                </div>

                <div style={{ marginTop: '2px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '4px' }}>
                    <Select id="U_Naturaleza" label={`Naturaleza ${isFieldOBL('U_Naturaleza') ? '*' : ''}`} options={initialDropdowns['NATURALEZA']} value={formData.U_Naturaleza} onChange={handleChange} tooltip={tip('U_Naturaleza')} {...getFieldProps('U_Naturaleza')} />
                    <Select id="U_Inicio" label={`Inicio ${isFieldOBL('U_Inicio') ? '*' : ''}`} options={initialDropdowns['INICIO']} value={formData.U_Inicio} onChange={handleChange} tooltip={tip('U_Inicio')} {...getFieldProps('U_Inicio')} />
                    <Select id="U_Actitud_Orientador" label={`Actitud ante el Orientador ${isFieldOBL('U_Actitud_Orientador') ? '*' : ''}`} options={initialDropdowns['ACTITUD_ORIENTADOR']} value={formData.U_Actitud_Orientador} onChange={handleChange} tooltip={tip('U_Actitud_Orientador')} {...getFieldProps('U_Actitud_Orientador')} />
                    <Select id="U_Presentacion" label={`Presentación ${isFieldOBL('U_Presentacion') ? '*' : ''}`} options={initialDropdowns['PRESENTACION']} value={formData.U_Presentacion} onChange={handleChange} tooltip={tip('U_Presentacion')} {...getFieldProps('U_Presentacion')} />
                    <Select id="U_Paralenguaje" label={`Paralenguaje ${isFieldOBL('U_Paralenguaje') ? '*' : ''}`} options={initialDropdowns['PARALENGUAJE']} value={formData.U_Paralenguaje} onChange={handleChange} tooltip={tip('U_Paralenguaje')} {...getFieldProps('U_Paralenguaje')} />
                    <Select id="U_Procedencia" label={`Procedencia ${isFieldOBL('U_Procedencia') ? '*' : ''}`} options={initialDropdowns['PROCEDENCIA']} value={formData.U_Procedencia} onChange={handleChange} tooltip={tip('U_Procedencia')} {...getFieldProps('U_Procedencia')} />
                    <Select id="U_Peticion" label={`Petición ${isFieldOBL('U_Peticion') ? '*' : ''}`} options={initialDropdowns['PETICION']} value={formData.U_Peticion} onChange={handleChange} tooltip={tip('U_Peticion')} {...getFieldProps('U_Peticion')} />
                    <Select id="U_Cond_Socioeconomica" label={`Condición Socioeconómica ${isFieldOBL('U_Cond_Socioeconomica') ? '*' : ''}`} options={initialDropdowns['CONDICION_SOCIOECONOMICA']} value={formData.U_Cond_Socioeconomica} onChange={handleChange} tooltip={tip('U_Cond_Socioeconomica')} {...getFieldProps('U_Cond_Socioeconomica')} />
                    <Select id="L_Llamada_Derivada" label={`Llamada derivada ${isFieldOBL('L_Llamada_Derivada') ? '*' : ''}`} options={initialDropdowns['LLAMADA_DERIVADA']} value={formData.L_Llamada_Derivada} onChange={handleChange} tooltip={tip('L_Llamada_Derivada')} {...getFieldProps('L_Llamada_Derivada')} />
                </div>
            </Card>

            {/* TERCERO SECTION */}
            <div style={{ display: [formData.U_Problema_1, formData.U_Problema_2, formData.U_Problema_3].some(code => isTerceroRequired(code)) ? 'block' : 'none' }}>
            <Card title="Tercero">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '4px' }}>
                    <Select id="T_Sexo_Tercero" label="Sexo *" options={initialDropdowns['SEXO']} value={formData.T_Sexo_Tercero} onChange={handleChange} tooltip={tip('T_Sexo_Tercero')} required error={missingFieldsList.includes('T_Sexo_Tercero')} />
                    <Select id="T_Edad_Tercero" label="Edad *" options={initialDropdowns['EDAD']} value={formData.T_Edad_Tercero} onChange={handleChange} tooltip={tip('T_Edad_Tercero')} required error={missingFieldsList.includes('T_Edad_Tercero')} />
                    <Select id="T_Estado_Civil_Tercero" label="Estado Civil *" options={initialDropdowns['ESTADO_CIVIL']} value={formData.T_Estado_Civil_Tercero} onChange={handleChange} tooltip={tip('T_Estado_Civil_Tercero')} required error={missingFieldsList.includes('T_Estado_Civil_Tercero')} />
                    <Select id="T_Convive" label="Convive *" options={initialDropdowns['CONVIVE']} value={formData.T_Convive} onChange={handleChange} tooltip={tip('T_Convive')} required error={missingFieldsList.includes('T_Convive')} />
                    <Select id="T_Relacion" label="Relación *" options={initialDropdowns['RELACION']} value={formData.T_Relacion} onChange={handleChange} tooltip={tip('T_Relacion')} required error={missingFieldsList.includes('T_Relacion')} />
                </div>
                
                <div className="glass-panel mobile-scroll-wrapper" style={{ marginTop: '1px', padding: 'var(--card-padding)' }}>
                    <div className="mobile-min-w-600" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', alignItems: 'start' }}>
                        <h4 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Problemática Tercero (Máx 3)</h4>
                        <h4 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Problema Tercero (Máx 3)</h4>

                        <Select id="T_Problematica_1" options={problematicaOptions} value={formData.T_Problematica_1} onChange={handleChange} placeholder="Seleccionar..." required error={missingFieldsList.includes('T_Problematica_1')} />
                        <Select id="T_Problema_1" options={getProblems(formData.T_Problematica_1, [formData.T_Problema_2, formData.T_Problema_3])} value={formData.T_Problema_1} onChange={handleChange} placeholder="Seleccionar..." disabled={!formData.T_Problematica_1} required error={missingFieldsList.includes('T_Problema_1')} />

                        <Select id="T_Problematica_2" options={problematicaOptions} value={formData.T_Problematica_2} onChange={handleChange} placeholder="Seleccionar..." />
                        <Select id="T_Problema_2" options={getProblems(formData.T_Problematica_2, [formData.T_Problema_1, formData.T_Problema_3])} value={formData.T_Problema_2} onChange={handleChange} placeholder="Seleccionar..." disabled={!formData.T_Problematica_2} />

                        <Select id="T_Problematica_3" options={problematicaOptions} value={formData.T_Problematica_3} onChange={handleChange} placeholder="Seleccionar..." />
                        <Select id="T_Problema_3" options={getProblems(formData.T_Problematica_3, [formData.T_Problema_1, formData.T_Problema_2])} value={formData.T_Problema_3} onChange={handleChange} placeholder="Seleccionar..." disabled={!formData.T_Problematica_3} />
                    </div>
                </div>
            </Card>
            </div>

            {/* RELACIONADO SECTION */}
            <div style={{ display: [formData.U_Problema_1, formData.U_Problema_2, formData.U_Problema_3].some(code => isRelacionadoRequired(code)) ? 'block' : 'none' }}>
            <Card title="Relacionado">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '4px' }}>
                    <Select id="R_Sexo_Relacionado" label="Sexo *" options={initialDropdowns['SEXO']} value={formData.R_Sexo_Relacionado} onChange={handleChange} tooltip={tip('R_Sexo_Relacionado')} required error={missingFieldsList.includes('R_Sexo_Relacionado')} />
                    <Select id="R_Edad_Relacionado" label="Edad *" options={initialDropdowns['EDAD']} value={formData.R_Edad_Relacionado} onChange={handleChange} tooltip={tip('R_Edad_Relacionado')} required error={missingFieldsList.includes('R_Edad_Relacionado')} />
                    <Select id="R_Estado_Civil_Relacionado" label="Estado Civil *" options={initialDropdowns['ESTADO_CIVIL']} value={formData.R_Estado_Civil_Relacionado} onChange={handleChange} tooltip={tip('R_Estado_Civil_Relacionado')} required error={missingFieldsList.includes('R_Estado_Civil_Relacionado')} />
                    <Select id="R_Convive" label="Convive *" options={initialDropdowns['CONVIVE']} value={formData.R_Convive} onChange={handleChange} tooltip={tip('R_Convive')} required error={missingFieldsList.includes('R_Convive')} />
                    <Select id="R_Relacion" label="Relación *" options={initialDropdowns['RELACION']} value={formData.R_Relacion} onChange={handleChange} tooltip={tip('R_Relacion')} required error={missingFieldsList.includes('R_Relacion')} />
                </div>

                <div className="glass-panel mobile-scroll-wrapper" style={{ marginTop: '1px', padding: 'var(--card-padding)' }}>
                    <div className="mobile-min-w-600" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', alignItems: 'start' }}>
                        <h4 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Problemática Relacionado (Máx 3)</h4>
                        <h4 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Problema Relacionado (Máx 3)</h4>

                        <Select id="R_Problematica_1" options={problematicaOptions} value={formData.R_Problematica_1} onChange={handleChange} placeholder="Seleccionar..." required error={missingFieldsList.includes('R_Problematica_1')} />
                        <Select id="R_Problema_1" options={getProblems(formData.R_Problematica_1, [formData.R_Problema_2, formData.R_Problema_3])} value={formData.R_Problema_1} onChange={handleChange} placeholder="Seleccionar..." disabled={!formData.R_Problematica_1} required error={missingFieldsList.includes('R_Problema_1')} />

                        <Select id="R_Problematica_2" options={problematicaOptions} value={formData.R_Problematica_2} onChange={handleChange} placeholder="Seleccionar..." />
                        <Select id="R_Problema_2" options={getProblems(formData.R_Problematica_2, [formData.R_Problema_1, formData.R_Problema_3])} value={formData.R_Problema_2} onChange={handleChange} placeholder="Seleccionar..." disabled={!formData.R_Problematica_2} />

                        <Select id="R_Problematica_3" options={problematicaOptions} value={formData.R_Problematica_3} onChange={handleChange} placeholder="Seleccionar..." />
                        <Select id="R_Problema_3" options={getProblems(formData.R_Problematica_3, [formData.R_Problema_1, formData.R_Problema_2])} value={formData.R_Problema_3} onChange={handleChange} placeholder="Seleccionar..." disabled={!formData.R_Problematica_3} />
                    </div>
                </div>
            </Card>
            </div>

            {/* LLAMADA SECTION */}
            <Card title="Datos de la Llamada">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '4px' }}>
                    <Input id="L_Hora" label={`Hora ${isFieldOBL('L_Hora') ? '*' : ''}`} type="time" value={formData.L_Hora} onChange={handleChange} tooltip={tip('L_Hora')} {...getFieldProps('L_Hora')} />
                    <Input id="L_Fecha" label={`Fecha ${isFieldOBL('L_Fecha') ? '*' : ''}`} type="date" value={formData.L_Fecha} onChange={handleChange} tooltip={tip('L_Fecha')} {...getFieldProps('L_Fecha')} />
                    <Select id="L_Resultado" label={`Resultado ${isFieldOBL('L_Resultado') ? '*' : ''}`} options={initialDropdowns['RESULTADO']} value={formData.L_Resultado} onChange={handleChange} tooltip={tip('L_Resultado')} {...getFieldProps('L_Resultado')} />
                    <Select id="L_Duracion" label={`Duración ${isFieldOBL('L_Duracion') ? '*' : ''}`} options={initialDropdowns['RANGO_DURACION']} value={formData.L_Duracion} onChange={handleChange} tooltip={tip('L_Duracion')} {...getFieldProps('L_Duracion')} />
                </div>
            </Card>

            {/* ORIENTADOR SECTION */}
            <Card title="Evaluación del Orientador">
                <div className="mobile-scroll-wrapper">
                    <div className="mobile-min-w-800" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '4px' }}>
                        <Input id="O_Clave" label="Clave" value={formData.O_Clave} disabled tooltip={tip('O_Clave')} />
                        <Select id="O_Autoevaluacion" label={`Autoevaluación ${isFieldOBL('O_Autoevaluacion') ? '*' : ''}`} options={initialDropdowns['AUTOEVALUACION']} value={formData.O_Autoevaluacion} onChange={handleChange} tooltip={tip('O_Autoevaluacion')} {...getFieldProps('O_Autoevaluacion')} />
                        <Select id="O_Volvera_Llamar" label={`Volverá a llamar ${isFieldOBL('O_Volvera_Llamar') ? '*' : ''}`} options={initialDropdowns['VOLVERA_LLAMAR']} value={formData.O_Volvera_Llamar} onChange={handleChange} tooltip={tip('O_Volvera_Llamar')} {...getFieldProps('O_Volvera_Llamar')} />
                        <div></div> {/* Empty column to maintain alignment with the 4 columns below */}
                    </div>
                </div>

                <div className="glass-panel mobile-scroll-wrapper" style={{ padding: 'var(--card-padding)' }}>
                    <div className="mobile-min-w-800" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)', gap: '4px', alignItems: 'start' }}>
                        {/* Headers */}
                        <label style={{ display: 'block', marginBottom: '0px', color: 'var(--color-text-muted)', fontWeight: '500', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>{`Nivel de Ayuda (Máx 2) ${isFieldOBL('O_Nivel_Ayuda_1') ? '*' : ''}`}</label>
                        <label style={{ display: 'block', marginBottom: '0px', color: 'var(--color-text-muted)', fontWeight: '500', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>{`Sentimientos (Máx 3) ${isFieldOBL('O_Sentimientos_1') ? '*' : ''}`}</label>
                        <label style={{ display: 'block', marginBottom: '0px', color: 'var(--color-text-muted)', fontWeight: '500', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>{`Actitudes equivocadas (Máx 2) ${isFieldOBL('O_Actitud_Equivocada_1') ? '*' : ''}`}</label>
                        <label style={{ display: 'block', marginBottom: '0px', color: 'var(--color-text-muted)', fontWeight: '500', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>{`Satisfacción del llamante (Máx 2) ${isFieldOBL('O_Satisfaccion_1') ? '*' : ''}`}</label>

                        {/* Row 1 */}
                        <Select id="O_Nivel_Ayuda_1" options={getFilteredOptions('NIVEL_AYUDA', [formData.O_Nivel_Ayuda_2])} value={formData.O_Nivel_Ayuda_1} onChange={handleChange} placeholder="Seleccionar..." {...getFieldProps('O_Nivel_Ayuda_1')} />
                        <Select id="O_Sentimientos_1" options={getFilteredOptions('SENTIMIENTOS', [formData.O_Sentimientos_2, formData.O_Sentimientos_3])} value={formData.O_Sentimientos_1} onChange={handleChange} placeholder="Seleccionar..." {...getFieldProps('O_Sentimientos_1')} />
                        <Select id="O_Actitud_Equivocada_1" options={getFilteredOptions('ACTITUD_EQUIVOCADA', [formData.O_Actitud_Equivocada_2])} value={formData.O_Actitud_Equivocada_1} onChange={handleChange} placeholder="Seleccionar..." {...getFieldProps('O_Actitud_Equivocada_1')} />
                        <Select id="O_Satisfaccion_1" options={getFilteredOptions('SATISFACCION', [formData.O_Satisfaccion_2])} value={formData.O_Satisfaccion_1} onChange={handleChange} placeholder="Seleccionar..." {...getFieldProps('O_Satisfaccion_1')} />

                        {/* Row 2 */}
                        <Select id="O_Nivel_Ayuda_2" options={getFilteredOptions('NIVEL_AYUDA', [formData.O_Nivel_Ayuda_1])} value={formData.O_Nivel_Ayuda_2} onChange={handleChange} placeholder="Seleccionar..." disabled={!formData.O_Nivel_Ayuda_1 || isFieldNH('O_Nivel_Ayuda_2')} {...getFieldProps('O_Nivel_Ayuda_2')} />
                        <Select id="O_Sentimientos_2" options={getFilteredOptions('SENTIMIENTOS', [formData.O_Sentimientos_1, formData.O_Sentimientos_3])} value={formData.O_Sentimientos_2} onChange={handleChange} placeholder="Seleccionar..." disabled={!formData.O_Sentimientos_1 || isFieldNH('O_Sentimientos_2')} {...getFieldProps('O_Sentimientos_2')} />
                        <Select id="O_Actitud_Equivocada_2" options={getFilteredOptions('ACTITUD_EQUIVOCADA', [formData.O_Actitud_Equivocada_1])} value={formData.O_Actitud_Equivocada_2} onChange={handleChange} placeholder="Seleccionar..." disabled={!formData.O_Actitud_Equivocada_1 || isFieldNH('O_Actitud_Equivocada_2')} {...getFieldProps('O_Actitud_Equivocada_2')} />
                        <Select id="O_Satisfaccion_2" options={getFilteredOptions('SATISFACCION', [formData.O_Satisfaccion_1])} value={formData.O_Satisfaccion_2} onChange={handleChange} placeholder="Seleccionar..." disabled={!formData.O_Satisfaccion_1 || isFieldNH('O_Satisfaccion_2')} {...getFieldProps('O_Satisfaccion_2')} />

                        {/* Row 3 */}
                        <div></div>
                        <Select id="O_Sentimientos_3" options={getFilteredOptions('SENTIMIENTOS', [formData.O_Sentimientos_1, formData.O_Sentimientos_2])} value={formData.O_Sentimientos_3} onChange={handleChange} placeholder="Seleccionar..." disabled={!formData.O_Sentimientos_2 || isFieldNH('O_Sentimientos_3')} {...getFieldProps('O_Sentimientos_3')} />
                        <div></div>
                        <div></div>
                    </div>
                </div>
            </Card>

            {/* SINTESIS SECTION */}
            <Card title={<span style={{ color: missingFieldsList.includes('L_Sintesis') ? '#f59e0b' : 'inherit' }}>Síntesis <span style={{ color: 'var(--color-accent)' }}>*</span></span>}>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: '1.5', textAlign: 'justify' }}>
                    En este apartado deben describir detalladamente las fases de la intervención en crisis que se desarrollaron con el usuario. Estas fases incluyen: <span style={{ color: 'var(--sub-color-accent)', fontWeight: '500' }}>Acogida, Exploración y comprensión del problema, Reestructuración, Planificación y cambio y Cierre.</span> Para los casos de LLHH/CCHH, es muy importante resaltar las estrategias que sirvieron para establecer límites, ya que son fundamentales en la intervención.
                </p>
                <textarea
                    id="L_Sintesis"
                    value={formData.L_Sintesis}
                    onChange={handleChange}
                    placeholder="Escriba aquí la síntesis..."
                    maxLength={300}
                    style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: 'var(--radius-sm)',
                        border: missingFieldsList.includes('L_Sintesis') ? '2px solid #ef4444' : '1px solid var(--sub-color-secondary)',
                        background: '#ffffff',
                        color: missingFieldsList.includes('L_Sintesis') ? '#ef4444' : 'var(--color-text-main)',
                        fontWeight: missingFieldsList.includes('L_Sintesis') ? '700' : 'normal',
                        fontSize: '1rem',
                        outline: 'none',
                        resize: 'vertical',
                        minHeight: '120px'
                    }}
                />
                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: (formData.L_Sintesis || '').length >= 280 ? '#ef4444' : '#9ca3af', marginTop: '2px' }}>
                    {(formData.L_Sintesis || '').length} / 300
                </div>
            </Card>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '6px' }}>
                <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? 'Registrando...' : 'Registrar Llamada Completa'}
                </Button>
            </div>
        </form>
    );
};

export default CallForm;
