# Guía de Configuración Manual de Firebase

Sigue estos pasos para configurar tu base de datos y usuarios manualmente desde la Consola de Firebase.

## 1. Configurar Autenticación (Crear Usuario Admin)

## 1. Configurar Autenticación (Crear Usuario Admin)

Para poder iniciar sesión, la cuenta debe existir en el servicio de Autenticación de Firebase.
**¡Truco para usar solo "Usuario" y no Email!**
Firebase exige un email real, pero la aplicación está configurada para agregar automáticamente `@te.org` si no lo escribes.
Así que, para tener un usuario **"admin"**:

1.  Ve a la [Consola de Firebase](https://console.firebase.google.com/project/telespantgrav/authentication/users).
2.  En el menú izquierdo, selecciona **Authentication**.
3.  Asegúrate de estar en la pestaña **Users**.
4.  Haz clic en el botón **Agregar usuario**.
5.  Ingresa el correo: `admin@te.org` (Tú usarás solo `admin` en la web, pero aquí debes poner el completo).
6.  Ingresa la contraseña: `admin123` (o la que prefieras).
7.  Haz clic en **Agregar usuario**.
8.  **IMPORTANTE**: Copia el **UID** del usuario que acabas de crear.

## 2. Crear Perfil de Usuario en Base de Datos

1.  En el menú izquierdo de Firebase, selecciona **Firestore Database**.
2.  Haz clic en la pestaña **Data**.
3.  Haz clic en **Comenzar colección** (si está vacía) o selecciona la colección `users`.
4.  **Agregar Documento**:
    *   **ID del documento**: PEGA AQUÍ EL UID.
    *   **Campo 1**: `name` (String) -> Valor: "Administrador Principal"
    *   **Campo 2**: `email` (String) -> Valor: "admin@te.org"
    *   **Campo 3**: `username` (String) -> Valor: "admin"
    *   **Campo 4**: `role` (String) -> Valor: "admin"
5.  Haz clic en **Guardar**.

Ahora, en la página web, ¡podrás loguearte escribiendo simplemente **Usuario: admin** y **Contraseña: admin123**!

## 3. Crear Listas Desplegables (Opcional pero Recomendado)

La aplicación necesita listas (como "Sexo", "Edad", etc.) para funcionar. Hacer esto manualmente es muy lento (son cientos de opciones), pero aquí están los pasos para crear una lista de prueba.

1.  En **Firestore Database**, crea una nueva colección llamada `lists` (o entra si ya existe).
2.  Haz clic en **Agregar documento**.
    *   **ID del documento**: Escribe el nombre exacto de la lista, por ejemplo: `Sexo`.
3.  **Agregar Campo**:
    *   Campo: `items`
    *   Tipo: **Array** (Matriz)
4.  Dentro del Array `items`, agrega valores. Cada valor debe ser un **Map** (Mapa).
5.  Dentro del **Map** (índice 0), agrega estos campos:
    *   `label` (String) -> "1 - Hombre"
    *   `value` (String) -> "1 - Hombre"
    *   `active` (Boolean) -> true
6.  Agrega otro Map (índice 1) para "2 - Mujer", y así sucesivamente.
7.  Haz clic en **Guardar**.

### Listas Necesarias
Debes repetir esto para cada una de estas listas exactas:
*   `Medio de contacto`
*   `Sexo`
*   `Edad`
*   `E.Civil`
*   `Convive`
*   `Asiduad`
*   `Naturaleza`
*   `Inicio`
*   `Actitud ante el orientador`
*   `Presentación`
*   `Paralenguaje`
*   `Procedencia`
*   `Petición`
*   `Condicion Socioeconomica`
*   `Llamada derivada`
*   `Resultado`
*   `C_duracion`
*   `O_autoevaluacion`
*   `O_volvera_llamar`
*   ... y las listas de evaluación (Nivel de ayuda, Sentimientos, etc.).

> **Nota**: Si decides no hacer esto manualmente, la aplicación tiene una copia de seguridad interna que cargará automáticamente si no encuentra datos en Firebase, así que **podrás usarla de inmediato** aunque no llenes estas listas manualmente.
