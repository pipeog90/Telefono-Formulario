import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, collection, getDocs, doc, setDoc } from '../firebase';
import { initialDropdowns, problemCategories } from '../data/initialData';

const ListsContext = createContext();

// Generate derived lists from problemCategories
const problematicaList = Object.entries(problemCategories).map(([key, category]) => ({
    value: key,
    label: category.label
}));

const problemaList = [];
Object.values(problemCategories).forEach(category => {
    category.items.forEach(item => {
        problemaList.push({
            value: item.fullCode,
            label: item.label
        });
    });
});

const extendedInitialDropdowns = {
    ...initialDropdowns,
    "Problemática": problematicaList,
    "Problema": problemaList
};

export const ListsProvider = ({ children }) => {
    // Initialize from localStorage if available, otherwise use extendedInitialDropdowns
    const [lists, setLists] = useState(() => {
        const saved = localStorage.getItem('angelPhoneLists');
        let initial = saved ? JSON.parse(saved) : extendedInitialDropdowns;

        // Force merge of new lists if missing (for existing users/localStorage)
        if (!initial['Problemática']) initial['Problemática'] = extendedInitialDropdowns['Problemática'];
        if (!initial['Problema']) initial['Problema'] = extendedInitialDropdowns['Problema'];
        if (!initial['CENTRO']) initial['CENTRO'] = extendedInitialDropdowns['CENTRO'];

        // Clean up deleted legacy lists
        if (initial['O_CLAVE']) delete initial['O_CLAVE'];

        return initial;
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Save to localStorage whenever lists change
    useEffect(() => {
        localStorage.setItem('angelPhoneLists', JSON.stringify(lists));
    }, [lists]);

    useEffect(() => {
        let mounted = true;

        // Failsafe: Ensure loading is set to false after 1.5s no matter what
        const failsafe = setTimeout(() => {
            if (mounted && loading) {
                setLoading(false);
            }
        }, 500);

        const fetchLists = async () => {
            try {
                if (mounted) {
                    // In mock mode, we just rely on localStorage which is already initialized in useState
                    // If we wanted to simulate an async fetch, we could do it here.
                    // But since we initialized state from localStorage/initialData, we are good.
                    if (!localStorage.getItem('angelPhoneLists')) {
                        setLists(extendedInitialDropdowns);
                    }
                }
            } catch (err) {
                console.warn("Error loading lists:", err);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchLists();

        return () => {
            mounted = false;
            clearTimeout(failsafe);
        };
    }, []);

    const updateList = async (listName, newItems) => {
        // Optimistic update: Update local state immediately
        setLists(prev => ({ ...prev, [listName]: newItems }));
        // LocalStorage is updated via the useEffect hook on [lists]
        return true;
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
