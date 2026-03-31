# Guía de Previsualización Local (Desarrollo en Tiempo Real) 🚀

Esta guía detalla los pasos para ver tus cambios de diseño (colores, espacios, logos) en el navegador de forma **instantánea**, sin tener que esperar a que Firebase procese el despliegue.

---

## 🏗️ Flujo de Trabajo Maestro

Para obtener la máxima velocidad al ajustar el diseño, seguiremos este proceso:

### 0. Asegurar la Ubicación Correcta
Antes de ejecutar comandos, abre tu terminal y navega a la carpeta de tu proyecto:
```bash
cd "C:\Users\pipeo\Documents\Telefono Formulario"
```

### 1. Iniciar el Motor Local
Ejecuta el siguiente comando para levantar el servidor de desarrollo:
```bash
npm run dev
```
*   **Resultado**: El terminal te dará un enlace (ej: `http://localhost:3000/`).
*   **Acción**: Haz Ctrl + Clic en ese enlace para abrir tu navegador local.

### 2. Navegación entre Vistas ("Sub-dominios")
Como esta es una aplicación de una sola página (SPA), puedes saltar entre pantallas cambiando la dirección en la barra del navegador:

*   **Pantalla de Login**: `http://localhost:3000/login`
*   **Formulario Principal**: `http://localhost:3000/`
*   **Panel de Administración**: `http://localhost:3000/admin`
*   **Gestión de Usuarios**: `http://localhost:3000/users`

### 3. Edición en Tiempo Real (HMR)
Esta es la parte donde ahorramos más tiempo. Gracias a **Vite HMR**:

1.  Mantén el navegador abierto en la página que quieres ajustar (ej: el Login).
2.  Modifica cualquier valor en `src/index.css` o `src/pages/Login.jsx`.
3.  **Guarda el archivo (Ctrl + S)**.
4.  **Magia**: El navegador se actualizará **en milisegundos**. No necesitas refrescar la página manualmente ni esperar a Firebase.

---

## 🔒 ¿Y mi base de datos personalizada?
No te preocupes. Aunque estés viendo el sitio en `localhost`, el código sigue conectado a tu **Firebase Real**. 
*   Si intentas loguearte, funcionará. 
*   Si guardas una llamada, se guardará en tu base de datos de la nube. 
*   **Solo el "cascarón" de la web es local; el cerebro sigue siendo Firebase.**

---

## 🏁 ¿Cuándo debo hacer el Deploy real?
Solo cuando estés **100% satisfecho** con el aspecto visual en tu servidor local. En ese momento, ejecuta la secuencia final:
```bash
npm run build
firebase deploy --only hosting
```

---

## 📡 Uso Sin Internet (Offline Mode)

Si te encuentras sin conexión a internet, aún puedes trabajar en el diseño:

1.  **Lo que SÍ funciona**: La carga de la página, los colores, los logos y los márgenes de **4px**. Vite sirve todo desde tu disco duro.
2.  **Lo que NO funciona**: El botón de "Ingresar" (porque no puede hablar con Firebase) y las páginas protegidas como `/admin`.

### 💡 Truco de Jarvis para ver el Administrador Offline:
Si necesitas ver la estética de las páginas internas sin tener internet ni loguearte, ve al archivo **`src/App.jsx`** y comenta las etiquetas de protección. 

**IMPORTANTE**: Para que React no dé error al comentar, debes envolver todo entre etiquetas de fragmento vacío `<>` y `</>`:

**Ejemplo para entrar al Panel de Administrador directamente:**
1.  Busca la línea del Administrador y déjala así:
    ```jsx
    <Route path="/admin" element={
        <>
            {/* <ProtectedRoute adminOnly={true}> */}
                <Admin />
            {/* </ProtectedRoute> */}
        </>
    } />
    ```
2.  **Guarda el archivo**. El navegador te dejará entrar a `http://localhost:3000/admin` al instante.

