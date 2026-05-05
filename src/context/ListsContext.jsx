import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialDropdowns, problemCategories } from '../data/initialData';
import { db } from '../services/firebase';

const ListsContext = createContext();

// Generate derived lists from problemCategories
const problematicaList = Object.entries(problemCategories).map(([key, category]) => {
    return {
        value: key,
        label: `${key} - ${category.label}`,
        active: true
    };
});

const problemaList = [];
Object.values(problemCategories).forEach(category => {
    category.items.forEach(item => {
        problemaList.push({
            value: item.fullCode,
            label: `${item.fullCode} - ${item.label}`,
            active: item.active !== false
        });
    });
});

const extendedInitialDropdowns = {
    ...initialDropdowns,
    "PROBLEMATICA": problematicaList,
    "PROBLEMA": problemaList
};

export const firestoreKeyMigration = {
    "Medio de contacto": "MEDIO_CONTACTO",
    "Comoconoce": "COMO_CONOCE",
    "Sexo": "SEXO",
    "Edad": "EDAD",
    "E.Civil": "ESTADO_CIVIL",
    "Convive": "CONVIVE",
    "Asiduad": "ASIDUIDAD",
    "Naturaleza": "NATURALEZA",
    "Inicio": "INICIO",
    "Actitud ante el orientador": "ACTITUD_ORIENTADOR",
    "Presentación": "PRESENTACION",
    "Paralenguaje": "PARALENGUAJE",
    "Procedencia": "PROCEDENCIA",
    "Petición": "PETICION",
    "Actitud ante el problema": "ACTITUD_PROBLEMA",
    "Condicion Socioeconomica": "CONDICION_SOCIOECONOMICA",
    "Llamada derivada": "LLAMADA_DERIVADA",
    "Resultado": "RESULTADO",
    "C_duracion": "RANGO_DURACION",
    "Autoevaluación": "AUTOEVALUACION",
    "Volvera a llamar": "VOLVERA_LLAMAR",
    "Nivel de ayuda": "NIVEL_AYUDA",
    "Sentimientos": "SENTIMIENTOS",
    "Actitudes equivodas": "ACTITUD_EQUIVOCADA",
    "Satisfacción del llamante": "SATISFACCION",
    "Relación": "RELACION",

    "L_Medio_Contacto": "MEDIO_CONTACTO",
    "U_Sexo": "SEXO",
    "U_Edad": "EDAD",
    "U_Estado_Civil": "ESTADO_CIVIL",
    "U_Convive": "CONVIVE",
    "U_Asiduidad": "ASIDUIDAD",
    "U_Naturaleza": "NATURALEZA",
    "U_Inicio": "INICIO",
    "U_Actitud_Orientador": "ACTITUD_ORIENTADOR",
    "U_Presentacion": "PRESENTACION",
    "U_Paralenguaje": "PARALENGUAJE",
    "U_Procedencia": "PROCEDENCIA",
    "U_Peticion": "PETICION",
    "U_Actitud_Problema": "ACTITUD_PROBLEMA",
    "L_Llamada_Derivada": "LLAMADA_DERIVADA",
    "L_Resultado": "RESULTADO",
    "O_Nivel_Ayuda": "NIVEL_AYUDA",
    "O_Sentimientos": "SENTIMIENTOS",
    "O_Autoevaluacion": "AUTOEVALUACION",
    "O_Actitud_Equivocada": "ACTITUD_EQUIVOCADA",
    "O_Satisfaccion": "SATISFACCION",
    "T_Relacion": "RELACION",
    "T_Actitud_Problema": "TERCERO_ACTITUD_PROBLEMA",
    "Tercero Actitud ante el problema": "TERCERO_ACTITUD_PROBLEMA",
    "Tercero Actitud ante": "TERCERO_ACTITUD_PROBLEMA",
    "U_Cond_Socioeconomica": "CONDICION_SOCIOECONOMICA",
    "O_Volvera_Llamar": "VOLVERA_LLAMAR",
    "Volvera a llamar": "VOLVERA_LLAMAR",
    "L_Como_Conoce": "COMO_CONOCE",
    "L_Duracion": "RANGO_DURACION",
    "L_Orientador": "ORIENTADOR",
    "Problemática": "PROBLEMATICA",
    "Problema": "PROBLEMA"
};

