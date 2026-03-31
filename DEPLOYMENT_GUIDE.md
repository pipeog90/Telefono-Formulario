# Deployment Guide: Firebase Hosting

This guide details the steps to deploy your **Ángel al Teléfono** web application to Firebase Hosting.

> [!IMPORTANT]
> **Current State: Mock Data**
> The application currently uses a **Mock Firebase Service** (`src/services/mockFirebase.js`).
> - **What this means:** The deployed site will work, but data (users, calls) will be stored in the **visitor's local browser storage**, not a central database.
> - **Behavior:** If you open the link on your phone, it won't show data you entered on your computer.
> - **Next Step:** To share data across devices, we must replace `mockFirebase.js` with the real Firebase configuration.

## Prerequisites
- **Firebase Project Created**: You have already created a project in the [Firebase Console](https://console.firebase.google.com/).
- **Firebase CLI Installed**: Checked (v14.26.0 found).

## Useful Commands for Testing

Before deploying, you typically want to test your application locally.

- **Start Local Development Server**:
  ```bash
  npm run dev
  ```
  *Use this while coding.* It starts a local server (usually at `http://localhost:3000`) that updates instantly when you save files.

- **Preview Production Build**:
  ```bash
  npm run build
  npm run preview
  ```
  *Use this before deploying.* It builds the app exactly as it will appear on the web and serves it locally. This helps catch bugs that only happen in the production version.

---

## Step-by-Step Deployment Instructions

### 0. Navigate to Workspace
Open your terminal (PowerShell or Command Prompt) and navigate to your project folder:
```bash
cd "C:\Users\pipeo\Documents\Telefono Formulario"
```

### 1. Login to Firebase
Login if you haven't already:
```bash
firebase login
```
*Follow the browser prompt to authenticate.*

### 2. Initialize Hosting (One-time setup)
If you haven't initialized the project yet, run:
```bash
firebase init hosting
```

**Select the following options interactively:**
1.  **Are you ready to proceed?** → type `y` (Yes)
2.  **Please select an option:** → Use arrow keys to select `Use an existing project` and press Enter.
3.  **Select a default Firebase project:** → Select the project you created.
4.  **What do you want to use as your public directory?** → type `dist` (This is where Vite builds the app).
5.  **Configure as a single-page app (rewrite all urls to /index.html)?** → type `y` (Yes).
6.  **Set up automatic builds and deploys with GitHub?** → type `n` (No, for now).
7.  **File dist/index.html already exists. Overwrite?** → type `n` (No, **do not** overwrite if asked).

### 3. Build the Project
Create the production-ready version of your app:
```bash
npm run build
```
*This compiles your code into the `dist` folder.*

### 4. Deploy
Upload the files to Firebase:
```bash
firebase deploy

firebase deploy --only hosting
```

### 5. Access Your Site
Once completed, the terminal will show a **Hosting URL**.
Example: `https://your-project-name.web.app`

## Troubleshooting
- **White Screen on Deploy?**: Ensure you answered `y` to "Configure as a single-page app".
- **Updates**: Whenever you make changes (like fixing the buttons), you must run `npm run build` and then `firebase deploy` again.
