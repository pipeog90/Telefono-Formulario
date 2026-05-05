/**
 * fieldConfig.js — Centralized field metadata from Parametrización Tab1
 *
 * Each key maps a form field ID to its:
 *   type:        'numeric' | 'char' | 'text' | 'date' | 'time'
 *   maxLength:   max characters allowed (null = unlimited)
 *   description: Spanish tooltip text shown when the user clicks the label
 */

export const fieldConfig = {
    // ── Llamada ──────────────────────────────────────────────────────────────
    L_ID_Llamada: {
        type: 'char',
        maxLength: 7,
        description: 'Identificador único de la llamada (ej. 171).'
    },
    L_Orientador: {
        type: 'char',
        maxLength: 6,
        description: 'Identifica al orientador.'
    },
    L_Medio_Contacto: {
        type: 'numeric',
        maxLength: 2,
        description: 'Medio a través del cual se contactó el llamante en la llamada.'
    },
    L_Como_Conoce: {
        type: 'numeric',
        maxLength: 2,
        description: 'Cómo conoció el llamante acerca del Teléfono de la Esperanza.'
    },
    L_Hora: {
        type: 'time',
        maxLength: null,
        description: 'Hora de inicio de la llamada.'
    },
    L_Fecha: {
        type: 'date',
        maxLength: null,
        description: 'Fecha en que se recibió la llamada.'
    },
    L_Resultado: {
        type: 'numeric',
        maxLength: 2,
        description: 'Qué se logró en la llamada.'
    },
    L_Duracion: {
        type: 'numeric',
        maxLength: 2,
        description: 'Tiempo transcurrido en la atención de la llamada.'
    },
    L_Llamada_Derivada: {
        type: 'numeric',
        maxLength: 2,
        description: 'Identifica la actividad en la que fue derivada la llamada, cuando aplica.'
    },
    L_Sintesis: {
        type: 'text',
        maxLength: 300,
        description: 'Resumen de lo que pasó durante la llamada; detalla el problema, énfasis en datos considerados importantes de la situación.'
    },

    // ── Usuario (Llamante) ───────────────────────────────────────────────────
    U_Sexo: {
        type: 'numeric',
        maxLength: 2,
        description: 'Género en el cual se identifica al llamante.'
    },
    U_Edad: {
        type: 'numeric',
        maxLength: 3,
        description: 'Edad en la cual se identifica al llamante, expresado en años.'
    },
    U_Estado_Civil: {
        type: 'numeric',
        maxLength: 2,
        description: 'Estado civil en el cual se identifica al llamante.'
    },
    U_Convive: {
        type: 'numeric',
        maxLength: 2,
        description: 'Indica con quién vive el llamante.'
    },
    U_Asiduidad: {
        type: 'numeric',
        maxLength: 2,
        description: 'Frecuencia de llamada del usuario.'
    },
    U_Problematica_1: {
        type: 'char',
        maxLength: 1,
        description: 'Identifica un área raíz del problema.'
    },
    U_Problema_1: {
        type: 'numeric',
        maxLength: 4,
        description: 'Identifica el problema según la primera causa.'
    },
    U_Problematica_2: {
        type: 'char',
        maxLength: 1,
        description: 'Identifica una segunda área raíz del problema.'
    },
    U_Problema_2: {
        type: 'numeric',
        maxLength: 4,
        description: 'Identifica el problema según la segunda causa.'
    },
    U_Problematica_3: {
        type: 'char',
        maxLength: 1,
        description: 'Identifica una tercera área raíz del problema.'
    },
    U_Problema_3: {
        type: 'numeric',
        maxLength: 4,
        description: 'Identifica el problema según la tercera causa.'
    },
    U_Naturaleza: {
        type: 'numeric',
        maxLength: 2,
        description: 'Categorización de la llamada.'
    },
    U_Inicio: {
        type: 'numeric',
        maxLength: 2,
        description: 'Identifica cómo se originó el problema.'
    },
    U_Actitud_Orientador: {
        type: 'numeric',
        maxLength: 2,
        description: 'Percepción del orientador sobre el trato recibido del usuario.'
    },
    U_Presentacion: {
        type: 'numeric',
        maxLength: 2,
        description: 'Cómo se abordó el problema.'
    },
    U_Paralenguaje: {
        type: 'numeric',
        maxLength: 2,
        description: 'Identifica elementos no verbales de la comunicación.'
    },
    U_Procedencia: {
        type: 'numeric',
        maxLength: 2,
        description: 'Procedencia del llamante.'
    },
    U_Peticion: {
        type: 'numeric',
        maxLength: 2,
        description: 'Petición del llamante.'
    },
    U_Actitud_Problema_1: {
        type: 'numeric',
        maxLength: 2,
        description: 'Posición identificada del usuario frente a su conflicto.'
    },
    U_Actitud_Problema_2: {
        type: 'numeric',
        maxLength: 2,
        description: 'Segunda posición identificada del usuario frente a su conflicto.'
    },
    U_Cond_Socioeconomica: {
        type: 'numeric',
        maxLength: 2,
        description: 'Identifica la situación social y económica del usuario.'
    },

    // ── Tercero ──────────────────────────────────────────────────────────────
    T_Sexo_Tercero: {
        type: 'numeric',
        maxLength: 2,
        description: 'Género en el cual se identifica al tercero por el cual se está llamando.'
    },
    T_Edad_Tercero: {
        type: 'numeric',
        maxLength: 2,
        description: 'Edad en la cual se identifica al tercero, expresado en años.'
    },
    T_Estado_Civil_Tercero: {
        type: 'numeric',
        maxLength: 2,
        description: 'Estado civil en el cual se identifica al tercero por el cual se está llamando.'
    },
    T_Convive: {
        type: 'numeric',
        maxLength: 2,
        description: 'Con quién convive el tercero por el cual se está llamando.'
    },
    T_Relacion: {
        type: 'numeric',
        maxLength: 2,
        description: 'Parentesco o relación del llamante con el tercero por el cual está llamando.'
    },
    T_Problematica_1: {
        type: 'char',
        maxLength: 1,
        description: 'Identifica un área raíz del problema, según el tercero.'
    },
    T_Problema_1: {
        type: 'numeric',
        maxLength: 4,
        description: 'Identifica el problema según la primera causa identificada por el tercero.'
    },
    T_Problematica_2: {
        type: 'char',
        maxLength: 1,
        description: 'Identifica una segunda área raíz del problema, según el tercero.'
    },
    T_Problema_2: {
        type: 'numeric',
        maxLength: 4,
        description: 'Identifica el problema según la segunda causa identificada por el tercero.'
    },
    T_Problematica_3: {
        type: 'char',
        maxLength: 1,
        description: 'Identifica una tercera área raíz del problema según el tercero.'
    },
    T_Problema_3: {
        type: 'numeric',
        maxLength: 4,
        description: 'Identifica el problema según la tercera causa identificada por el tercero.'
    },
    T_Actitud_Problema_1: {
        type: 'numeric',
        maxLength: 2,
        description: 'Reacción del tercero ante la situación.'
    },
    T_Actitud_Problema_2: {
        type: 'numeric',
        maxLength: 2,
        description: 'Segunda reacción del tercero ante la situación.'
    },

    // ── Relacionado ──────────────────────────────────────────────────────────
    R_Sexo_Relacionado: {
        type: 'numeric',
        maxLength: 2,
        description: 'Género en el cual se identifica el relacionado.'
    },
    R_Edad_Relacionado: {
        type: 'numeric',
        maxLength: 2,
        description: 'Edad en la cual se identifica el relacionado, expresado en años.'
    },
    R_Estado_Civil_Relacionado: {
        type: 'numeric',
        maxLength: 2,
        description: 'Estado civil en el cual se identifica el relacionado.'
    },
    R_Convive: {
        type: 'numeric',
        maxLength: 2,
        description: 'Con quién convive el relacionado.'
    },
    R_Relacion: {
        type: 'numeric',
        maxLength: 2,
        description: 'Parentesco o relación del llamante con el relacionado.'
    },
    R_Problematica_1: {
        type: 'char',
        maxLength: 1,
        description: 'Identifica un área raíz del problema, según el relacionado.'
    },
    R_Problema_1: {
        type: 'numeric',
        maxLength: 4,
        description: 'Identifica el problema según la primera causa identificada por el relacionado.'
    },
    R_Problematica_2: {
        type: 'char',
        maxLength: 1,
        description: 'Identifica una segunda área raíz del problema, según el relacionado.'
    },
    R_Problema_2: {
        type: 'numeric',
        maxLength: 4,
        description: 'Identifica el problema según la segunda causa identificada por el relacionado.'
    },
    R_Problematica_3: {
        type: 'char',
        maxLength: 1,
        description: 'Identifica una tercera área raíz del problema según el relacionado.'
    },
    R_Problema_3: {
        type: 'numeric',
        maxLength: 4,
        description: 'Identifica el problema según la tercera causa identificada por el relacionado.'
    },

    // ── Orientador ───────────────────────────────────────────────────────────
    O_Clave: {
        type: 'char',
        maxLength: 3,
        description: 'Clave del orientador.'
    },
    O_Autoevaluacion: {
        type: 'numeric',
        maxLength: 2,
        description: 'Calificación del orientador sobre su manera de abordar la llamada.'
    },
    O_Volvera_Llamar: {
        type: 'text',
        maxLength: 2,
        description: 'Consideración sobre si el usuario volverá a llamar.'
    },
    O_Nivel_Ayuda_1: {
        type: 'numeric',
        maxLength: 2,
        description: 'Ayuda que considera brindó al usuario.'
    },
    O_Nivel_Ayuda_2: {
        type: 'numeric',
        maxLength: 2,
        description: 'Segunda ayuda que considera brindó al usuario.'
    },
    O_Sentimientos_1: {
        type: 'numeric',
        maxLength: 2,
        description: 'Sentimiento que percibe sintió durante la llamada.'
    },
    O_Sentimientos_2: {
        type: 'numeric',
        maxLength: 2,
        description: 'Segundo sentimiento que percibe sintió durante la llamada.'
    },
    O_Sentimientos_3: {
        type: 'numeric',
        maxLength: 2,
        description: 'Tercer sentimiento que percibe sintió durante la llamada.'
    },
    O_Actitud_Equivocada_1: {
        type: 'numeric',
        maxLength: 2,
        description: 'Identifica qué actitud errada puede haber tomado atendiendo la llamada.'
    },
    O_Actitud_Equivocada_2: {
        type: 'numeric',
        maxLength: 2,
        description: 'Identifica una segunda actitud errada puede haber tomado atendiendo la llamada.'
    },
    O_Satisfaccion_1: {
        type: 'numeric',
        maxLength: 2,
        description: 'Identifica el impacto positivo percibido en el usuario.'
    },
    O_Satisfaccion_2: {
        type: 'numeric',
        maxLength: 2,
        description: 'Identifica un segundo impacto positivo percibido en el usuario.'
    },

    // ── Cita / Entrevista (future phase) ─────────────────────────────────────
    CE_Profesional: {
        type: 'char',
        maxLength: 6,
        description: 'Identifica al profesional al cual se remite.'
    },
    CE_Referencia: {
        type: 'text',
        maxLength: 7,
        description: 'Identificador de la cita a entrevista o apoyo especializado al que se remite al llamante.'
    },
    CE_Fecha: {
        type: 'date',
        maxLength: null,
        description: 'Fecha de la cita a la que se remite.'
    },
    CE_Hora: {
        type: 'time',
        maxLength: null,
        description: 'Hora de la cita a la cual se remite.'
    }
};
