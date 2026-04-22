import React, { useState, useEffect } from 'react';
import { useLists } from '../hooks/useLists';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { List } from 'lucide-react';

const Admin = () => {
    const { lists, loading, updateList } = useLists();

    // --- LIST MANAGEMENT STATE ---
    const [selectedList, setSelectedList] = useState(() => localStorage.getItem('adminSelectedList') || '');
    const [newValue, setNewValue] = useState('');
    const [editingIndex, setEditingIndex] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [error, setError] = useState('');
    const [selectedLetter, setSelectedLetter] = useState('A');

    // --- EFFECTS ---
    useEffect(() => {
        if (selectedList) localStorage.setItem('adminSelectedList', selectedList);
    }, [selectedList]);

    // --- LIST MANAGEMENT LOGIC ---
    const listKeys = Object.keys(lists).sort();
    let currentItems = lists[selectedList] || [];
    if (selectedList === 'Problema') {
        currentItems = currentItems.filter(item => item.value.startsWith(selectedLetter));
    }
    const problemLetters = lists['Problemática']?.map(item => item.value) || [];

    const handleAdd = (e) => {
        e.preventDefault();
        setError('');
        if (!newValue.trim()) return;

        const parts = newValue.split(' - ');
        if (parts.length < 2) {
            // Check for common error: missing spaces around hyphen
            if (newValue.includes('-')) {
                setError('Por favor, asegúrese de poner un espacio antes y después del guión (ejemplo: "A - Valor").');
            } else {
                setError('Formato incorrecto. Debe escribir el código, un guión y el valor (ejemplo: "10 - Nuevo Item").');
            }
            return;
        }

        const value = parts[0].trim();
        const description = parts.slice(1).join(' - ').trim();

        // Restriction: description must contain at least one letter or number
        if (!/[a-zA-ZÀ-ÿ0-9]/.test(description)) {
            setError('Error: La descripción no puede estar vacía ni contener solo espacios. Debe incluir al menos una letra o número.');
            return;
        }

        if (selectedList === 'Problemática') {
            if (!/^[A-Z]$/.test(value)) {
                setError('Error: Para "Problemática", el código debe ser una sola letra mayúscula (ejemplo: "A", "B", "C").');
                return;
            }
        } else if (selectedList === 'Problema') {
            if (!value) {
                setError('Error: El código no puede estar vacío.');
                return;
            }
            // Restriction: Must start with selected letter and be followed by numbers
            const regex = new RegExp(`^${selectedLetter}\\d+$`);
            if (!regex.test(value)) {
                setError(`Error: El formato debe ser la letra "${selectedLetter}" seguida de un número (ej: "${selectedLetter}1").`);
                return;
            }
        } else if (selectedList !== 'Problemática' && selectedList !== 'Problema' && (isNaN(value) || value === '')) {
            setError('Error: Para esta lista, la primera parte debe ser un número (ejemplo: "1 - Opción").');
            return;
        }

        const allItems = lists[selectedList] || [];
        if (allItems.some(item => item.value === value)) {
            setError(`Error: El código "${value}" ya existe en esta lista. Por favor use otro.`);
            return;
        }

        // ... (rest of the add logic) ...
        const fullLabel = `${value} - ${description}`;
        const newItem = { value, label: fullLabel, active: true };
        const newItems = [...allItems, newItem];

        if (selectedList === 'Problemática') {
            newItems.sort((a, b) => a.value.localeCompare(b.value));
        } else if (selectedList === 'Problema') {
            newItems.sort((a, b) => a.value.localeCompare(b.value, undefined, { numeric: true, sensitivity: 'base' }));
        } else {
            newItems.sort((a, b) => parseInt(a.value) - parseInt(b.value));
        }

        updateList(selectedList, newItems);
        setNewValue('');
    };

    // Helper for placeholder
    const getPlaceholder = () => {
        if (selectedList === 'Problemática') return 'Ejemplo: A - Problemas Familiares';
        if (selectedList === 'Problema') return `Ejemplo: ${selectedLetter}1 - Descripción del problema`;
        return 'Ejemplo: 1 - Descripción';
    };

    const handleToggleActive = async (itemToToggle) => {
        const allItems = lists[selectedList] || [];
        const newItems = allItems.map(item => {
            if (item.value === itemToToggle.value) {
                return { ...item, active: !item.active };
            }
            return item;
        });
        await updateList(selectedList, newItems);
    };

    const handleDelete = async (itemToDelete) => {
        if (selectedList === 'Problemática') {
            const code = itemToDelete.value;
            if (window.confirm(`ADVERTENCIA: Al eliminar la "Problemática" ${code}, se eliminarán también todos los "Problema" asociados. ¿Desea continuar?`)) {
                // Delete Problemática entry
                const probList = lists['Problemática'] || [];
                const newProb = probList.filter(item => item.value !== code);
                await updateList('Problemática', newProb);

                // Delete associated Problema entries
                const problemaList = lists['Problema'] || [];
                const newProblema = problemaList.filter(item => !item.value.startsWith(code));
                await updateList('Problema', newProblema);
            }
        } else {
            if (window.confirm(`ADVERTENCIA: ¿Está seguro de que desea eliminar PERMANENTEMENTE el valor "${itemToDelete.label}"?\n\nEsta acción eliminará el valor de la lista de opciones para nuevos registros. Los registros históricos no se verán afectados.`)) {
                const allItems = lists[selectedList] || [];
                const newItems = allItems.filter(item => item.value !== itemToDelete.value);
                await updateList(selectedList, newItems);
            }
        }
    };

    const startEdit = (item) => {
        setEditValue(item.value);
        let description = item.label;
        if (item.label.startsWith(item.value + ' - ')) {
            description = item.label.substring((item.value + ' - ').length);
        }
        setEditDescription(description);
        setEditingIndex(item.value);
    };

    const cancelEdit = () => {
        setEditingIndex(null);
        setEditValue('');
        setEditDescription('');
    };

    const saveEdit = async (originalItem) => {
        if (!editValue.trim() || !editDescription.trim()) {
            alert('Código y Descripción no pueden estar vacíos.');
            return;
        }

        const allItems = lists[selectedList] || [];
        // Check for duplicates (excluding current item)
        if (allItems.some(item => item.value === editValue && item.value !== originalItem.value)) {
            alert('Error: El código de valor ya existe en esta lista.');
            return;
        }

        const newItems = allItems.map(item => {
            if (item.value === originalItem.value) {
                const newLabel = `${editValue} - ${editDescription}`;
                return { ...item, value: editValue, label: newLabel };
            }
            return item;
        });

        // Sorting based on list type
        if (selectedList === 'Problemática') {
            newItems.sort((a, b) => a.value.localeCompare(b.value));
        } else if (selectedList === 'Problema') {
            newItems.sort((a, b) => a.value.localeCompare(b.value, undefined, { numeric: true, sensitivity: 'base' }));
        } else {
            newItems.sort((a, b) => parseInt(a.value) - parseInt(b.value));
        }

        updateList(selectedList, newItems);
        setEditingIndex(null);
    };

    return (
        <div className="container animate-fade-in">
            <section id="administracion" className="tab-content active" style={{ display: 'block' }}>
                <h2 style={{ color: 'var(--color-secondary)', borderBottom: '2px solid var(--color-secondary)', paddingBottom: '2px', marginBottom: '2px', fontWeight: '600' }}>Administración de Valores</h2>

                <div className="admin-section">
                    <div className="form-group" style={{ marginBottom: '4px' }}>
                        <label htmlFor="lista-select" style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Seleccionar Lista a Administrar:</label>
                        <Select
                            id="lista-select"
                            value={selectedList}
                            onChange={(e) => {
                                setSelectedList(e.target.value);
                                setError('');
                                setEditingIndex(null);
                            }}
                            options={listKeys.map(key => ({ value: key, label: key }))}
                            placeholder="-- Seleccione una lista --"
                        />
                    </div>

                    {!selectedList ? (
                        <div style={{ padding: '12px', textAlign: 'center', color: '#888', background: '#f9f9f9', borderRadius: '8px', border: '1px dashed #ccc' }}>
                            <p>Por favor seleccione una lista arriba para comenzar a editar.</p>
                        </div>
                    ) : (
                        <>
                            {/* Letter Filter for "Problema" */}
                            {selectedList === 'Problema' && (
                                <div style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                    {problemLetters.map(letter => (
                                        <button
                                            key={letter}
                                            onClick={() => setSelectedLetter(letter)}
                                            style={{
                                                padding: '5px 10px',
                                                border: '1px solid var(--color-primary)',
                                                backgroundColor: selectedLetter === letter ? 'var(--color-primary)' : 'white',
                                                color: selectedLetter === letter ? 'white' : 'var(--color-primary)',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {letter}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <div className="glass-panel" style={{ padding: 'var(--card-padding)', marginBottom: '4px' }}>
                                <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                                    <div style={{ flexGrow: 1, minWidth: '200px' }}>
                                        <Input
                                            id="nuevo-valor"
                                            label={`Nuevo Valor (${getPlaceholder()})`}
                                            placeholder={getPlaceholder()}
                                            value={newValue}
                                            onChange={(e) => {
                                                setNewValue(e.target.value);
                                                setError('');
                                            }}
                                        />

                                    </div>
                                    <div style={{ marginBottom: '1px' }}> {/* Lifted 1px to align with input border baseline */}
                                        <Button
                                            onClick={handleAdd}
                                            variant="primary"
                                            style={{
                                                background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                                                color: 'white',
                                                border: 'none',
                                                boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)',
                                                height: 'var(--input-height)',
                                                padding: '0 16px'
                                            }}
                                        >
                                            Agregar Valor
                                        </Button>
                                    </div>
                                </div>
                                {error && (
                                    <div style={{ color: '#e74c3c', marginTop: '10px', fontSize: '0.9em', fontWeight: 'bold' }}>
                                        {error}
                                    </div>
                                )}
                            </div>

                            <div className="glass-panel" style={{ padding: 'var(--card-padding)', overflow: 'hidden' }}>
                                <div className="table-responsive-wrapper">
                                    <table className="data-table admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ textAlign: 'left', padding: 'var(--admin-cell-padding)' }}>Valor</th>
                                                <th style={{ textAlign: 'left', padding: 'var(--admin-cell-padding)', width: '1px', whiteSpace: 'nowrap' }}>Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentItems.length === 0 ? (
                                                <tr><td colSpan="2" className="no-data" style={{ textAlign: 'center', padding: '20px' }}>No hay valores definidos.</td></tr>
                                            ) : (
                                                currentItems.map((item) => (
                                                    <tr key={item.value} className={item.active === false ? 'inactive-row' : ''} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                                        <td style={{ padding: 'var(--admin-cell-padding)' }}>
                                                            {editingIndex === item.value ? (
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                                    <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} className="input-field" style={{ width: '100%' }} placeholder="Código" />
                                                                    <input type="text" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="input-field" style={{ width: '100%' }} placeholder="Descripción" />
                                                                </div>
                                                            ) : (
                                                                <span style={{ color: item.active === false ? 'red' : 'inherit' }}>
                                                                    {item.label}
                                                                </span>
                                                            )}
                                                        </td>

                                                        <td style={{ padding: 'var(--admin-cell-padding)', textAlign: 'left', width: '1px', whiteSpace: 'nowrap' }}>
                                                            {editingIndex === item.value ? (
                                                                <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-start' }}>
                                                                    <button onClick={() => saveEdit(item)} className="button small primary" style={{ backgroundColor: 'var(--color-success)', color: 'white', border: 'none', padding: 'var(--admin-btn-padding)', borderRadius: '4px', cursor: 'pointer' }}>Guardar</button>
                                                                    <button onClick={() => setEditingIndex(null)} className="button small outline" style={{ border: '1px solid var(--color-text-secondary)', color: 'var(--color-text-secondary)', padding: 'var(--admin-btn-padding)', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }}>Cancelar</button>
                                                                </div>
                                                            ) : (
                                                                <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-start' }}>
                                                                    <button onClick={() => startEdit(item)} className="button small outline" style={{ border: '1px solid var(--color-primary)', color: 'var(--color-primary)', padding: 'var(--admin-btn-padding)', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }}>Modificar</button>
                                                                    <button onClick={() => handleToggleActive(item)} className="button small outline" style={{ border: '1px solid var(--color-warning)', color: 'var(--color-warning)', padding: 'var(--admin-btn-padding)', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }}>
                                                                        {item.active !== false ? 'Desactivar' : 'Reactivar'}
                                                                    </button>
                                                                    <button onClick={() => handleDelete(item)} className="button small outline" style={{ border: '1px solid var(--color-danger)', color: 'var(--color-danger)', padding: 'var(--admin-btn-padding)', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }}>Eliminar</button>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Admin;