export const ListsProvider = ({ children }) => {
    const [lists, setLists] = useState(() => {
        const saved = localStorage.getItem('angel_phone_lists');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Migrate any old cached key names
            const migrated = {};
            for (const [key, value] of Object.entries(parsed)) {
                // If it's a legacy key, map it. If not, keep it.
                const newKey = firestoreKeyMigration[key] || key;
                // Avoid keeping the old key if we migrated it
                migrated[newKey] = value;
            }
            
            // Final check: if an old key exists in the migrated object but we have its new version,
            // the loop above already handled it (by overwriting migrated[newKey]).
            // However, we should explicitly remove keys that are in the migration map's keys.
            Object.keys(firestoreKeyMigration).forEach(oldKey => {
                if (migrated[oldKey]) {
                    delete migrated[oldKey];
                }
            });

            return migrated;
        }
        return extendedInitialDropdowns;
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initial Load and Real-time Subscription from Firestore
    useEffect(() => {
        setLoading(true);
        const unsubscribe = db.subscribeToLists((firestoreLists) => {
            try {
                if (Object.keys(firestoreLists).length > 0) {
                    // Migrate old Firestore key names to new data dictionary names
                    const migrated = {};
                    
                    // 1. Process all entries from Firestore
                    for (const [key, value] of Object.entries(firestoreLists)) {
                        if (key === 'O_CLAVE') continue; // Explicitly ignore legacy O_CLAVE
                        const newKey = firestoreKeyMigration[key] || key;
                        // If it's a legacy key, it gets "renamed" to newKey.
                        // If it's already a newKey, it stays as is.
                        migrated[newKey] = value;
                    }

                    setLists(prev => {
                        // 2. Start with previous state but REMOVE all legacy keys
                        const cleanPrev = { ...prev };
                        Object.keys(firestoreKeyMigration).forEach(oldKey => {
                            delete cleanPrev[oldKey];
                        });
                        
                        // Explicitly remove O_CLAVE to purge it
                        if (cleanPrev['O_CLAVE']) delete cleanPrev['O_CLAVE'];
                        
                        // 3. Merge with migrated data from Firestore, 
                        // ensuring NO legacy keys are included in the final object
                        const finalMigrated = {};
                        for (const [key, value] of Object.entries(migrated)) {
                            if (!firestoreKeyMigration[key]) {
                                finalMigrated[key] = value;
                            }
                        }
                        
                        return { ...cleanPrev, ...finalMigrated };
                    });
                }
            } catch (err) {
                console.error("Error processing lists from Firestore:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    // Save to localStorage whenever lists change (Caching)
    useEffect(() => {
        localStorage.setItem('angel_phone_lists', JSON.stringify(lists));
    }, [lists]);

    const updateList = async (listName, newItems) => {
        // Optimistic update
        setLists(prev => ({ ...prev, [listName]: newItems }));

        // Persist to Firestore
        try {
            await db.updateList(listName, newItems);
            return true;
        } catch (err) {
            console.error(`Error updating list ${listName} in Firestore:`, err);
            // Ideally revert state here on failure, but for now we accept inconsistency risk
            return false;
        }
    };



    return (
        <ListsContext.Provider value={{ lists, loading, error, updateList }}>
            {children}
        </ListsContext.Provider>
    );
};

export const useListsContext = () => {
    const context = useContext(ListsContext);
    if (!context) {
        throw new Error('useListsContext must be used within a ListsProvider');
    }
    return context;
};
