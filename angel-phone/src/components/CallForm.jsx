import React, { useState, useEffect } from 'react';
import { problemCategories } from '../data/initialData';
import { useLists } from '../hooks/useLists';
import Card from './ui/Card';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';
import { db } from '../../../src/services/firebase';

const CallForm = ({ user }) => {
    const { lists: rawLists, loading: listsLoading } = useLists();

    // Filter out inactive items for the form
    const initialDropdowns = React.useMemo(() => {
        if (!rawLists) return {};
        const filtered = {};
        const isOrientador = user && user.role === 'user';

        Object.keys(rawLists).forEach(key => {
            let items = rawLists[key].filter(item => item.active !== false);

            if (key === 'Medio de contacto' && isOrientador) {
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
        T_Problematica_1: '', T_Problema_1: '',
        T_Problematica_2: '', T_Problema_2: '',
        T_Problematica_3: '', T_Problema_3: '',
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
            const draft = localStorage.getItem('callFormDraft');
            if (draft) return { ...blankForm(), ...JSON.parse(draft) };
        } catch (_) { }
        return blankForm();
    });

    // Persist form data to localStorage on every change (except user-specific fields)
    useEffect(() => {
        const { L_Orientador, O_Clave, ...draftData } = formData;
        localStorage.setItem('callFormDraft', JSON.stringify(draftData));
    }, [formData]);

    // Always keep user-dependent fields in sync with logged-in user
    useEffect(() => {
        if (user && user.name) {
            setFormData(prev => ({
                ...prev,
                L_Orientador: user.name,
                O_Clave: user.name
            }));
        }
    }, [user]);

    // Reset all fields (with confirmation)
    const handleReset = () => {
        if (window.confirm('¿Está seguro de que desea iniciar una nueva llamada? Se perderán todos los datos no guardados.')) {
            localStorage.removeItem('callFormDraft');
            setFormData({
                ...blankForm(),
                L_Orientador: user?.name || '',
                O_Clave: user?.name || ''
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

    // Helper to handle input changes
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    // Helper to get problems based on selected problematica category
    const getProblems = (categoryCode, excludeProblems = []) => {
        if (!categoryCode || !initialDropdowns['Problema']) return [];
        return initialDropdowns['Problema']
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
    const problematicaOptions = (initialDropdowns['Problemática'] || []).map(item => ({
        value: item.value,
        label: item.label
    }));

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Required fields validation
        const requiredFields = {
            U_Sexo: 'Sexo',
            U_Edad: 'Edad',
            U_Estado_Civil: 'E. Civil',
            U_Convive: 'Convive',
            U_Asiduidad: 'Asiduidad',
            U_Naturaleza: 'Naturaleza',
            U_Inicio: 'Inicio',
            U_Actitud_Orientador: 'Actitud ante L_Orientador',
            U_Presentacion: 'Presentación',
            U_Paralenguaje: 'Paralenguaje',
            U_Procedencia: 'Procedencia',
            U_Peticion: 'Petición',
            U_Cond_Socioeconomica: 'Condición Socioeconómica',
            L_Llamada_Derivada: 'Llamada derivada',
            L_Hora: 'Hora',
            L_Fecha: 'Fecha',
            L_Resultado: 'Resultado',
            L_Duracion: 'Duración',
            O_Autoevaluacion: 'Autoevaluación',
            O_Volvera_Llamar: 'Volverá a llamar'
        };

        const missingFields = Object.entries(requiredFields)
            .filter(([key]) => !formData[key])
            .map(([key]) => key);

        if (missingFields.length > 0) {
            setErrorMessage('Para registrar la llamada correctamente es necesario completar los campos obligatorios señalados.');
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

            await db.addCall(cleanData);
            setSuccessMessage("Llamada registrada correctamente.");
            localStorage.removeItem('callFormDraft');

            // Reset form to initial state
            setFormData({
                ...blankForm(),
                L_Orientador: user?.name || '',
                O_Clave: user?.name || ''
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    <Input id="L_Orientador" label="Orientador" value={formData.L_Orientador} disabled />
                    <Select
                        id="L_Medio_Contacto"
                        label="Medio de contacto"
                        options={initialDropdowns['Medio de contacto']}
                        value={formData.L_Medio_Contacto}
                        onChange={handleChange}
                    />
                    <Select
                        id="L_Como_Conoce"
                        label="Cómo conoció el teléfono"
                        options={initialDropdowns['Comoconoce']}
                        value={formData.L_Como_Conoce}
                        onChange={handleChange}
                    />
                </div>
            </Card>

            {/* LLAMANTE SECTION */}
            <Card title="Llamante">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ flex: '1 1 200px' }}>
                        <Select id="U_Sexo" label="Sexo" options={initialDropdowns['Sexo']} value={formData.U_Sexo} onChange={handleChange} required error={missingFieldsList.includes('U_Sexo')} />
                    </div>
                    <div style={{ flex: '1 1 200px' }}>
                        <Select id="U_Edad" label="Edad" options={initialDropdowns['Edad']} value={formData.U_Edad} onChange={handleChange} required error={missingFieldsList.includes('U_Edad')} />
                    </div>
                    <div style={{ flex: '1 1 200px' }}>
                        <Select id="U_Estado_Civil" label="E. Civil" options={initialDropdowns['E.Civil']} value={formData.U_Estado_Civil} onChange={handleChange} required error={missingFieldsList.includes('U_Estado_Civil')} />
                    </div>
                    <div style={{ flex: '1 1 200px' }}>
                        <Select id="U_Convive" label="Convive" options={initialDropdowns['Convive']} value={formData.U_Convive} onChange={handleChange} required error={missingFieldsList.includes('U_Convive')} />
                    </div>
                    <div style={{ flex: '1 1 200px' }}>
                        <Select id="U_Asiduidad" label="Asiduidad" options={initialDropdowns['Asiduad']} value={formData.U_Asiduidad} onChange={handleChange} required error={missingFieldsList.includes('U_Asiduidad')} />
                    </div>
                </div>

                <div className="glass-panel mobile-scroll-wrapper" style={{ marginTop: '1px', padding: 'var(--card-padding)' }}>
                    <div className="mobile-min-w-600" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', alignItems: 'start' }}>
                        <h4 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Problemática (Máx 3)</h4>
                        <h4 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Problema (Máx 3)</h4>

                        <Select id="U_Problematica_1" options={problematicaOptions} value={formData.U_Problematica_1} onChange={handleChange} placeholder="Seleccionar..." />
                        <Select id="U_Problema_1" options={getProblems(formData.U_Problematica_1, [formData.U_Problema_2, formData.U_Problema_3])} value={formData.U_Problema_1} onChange={handleChange} placeholder="Seleccionar..." disabled={!formData.U_Problematica_1} />

                        <Select id="U_Problematica_2" options={problematicaOptions} value={formData.U_Problematica_2} onChange={handleChange} placeholder="Seleccionar..." />
                        <Select id="U_Problema_2" options={getProblems(formData.U_Problematica_2, [formData.U_Problema_1, formData.U_Problema_3])} value={formData.U_Problema_2} onChange={handleChange} placeholder="Seleccionar..." disabled={!formData.U_Problematica_2} />

                        <Select id="U_Problematica_3" options={problematicaOptions} value={formData.U_Problematica_3} onChange={handleChange} placeholder="Seleccionar..." />
                        <Select id="U_Problema_3" options={getProblems(formData.U_Problematica_3, [formData.U_Problema_1, formData.U_Problema_2])} value={formData.U_Problema_3} onChange={handleChange} placeholder="Seleccionar..." disabled={!formData.U_Problematica_3} />
                    </div>
                </div>

                <div style={{ marginTop: '2px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '6px' }}>
                    <Select id="U_Naturaleza" label="Naturaleza" options={initialDropdowns['Naturaleza']} value={formData.U_Naturaleza} onChange={handleChange} required error={missingFieldsList.includes('U_Naturaleza')} />
                    <Select id="U_Inicio" label="Inicio" options={initialDropdowns['Inicio']} value={formData.U_Inicio} onChange={handleChange} required error={missingFieldsList.includes('U_Inicio')} />
                    <Select id="U_Actitud_Orientador" label="Actitud ante L_Orientador" options={initialDropdowns['Actitud ante el L_Orientador']} value={formData.U_Actitud_Orientador} onChange={handleChange} required error={missingFieldsList.includes('U_Actitud_Orientador')} />
                    <Select id="U_Presentacion" label="Presentación" options={initialDropdowns['Presentación']} value={formData.U_Presentacion} onChange={handleChange} required error={missingFieldsList.includes('U_Presentacion')} />
                    <Select id="U_Paralenguaje" label="Paralenguaje" options={initialDropdowns['Paralenguaje']} value={formData.U_Paralenguaje} onChange={handleChange} required error={missingFieldsList.includes('U_Paralenguaje')} />
                    <Select id="U_Procedencia" label="Procedencia" options={initialDropdowns['Procedencia']} value={formData.U_Procedencia} onChange={handleChange} required error={missingFieldsList.includes('U_Procedencia')} />
                    <Select id="U_Peticion" label="Petición" options={initialDropdowns['Petición']} value={formData.U_Peticion} onChange={handleChange} required error={missingFieldsList.includes('U_Peticion')} />
                    <Select id="U_Cond_Socioeconomica" label="Condición Socioeconómica" options={initialDropdowns['Condicion Socioeconomica']} value={formData.U_Cond_Socioeconomica} onChange={handleChange} required error={missingFieldsList.includes('U_Cond_Socioeconomica')} />
                    <Select id="L_Llamada_Derivada" label="Llamada derivada" options={initialDropdowns['Llamada derivada']} value={formData.L_Llamada_Derivada} onChange={handleChange} required error={missingFieldsList.includes('L_Llamada_Derivada')} />
                </div>
            </Card>

            {/* TERCERO SECTION */}
            { [formData.U_Problema_1, formData.U_Problema_2, formData.U_Problema_3].some(code => {
                if (!code) return false;
                for (const cat of Object.values(problemCategories)) {
                    const p = cat.items.find(i => i.fullCode === code);
                    if (p && p.tercero === 1) return true;
                }
                return false;
            }) && (
            <Card title="Tercero (Opcional)">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '6px' }}>
                    <Select id="T_Sexo_Tercero" label="Sexo" options={initialDropdowns['Sexo']} value={formData.T_Sexo_Tercero} onChange={handleChange} />
                    <Select id="T_Edad_Tercero" label="Edad" options={initialDropdowns['Edad']} value={formData.T_Edad_Tercero} onChange={handleChange} />
                    <Select id="T_Estado_Civil_Tercero" label="E. Civil" options={initialDropdowns['E.Civil']} value={formData.T_Estado_Civil_Tercero} onChange={handleChange} />
                    <Select id="T_Convive" label="Convive" options={initialDropdowns['Convive']} value={formData.T_Convive} onChange={handleChange} />
                    <Select id="T_Relacion" label="Relación" options={initialDropdowns['Relación']} value={formData.T_Relacion} onChange={handleChange} />
                </div>
                
                <div className="glass-panel mobile-scroll-wrapper" style={{ marginTop: '1px', padding: 'var(--card-padding)' }}>
                    <div className="mobile-min-w-600" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', alignItems: 'start' }}>
                        <h4 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Problemática Tercero (Máx 3)</h4>
                        <h4 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Problema Tercero (Máx 3)</h4>

                        <Select id="T_Problematica_1" options={problematicaOptions} value={formData.T_Problematica_1} onChange={handleChange} placeholder="Seleccionar..." />
                        <Select id="T_Problema_1" options={getProblems(formData.T_Problematica_1, [formData.T_Problema_2, formData.T_Problema_3])} value={formData.T_Problema_1} onChange={handleChange} placeholder="Seleccionar..." disabled={!formData.T_Problematica_1} />

                        <Select id="T_Problematica_2" options={problematicaOptions} value={formData.T_Problematica_2} onChange={handleChange} placeholder="Seleccionar..." />
                        <Select id="T_Problema_2" options={getProblems(formData.T_Problematica_2, [formData.T_Problema_1, formData.T_Problema_3])} value={formData.T_Problema_2} onChange={handleChange} placeholder="Seleccionar..." disabled={!formData.T_Problematica_2} />

                        <Select id="T_Problematica_3" options={problematicaOptions} value={formData.T_Problematica_3} onChange={handleChange} placeholder="Seleccionar..." />
                        <Select id="T_Problema_3" options={getProblems(formData.T_Problematica_3, [formData.T_Problema_1, formData.T_Problema_2])} value={formData.T_Problema_3} onChange={handleChange} placeholder="Seleccionar..." disabled={!formData.T_Problematica_3} />
                    </div>
                </div>
            </Card>
            )}

            {/* LLAMADA SECTION */}
            <Card title="Datos de la Llamada">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '6px' }}>
                    <Input id="L_Hora" label="Hora" type="time" value={formData.L_Hora} onChange={handleChange} required error={missingFieldsList.includes('L_Hora')} />
                    <Input id="L_Fecha" label="Fecha" type="date" value={formData.L_Fecha} onChange={handleChange} required error={missingFieldsList.includes('L_Fecha')} />
                    <Select id="L_Resultado" label="Resultado" options={initialDropdowns['Resultado']} value={formData.L_Resultado} onChange={handleChange} required error={missingFieldsList.includes('L_Resultado')} />
                    <Select id="L_Duracion" label="Duración" options={initialDropdowns['C_duracion']} value={formData.L_Duracion} onChange={handleChange} required error={missingFieldsList.includes('L_Duracion')} />
                </div>
            </Card>

            {/* ORIENTADOR SECTION */}
            <Card title="Evaluación del Orientador">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '6px' }}>
                    <Input id="O_Clave" label="Clave" value={formData.O_Clave} disabled />
                    <Select id="O_Autoevaluacion" label="Autoevaluación" options={initialDropdowns['Autoevaluación']} value={formData.O_Autoevaluacion} onChange={handleChange} required error={missingFieldsList.includes('O_Autoevaluacion')} />
                    <Select id="O_Volvera_Llamar" label="Volverá a llamar" options={initialDropdowns['Volvera a llamar']} value={formData.O_Volvera_Llamar} onChange={handleChange} required error={missingFieldsList.includes('O_Volvera_Llamar')} />
                </div>

                <div className="glass-panel mobile-scroll-wrapper" style={{ padding: 'var(--card-padding)' }}>
                    <div className="mobile-min-w-800" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '6px', alignItems: 'start' }}>
                        {/* Headers */}
                        <label style={{ display: 'block', marginBottom: '0px', color: 'var(--color-text-muted)', fontWeight: '500', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>Nivel de Ayuda (Máx 2)</label>
                        <label style={{ display: 'block', marginBottom: '0px', color: 'var(--color-text-muted)', fontWeight: '500', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>Sentimientos (Máx 3)</label>
                        <label style={{ display: 'block', marginBottom: '0px', color: 'var(--color-text-muted)', fontWeight: '500', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>Actitudes equivocadas (Máx 2)</label>
                        <label style={{ display: 'block', marginBottom: '0px', color: 'var(--color-text-muted)', fontWeight: '500', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>Satisfacción del llamante (Máx 2)</label>

                        {/* Row 1 */}
                        <Select id="O_Nivel_Ayuda_1" options={getFilteredOptions('Nivel de ayuda', [formData.O_Nivel_Ayuda_2])} value={formData.O_Nivel_Ayuda_1} onChange={handleChange} placeholder="Seleccionar..." />
                        <Select id="O_Sentimientos_1" options={getFilteredOptions('Sentimientos', [formData.O_Sentimientos_2, formData.O_Sentimientos_3])} value={formData.O_Sentimientos_1} onChange={handleChange} placeholder="Seleccionar..." />
                        <Select id="O_Actitud_Equivocada_1" options={getFilteredOptions('Actitudes equivodas', [formData.O_Actitud_Equivocada_2])} value={formData.O_Actitud_Equivocada_1} onChange={handleChange} placeholder="Seleccionar..." />
                        <Select id="O_Satisfaccion_1" options={getFilteredOptions('Satisfacción del llamante', [formData.O_Satisfaccion_2])} value={formData.O_Satisfaccion_1} onChange={handleChange} placeholder="Seleccionar..." />

                        {/* Row 2 */}
                        <Select id="O_Nivel_Ayuda_2" options={getFilteredOptions('Nivel de ayuda', [formData.O_Nivel_Ayuda_1])} value={formData.O_Nivel_Ayuda_2} onChange={handleChange} placeholder="Seleccionar..." disabled={!formData.O_Nivel_Ayuda_1} />
                        <Select id="O_Sentimientos_2" options={getFilteredOptions('Sentimientos', [formData.O_Sentimientos_1, formData.O_Sentimientos_3])} value={formData.O_Sentimientos_2} onChange={handleChange} placeholder="Seleccionar..." disabled={!formData.O_Sentimientos_1} />
                        <Select id="O_Actitud_Equivocada_2" options={getFilteredOptions('Actitudes equivodas', [formData.O_Actitud_Equivocada_1])} value={formData.O_Actitud_Equivocada_2} onChange={handleChange} placeholder="Seleccionar..." disabled={!formData.O_Actitud_Equivocada_1} />
                        <Select id="O_Satisfaccion_2" options={getFilteredOptions('Satisfacción del llamante', [formData.O_Satisfaccion_1])} value={formData.O_Satisfaccion_2} onChange={handleChange} placeholder="Seleccionar..." disabled={!formData.O_Satisfaccion_1} />

                        {/* Row 3 */}
                        <div></div>
                        <Select id="O_Sentimientos_3" options={getFilteredOptions('Sentimientos', [formData.O_Sentimientos_1, formData.O_Sentimientos_2])} value={formData.O_Sentimientos_3} onChange={handleChange} placeholder="Seleccionar..." disabled={!formData.O_Sentimientos_2} />
                        <div></div>
                        <div></div>
                    </div>
                </div>
            </Card>

            {/* SINTESIS SECTION */}
            <Card title="Síntesis">
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: '1.5', textAlign: 'justify' }}>
                    En este apartado deben describir detalladamente las fases de la intervención en crisis que se desarrollaron con el usuario. Estas fases incluyen: <span style={{ color: 'var(--sub-color-accent)', fontWeight: '500' }}>Acogida, Exploración y comprensión del problema, Reestructuración, Planificación y cambio y Cierre.</span> Para los casos de LLHH/CCHH, es muy importante resaltar las estrategias que sirvieron para establecer límites, ya que son fundamentales en la intervención.
                </p>
                <textarea
                    id="L_Sintesis"
                    value={formData.L_Sintesis}
                    onChange={handleChange}
                    placeholder="Escriba aquí la síntesis..."
                    style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--sub-color-secondary)',
                        background: '#ffffff',
                        color: 'var(--color-text-main)',
                        fontSize: '1rem',
                        outline: 'none',
                        resize: 'vertical',
                        minHeight: '120px'
                    }}
                />
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
