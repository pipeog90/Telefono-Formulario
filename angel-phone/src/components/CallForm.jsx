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
        orientador: '',
        medioContacto: '',
        comoConocio: '',
        l_sexo: '',
        l_edad: '',
        l_ecivil: '',
        l_convive: '',
        l_asiduidad: '',
        l_problematica_1: '', l_problema_1: '',
        l_problematica_2: '', l_problema_2: '',
        l_problematica_3: '', l_problema_3: '',
        l_naturaleza: '',
        l_inicio: '',
        l_actitud: '',
        l_presentacion: '',
        l_paralenguaje: '',
        l_procedencia: '',
        l_peticion: '',
        l_actitud_problema_1: '',
        l_actitud_problema_2: '',
        l_condicion: '',
        l_derivada: '',
        t_sexo: '',
        t_edad: '',
        t_ecivil: '',
        t_convive: '',
        t_relacion: '',
        t_problematica_1: '', t_problema_1: '',
        t_problematica_2: '', t_problema_2: '',
        t_problematica_3: '', t_problema_3: '',
        t_actitud_problema_1: '',
        t_actitud_problema_2: '',
        c_hora: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        c_fecha: new Date().toISOString().split('T')[0],
        c_resultado: '',
        c_duracion: '',
        o_clave: '',
        o_autoevaluacion: '',
        o_volvera_llamar: '',
        o_nivel_ayuda_1: '', o_nivel_ayuda_2: '',
        o_sentimientos_1: '', o_sentimientos_2: '', o_sentimientos_3: '',
        o_actitudes_1: '', o_actitudes_2: '',
        o_satisfaccion_1: '', o_satisfaccion_2: '',
        sintesis: ''
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
        const { orientador, o_clave, ...draftData } = formData;
        localStorage.setItem('callFormDraft', JSON.stringify(draftData));
    }, [formData]);

    // Always keep user-dependent fields in sync with logged-in user
    useEffect(() => {
        if (user && user.name) {
            setFormData(prev => ({
                ...prev,
                orientador: user.name,
                o_clave: user.name
            }));
        }
    }, [user]);

    // Reset all fields (with confirmation)
    const handleReset = () => {
        if (window.confirm('¿Está seguro de que desea iniciar una nueva llamada? Se perderán todos los datos no guardados.')) {
            localStorage.removeItem('callFormDraft');
            setFormData({
                ...blankForm(),
                orientador: user?.name || '',
                o_clave: user?.name || ''
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
            l_sexo: 'Sexo',
            l_edad: 'Edad',
            l_ecivil: 'E. Civil',
            l_convive: 'Convive',
            l_asiduidad: 'Asiduidad',
            l_naturaleza: 'Naturaleza',
            l_inicio: 'Inicio',
            l_actitud: 'Actitud ante orientador',
            l_presentacion: 'Presentación',
            l_paralenguaje: 'Paralenguaje',
            l_procedencia: 'Procedencia',
            l_peticion: 'Petición',
            l_condicion: 'Condición Socioeconómica',
            l_derivada: 'Llamada derivada',
            c_hora: 'Hora',
            c_fecha: 'Fecha',
            c_resultado: 'Resultado',
            c_duracion: 'Duración',
            o_autoevaluacion: 'Autoevaluación',
            o_volvera_llamar: 'Volverá a llamar'
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
            // Add the orientador UID for future reporting/filtering
            if (user && user.uid) {
                cleanData.orientadorUid = user.uid;
            }

            await db.addCall(cleanData);
            setSuccessMessage("Llamada registrada correctamente.");
            localStorage.removeItem('callFormDraft');

            // Reset form to initial state
            setFormData({
                ...blankForm(),
                orientador: user?.name || '',
                o_clave: user?.name || ''
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
                            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
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
                    <Input id="orientador" label="Orientador" value={formData.orientador} disabled />
                    <Select
                        id="medioContacto"
                        label="Medio de contacto"
                        options={initialDropdowns['Medio de contacto']}
                        value={formData.medioContacto}
                        onChange={handleChange}
                    />
                    <Select
                        id="comoConocio"
                        label="Cómo conoció el teléfono"
                        options={initialDropdowns['Comoconoce']}
                        value={formData.comoConocio}
                        onChange={handleChange}
                    />
                </div>
            </Card>

            {/* LLAMANTE SECTION */}
            <Card title="Llamante">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                    <div style={{ flex: '1 1 200px' }}>
                        <Select id="l_sexo" label="Sexo" options={initialDropdowns['Sexo']} value={formData.l_sexo} onChange={handleChange} required error={missingFieldsList.includes('l_sexo')} />
                    </div>
                    <div style={{ flex: '1 1 200px' }}>
                        <Select id="l_edad" label="Edad" options={initialDropdowns['Edad']} value={formData.l_edad} onChange={handleChange} required error={missingFieldsList.includes('l_edad')} />
                    </div>
                    <div style={{ flex: '1 1 200px' }}>
                        <Select id="l_ecivil" label="E. Civil" options={initialDropdowns['E.Civil']} value={formData.l_ecivil} onChange={handleChange} required error={missingFieldsList.includes('l_ecivil')} />
                    </div>
                    <div style={{ flex: '1 1 200px' }}>
                        <Select id="l_convive" label="Convive" options={initialDropdowns['Convive']} value={formData.l_convive} onChange={handleChange} required error={missingFieldsList.includes('l_convive')} />
                    </div>
                    <div style={{ flex: '1 1 200px' }}>
                        <Select id="l_asiduidad" label="Asiduidad" options={initialDropdowns['Asiduad']} value={formData.l_asiduidad} onChange={handleChange} required error={missingFieldsList.includes('l_asiduidad')} />
                    </div>
                </div>

                <div className="glass-panel mobile-scroll-wrapper" style={{ marginTop: '20px', padding: '15px' }}>
                    <div className="mobile-min-w-600" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
                        <h4 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '10px' }}>Problemática (Máx 3)</h4>
                        <h4 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '10px' }}>Problema (Máx 3)</h4>

                        <Select id="l_problematica_1" options={problematicaOptions} value={formData.l_problematica_1} onChange={handleChange} placeholder="Seleccionar..." />
                        <Select id="l_problema_1" options={getProblems(formData.l_problematica_1, [formData.l_problema_2, formData.l_problema_3])} value={formData.l_problema_1} onChange={handleChange} placeholder="Seleccionar..." disabled={!formData.l_problematica_1} />

                        <Select id="l_problematica_2" options={problematicaOptions} value={formData.l_problematica_2} onChange={handleChange} placeholder="Seleccionar..." />
                        <Select id="l_problema_2" options={getProblems(formData.l_problematica_2, [formData.l_problema_1, formData.l_problema_3])} value={formData.l_problema_2} onChange={handleChange} placeholder="Seleccionar..." disabled={!formData.l_problematica_2} />

                        <Select id="l_problematica_3" options={problematicaOptions} value={formData.l_problematica_3} onChange={handleChange} placeholder="Seleccionar..." />
                        <Select id="l_problema_3" options={getProblems(formData.l_problematica_3, [formData.l_problema_1, formData.l_problema_2])} value={formData.l_problema_3} onChange={handleChange} placeholder="Seleccionar..." disabled={!formData.l_problematica_3} />
                    </div>
                </div>

                <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    <Select id="l_naturaleza" label="Naturaleza" options={initialDropdowns['Naturaleza']} value={formData.l_naturaleza} onChange={handleChange} required error={missingFieldsList.includes('l_naturaleza')} />
                    <Select id="l_inicio" label="Inicio" options={initialDropdowns['Inicio']} value={formData.l_inicio} onChange={handleChange} required error={missingFieldsList.includes('l_inicio')} />
                    <Select id="l_actitud" label="Actitud ante orientador" options={initialDropdowns['Actitud ante el orientador']} value={formData.l_actitud} onChange={handleChange} required error={missingFieldsList.includes('l_actitud')} />
                    <Select id="l_presentacion" label="Presentación" options={initialDropdowns['Presentación']} value={formData.l_presentacion} onChange={handleChange} required error={missingFieldsList.includes('l_presentacion')} />
                    <Select id="l_paralenguaje" label="Paralenguaje" options={initialDropdowns['Paralenguaje']} value={formData.l_paralenguaje} onChange={handleChange} required error={missingFieldsList.includes('l_paralenguaje')} />
                    <Select id="l_procedencia" label="Procedencia" options={initialDropdowns['Procedencia']} value={formData.l_procedencia} onChange={handleChange} required error={missingFieldsList.includes('l_procedencia')} />
                    <Select id="l_peticion" label="Petición" options={initialDropdowns['Petición']} value={formData.l_peticion} onChange={handleChange} required error={missingFieldsList.includes('l_peticion')} />
                    <Select id="l_condicion" label="Condición Socioeconómica" options={initialDropdowns['Condicion Socioeconomica']} value={formData.l_condicion} onChange={handleChange} required error={missingFieldsList.includes('l_condicion')} />
                    <Select id="l_derivada" label="Llamada derivada" options={initialDropdowns['Llamada derivada']} value={formData.l_derivada} onChange={handleChange} required error={missingFieldsList.includes('l_derivada')} />
                </div>
            </Card>

            {/* TERCERO SECTION */}
            <Card title="Tercero (Opcional)">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    <Select id="t_sexo" label="Sexo" options={initialDropdowns['Sexo']} value={formData.t_sexo} onChange={handleChange} />
                    <Select id="t_edad" label="Edad" options={initialDropdowns['Edad']} value={formData.t_edad} onChange={handleChange} />
                    <Select id="t_ecivil" label="E. Civil" options={initialDropdowns['E.Civil']} value={formData.t_ecivil} onChange={handleChange} />
                    <Select id="t_convive" label="Convive" options={initialDropdowns['Convive']} value={formData.t_convive} onChange={handleChange} />
                    <Select id="t_relacion" label="Relación" options={initialDropdowns['Relación']} value={formData.t_relacion} onChange={handleChange} />
                </div>
            </Card>

            {/* LLAMADA SECTION */}
            <Card title="Datos de la Llamada">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    <Input id="c_hora" label="Hora" type="time" value={formData.c_hora} onChange={handleChange} required error={missingFieldsList.includes('c_hora')} />
                    <Input id="c_fecha" label="Fecha" type="date" value={formData.c_fecha} onChange={handleChange} required error={missingFieldsList.includes('c_fecha')} />
                    <Select id="c_resultado" label="Resultado" options={initialDropdowns['Resultado']} value={formData.c_resultado} onChange={handleChange} required error={missingFieldsList.includes('c_resultado')} />
                    <Select id="c_duracion" label="Duración" options={initialDropdowns['C_duracion']} value={formData.c_duracion} onChange={handleChange} required error={missingFieldsList.includes('c_duracion')} />
                </div>
            </Card>

            {/* ORIENTADOR SECTION */}
            <Card title="Evaluación del Orientador">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    <Input id="o_clave" label="Clave" value={formData.o_clave} disabled />
                    <Select id="o_autoevaluacion" label="Autoevaluación" options={initialDropdowns['Autoevaluación']} value={formData.o_autoevaluacion} onChange={handleChange} required error={missingFieldsList.includes('o_autoevaluacion')} />
                    <Select id="o_volvera_llamar" label="Volverá a llamar" options={initialDropdowns['Volvera a llamar']} value={formData.o_volvera_llamar} onChange={handleChange} required error={missingFieldsList.includes('o_volvera_llamar')} />
                </div>

                <div className="glass-panel mobile-scroll-wrapper" style={{ marginTop: '20px', padding: '15px' }}>
                    <div className="mobile-min-w-800" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px', alignItems: 'start' }}>
                        {/* Headers */}
                        <label style={{ display: 'block', marginBottom: '0px', color: 'var(--color-text-muted)', fontWeight: '500' }}>Nivel de Ayuda (Máx 2)</label>
                        <label style={{ display: 'block', marginBottom: '0px', color: 'var(--color-text-muted)', fontWeight: '500' }}>Sentimientos (Máx 3)</label>
                        <label style={{ display: 'block', marginBottom: '0px', color: 'var(--color-text-muted)', fontWeight: '500' }}>Actitudes equivocadas (Máx 2)</label>
                        <label style={{ display: 'block', marginBottom: '0px', color: 'var(--color-text-muted)', fontWeight: '500' }}>Satisfacción del llamante (Máx 2)</label>

                        {/* Row 1 */}
                        <Select id="o_nivel_ayuda_1" options={getFilteredOptions('Nivel de ayuda', [formData.o_nivel_ayuda_2])} value={formData.o_nivel_ayuda_1} onChange={handleChange} placeholder="Seleccionar..." />
                        <Select id="o_sentimientos_1" options={getFilteredOptions('Sentimientos', [formData.o_sentimientos_2, formData.o_sentimientos_3])} value={formData.o_sentimientos_1} onChange={handleChange} placeholder="Seleccionar..." />
                        <Select id="o_actitudes_1" options={getFilteredOptions('Actitudes equivodas', [formData.o_actitudes_2])} value={formData.o_actitudes_1} onChange={handleChange} placeholder="Seleccionar..." />
                        <Select id="o_satisfaccion_1" options={getFilteredOptions('Satisfacción del llamante', [formData.o_satisfaccion_2])} value={formData.o_satisfaccion_1} onChange={handleChange} placeholder="Seleccionar..." />

                        {/* Row 2 */}
                        <Select id="o_nivel_ayuda_2" options={getFilteredOptions('Nivel de ayuda', [formData.o_nivel_ayuda_1])} value={formData.o_nivel_ayuda_2} onChange={handleChange} placeholder="Seleccionar..." disabled={!formData.o_nivel_ayuda_1} />
                        <Select id="o_sentimientos_2" options={getFilteredOptions('Sentimientos', [formData.o_sentimientos_1, formData.o_sentimientos_3])} value={formData.o_sentimientos_2} onChange={handleChange} placeholder="Seleccionar..." disabled={!formData.o_sentimientos_1} />
                        <Select id="o_actitudes_2" options={getFilteredOptions('Actitudes equivodas', [formData.o_actitudes_1])} value={formData.o_actitudes_2} onChange={handleChange} placeholder="Seleccionar..." disabled={!formData.o_actitudes_1} />
                        <Select id="o_satisfaccion_2" options={getFilteredOptions('Satisfacción del llamante', [formData.o_satisfaccion_1])} value={formData.o_satisfaccion_2} onChange={handleChange} placeholder="Seleccionar..." disabled={!formData.o_satisfaccion_1} />

                        {/* Row 3 */}
                        <div></div>
                        <Select id="o_sentimientos_3" options={getFilteredOptions('Sentimientos', [formData.o_sentimientos_1, formData.o_sentimientos_2])} value={formData.o_sentimientos_3} onChange={handleChange} placeholder="Seleccionar..." disabled={!formData.o_sentimientos_2} />
                        <div></div>
                        <div></div>
                    </div>
                </div>
            </Card>

            {/* SINTESIS SECTION */}
            <Card title="Síntesis">
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '15px', lineHeight: '1.5', textAlign: 'justify' }}>
                    En este apartado deben describir detalladamente las fases de la intervención en crisis que se desarrollaron con el usuario. Estas fases incluyen: <span style={{ color: 'var(--color-accent)', fontWeight: '500' }}>Acogida, Exploración y comprensión del problema, Reestructuración, Planificación y cambio y Cierre.</span> Para los casos de LLHH/CCHH, es muy importante resaltar las estrategias que sirvieron para establecer límites, ya que son fundamentales en la intervención.
                </p>
                <textarea
                    id="sintesis"
                    value={formData.sintesis}
                    onChange={handleChange}
                    placeholder="Escriba aquí la síntesis..."
                    style={{
                        width: '100%',
                        padding: '16px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-secondary)',
                        background: '#ffffff',
                        color: 'var(--color-text-main)',
                        fontSize: '1rem',
                        outline: 'none',
                        resize: 'vertical',
                        minHeight: '120px'
                    }}
                />
            </Card>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
                <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? 'Registrando...' : 'Registrar Llamada Completa'}
                </Button>
            </div>
        </form>
    );
};

export default CallForm;
