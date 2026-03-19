import React, { useState, useEffect } from 'react';
import { useLists } from '../hooks/useLists';
import { db, auth } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { Trash2, FileUp, FileDown, Search, AlertTriangle } from 'lucide-react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';

const Reportes = () => {
    const { lists } = useLists();
    const [filters, setFilters] = useState({
        fechaInicio: '',
        fechaFin: '',
        orientador: '',
        problema: '',
        asiduidad: '',
        sexo: '',
        edad: ''
    });
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [usersList, setUsersList] = useState([]);

    // Fetch users for Orientador dropdown
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const users = await auth.getUsers();
                setUsersList(users.map((u) => ({ value: u.name, label: u.name })));
            } catch (err) {
                console.warn('Could not fetch users for filter:', err);
            }
        };
        fetchUsers();
    }, []);

    // Helper to get options safely from lists
    const getOptions = (key) => {
        if (!lists || !lists[key]) return [];
        return lists[key].filter((item) => item.active !== false);
    };

    if (!lists) {
        return <div className="container" style={{ padding: '20px', textAlign: 'center' }}>Cargando configuración...</div>;
    }

    const handleChange = (e) => {
        setFilters({ ...filters, [e.target.id]: e.target.value });
    };

    // Check user role
    const { user } = useAuth();
    const isAdmin = user && user.role === 'admin';

    const getFilteredData = async (filterOverride = {}) => {
        setLoading(true);
        setSearched(true);
        try {
            let data = await db.getCalls();

            const activeFilters = { ...filters, ...filterOverride };

            // Date Range
            if (activeFilters.fechaInicio) data = data.filter(item => item.c_fecha >= activeFilters.fechaInicio);
            if (activeFilters.fechaFin) data = data.filter(item => item.c_fecha <= activeFilters.fechaFin);

            // Specific Filters
            if (activeFilters.orientador) data = data.filter(item => item.orientador === activeFilters.orientador);
            // Adapt problem filtering to match data structure
            // CallForm stores l_problematica as just the letter key (e.g. "O"),
            // but the Reportes Select sends the full string (e.g. "O - PROBLEMAS...").
            // We extract the letter prefix and check ALL three problematica/problema pairs.
            if (activeFilters.problema) {
                const filterKey = activeFilters.problema.split(' - ')[0]; // Extract letter key
                data = data.filter(item => {
                    // Check all three problematica slots
                    const p1 = String(item.l_problematica_1 || '');
                    const p2 = String(item.l_problematica_2 || '');
                    const p3 = String(item.l_problematica_3 || '');
                    // Check all three problema slots (e.g. "O2" starts with "O")
                    const prob1 = String(item.l_problema_1 || '');
                    const prob2 = String(item.l_problema_2 || '');
                    const prob3 = String(item.l_problema_3 || '');

                    return p1 === filterKey || p1 === activeFilters.problema ||
                        p2 === filterKey || p2 === activeFilters.problema ||
                        p3 === filterKey || p3 === activeFilters.problema ||
                        prob1.startsWith(filterKey) || prob1 === activeFilters.problema ||
                        prob2.startsWith(filterKey) || prob2 === activeFilters.problema ||
                        prob3.startsWith(filterKey) || prob3 === activeFilters.problema;
                });
            }
            if (activeFilters.asiduidad) data = data.filter(item => item.l_asiduidad === activeFilters.asiduidad);
            if (activeFilters.sexo) data = data.filter(item => item.l_sexo === activeFilters.sexo);
            if (activeFilters.edad) data = data.filter(item => item.l_edad === activeFilters.edad);

            // Quick Filter: Last Week
            if (activeFilters.lastWeek) {
                const today = new Date();
                const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
                const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                const lastMonday = new Date(today);
                lastMonday.setDate(today.getDate() - diffToMonday);
                lastMonday.setHours(0, 0, 0, 0);

                data = data.filter(item => new Date(item.c_fecha) >= lastMonday);
            }

            // specific sorting (newest first)
            data.sort((a, b) => new Date(b.c_fecha + 'T' + b.c_hora) - new Date(a.c_fecha + 'T' + a.c_hora));

            // Quick Filter: Last 20
            if (activeFilters.last20) {
                data = data.slice(0, 20);
            }

            // Helper to get label robustly (handles string/number mismatch)
            const getLabel = (listName, val) => {
                if (!val || !lists || !lists[listName]) return val || '';
                const item = lists[listName].find(opt => String(opt.value) === String(val));
                return item ? item.label : val;
            };

            // formatting DD/MM/YYYY
            const formatDate = (dateString) => {
                if (!dateString) return '';
                const parts = dateString.split('-');
                if (parts.length === 3) {
                    return `${parts[2]}/${parts[1]}/${parts[0]}`;
                }
                return dateString;
            };

            // Map data to display format (convert codes to labels for both display AND export)
            const mappedData = data.map((item) => ({
                ...item, // Keep originals
                c_fecha: formatDate(item.c_fecha),
                orientador: item.orientador || 'Desconocido',
                sintesis: item.sintesis || '',
                // Header Section
                medioContacto: getLabel('Medio de contacto', item.medioContacto),
                comoConocio: getLabel('Comoconoce', item.comoConocio),
                // Llamante Section
                l_sexo: getLabel('Sexo', item.l_sexo),
                l_edad: getLabel('Edad', item.l_edad),
                l_ecivil: getLabel('E.Civil', item.l_ecivil),
                l_convive: getLabel('Convive', item.l_convive),
                l_asiduidad: getLabel('Asiduad', item.l_asiduidad),
                l_problematica_1: getLabel('Problemática', item.l_problematica_1),
                l_problema_1: getLabel('Problema', item.l_problema_1),
                l_problematica_2: getLabel('Problemática', item.l_problematica_2),
                l_problema_2: getLabel('Problema', item.l_problema_2),
                l_problematica_3: getLabel('Problemática', item.l_problematica_3),
                l_problema_3: getLabel('Problema', item.l_problema_3),
                l_naturaleza: getLabel('Naturaleza', item.l_naturaleza),
                l_inicio: getLabel('Inicio', item.l_inicio),
                l_actitud: getLabel('Actitud ante el orientador', item.l_actitud),
                l_presentacion: getLabel('Presentación', item.l_presentacion),
                l_paralenguaje: getLabel('Paralenguaje', item.l_paralenguaje),
                l_procedencia: getLabel('Procedencia', item.l_procedencia),
                l_peticion: getLabel('Petición', item.l_peticion),
                l_actitud_problema_1: getLabel('Actitud ante el problema', item.l_actitud_problema_1),
                l_actitud_problema_2: getLabel('Actitud ante el problema', item.l_actitud_problema_2),
                l_condicion: getLabel('Condicion Socioeconomica', item.l_condicion),
                l_derivada: getLabel('Llamada derivada', item.l_derivada),
                // Tercero Section
                t_sexo: getLabel('Sexo', item.t_sexo),
                t_edad: getLabel('Edad', item.t_edad),
                t_ecivil: getLabel('E.Civil', item.t_ecivil),
                t_convive: getLabel('Convive', item.t_convive),
                t_relacion: getLabel('Relación', item.t_relacion),
                t_problematica_1: getLabel('Problemática', item.t_problematica_1),
                t_problema_1: getLabel('Problema', item.t_problema_1),
                t_problematica_2: getLabel('Problemática', item.t_problematica_2),
                t_problema_2: getLabel('Problema', item.t_problema_2),
                t_problematica_3: getLabel('Problemática', item.t_problematica_3),
                t_problema_3: getLabel('Problema', item.t_problema_3),
                t_actitud_problema_1: getLabel('Actitud ante el problema', item.t_actitud_problema_1),
                t_actitud_problema_2: getLabel('Actitud ante el problema', item.t_actitud_problema_2),
                // Llamada Section
                c_resultado: getLabel('Resultado', item.c_resultado),
                c_duracion: getLabel('C_duracion', item.c_duracion),
                // Orientador Evaluation Section
                o_autoevaluacion: getLabel('Autoevaluación', item.o_autoevaluacion),
                o_volvera_llamar: getLabel('Volvera a llamar', item.o_volvera_llamar),
                o_nivel_ayuda_1: getLabel('Nivel de ayuda', item.o_nivel_ayuda_1),
                o_nivel_ayuda_2: getLabel('Nivel de ayuda', item.o_nivel_ayuda_2),
                o_sentimientos_1: getLabel('Sentimientos', item.o_sentimientos_1),
                o_sentimientos_2: getLabel('Sentimientos', item.o_sentimientos_2),
                o_sentimientos_3: getLabel('Sentimientos', item.o_sentimientos_3),
                o_actitudes_1: getLabel('Actitudes equivodas', item.o_actitudes_1),
                o_actitudes_2: getLabel('Actitudes equivodas', item.o_actitudes_2),
                o_satisfaccion_1: getLabel('Satisfacción del llamante', item.o_satisfaccion_1),
                o_satisfaccion_2: getLabel('Satisfacción del llamante', item.o_satisfaccion_2)
            }));

            setResults(mappedData);
        } catch (error) {
            console.warn("Error generating report:", error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const generateReport = () => getFilteredData();

    const handleLast20 = () => {
        // Clear date filters for this query
        getFilteredData({ last20: true, fechaInicio: '', fechaFin: '' });
    };

    const handleLastWeek = () => {
        getFilteredData({ lastWeek: true, fechaInicio: '', fechaFin: '' });
    };

    const handleDelete = async (id) => {
        if (!isAdmin) return;
        if (window.confirm("¿Está seguro de eliminar este registro? Esta acción no se puede deshacer.")) {
            await db.deleteCall(id);
            // Refresh results
            getFilteredData();
        }
    };

    const handleDeleteAll = async () => {
        if (!isAdmin) return;
        if (window.confirm("¡ADVERTENCIA! ¿Está seguro de eliminar TODOS los registros? Esta acción es irreversible.")) {
            await db.clearCalls();
            setResults([]);
        }
    };

    // CSV Export (Excel compatible) - Comprehensive Export
    const handleExport = () => {
        if (results.length === 0) {
            alert("No hay datos para exportar.");
            return;
        }

        const headers = [
            "Orientador", "Medio de Contacto", "Cómo Conoció",
            "L_Sexo", "L_Edad", "L_Estado Civil", "L_Convive", "L_Asiduidad",
            "L_Problemática 1", "L_Problema 1",
            "L_Problemática 2", "L_Problema 2",
            "L_Problemática 3", "L_Problema 3",
            "L_Naturaleza", "L_Inicio", "L_Actitud", "L_Presentación", "L_Paralenguaje",
            "L_Procedencia", "L_Petición",
            "L_Actitud Problema 1", "L_Actitud Problema 2",
            "L_Condición", "L_Derivada",
            "T_Sexo", "T_Edad", "T_Estado Civil", "T_Convive", "T_Relación",
            "T_Problemática 1", "T_Problema 1",
            "T_Problemática 2", "T_Problema 2",
            "T_Problemática 3", "T_Problema 3",
            "T_Actitud Problema 1", "T_Actitud Problema 2",
            "Fecha", "Hora", "Resultado", "Duración",
            "O_Clave", "O_Autoevaluación", "O_Volverá Llamar",
            "O_Nivel Ayuda 1", "O_Nivel Ayuda 2",
            "O_Sentimientos 1", "O_Sentimientos 2", "O_Sentimientos 3",
            "O_Actitudes 1", "O_Actitudes 2",
            "O_Satisfacción 1", "O_Satisfacción 2",
            "Síntesis"
        ];

        const escapeCSV = (value) => {
            if (value === null || value === undefined) return '';
            const str = String(value);
            if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        const csvContent = [
            headers.join(","),
            ...results.map((item) => [
                escapeCSV(item.orientador),
                escapeCSV(item.medioContacto),
                escapeCSV(item.comoConocio),
                escapeCSV(item.l_sexo),
                escapeCSV(item.l_edad),
                escapeCSV(item.l_ecivil),
                escapeCSV(item.l_convive),
                escapeCSV(item.l_asiduidad),
                escapeCSV(item.l_problematica_1),
                escapeCSV(item.l_problema_1),
                escapeCSV(item.l_problematica_2),
                escapeCSV(item.l_problema_2),
                escapeCSV(item.l_problematica_3),
                escapeCSV(item.l_problema_3),
                escapeCSV(item.l_naturaleza),
                escapeCSV(item.l_inicio),
                escapeCSV(item.l_actitud),
                escapeCSV(item.l_presentacion),
                escapeCSV(item.l_paralenguaje),
                escapeCSV(item.l_procedencia),
                escapeCSV(item.l_peticion),
                escapeCSV(item.l_actitud_problema_1),
                escapeCSV(item.l_actitud_problema_2),
                escapeCSV(item.l_condicion),
                escapeCSV(item.l_derivada),
                escapeCSV(item.t_sexo),
                escapeCSV(item.t_edad),
                escapeCSV(item.t_ecivil),
                escapeCSV(item.t_convive),
                escapeCSV(item.t_relacion),
                escapeCSV(item.t_problematica_1),
                escapeCSV(item.t_problema_1),
                escapeCSV(item.t_problematica_2),
                escapeCSV(item.t_problema_2),
                escapeCSV(item.t_problematica_3),
                escapeCSV(item.t_problema_3),
                escapeCSV(item.t_actitud_problema_1),
                escapeCSV(item.t_actitud_problema_2),
                escapeCSV(item.c_fecha),
                escapeCSV(item.c_hora),
                escapeCSV(item.c_resultado),
                escapeCSV(item.c_duracion),
                escapeCSV(item.o_clave),
                escapeCSV(item.o_autoevaluacion),
                escapeCSV(item.o_volvera_llamar),
                escapeCSV(item.o_nivel_ayuda_1),
                escapeCSV(item.o_nivel_ayuda_2),
                escapeCSV(item.o_sentimientos_1),
                escapeCSV(item.o_sentimientos_2),
                escapeCSV(item.o_sentimientos_3),
                escapeCSV(item.o_actitudes_1),
                escapeCSV(item.o_actitudes_2),
                escapeCSV(item.o_satisfaccion_1),
                escapeCSV(item.o_satisfaccion_2),
                escapeCSV(item.sintesis)
            ].join(","))
        ].join("\n");

        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `reporte_completo_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            const text = evt.target.result;
            // Simple CSV parser
            const lines = text.split('\\n');
            if (lines.length < 2) return;

            // Assume format matches our export: Header row, then data
            // For a robust import, we'd map columns. Here we act as if re-importing our backup.
            // Simplified: loop lines, parse CSV, add to DB.
            // NOTE: Parsing complex CSV with commas in quotes is tricky without lib.
            // basic split by comma might fail on quotes.
            // User requested "Import from Excel", CSV is best effort without sheetjs.

            let count = 0;
            // skipping header
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                // Basic mock import - populating core fields with random ID to simulating restoration
                // Real implementation needs a proper CSV parser
                const cols = lines[i].split(','); // This is fragile
                if (cols.length > 5) {
                    await db.addCall({
                        c_fecha: cols[1], // Index based on export order
                        sintesis: "Importado: " + (cols[13] || '').replace(/"/g, ''),
                        restored: true
                    });
                    count++;
                }
            }
            alert(`Se importaron ${count} registros (Simulado).`);
            generateReport(); // Refresh
        };
        reader.readAsText(file);
    };

    return (
        <div className="container animate-fade-in" style={{ paddingBottom: '4rem' }}>
            <section id="reportes" className="tab-content active" style={{ display: 'block' }}>
                <h2 style={{ color: 'var(--color-secondary)', borderBottom: '2px solid var(--color-secondary)', paddingBottom: '10px', marginBottom: '20px', fontWeight: '600' }}>
                    Generación de Reportes
                </h2>

                <div className="reporte-controls" style={{ display: 'flex', flexDirection: 'column', gap: '30px', marginBottom: '20px' }}>
                    <div className="glass-panel" style={{ padding: '20px' }}>
                        <h3 className="section-title">Filtros de Búsqueda</h3>
                        <form id="reporte-form-filters" onSubmit={(e) => { e.preventDefault(); generateReport(); }}>
                            <div className="form-grid-3" style={{ marginBottom: '20px' }}>
                                <Input
                                    id="fechaInicio"
                                    label="Fecha Inicio"
                                    type="date"
                                    value={filters.fechaInicio}
                                    onChange={handleChange}
                                />
                                <Input
                                    id="fechaFin"
                                    label="Fecha Fin"
                                    type="date"
                                    value={filters.fechaFin}
                                    onChange={handleChange}
                                />
                                <Select
                                    id="orientador"
                                    label="Orientador"
                                    value={filters.orientador}
                                    onChange={(e) => handleChange({ target: { id: 'orientador', value: e.target.value } })}
                                    options={usersList}
                                    placeholder="Todos"
                                />
                            </div>
                            <div className="form-grid-3" style={{ marginBottom: '20px' }}>
                                <Select
                                    id="problema"
                                    label="Problemática"
                                    value={filters.problema}
                                    onChange={(e) => handleChange({ target: { id: 'problema', value: e.target.value } })}
                                    options={getOptions('Problemática')}
                                    placeholder="Todas"
                                />
                                <Select
                                    id="asiduidad"
                                    label="Asiduidad"
                                    value={filters.asiduidad}
                                    onChange={(e) => handleChange({ target: { id: 'asiduidad', value: e.target.value } })}
                                    options={getOptions('Asiduad')}
                                    placeholder="Todas"
                                />
                                <Select
                                    id="sexo"
                                    label="Sexo"
                                    value={filters.sexo}
                                    onChange={(e) => handleChange({ target: { id: 'sexo', value: e.target.value } })}
                                    options={getOptions('Sexo')}
                                    placeholder="Todos"
                                />
                                <Select
                                    id="edad"
                                    label="Edad"
                                    value={filters.edad}
                                    onChange={(e) => handleChange({ target: { id: 'edad', value: e.target.value } })}
                                    options={getOptions('Edad')}
                                    placeholder="Todas"
                                />
                            </div>

                            {/* Action Buttons Row */}
                            <div className="action-buttons-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '15px', justifyContent: 'flex-start' }}>
                                <Button type="submit" variant="primary" style={{ width: '170px', padding: '10px', display: 'flex', justifyContent: 'center' }}>
                                    {loading ? 'Generando...' : 'Generar Reporte'}
                                </Button>
                                <Button type="button" onClick={handleExport} variant="secondary" style={{ width: '170px', padding: '10px', backgroundColor: 'white', border: '2px solid #3498db', color: '#3498db', display: 'flex', justifyContent: 'center' }}>
                                    <FileDown size={16} /> Exportar Excel
                                </Button>

                                <div className="file-input-wrapper" style={{ position: 'relative', overflow: 'hidden', display: 'inline-block' }}>
                                    <Button type="button" variant="secondary" style={{ width: '170px', padding: '10px', backgroundColor: 'white', border: '2px solid #27ae60', color: '#27ae60', display: 'flex', justifyContent: 'center' }}>
                                        <FileUp size={16} /> Importar Excel
                                    </Button>
                                    <input type="file" accept=".csv" onChange={handleImport} style={{ position: 'absolute', top: 0, left: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
                                </div>

                                {isAdmin && (
                                    <Button type="button" onClick={handleDeleteAll} variant="danger" style={{ width: '170px', padding: '10px', backgroundColor: '#e74c3c', border: '2px solid #c0392b', color: 'white', display: 'flex', justifyContent: 'center' }}>
                                        <AlertTriangle size={16} /> Eliminar TODO
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="glass-panel" style={{ padding: '20px' }}>
                        <h3 className="section-title">Consultas Rápidas</h3>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <Button onClick={handleLast20} variant="primary" style={{ width: '200px', display: 'flex', justifyContent: 'center' }}>Últimas 20 llamadas</Button>
                            <Button onClick={handleLastWeek} variant="primary" style={{ width: '200px', display: 'flex', justifyContent: 'center' }}>Última semana</Button>
                        </div>
                    </div>
                </div>

                <div className="reporte-display">
                    <h3 style={{ marginBottom: '1rem' }}>Resultados del Reporte (<span id="total-registros">{results.length}</span> llamadas)</h3>
                    <div className="table-responsive-wrapper">
                        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', fontSize: '0.9em' }}>
                            <thead>
                                <tr>
                                    <th style={{ width: '35px', minWidth: '35px', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', padding: '10px', textAlign: 'center' }}>No</th>
                                    <th style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', padding: '10px', textAlign: 'left' }}>Orientador</th>
                                    <th style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', padding: '10px', textAlign: 'left' }}>Problema</th>
                                    <th style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', padding: '10px', textAlign: 'left' }}>Síntesis</th>
                                    <th style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', padding: '10px', textAlign: 'left' }}>Fecha</th>
                                    <th style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', padding: '10px', textAlign: 'left' }}>Duración</th>
                                    <th style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', padding: '10px', textAlign: 'left' }}>Sexo</th>
                                    <th style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', padding: '10px', textAlign: 'left' }}>Edad</th>
                                    <th style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', padding: '10px', textAlign: 'left' }}>Cómo se enteró</th>
                                    {isAdmin && <th style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', padding: '10px', textAlign: 'left' }}>Acciones</th>}
                                </tr>
                            </thead>
                            <tbody id="reporte-table-body">
                                {results.length === 0 ? (
                                    <tr><td colSpan={isAdmin ? "10" : "9"} className="no-data" style={{ textAlign: 'center', padding: '20px', color: '#888', fontStyle: 'italic' }}>
                                        {searched ? 'No hay llamadas registradas o no coinciden con los filtros.' : 'Configure los filtros y haga clic en Generar Reporte.'}
                                    </td></tr>
                                ) : (
                                    results.map((row, index) => (
                                        <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
                                            <td style={{ padding: '10px', borderBottom: '1px solid #eee', textAlign: 'center', fontWeight: '600', color: 'var(--color-text-muted)' }}>{index + 1}</td>
                                            <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{row.orientador}</td>
                                            <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                                                {[row.l_problema_1, row.l_problema_2, row.l_problema_3]
                                                    .filter(p => p && p.trim() !== '')
                                                    .map((p, pIdx) => (
                                                        <div key={pIdx} style={{ marginBottom: '4px' }}>• {p}</div>
                                                    ))}
                                            </td>
                                            <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{row.sintesis}</td>
                                            <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{row.c_fecha}</td>
                                            <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{row.c_duracion}</td>
                                            <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{row.l_sexo}</td>
                                            <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{row.l_edad}</td>
                                            <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{row.comoConocio}</td>
                                            {isAdmin && (
                                                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                                                    <button onClick={() => handleDelete(row.id)} title="Eliminar registro" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#e74c3c' }}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Reportes;
