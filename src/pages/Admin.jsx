import React, { useState, useEffect } from 'react';
import { useLists, firestoreKeyMigration } from '../hooks/useLists';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { List, RefreshCw, Database } from 'lucide-react';
import { initialDropdowns, problemCategories } from '../data/initialData';
import { db } from '../services/firebase';

const Admin = () => {
    const { lists, loading, updateList } = useLists();

    // --- LIST MANAGEMENT STATE ---
    const [selectedList, setSelectedList] = useState(() => sessionStorage.getItem('adminSelectedList') || '');
    const [newValue, setNewValue] = useState('');
    const [editingIndex, setEditingIndex] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [error, setError] = useState('');
    const [selectedLetter, setSelectedLetter] = useState('A');

    // --- EFFECTS ---
    useEffect(() => {
        if (selectedList) sessionStorage.setItem('adminSelectedList', selectedList);
    }, [selectedList]);

    // --- LIST MANAGEMENT LOGIC ---
    const listKeys = React.useMemo(() => Object.keys(lists)
        .filter(key => !firestoreKeyMigration[key])
        .sort(), [lists]);

    const currentItems = React.useMemo(() => {
        let items = lists[selectedList] || [];
        if (selectedList === 'PROBLEMA') {
            return items.filter(item => item.value.startsWith(selectedLetter));
        }
        return items;
    }, [lists, selectedList, selectedLetter]);

    const problemLetters = React.useMemo(() => lists['PROBLEMATICA']?.map(item => item.value) || [], [lists]);

    const handleAdd = (e) => {
        e.preventDefault();
        setError('');
        if (!newValue.trim()) return;

        const description = newValue.trim();
        const allItems = lists[selectedList] || [];

        let generatedValue = '';

        if (selectedList === 'PROBLEMATICA') {
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
        } else if (selectedList === 'PROBLEMA') {
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

        const fullLabel = `${generatedValue} - ${description}`;
        const newItem = { value: generatedValue, label: fullLabel, active: true };
        const newItems = [...allItems, newItem];

        if (selectedList === 'PROBLEMATICA') {
            newItems.sort((a, b) => a.value.localeCompare(b.value));
        } else if (selectedList === 'PROBLEMA') {
            newItems.sort((a, b) => a.value.localeCompare(b.value, undefined, { numeric: true, sensitivity: 'base' }));
        } else {
            newItems.sort((a, b) => parseInt(a.value) - parseInt(b.value));
        }

        updateList(selectedList, newItems);
        setNewValue('');
    };

    // Helper for placeholder
    const getPlaceholder = () => {
        return 'Escriba la descripción (el código se generará automáticamente)';
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
        if (selectedList === 'PROBLEMATICA') {
            const code = itemToDelete.value;
            if (window.confirm(`ADVERTENCIA: Al eliminar la "PROBLEMATICA" ${code}, se eliminarán también todos los "PROBLEMA" asociados. ¿Desea continuar?`)) {
                // Delete Problemática entry
                const probList = lists['PROBLEMATICA'] || [];
                const newProb = probList.filter(item => item.value !== code);
                await updateList('PROBLEMATICA', newProb);

                // Delete associated Problema entries
                const problemaList = lists['PROBLEMA'] || [];
                const newProblema = problemaList.filter(item => !item.value.startsWith(code));
                await updateList('PROBLEMA', newProblema);
            }
        } else {
            if (window.confirm(`ADVERTENCIA: ¿Está seguro de que desea eliminar PERMANENTEMENTE el valor "${itemToDelete.label}"?\n\nEsta acción eliminará el valor de la lista de opciones para nuevos registros. Los registros históricos no se verán afectados.`)) {
                const allItems = lists[selectedList] || [];
                const newItems = allItems.filter(item => item.value !== itemToDelete.value);
                await updateList(selectedList, newItems);
            }
        }
    };

    const handlePurgeLegacy = async () => {
        const legacyKeys = Object.keys(lists).filter(key => firestoreKeyMigration[key]);
        if (legacyKeys.length === 0) {
            alert('No se detectaron listas legadas redundantes.');
            return;
        }

        if (window.confirm(`¿Está seguro de que desea eliminar PERMANENTEMENTE las siguientes ${legacyKeys.length} listas redundantes de Firestore?\n\n${legacyKeys.join('\n')}\n\nNota: Los datos ya han sido migrados internamente, por lo que esta acción es segura.`)) {
            try {
                const { deleteDoc, doc, firestore } = require('../services/firebase');
                for (const key of legacyKeys) {
                    await deleteDoc(doc(firestore, "lists", key));
                }
                alert('Limpieza completada con éxito.');
            } catch (err) {
                console.error("Error purging legacy lists:", err);
                alert('Error al purgar las listas. Revise la consola.');
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
        if (selectedList === 'PROBLEMATICA') {
            newItems.sort((a, b) => a.value.localeCompare(b.value));
        } else if (selectedList === 'PROBLEMA') {
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--color-secondary)', paddingBottom: '2px', marginBottom: '2px' }}>
                    <h2 style={{ color: 'var(--color-secondary)', margin: 0, fontWeight: '600' }}>Administración de Valores</h2>
                    {Object.keys(lists).some(key => firestoreKeyMigration[key]) && (
                        <Button 
                            onClick={handlePurgeLegacy}
                            variant="outline"
                            style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)', fontSize: '0.8rem', padding: '4px 8px' }}
                        >
                            <RefreshCw size={14} style={{ marginRight: '4px' }} />
                            Purgar Datos Legados
                        </Button>
                    )}

                </div>

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
                            {/* Letter Filter for "PROBLEMA" */}
                            {selectedList === 'PROBLEMA' && (
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
                                            label="Descripción del Nuevo Valor"
                                            placeholder={getPlaceholder()}
                                            value={newValue}
                                            onChange={(e) => {
                                                setNewValue(e.target.value);
                                                setError('');
                                            }}
                                            tooltip="Descripción del valor de la Categoría"
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

                            <div className="premium-table-wrapper">
                                <div className="table-responsive-wrapper">
                                    <table className="premium-table">
                                        <thead>
                                            <tr>
                                                <th style={{ textAlign: 'left' }}>Valor</th>
                                                <th style={{ textAlign: 'left', width: '1px', whiteSpace: 'nowrap' }}>Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentItems.length === 0 ? (
                                                <tr><td colSpan="2" className="no-data" style={{ textAlign: 'center', padding: '20px' }}>No hay valores definidos.</td></tr>
                                            ) : (
                                                currentItems.map((item) => (
                                                    <tr key={item.value} className={item.active === false ? 'inactive-row' : ''}>
                                                        <td>
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

                                                        <td style={{ textAlign: 'left', width: '1px', whiteSpace: 'nowrap' }}>
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
