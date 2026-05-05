import React, { useState, useEffect } from 'react';
import { useLists } from '../hooks/useLists';
import Button from '../components/ui/Button';

const Admin = () => {
    const { lists, loading, updateList } = useLists();

    // Persistence: Initialize from localStorage or default to empty
    const [selectedList, setSelectedList] = useState(() => {
        return sessionStorage.getItem('adminSelectedList') || '';
    });

    const [newValue, setNewValue] = useState('');
    const [editingIndex, setEditingIndex] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [error, setError] = useState('');

    // State for "Problema" letter filtering
    const [selectedLetter, setSelectedLetter] = useState('A');

    // Update localStorage when selectedList changes
    useEffect(() => {
        if (selectedList) {
            sessionStorage.setItem('adminSelectedList', selectedList);
        }
    }, [selectedList]);

    // Sort list keys alphabetically
    const listKeys = Object.keys(lists).sort();

    // Get current items based on selection
    let currentItems = lists[selectedList] || [];

    // Filter items for "Problema" based on selected letter
    if (selectedList === 'Problema') {
        currentItems = currentItems.filter(item => item.value.startsWith(selectedLetter));
    }

    // Dynamic letters for Problema based on Problemática list
    const problemLetters = lists['Problemática']?.map(item => item.value) || [];

    const handleAdd = (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors
        if (!newValue.trim()) return;

        const description = newValue.trim();
        const allItems = lists[selectedList] || [];

        let generatedValue = '';

        if (selectedList === 'Problemática') {
            const usedLetters = new Set(allItems.map(item => item.value.toUpperCase()));
            let found = false;
            for (let i = 65; i <= 90; i++) {
                const letter = String.fromCharCode(i);
                if (!usedLetters.has(letter)) {
                    generatedValue = letter;
                    found = true;
                    break;
                }
            }
            if (!found) {
                setError('No hay más letras disponibles (A-Z) para Problemáticas.');
                return;
            }
        } else if (selectedList === 'Problema') {
            const prefix = selectedLetter;
            const usedNumbers = new Set();
            allItems.forEach(item => {
                if (item.value.startsWith(prefix)) {
                    const numStr = item.value.substring(prefix.length);
                    const num = parseInt(numStr, 10);
                    if (!isNaN(num)) usedNumbers.add(num);
                }
            });
            let nextNum = 1;
            while (usedNumbers.has(nextNum)) {
                nextNum++;
            }
            generatedValue = `${prefix}${nextNum}`;
        } else {
            const usedNumbers = new Set();
            allItems.forEach(item => {
                const num = parseInt(item.value, 10);
                if (!isNaN(num)) usedNumbers.add(num);
            });
            let nextNum = 1;
            while (usedNumbers.has(nextNum)) {
                nextNum++;
            }
            generatedValue = nextNum.toString();
        }

        const label = `${generatedValue} - ${description}`;
        const newItem = { value: generatedValue, label: label, active: true };
        const newItems = [...allItems, newItem];

        // Sorting based on list type
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
        setEditDescription(item.label);
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
                return { ...item, value: editValue, label: editDescription };
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

    if (loading) return <div className="container">Cargando datos...</div>;

    return (
        <div className="container animate-fade-in">
            <section id="administracion" className="tab-content active" style={{ display: 'block' }}>
                <h2 style={{ color: 'var(--color-secondary)', borderBottom: '2px solid var(--color-secondary)', paddingBottom: '10px', marginBottom: '20px', fontWeight: '600' }}>Administración de Valores</h2>

                <div className="admin-section">
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label htmlFor="lista-select" style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Seleccionar Lista a Administrar:</label>
                        <select
                            id="lista-select"
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            value={selectedList}
                            onChange={(e) => {
                                setSelectedList(e.target.value);
                                setError('');
                                setEditingIndex(null);
                            }}
                        >
                            <option value="">-- Seleccione una lista --</option>
                            {listKeys.map(key => (
                                <option key={key} value={key}>{key}</option>
                            ))}
                        </select>
                    </div>

                    {!selectedList ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#888', background: '#f9f9f9', borderRadius: '8px', border: '1px dashed #ccc' }}>
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

                            <div className="admin-form-group" style={{ display: 'flex', flexDirection: 'column', marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '4px' }}>
                                <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
                                    <div style={{ flexGrow: 1 }}>
                                        <label htmlFor="nuevo-valor" style={{ display: 'block', marginBottom: '5px' }}>
                                            Descripción del Nuevo Valor
                                        </label>
                                        <input
                                            type="text"
                                            id="nuevo-valor"
                                            placeholder="Escriba la descripción (el código se generará automáticamente)"
                                            value={newValue}
                                            onChange={(e) => {
                                                setNewValue(e.target.value);
                                                setError('');
                                            }}
                                            style={{ padding: '8px', border: `1px solid ${error ? '#e74c3c' : '#ccc'}`, borderRadius: '4px', width: '100%' }}
                                        />
                                    </div>
                                    <form id="admin-add-form" style={{ display: 'contents' }} onSubmit={handleAdd}>
                                        <button type="submit" className="button secondary" style={{ padding: '8px 15px', backgroundColor: '#5DADE2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                            Insertar Valor
                                        </button>
                                    </form>
                                </div >
                                {error && (
                                    <div style={{ color: '#e74c3c', marginTop: '10px', fontSize: '0.9em', fontWeight: 'bold', padding: '8px', backgroundColor: '#fadbd8', borderRadius: '4px' }}>
                                        {error}
                                    </div>
                                )}
                            </div >

                            <h3 style={{ marginBottom: '1rem' }}>
                                Valores Actuales de la Lista: <span id="lista-actual-titulo">{selectedList}</span>
                                {selectedList === 'Problema' && <span style={{ fontSize: '0.8em', color: '#666', marginLeft: '10px' }}>(Filtrado por letra {selectedLetter})</span>}
                            </h3>

                            <table className="data-table admin-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', fontSize: '0.9em' }}>
                                <thead>
                                    <tr>
                                        <th style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', padding: '10px', textAlign: 'left' }}>Valor</th>
                                        <th style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', padding: '10px', textAlign: 'left' }}>Estado</th>
                                        <th style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', padding: '10px', textAlign: 'right' }}>Acción</th>
                                    </tr>
                                </thead>
                                <tbody id="admin-table-body">
                                    {currentItems.length === 0 ? (
                                        <tr><td colSpan="3" className="no-data" style={{ textAlign: 'center', padding: '20px', color: '#888', fontStyle: 'italic' }}>No hay valores definidos en esta lista (o filtro).</td></tr>
                                    ) : (
                                        currentItems.map((item) => (
                                            <tr key={item.value} className={item.active === false ? 'inactive-row' : ''} style={item.active === false ? { backgroundColor: '#fff5f5', color: '#7f8c8d', textDecoration: 'line-through', opacity: 0.8 } : { borderBottom: '1px solid var(--color-border)' }}>
                                                <td style={{ padding: '10px', verticalAlign: 'middle' }}>
                                                    {editingIndex === item.value ? (
                                                        <>
                                                            <input
                                                                type="text"
                                                                className="edit-input"
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                placeholder="Código"
                                                                style={{ width: '100%', padding: '5px', border: '1px solid var(--color-modify)', borderRadius: '3px', fontSize: '1em', marginBottom: '5px' }}
                                                            />
                                                            <input
                                                                type="text"
                                                                className="edit-input"
                                                                value={editDescription}
                                                                onChange={(e) => setEditDescription(e.target.value)}
                                                                placeholder="Descripción"
                                                                style={{ width: '100%', padding: '5px', border: '1px solid var(--color-modify)', borderRadius: '3px', fontSize: '1em' }}
                                                            />
                                                        </>
                                                    ) : (
                                                        item.label
                                                    )}
                                                </td>
                                                <td style={{ padding: '10px', verticalAlign: 'middle' }}>{item.active !== false ? 'Activo' : 'Inactivo'}</td>
                                                <td className="action-cell" style={{ padding: '10px', verticalAlign: 'middle', display: 'flex', gap: '8px', justifyContent: 'flex-end', minWidth: '250px' }}>
                                                    {editingIndex === item.value ? (
                                                        <>
                                                            <button onClick={() => saveEdit(item)} className="action-btn save-btn" style={{ color: 'white', border: 'none', padding: '6px 10px', borderRadius: '3px', cursor: 'pointer', fontSize: '0.85em', fontWeight: '600', backgroundColor: '#27ae60' }}>Guardar</button>
                                                            <button onClick={cancelEdit} className="action-btn cancel-btn" style={{ color: 'white', border: 'none', padding: '6px 10px', borderRadius: '3px', cursor: 'pointer', fontSize: '0.85em', fontWeight: '600', backgroundColor: '#95A5A6' }}>Cancelar</button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button onClick={() => startEdit(item)} className="action-btn modify-btn" style={{ color: 'white', border: 'none', padding: '6px 10px', borderRadius: '3px', cursor: 'pointer', fontSize: '0.85em', fontWeight: '600', backgroundColor: '#2980b9' }}>Modificar</button>
                                                            <button onClick={() => handleToggleActive(item)} className={`action-btn ${item.active !== false ? 'inactivate-btn' : 'activate-btn'}`} style={{ color: 'white', border: 'none', padding: '6px 10px', borderRadius: '3px', cursor: 'pointer', fontSize: '0.85em', fontWeight: '600', backgroundColor: item.active !== false ? '#f39c12' : '#27ae60' }}>
                                                                {item.active !== false ? 'Inactivar' : 'Activar'}
                                                            </button>
                                                            <button onClick={() => handleDelete(item)} className="action-btn delete-btn" style={{ color: 'white', border: 'none', padding: '6px 10px', borderRadius: '3px', cursor: 'pointer', fontSize: '0.85em', fontWeight: '600', backgroundColor: '#c0392b' }}>Eliminar</button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </>
                    )}
                </div >
            </section >
        </div >
    );
};

export default Admin;
