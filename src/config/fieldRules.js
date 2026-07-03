export const RULE_OBL = 'OBL';
export const RULE_OPC = 'OPC';
export const RULE_NH = 'NH';

// Mapeos extraídos de la Matriz DataMaestra (Columnas G y H)
export const TERCERO_PROBLEMS = ['B34', 'B35', 'F1'];
export const RELACIONADO_PROBLEMS = ['A21', 'A22', 'A23', 'B2', 'B3', 'B5', 'B6', 'B8', 'B9', 'B12', 'B13', 'B17', 'B19', 'B20', 'B22', 'B23', 'B24', 'B25', 'B26', 'B27', 'B28', 'B29', 'B30', 'B34', 'B35', 'B36', 'C11'];

export const isTerceroRequired = (problemCode) => TERCERO_PROBLEMS.includes(problemCode);
export const isRelacionadoRequired = (problemCode) => RELACIONADO_PROBLEMS.includes(problemCode);

// Regla RG5: Campos siempre obligatorios en todas las llamadas
export const GLOBAL_OBLIGATORIOS = [
  'L_Orientador', 'L_Medio_Contacto', 'L_Como_Conoce', 'L_Sintesis',
  'U_Problematica_1', 'U_Problema_1'
];

// Regla RG6: Campos siempre opcionales en todas las llamadas
export const GLOBAL_OPCIONALES = [
  'L_Llamada_Derivada', 'U_Procedencia',
  'U_Problematica_2', 'U_Problema_2',
  'U_Problematica_3', 'U_Problema_3',
  'U_Actitud_Problema_1', 'U_Actitud_Problema_2',
  'T_Actitud_Problema_1', 'T_Actitud_Problema_2',
  'R_Actitud_Problema_1', 'R_Actitud_Problema_2'
];

// Campos de Usuario
const userFields = [
  'U_Sexo', 'U_Edad', 'U_Estado_Civil', 'U_Convive', 'U_Asiduidad',
  'U_Naturaleza', 'U_Inicio', 'U_Actitud_Orientador', 'U_Presentacion',
  'U_Paralenguaje', 'U_Peticion', 'U_Actitud_Problema_1', 'U_Actitud_Problema_2',
  'U_Cond_Socioeconomica'
];

// Campos de Orientador
const orientadorFields = [
  'O_Nivel_Ayuda_1', 'O_Nivel_Ayuda_2', 'O_Sentimientos_1', 'O_Sentimientos_2',
  'O_Sentimientos_3', 'O_Autoevaluacion', 'O_Actitud_Equivocada_1',
  'O_Actitud_Equivocada_2', 'O_Satisfaccion_1', 'O_Satisfaccion_2', 'O_Volvera_Llamar',
  'L_Hora', 'L_Fecha', 'L_Resultado', 'L_Duracion'
];

const allDynamicFields = [...userFields, ...orientadorFields];

/**
 * Returns the status (OBL, OPC, NH) for a given field based on the problem code.
 * @param {string} problemCode The code of the selected problem (e.g., 'F1', 'P5', 'A1')
 * @param {string} fieldName The name of the field to check
 * @returns {string} RULE_OBL, RULE_OPC, or RULE_NH
 */
export function getFieldStatus(problemCode, fieldName) {
  // RG5/RG6: Global priority
  if (GLOBAL_OBLIGATORIOS.includes(fieldName)) return RULE_OBL;
  if (GLOBAL_OPCIONALES.includes(fieldName)) return RULE_OPC;

  if (!problemCode) return RULE_NH; // If no problem is selected, dynamic fields are generally disabled

  // We only control dynamic fields in this matrix
  if (!allDynamicFields.includes(fieldName)) return RULE_OBL; // Default fallback for unknown fields

  const isPeriferica = problemCode.startsWith('P');
  const isHabitual = ['F0', 'F5', 'F8'].includes(problemCode);
  const isSamaritano = problemCode === 'F1';
  const isF9F10 = ['F9', 'F10'].includes(problemCode);
  const isStandard = ['A', 'B', 'C', 'D'].some(prefix => problemCode.startsWith(prefix));

  // --- Reglas Específicas ---

  // RG12: Llamadas Periféricas (P)
  if (isPeriferica) {
    if (['U_Sexo', 'U_Edad'].includes(fieldName)) return RULE_OPC;
    return RULE_NH; // Todos los demás NH
  }

  // RG13: Llamante Habitual (F0, F5, F8)
  if (isHabitual) {
    if (['U_Sexo', 'U_Edad'].includes(fieldName)) return RULE_OBL;
    if (['U_Naturaleza', 'U_Inicio', 'O_Volvera_Llamar'].includes(fieldName)) return RULE_OPC;
    return RULE_NH; // Todos los demás NH
  }

  // RG14: Buen Samaritano (F1)
  if (isSamaritano) {
    if (['U_Sexo', 'U_Edad'].includes(fieldName)) return RULE_OBL;
    // Orientador fields for F1
    const f1OrientadorOBL = [
      'O_Nivel_Ayuda_1', 'O_Sentimientos_1', 'O_Autoevaluacion', 
      'O_Actitud_Equivocada_1', 'O_Satisfaccion_1', 'O_Volvera_Llamar',
      'L_Hora', 'L_Fecha', 'L_Resultado', 'L_Duracion'
    ];
    const f1OrientadorOPC = [
      'O_Nivel_Ayuda_2', 'O_Sentimientos_2', 'O_Sentimientos_3', 
      'O_Actitud_Equivocada_2', 'O_Satisfaccion_2'
    ];
    if (f1OrientadorOBL.includes(fieldName)) return RULE_OBL;
    if (f1OrientadorOPC.includes(fieldName)) return RULE_OPC;
    return RULE_NH; // Todos los demás NH
  }

  // F9 y F10
  if (isF9F10) {
    const f9f10OPC = [
      'U_Actitud_Problema_1', 'U_Actitud_Problema_2',
      'O_Nivel_Ayuda_2', 'O_Sentimientos_2', 'O_Sentimientos_3', 
      'O_Actitud_Equivocada_2', 'O_Satisfaccion_2'
    ];
    if (f9f10OPC.includes(fieldName)) return RULE_OPC;
    return RULE_OBL; // Todos los demás son OBL
  }

  // RG11: Problemática General (A, B, C, D)
  if (isStandard) {
    const standardOPC = [
      'O_Nivel_Ayuda_2', 'O_Sentimientos_2', 'O_Sentimientos_3', 
      'O_Actitud_Equivocada_2', 'O_Satisfaccion_2'
    ];
    if (standardOPC.includes(fieldName)) return RULE_OPC;
    return RULE_OBL; 
  }

  // Default behavior if not explicitly caught
  return RULE_OBL;
}
