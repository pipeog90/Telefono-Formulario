import { useListsContext, firestoreKeyMigration } from '../context/ListsContext';

export { firestoreKeyMigration };

export const useLists = () => {
    return useListsContext();
};
