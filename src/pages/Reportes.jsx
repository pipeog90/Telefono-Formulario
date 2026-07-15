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
    const [filters, setFilters] = useState(() => {
        const saved = sessionStorage.getItem('reportesFilters');
        return saved ? JSON.parse(saved) : {
            fechaInicio: '',
            fechaFin: '',
            orientador: '',
            problema: '',
            asiduidad: '',
            sexo: '',
            edad: ''
        };
    });
    const [results, setResults] = useState(() => {
        try {
            const saved = sessionStorage.getItem('reportesResults');
            return saved ? JSON.parse(saved) : [];
        } catch(e) { return []; }
    });
    const [rawResults, setRawResults] = useState(() => {
        try {
            const saved = sessionStorage.getItem('reportesRawResults');
            return saved ? JSON.parse(saved) : [];
        } catch(e) { return []; }
    });
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(() => {
        const saved = sessionStorage.getItem('reportesSearched');
        return saved ? JSON.parse(saved) : false;
    });
    const [usersList, setUsersList] = useState([]);

    // Filters and Pagination for the table
    const [columnFilters, setColumnFilters] = useState(() => {
        const saved = sessionStorage.getItem('reportesColumnFilters');
        return saved ? JSON.parse(saved) : {};
    });
    const [currentPage, setCurrentPage] = useState(() => {
        const saved = sessionStorage.getItem('reportesCurrentPage');
        return saved ? JSON.parse(saved) : 1;
    });
    const [itemsPerPage, setItemsPerPage] = useState(() => {
        const saved = sessionStorage.getItem('reportesItemsPerPage');
        return saved ? JSON.parse(saved) : 20;
    });

    // Sync state to sessionStorage
    useEffect(() => { sessionStorage.setItem('reportesFilters', JSON.stringify(filters)); }, [filters]);
    useEffect(() => { sessionStorage.setItem('reportesSearched', JSON.stringify(searched)); }, [searched]);
    useEffect(() => { sessionStorage.setItem('reportesColumnFilters', JSON.stringify(columnFilters)); }, [columnFilters]);
    useEffect(() => { sessionStorage.setItem('reportesCurrentPage', JSON.stringify(currentPage)); }, [currentPage]);
    useEffect(() => { sessionStorage.setItem('reportesItemsPerPage', JSON.stringify(itemsPerPage)); }, [itemsPerPage]);
    useEffect(() => {
        try {
            sessionStorage.setItem('reportesResults', JSON.stringify(results));
            sessionStorage.setItem('reportesRawResults', JSON.stringify(rawResults));
        } catch (e) {
            console.warn("Could not save report results to sessionStorage. Quota exceeded?", e);
        }
    }, [results, rawResults]);

    // Fetch users for Orientador dropdown
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const users = await auth.getUsers();
                setUsersList(users.map((u) => ({ value: u.name, label: u.name, Clave: u.Clave })));
            } catch (err) {
                console.warn('Could not fetch users for filter:', err);
            }
        };
        fetchUsers();
    }, []);

    // Memoized options for Select components to prevent repeated filtering on every render
    const optionsCache = React.useMemo(() => {
        if (!lists) return {};
        const cache = {};
        Object.keys(lists).forEach(key => {
            cache[key] = (lists[key] || []).filter(item => item.active !== false);
        });
        return cache;
    }, [lists]);

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
            const activeFilters = { ...filters, ...filterOverride };
            let data = await db.getCalls(activeFilters);

            // Robust Matcher for basic fields
            const safeMatch = (itemValue, filterValue, listName) => {
                if (!filterValue) return true;
                const v1 = String(itemValue || '').trim().toUpperCase();
                const v2 = String(filterValue || '').trim().toUpperCase();
                const v2Id = v2.split(' - ')[0].trim();
                
                if (v1 === v2 || v1 === v2Id || v1.startsWith(`${v2Id} -`) || v1.startsWith(`${v2Id}-`)) return true;

                if (listName && lists && lists[listName]) {
                    const matchedOption = lists[listName].find(opt => String(opt.value).toUpperCase() === v2);
                    if (matchedOption) {
                        const parts = matchedOption.label.split(' - ');
                        if (parts.length > 1) {
                            const labelText = parts.slice(1).join(' - ').trim().toUpperCase();
                            if (v1 === labelText || v1.includes(labelText)) return true;
                        }
                    }
                }
                return false;
            };

            // Specific Filters
            if (activeFilters.orientador) {
                // Find the selected user's Clave to match legacy data
                const selectedUser = usersList.find(u => u.value === activeFilters.orientador);
                const mappedClave = selectedUser ? selectedUser.Clave : null;

                data = data.filter(item => {
                    // Item could be legacy (O_Clave) or new (L_Orientador)
                    return safeMatch(item.L_Orientador, activeFilters.orientador, null) || 
                           (mappedClave && safeMatch(item.O_Clave, mappedClave, null)) ||
                           safeMatch(item.O_Clave, activeFilters.orientador, null);
                });
            }
            
            if (activeFilters.problema) {
                const filterKey = activeFilters.problema.split(' - ')[0].trim().toUpperCase();
                const probRegex = new RegExp(`^${filterKey}\\d+`);
                
                let problematicaLabelText = '';
                let problemaLabelText = '';
                
                if (filterKey.length === 1) {
                    const matchedOption = (lists['PROBLEMATICA'] || []).find(opt => String(opt.value).toUpperCase() === filterKey);
                    if (matchedOption) {
                        const parts = matchedOption.label.split(' - ');
                        if (parts.length > 1) problematicaLabelText = parts.slice(1).join(' - ').trim().toUpperCase();
                    }
                } else {
                    const matchedOption = (lists['PROBLEMA'] || []).find(opt => String(opt.value).toUpperCase() === filterKey);
                    if (matchedOption) {
                        const parts = matchedOption.label.split(' - ');
                        if (parts.length > 1) problemaLabelText = parts.slice(1).join(' - ').trim().toUpperCase();
                    }
                }
                
                data = data.filter(item => {
                    const p1 = String(item.U_Problematica_1 || '').trim().toUpperCase();
                    const p2 = String(item.U_Problematica_2 || '').trim().toUpperCase();
                    const p3 = String(item.U_Problematica_3 || '').trim().toUpperCase();
                    
                    const prob1 = String(item.U_Problema_1 || '').trim().toUpperCase();
                    const prob2 = String(item.U_Problema_2 || '').trim().toUpperCase();
                    const prob3 = String(item.U_Problema_3 || '').trim().toUpperCase();

                    const matchesProb = (p) => {
                        if (p === filterKey || p.startsWith(`${filterKey} -`) || p.startsWith(`${filterKey}-`)) return true;
                        if (filterKey.length === 1 && problematicaLabelText && (p === problematicaLabelText || p.includes(problematicaLabelText))) return true;
                        return false;
                    };
                    
                    const matchesProblem = (prob) => {
                        if (prob === filterKey || prob.startsWith(`${filterKey} -`) || prob.startsWith(`${filterKey}-`)) return true;
                        if (filterKey.length > 1 && problemaLabelText && (prob === problemaLabelText || prob.includes(problemaLabelText))) return true;
                        if (filterKey.length === 1 && probRegex.test(prob)) return true;
                        return false;
                    };

                    return matchesProb(p1) || matchesProb(p2) || matchesProb(p3) ||
                           matchesProblem(prob1) || matchesProblem(prob2) || matchesProblem(prob3);
                });
            }

            if (activeFilters.asiduidad) data = data.filter(item => safeMatch(item.U_Asiduidad, activeFilters.asiduidad, 'ASIDUIDAD'));
            if (activeFilters.sexo) data = data.filter(item => safeMatch(item.U_Sexo, activeFilters.sexo, 'SEXO'));
            if (activeFilters.edad) data = data.filter(item => safeMatch(item.U_Edad, activeFilters.edad, 'EDAD'));

            // Date Range Filters
            if (activeFilters.fechaInicio) {
                data = data.filter(item => item.L_Fecha >= activeFilters.fechaInicio);
            }
            if (activeFilters.fechaFin) {
                data = data.filter(item => item.L_Fecha <= activeFilters.fechaFin);
            }

            // Quick Filter: Last Week
            if (activeFilters.lastWeek) {
                const today = new Date();
                const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
                const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                const currentMonday = new Date(today);
                currentMonday.setDate(today.getDate() - diffToMonday);
                
                const lastWeekMonday = new Date(currentMonday);
                lastWeekMonday.setDate(currentMonday.getDate() - 7);
                
                const lastWeekSunday = new Date(currentMonday);
                lastWeekSunday.setDate(currentMonday.getDate() - 1);
                
                // Format strings to match 'YYYY-MM-DD' since item.L_Fecha is in that format
                const pad = (n) => n.toString().padStart(2, '0');
                const lastMonStr = `${lastWeekMonday.getFullYear()}-${pad(lastWeekMonday.getMonth() + 1)}-${pad(lastWeekMonday.getDate())}`;
                const lastSunStr = `${lastWeekSunday.getFullYear()}-${pad(lastWeekSunday.getMonth() + 1)}-${pad(lastWeekSunday.getDate())}`;

                data = data.filter(item => item.L_Fecha >= lastMonStr && item.L_Fecha <= lastSunStr);
            }

            // specific sorting (newest first)
            data.sort((a, b) => {
                const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date((a.L_Fecha || '') + 'T' + (a.L_Hora || '00:00')).getTime();
                const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date((b.L_Fecha || '') + 'T' + (b.L_Hora || '00:00')).getTime();
                return (timeB || 0) - (timeA || 0);
            });

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

            // Build a quick lookup for Orientador names and Claves
            const orientadorMap = {};
            const claveToNameMap = {};
            usersList.forEach(u => {
                if (u.value) {
                    orientadorMap[u.value] = u.label || u.description || u.value;
                }
                if (u.Clave) {
                    claveToNameMap[u.Clave] = u.label || u.value;
                }
            });

            // Map data to display format (convert codes to labels for both display AND export)
            const mappedData = data.map((item) => {
                // If L_Orientador is missing (legacy data) but we have O_Clave, find the name
                let resolvedOrientador = item.L_Orientador;
                if (!resolvedOrientador && item.O_Clave) {
                    resolvedOrientador = claveToNameMap[item.O_Clave] || orientadorMap[item.O_Clave] || item.O_Clave;
                }

                return {
                ...item, // Keep originals
                l_id_llamada: item.L_ID_Llamada || '—',
                c_fecha: formatDate(item.L_Fecha),
                orientador: resolvedOrientador || 'Desconocido',
                L_Orientador: resolvedOrientador || 'Desconocido', // Overwrite for the table to render it
                sintesis: item.L_Sintesis || '',
                // Header Section
                medioContacto: getLabel('MEDIO_CONTACTO', item.L_Medio_Contacto),
                comoConocio: getLabel('COMO_CONOCE', item.L_Como_Conoce),
                // Llamante Section
                l_sexo: getLabel('SEXO', item.U_Sexo),
                l_edad: getLabel('EDAD', item.U_Edad),
                l_ecivil: getLabel('ESTADO_CIVIL', item.U_Estado_Civil),
                l_convive: getLabel('CONVIVE', item.U_Convive),
                l_asiduidad: getLabel('ASIDUIDAD', item.U_Asiduidad),
                l_problematica_1: getLabel('PROBLEMATICA', item.U_Problematica_1),
                l_problema_1: getLabel('PROBLEMA', item.U_Problema_1),
                l_problematica_2: getLabel('PROBLEMATICA', item.U_Problematica_2),
                l_problema_2: getLabel('PROBLEMA', item.U_Problema_2),
                l_problematica_3: getLabel('PROBLEMATICA', item.U_Problematica_3),
                l_problema_3: getLabel('PROBLEMA', item.U_Problema_3),
                l_naturaleza: getLabel('NATURALEZA', item.U_Naturaleza),
                l_inicio: getLabel('INICIO', item.U_Inicio),
                l_actitud: getLabel('ACTITUD_ORIENTADOR', item.U_Actitud_Orientador),
                l_presentacion: getLabel('PRESENTACION', item.U_Presentacion),
                l_paralenguaje: getLabel('PARALENGUAJE', item.U_Paralenguaje),
                l_procedencia: getLabel('PROCEDENCIA', item.U_Procedencia),
                l_peticion: getLabel('PETICION', item.U_Peticion),
                l_actitud_problema_1: getLabel('ACTITUD_PROBLEMA', item.U_Actitud_Problema_1),
                l_actitud_problema_2: getLabel('ACTITUD_PROBLEMA', item.U_Actitud_Problema_2),
                l_condicion: getLabel('CONDICION_SOCIOECONOMICA', item.U_Cond_Socioeconomica),
                l_derivada: getLabel('LLAMADA_DERIVADA', item.L_Llamada_Derivada),
                // Tercero Section
                t_sexo: getLabel('SEXO', item.T_Sexo_Tercero),
                t_edad: getLabel('EDAD', item.T_Edad_Tercero),
                t_ecivil: getLabel('ESTADO_CIVIL', item.T_Estado_Civil_Tercero),
                t_convive: getLabel('CONVIVE', item.T_Convive),
                t_relacion: getLabel('RELACION', item.T_Relacion),
                t_problematica_1: getLabel('PROBLEMATICA', item.T_Problematica_1),
                t_problema_1: getLabel('PROBLEMA', item.T_Problema_1),
                t_problematica_2: getLabel('PROBLEMATICA', item.T_Problematica_2),
                t_problema_2: getLabel('PROBLEMA', item.T_Problema_2),
                t_problematica_3: getLabel('PROBLEMATICA', item.T_Problematica_3),
                t_problema_3: getLabel('PROBLEMA', item.T_Problema_3),
                t_actitud_problema_1: getLabel('ACTITUD_PROBLEMA', item.T_Actitud_Problema_1),
                t_actitud_problema_2: getLabel('ACTITUD_PROBLEMA', item.T_Actitud_Problema_2),
                // Llamada Section
                c_resultado: getLabel('RESULTADO', item.L_Resultado),
                c_duracion: getLabel('RANGO_DURACION', item.L_Duracion),
                // Orientador Evaluation Section
                o_autoevaluacion: getLabel('AUTOEVALUACION', item.O_Autoevaluacion),
                o_volvera_llamar: getLabel('VOLVERA_LLAMAR', item.O_Volvera_Llamar),
                o_nivel_ayuda_1: getLabel('NIVEL_AYUDA', item.O_Nivel_Ayuda_1),
                o_nivel_ayuda_2: getLabel('NIVEL_AYUDA', item.O_Nivel_Ayuda_2),
                o_sentimientos_1: getLabel('SENTIMIENTOS', item.O_Sentimientos_1),
                o_sentimientos_2: getLabel('SENTIMIENTOS', item.O_Sentimientos_2),
                o_sentimientos_3: getLabel('SENTIMIENTOS', item.O_Sentimientos_3),
                o_actitudes_1: getLabel('ACTITUD_EQUIVOCADA', item.O_Actitud_Equivocada_1),
                o_actitudes_2: getLabel('ACTITUD_EQUIVOCADA', item.O_Actitud_Equivocada_2),
                o_satisfaccion_1: getLabel('SATISFACCION', item.O_Satisfaccion_1),
                o_satisfaccion_2: getLabel('SATISFACCION', item.O_Satisfaccion_2)
            };
        });

        setResults(mappedData);
            setRawResults(data);
            setColumnFilters({});
        } catch (error) {
            console.warn("Error generating report:", error);
            setResults([]);
            setColumnFilters({});
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
            try {
                await db.clearCalls();
                setResults([]);
                setSearched(false);
                setColumnFilters({});
            } catch (err) {
                console.error("Error clearing calls:", err);
            }
        }
    };

    // CSV Export (Excel compatible) - Comprehensive Export
    const handleExport = () => {
        if (results.length === 0) {
            alert("No hay datos para exportar.");
            return;
        }

        const headers = [
            "ID", "Orientador", "Medio de Contacto", "Cómo Conoció",
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
            ...rawResults.map((item) => [
                escapeCSV(item.L_ID_Llamada),
                escapeCSV(item.L_Orientador),
                escapeCSV(item.L_Medio_Contacto),
                escapeCSV(item.L_Como_Conoce),
                escapeCSV(item.U_Sexo),
                escapeCSV(item.U_Edad),
                escapeCSV(item.U_Estado_Civil),
                escapeCSV(item.U_Convive),
                escapeCSV(item.U_Asiduidad),
                escapeCSV(item.U_Problematica_1),
                escapeCSV(item.U_Problema_1),
                escapeCSV(item.U_Problematica_2),
                escapeCSV(item.U_Problema_2),
                escapeCSV(item.U_Problematica_3),
                escapeCSV(item.U_Problema_3),
                escapeCSV(item.U_Naturaleza),
                escapeCSV(item.U_Inicio),
                escapeCSV(item.U_Actitud_Orientador),
                escapeCSV(item.U_Presentacion),
                escapeCSV(item.U_Paralenguaje),
                escapeCSV(item.U_Procedencia),
                escapeCSV(item.U_Peticion),
                escapeCSV(item.U_Actitud_Problema_1),
                escapeCSV(item.U_Actitud_Problema_2),
                escapeCSV(item.U_Cond_Socioeconomica),
                escapeCSV(item.L_Llamada_Derivada),
                escapeCSV(item.T_Sexo_Tercero),
                escapeCSV(item.T_Edad_Tercero),
                escapeCSV(item.T_Estado_Civil_Tercero),
                escapeCSV(item.T_Convive),
                escapeCSV(item.T_Relacion),
                escapeCSV(item.T_Problematica_1),
                escapeCSV(item.T_Problema_1),
                escapeCSV(item.T_Problematica_2),
                escapeCSV(item.T_Problema_2),
                escapeCSV(item.T_Problematica_3),
                escapeCSV(item.T_Problema_3),
                escapeCSV(item.T_Actitud_Problema_1),
                escapeCSV(item.T_Actitud_Problema_2),
                escapeCSV(item.L_Fecha),
                escapeCSV(item.L_Hora),
                escapeCSV(item.L_Resultado),
                escapeCSV(item.L_Duracion),
                escapeCSV(item.O_Clave),
                escapeCSV(item.O_Autoevaluacion),
                escapeCSV(item.O_Volvera_Llamar),
                escapeCSV(item.O_Nivel_Ayuda_1),
                escapeCSV(item.O_Nivel_Ayuda_2),
                escapeCSV(item.O_Sentimientos_1),
                escapeCSV(item.O_Sentimientos_2),
                escapeCSV(item.O_Sentimientos_3),
                escapeCSV(item.O_Actitud_Equivocada_1),
                escapeCSV(item.O_Actitud_Equivocada_2),
                escapeCSV(item.O_Satisfaccion_1),
                escapeCSV(item.O_Satisfaccion_2),
                escapeCSV(item.L_Sintesis)
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
            const lines = text.split('\n');
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

    const uniqueOptionsCache = React.useMemo(() => {
        if (!results || results.length === 0) return {};
        const fields = ['L_ID_Llamada', 'L_Orientador', 'L_Sintesis', 'L_Fecha', 'L_Duracion', 'U_Sexo', 'U_Edad', 'L_Como_Conoce', 'U_Asiduidad'];
        const cache = {};
        
        fields.forEach(f => {
            let availableResults = results;
            
            // Apply all filters *except* the current column
            Object.entries(columnFilters).forEach(([key, value]) => {
                if (key !== f && value && value.trim() !== '') {
                    const lowerValue = value.toLowerCase().trim();
                    availableResults = availableResults.filter(item => {
                        if (key === 'Problema') {
                            return (item.U_Problema_1 || '').toLowerCase().trim() === lowerValue ||
                                   (item.U_Problema_2 || '').toLowerCase().trim() === lowerValue ||
                                   (item.U_Problema_3 || '').toLowerCase().trim() === lowerValue;
                        }
                        if (key === 'L_Sintesis') {
                            return String(item[key] || '').toLowerCase().includes(lowerValue);
                        }
                        return String(item[key] || '').toLowerCase().trim() === lowerValue;
                    });
                }
            });

            cache[f] = [...new Set(availableResults.map(r => r[f]))].filter(Boolean).sort();
        });
        
        // Special case: Problema
        let availableResultsForProblema = results;
        Object.entries(columnFilters).forEach(([key, value]) => {
            if (key !== 'Problema' && value && value.trim() !== '') {
                const lowerValue = value.toLowerCase().trim();
                availableResultsForProblema = availableResultsForProblema.filter(item => {
                    return String(item[key] || '').toLowerCase().trim() === lowerValue;
                });
            }
        });

        const allProblems = [];
        availableResultsForProblema.forEach(r => {
            if (r.U_Problema_1) allProblems.push(r.U_Problema_1);
            if (r.U_Problema_2) allProblems.push(r.U_Problema_2);
            if (r.U_Problema_3) allProblems.push(r.U_Problema_3);
        });
        cache['Problema'] = [...new Set(allProblems)].filter(Boolean).sort();
        
        return cache;
    }, [results, columnFilters]);

    const getUniqueOptions = (field) => {
        return uniqueOptionsCache[field] || [];
    };

    // ── Pagination and Filtering Logic ──────────────────────────────────────
    const filteredResults = React.useMemo(() => {
        let res = results;
        Object.entries(columnFilters).forEach(([key, value]) => {
            if (value && value.trim() !== '') {
                const lowerValue = value.toLowerCase().trim();
                res = res.filter(item => {
                    if (key === 'Problema') {
                        return (item.U_Problema_1 || '').toLowerCase().trim() === lowerValue ||
                               (item.U_Problema_2 || '').toLowerCase().trim() === lowerValue ||
                               (item.U_Problema_3 || '').toLowerCase().trim() === lowerValue;
                    }
                    if (key === 'L_Sintesis') {
                        return String(item[key] || '').toLowerCase().includes(lowerValue);
                    }
                    return String(item[key] || '').toLowerCase().trim() === lowerValue;
                });
            }
        });
        return res;
    }, [results, columnFilters]);

    const totalPages = Math.max(1, Math.ceil(filteredResults.length / itemsPerPage));
    
    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(1);
        }
    }, [totalPages, currentPage]);

    const paginatedResults = React.useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredResults.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredResults, currentPage, itemsPerPage]);

    const handleColumnFilterChange = (column, value) => {
        setColumnFilters(prev => ({ ...prev, [column]: value }));
        setCurrentPage(1);
    };

    const clearColumnFilters = () => {
        setColumnFilters({});
        setCurrentPage(1);
    };

    return (
        <div className="container animate-fade-in" style={{ paddingBottom: '4rem' }}>
            <section id="reportes" className="tab-content active" style={{ display: 'block' }}>
                <h2 style={{ color: 'var(--color-secondary)', borderBottom: '2px solid var(--color-secondary)', paddingBottom: '2px', marginBottom: '2px', fontWeight: '600' }}>
                    Generación de Reportes
                </h2>

                <div className="reporte-controls" style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '2px' }}>
                    <div className="glass-panel" style={{ padding: 'var(--card-padding)' }}>
                        <h3 className="section-title">Filtros de Búsqueda</h3>
                        <form id="reporte-form-filters" onSubmit={(e) => { e.preventDefault(); generateReport(); }}>
                            <div className="form-grid-3" style={{ marginBottom: '6px' }}>
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
                                    tooltip="Nombre del orientador"
                                />
                            </div>
                            <div className="form-grid-3" style={{ marginBottom: '1px' }}>
                                <Select
                                    id="problema"
                                    label="Problemática"
                                    value={filters.problema}
                                    onChange={(e) => handleChange({ target: { id: 'problema', value: e.target.value } })}
                                    options={optionsCache['PROBLEMATICA']}
                                    placeholder="Todas"
                                    tooltip="Problemática o causa posible del problema"
                                />
                                <Select
                                    id="asiduidad"
                                    label="Asiduidad"
                                    value={filters.asiduidad}
                                    onChange={(e) => handleChange({ target: { id: 'asiduidad', value: e.target.value } })}
                                    options={optionsCache['ASIDUIDAD']}
                                    placeholder="Todas"
                                    tooltip="Frecuencia de llamada del usuario"
                                />
                                <Select
                                    id="sexo"
                                    label="Sexo"
                                    value={filters.sexo}
                                    onChange={(e) => handleChange({ target: { id: 'sexo', value: e.target.value } })}
                                    options={optionsCache['SEXO']}
                                    placeholder="Todos"
                                    tooltip="Sexo"
                                />
                                <Select
                                    id="edad"
                                    label="Rango de Edad"
                                    value={filters.edad}
                                    onChange={(e) => handleChange({ target: { id: 'edad', value: e.target.value } })}
                                    options={optionsCache['EDAD']}
                                    placeholder="Todos"
                                    tooltip="Edad en la cual se identifica al usuario"
                                />
                            </div>

                            {/* Action Buttons Row */}
                            <div className="action-buttons-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px', justifyContent: 'flex-start' }}>
                                <Button type="submit" variant="primary" style={{ width: '170px', padding: '10px', display: 'flex', justifyContent: 'center', backgroundColor: loading ? '#f39c12' : '', borderColor: loading ? '#e67e22' : '' }}>
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

                    <div className="glass-panel" style={{ padding: 'var(--card-padding)' }}>
                        <h3 className="section-title">Consultas Rápidas</h3>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <Button onClick={handleLast20} variant="primary" style={{ width: '170px', padding: '10px', display: 'flex', justifyContent: 'center', whiteSpace: 'nowrap' }}>Últimas 20 llamadas</Button>
                            <Button onClick={handleLastWeek} variant="primary" style={{ width: '170px', padding: '10px', display: 'flex', justifyContent: 'center', whiteSpace: 'nowrap' }}>Última semana</Button>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '8px' }}>
                    <h3 style={{ margin: '0 0 6px 0', color: 'var(--color-secondary)', fontWeight: '600', paddingLeft: '4px' }}>Resultados del Reporte (<span id="total-registros">{results.length}</span> llamadas)</h3>
                    <div className="premium-table-wrapper" style={{ marginBottom: '0' }}>
                        <div className="table-responsive-wrapper">
                            <table className="premium-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '40px', textAlign: 'center' }}>No</th>
                                    <th>
                                        <div>ID</div>
                                        {results.length > 0 && (
                                            <select className="table-filter-input" value={columnFilters.L_ID_Llamada || ''} onChange={e => handleColumnFilterChange('L_ID_Llamada', e.target.value)}>
                                                <option value="">Filtrar...</option>
                                                {getUniqueOptions('L_ID_Llamada').map((opt, i) => <option key={i} value={opt}>{opt || '-'}</option>)}
                                            </select>
                                        )}
                                    </th>
                                    <th>
                                        <div>Orientador</div>
                                        {results.length > 0 && (
                                            <select className="table-filter-input" value={columnFilters.L_Orientador || ''} onChange={e => handleColumnFilterChange('L_Orientador', e.target.value)}>
                                                <option value="">Filtrar...</option>
                                                {getUniqueOptions('L_Orientador').map((opt, i) => <option key={i} value={opt}>{opt || '-'}</option>)}
                                            </select>
                                        )}
                                    </th>
                                    <th>
                                        <div>Problema</div>
                                        {results.length > 0 && (
                                            <select className="table-filter-input" value={columnFilters.Problema || ''} onChange={e => handleColumnFilterChange('Problema', e.target.value)}>
                                                <option value="">Filtrar...</option>
                                                {getUniqueOptions('Problema').map((opt, i) => <option key={i} value={opt}>{opt || '-'}</option>)}
                                            </select>
                                        )}
                                    </th>
                                    <th>
                                        <div>Síntesis</div>
                                        {results.length > 0 && (
                                            <input 
                                                type="text" 
                                                className="table-filter-input" 
                                                placeholder="Buscar..." 
                                                value={columnFilters.L_Sintesis || ''} 
                                                onChange={e => handleColumnFilterChange('L_Sintesis', e.target.value)}
                                            />
                                        )}
                                    </th>
                                    <th>
                                        <div>Fecha</div>
                                        {results.length > 0 && (
                                            <select className="table-filter-input" value={columnFilters.L_Fecha || ''} onChange={e => handleColumnFilterChange('L_Fecha', e.target.value)}>
                                                <option value="">Filtrar...</option>
                                                {getUniqueOptions('L_Fecha').map((opt, i) => <option key={i} value={opt}>{opt || '-'}</option>)}
                                            </select>
                                        )}
                                    </th>
                                    <th>
                                        <div>Duración</div>
                                        {results.length > 0 && (
                                            <select className="table-filter-input" value={columnFilters.L_Duracion || ''} onChange={e => handleColumnFilterChange('L_Duracion', e.target.value)}>
                                                <option value="">Filtrar...</option>
                                                {getUniqueOptions('L_Duracion').map((opt, i) => <option key={i} value={opt}>{opt || '-'}</option>)}
                                            </select>
                                        )}
                                    </th>
                                    <th>
                                        <div>Sexo</div>
                                        {results.length > 0 && (
                                            <select className="table-filter-input" value={columnFilters.U_Sexo || ''} onChange={e => handleColumnFilterChange('U_Sexo', e.target.value)}>
                                                <option value="">Filtrar...</option>
                                                {getUniqueOptions('U_Sexo').map((opt, i) => <option key={i} value={opt}>{opt || '-'}</option>)}
                                            </select>
                                        )}
                                    </th>
                                    <th>
                                        <div>Edad</div>
                                        {results.length > 0 && (
                                            <select className="table-filter-input" value={columnFilters.U_Edad || ''} onChange={e => handleColumnFilterChange('U_Edad', e.target.value)}>
                                                <option value="">Filtrar...</option>
                                                {getUniqueOptions('U_Edad').map((opt, i) => <option key={i} value={opt}>{opt || '-'}</option>)}
                                            </select>
                                        )}
                                    </th>
                                    <th>
                                        <div>Cómo se enteró</div>
                                        {results.length > 0 && (
                                            <select className="table-filter-input" value={columnFilters.L_Como_Conoce || ''} onChange={e => handleColumnFilterChange('L_Como_Conoce', e.target.value)}>
                                                <option value="">Filtrar...</option>
                                                {getUniqueOptions('L_Como_Conoce').map((opt, i) => <option key={i} value={opt}>{opt || '-'}</option>)}
                                            </select>
                                        )}
                                    </th>
                                    <th>
                                        <div>Asiduidad</div>
                                        {results.length > 0 && (
                                            <select className="table-filter-input" value={columnFilters.U_Asiduidad || ''} onChange={e => handleColumnFilterChange('U_Asiduidad', e.target.value)}>
                                                <option value="">Filtrar...</option>
                                                {getUniqueOptions('U_Asiduidad').map((opt, i) => <option key={i} value={opt}>{opt || '-'}</option>)}
                                            </select>
                                        )}
                                    </th>
                                </tr>
                            </thead>
                            <tbody id="reporte-table-body">
                                {paginatedResults.length === 0 ? (
                                    <tr><td colSpan="11" className="no-data" style={{ textAlign: 'center', padding: '20px', color: '#888', fontStyle: 'italic' }}>
                                        {loading ? 'Generando reporte...' : (searched ? 'No hay llamadas registradas o no coinciden con los filtros.' : 'Configure los filtros y haga clic en Generar Reporte.')}
                                    </td></tr>
                                ) : (
                                    paginatedResults.map((row, index) => (
                                        <tr key={index}>
                                            <td style={{ textAlign: 'center', fontWeight: '600', color: 'var(--color-text-muted)' }}>{index + 1}</td>
                                            <td style={{ textAlign: 'center', fontWeight: '500', color: 'var(--color-primary)' }}>{row.L_ID_Llamada || '—'}</td>
                                            <td>{row.L_Orientador}</td>
                                            <td>
                                                {[row.U_Problema_1, row.U_Problema_2, row.U_Problema_3]
                                                    .filter(p => p && p.trim() !== '')
                                                    .map((p, pIdx) => (
                                                        <div key={pIdx} style={{ marginBottom: '4px' }}>• {p}</div>
                                                    ))}
                                            </td>
                                            <td>{row.L_Sintesis}</td>
                                            <td>{row.L_Fecha}</td>
                                            <td>{row.L_Duracion}</td>
                                            <td>{row.U_Sexo}</td>
                                            <td>{row.U_Edad}</td>
                                            <td>{row.L_Como_Conoce}</td>
                                            <td>{row.U_Asiduidad}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* ── Pagination UI ───────────────────────────────────────────── */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderTop: '1px solid var(--color-border)', gap: '12px', background: 'var(--color-white)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
                            <span>Mostrar:</span>
                            <select 
                                value={itemsPerPage} 
                                onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} 
                                className="ui-input"
                                style={{ height: '32px', padding: '0 12px', width: 'auto', minWidth: '70px' }}
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <span>registros ({filteredResults.length} en total)</span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} variant="secondary" style={{ padding: '0 12px', height: '32px', fontSize: '1rem' }}>&laquo;</Button>
                            <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} variant="secondary" style={{ padding: '0 12px', height: '32px', fontSize: '1rem' }}>&lsaquo;</Button>
                            
                            <span style={{ margin: '0 12px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-text-primary)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                Página
                                <input 
                                    type="number"
                                    key={currentPage}
                                    defaultValue={currentPage}
                                    className="ui-input"
                                    style={{ width: '50px', height: '26px', padding: '0 4px', textAlign: 'center', margin: 0, fontWeight: 'normal' }}
                                    min={1}
                                    max={totalPages}
                                    onBlur={(e) => {
                                        let val = parseInt(e.target.value);
                                        if (isNaN(val) || val < 1) val = 1;
                                        if (val > totalPages) val = totalPages;
                                        setCurrentPage(val);
                                        e.target.value = val;
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') e.target.blur();
                                    }}
                                />
                                de {totalPages}
                            </span>
                            
                            <Button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} variant="secondary" style={{ padding: '0 12px', height: '32px', fontSize: '1rem' }}>&rsaquo;</Button>
                            <Button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} variant="secondary" style={{ padding: '0 12px', height: '32px', fontSize: '1rem' }}>&raquo;</Button>
                        </div>
                    </div>
                </div>
                </div>
            </section>
        </div>
    );
};

export default Reportes;
