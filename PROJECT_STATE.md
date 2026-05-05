# Project State

## Active Task
Clean up redundant lists in the Firebase `lists` collection by referencing the provided Excel catalogs (`TelEsperanzaMed-Catalogo.xlsx` and `TelEsperanzaMed-DataMaestra.xlsx`). Delete incorrect lists from Firebase and ensure the frontend codebase reflects the correct list structure.

## File Ledger
- `C:\Users\pipeo\Documents\Telefono Formulario\Retrofit 21-04-2026\TelEsperanzaMed-Catalogo.xlsx` (Read-only: Source of truth for standard lists)
- `C:\Users\pipeo\Documents\Telefono Formulario\Retrofit 21-04-2026\TelEsperanzaMed-DataMaestra.xlsx` (Read-only: Source of truth for PROBLEMA/PROBLEMATICA)
- `C:\Users\pipeo\.gemini\antigravity\scratch\firebase_cleanup.py` (Script to be created: Will interact with Firebase Admin SDK to fetch, compare, and delete lists)
- `C:\Users\pipeo\Documents\Telefono Formulario\src\data\initialData.js` (Target: May need updates if list keys change)
- `C:\Users\pipeo\Documents\Telefono Formulario\angel-phone\src\data\initialData.js` (Target: Counterpart duplicate)

## Dependency Graph
- If we delete lists from Firebase, we must ensure `initialData.js` (both in `src` and `angel-phone/src`) only contains the verified correct list keys, so it doesn't attempt to recreate or reference the deleted lists.
