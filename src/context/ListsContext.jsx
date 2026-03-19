import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialDropdowns, problemCategories } from '../data/initialData';
import { db } from '../services/firebase';

const ListsContext = createContext();

// Generate derived lists from problemCategories
const problematicaList = Object.entries(problemCategories).map(([key, category]) => {
    const full = `${key} - ${category.label}`;
    return {
        value: full,
        label: full
    };
});

const problemaList = [];
Object.values(problemCategories).forEach(category => {
    category.items.forEach(item => {
        const full = `${item.fullCode} - ${item.label}`;
        problemaList.push({
            value: full,
            label: full
        });
    });
});

const extendedInitialDropdowns = {
    ...initialDropdowns,
    "Problemática": problematicaList,
    "Problema": problemaList
};

export const ListsProvider = ({ children }) => {
    const [lists, setLists] = useState(() => {
        const saved = localStorage.getItem('angel_phone_lists');
        return saved ? JSON.parse(saved) : extendedInitialDropdowns;
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initial Load from Firestore
    useEffect(() => {
        const fetchLists = async () => {
            try {
                const firestoreLists = await db.getLists();
                // If firestore is empty (first run), we might want to trigger a seed or just use defaults.
                // For now, if firestore has data, merge it.
                if (Object.keys(firestoreLists).length > 0) {
                    setLists(prev => ({ ...prev, ...firestoreLists }));
                }
            } catch (err) {
                console.error("Error loading lists from Firestore:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        fetchLists();
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