**Referencias de líneas en `src/App.jsx`:**
*   **Registro de Llamadas (Home)**: Comentar líneas **27** y **29**.
*   **Admin**: Comentar líneas **35** y **37**.
*   **Reportes**: Comentar líneas **43** y **45**.
*   **Usuarios**: Comentar líneas **51** y **53**.

### 🚪 ¿Cómo ver el Login sin ser redirigido?
Como ahora el sistema inyecta un usuario de pruebas automáticamente, si intentas ir a `/login`, el sitio te mandará de vuelta al Inicio. Para evitar esto, debes comentar el bloque de redirección en **`src/pages/Login.jsx`**.

#### Comparativa de estados:

**1. MODO OFFLINE (Para ajustar diseño):**
```javascript
// src/pages/Login.jsx (Líneas 20-22 aprox.)
/*
React.useEffect(() => {
    if (user) {
        window.location.href = '/';
    }
}, [user]);
*/
```

**2. MODO PRODUCCIÓN (Antes de Deploy):**
```javascript
// src/pages/Login.jsx (Líneas 20-22 aprox.)
React.useEffect(() => {
    if (user) {
        window.location.href = '/';
    }
}, [user]);
```

---

## 🔐 Cómo revertir los cambios antes del Deploy

Es **CRÍTICO** que antes de subir tu aplicación a Firebase, dejes el código como estaba para que las rutas vuelvan a estar protegidas.

**Pasos para revertir (Ejemplo Admin):**
1.  En `src/App.jsx`, identifica la ruta que habías modificado.
2.  **Elimina** las etiquetas de fragmento `<>` y `</>`.
3.  **Quita los comentarios** `{/*` y `*/}` de las etiquetas `ProtectedRoute`.
4.  La ruta debe quedar así de limpia:
    ```jsx
    <Route path="/admin" element={
        <ProtectedRoute adminOnly={true}>
            <Admin />
        </ProtectedRoute>
    } />
    ```
5.  **Guarda el archivo**.

---

## 🛠️ Modos de Trabajo (Protocolo de Jarvis)

Para simplificar nuestra comunicación, hemos definido dos estados para el proyecto:

### 🎨 1. DESIGN MODE (Modo de Diseño)
*   **Propósito**: Ajustes estéticos ultrarrápidos y navegación offline.
*   **Archivos afectados**:
    *   `src/App.jsx`: Todas las rutas protegidas están comentadas (Bypass).
    *   `src/pages/Login.jsx`: Redirección automática comentada.
    *   `src/context/AuthContext.jsx`: Usuario Mock inyectado automáticamente en `localhost`.
*   **⚠️ Riesgo**: **NO** desplegar en este estado. La seguridad está desactivada.

**Ejemplo de código para AuthContext.jsx en DESIGN MODE: (Replace line 30-32)**
```javascript
            } else {
                // FALLBACK FOR OFFLINE DEVELOPMENT
                if (window.location.hostname === 'localhost') {
                    setUser({
                        uid: 'mock-id',
                        name: 'Admin (Modo Diseño)',
                        username: 'admin',
                        role: 'admin',
                        isMock: true
                    });
                } else {
                    setUser(null);
                }
            }
```

**Ejemplo de código para AuthContext.jsx en PRODUCTION MODE: (Replace line 30-43)**
```javascript
            } else {
                setUser(null);
            }
```

### 🚀 2. PRODUCTION MODE (Modo de Producción)
*   **Propósito**: Entrega final y seguridad total en la nube.
*   **Estado final**:
    *   **SIN COMENTARIOS**: Todas las protecciones en `App.jsx` y `Login.jsx` están activas.
    *   **SEGURIDAD**: El sistema exige login real y permisos de administrador.
*   **Acción**: Solo se realiza el `npm run build` y `firebase deploy` cuando el proyecto está en este modo.

---

> [!TIP]
> **Consejo de Jarvis**: Entendido, señor. De ahora en adelante, cada vez que solicite cambiar a **Design Mode** o **Production Mode**, realizaré la "limpieza" o el "bypass" de todos los archivos mencionados en una sola maniobra coordinada. 🦾
