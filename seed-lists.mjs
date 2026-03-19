/**
 * Seed Script for Firestore Lists Collection
 * Run with: node seed-lists.js
 * 
 * This script populates the 'lists' collection in Firestore with all dropdown data.
 * It only needs to be run ONCE after initial Firebase setup.
 */

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// --- Firebase Configuration (same as in your app) ---
const firebaseConfig = {
    apiKey: "AIzaSyAMU2uJi7fd19tebwA2AgE47O-cYH_oorw",
    authDomain: "telespantgrav.firebaseapp.com",
    projectId: "telespantgrav",
    storageBucket: "telespantgrav.firebasestorage.app",
    messagingSenderId: "661489752694",
    appId: "1:661489752694:web:f1e137113fd73b2a929d57",
    measurementId: "G-FC62DY559B"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Initial Dropdowns Data ---
// Format: value = ID only, label = "ID - Description"
const initialDropdowns = {
    "Medio de contacto": [
        { value: "1", label: "1 - Por teléfono", active: true },
        { value: "2", label: "2 - Atendido en sede", active: true },
        { value: "3", label: "3 - Por email", active: true },
        { value: "7", label: "7 - Programa de atención a personas mayores", active: true },
        { value: "8", label: "8 - Chat TE", active: true }
    ],
    "Sexo": [
        { value: "0", label: "0 - No lo sé", active: true },
        { value: "1", label: "1 - Hombre", active: true },
        { value: "2", label: "2 - Mujer", active: true }
    ],
    "Edad": [
        { value: "1", label: "1 - Hasta 18 años", active: true },
        { value: "2", label: "2 - De 19 a 25", active: true },
        { value: "3", label: "3 - De 26 a 35", active: true },
        { value: "4", label: "4 - De 36 a 45", active: true },
        { value: "5", label: "5 - De 46 a 56", active: true },
        { value: "6", label: "6 - De 55 a 65", active: true },
        { value: "7", label: "7 - De 66 a 75", active: true },
        { value: "8", label: "8 - 76 o mas", active: true },
        { value: "9", label: "9 - Si, definir", active: true }
    ],
    "E.Civil": [
        { value: "0", label: "0 - No lo sé", active: true },
        { value: "1", label: "1 - Soltero", active: true },
        { value: "2", label: "2 - Casado", active: true },
        { value: "3", label: "3 - Viudo", active: true },
        { value: "4", label: "4 - Separado/Divorciado", active: true },
        { value: "5", label: "5 - Matrimonio nulo", active: true },
        { value: "6", label: "6 - Pareja de hecho", active: true }
    ],
    "Convive": [
        { value: "0", label: "0 - No lo sé", active: true },
        { value: "1", label: "1 - Solo", active: true },
        { value: "2", label: "2 - Familia de origen", active: true },
        { value: "3", label: "3 - Familia propia", active: true },
        { value: "4", label: "4 - Pareja de hecho", active: true },
        { value: "5", label: "5 - Pareja Homosexual", active: true },
        { value: "6", label: "6 - Domicilio de los hijos casados o emancipados", active: true },
        { value: "7", label: "7 - Con otros parientes", active: true },
        { value: "8", label: "8 - Residencia o institución benéfica", active: true },
        { value: "9", label: "9 - Piso compartido", active: true }
    ],
    "Asiduad": [
        { value: "0", label: "0 - No lo sé", active: true },
        { value: "1", label: "1 - Primera llamada", active: true },
        { value: "2", label: "2 - Ha llamado mas veces por el mismo asunto", active: true },
        { value: "3", label: "3 - Ha llamado mas veces en otras crisis", active: true },
        { value: "4", label: "4 - Llamante frecuente", active: true }
    ],
    "Naturaleza": [
        { value: "1", label: "1 - Problema Leve", active: true },
        { value: "2", label: "2 - Problema Grave", active: true },
        { value: "3", label: "3 - Problema Crónico", active: true },
        { value: "4", label: "4 - Crisis actual por situación externa", active: true },
        { value: "5", label: "5 - Crisis actual por procesos internos o evolutivos", active: true }
    ],
    "Inicio": [
        { value: "1", label: "1 - Menos de 1 semana", active: true },
        { value: "2", label: "2 - Entre 1 semana y 1 mes", active: true },
        { value: "3", label: "3 - Mas de 1 mes y menos de 1 año", active: true },
        { value: "4", label: "4 - Mas de 1 año", active: true }
    ],
    "Actitud ante el orientador": [
        { value: "1", label: "1 - Confiada", active: true },
        { value: "2", label: "2 - Desconfiada", active: true },
        { value: "3", label: "3 - Dependiente", active: true },
        { value: "4", label: "4 - Enfadada", active: true },
        { value: "5", label: "5 - Agresiva", active: true },
        { value: "6", label: "6 - Ansiosa", active: true },
        { value: "7", label: "7 - Desorientada", active: true }
    ],
    "Presentación": [
        { value: "1", label: "1 - Clara y directa", active: true },
        { value: "2", label: "2 - Con rodeos", active: true },
        { value: "3", label: "3 - Dubitativa", active: true },
        { value: "4", label: "4 - Abstracta e impersal", active: true },
        { value: "5", label: "5 - Muy prolija", active: true },
        { value: "6", label: "6 - Muy escueta", active: true },
        { value: "9", label: "9 - Comunicación Congruente", active: true },
        { value: "10", label: "10 - Comunicaión Incongruente", active: true }
    ],
    "Paralenguaje": [
        { value: "1", label: "1 - No significativo", active: true },
        { value: "2", label: "2 - Silencios", active: true },
        { value: "3", label: "3 - Suspiros", active: true },
        { value: "4", label: "4 - Sollozos", active: true },
        { value: "5", label: "5 - Ritmo o tono de voz alterados", active: true },
        { value: "7", label: "7 - Risas nerviosas", active: true }
    ],
    "Procedencia": [
        { value: "1", label: "1 - De la misma población del centro del Telefono", active: true },
        { value: "2", label: "2 - De la misma provincia del Telefono", active: true },
        { value: "3", label: "3 - De otra provincia", active: true },
        { value: "4", label: "4 - De otro país europeo", active: true },
        { value: "5", label: "5 - De otro país latinoamericano", active: true },
        { value: "6", label: "6 - De otros países", active: true }
    ],
    "Petición": [
        { value: "2", label: "2 - Hablar o de desahogarse con alguien", active: true },
        { value: "3", label: "3 - Orientación", active: true },
        { value: "5", label: "5 - Soluciones inmediatas", active: true },
        { value: "6", label: "6 - Aprobación de una decisión, tomada", active: true },
        { value: "9", label: "9 - Entrevista con un profesional", active: true }
    ],
    "Actitud ante el problema": [
        { value: "2", label: "2 - Cree que no tiene solución", active: true },
        { value: "3", label: "3 - Pasivo y sin deseos de colaborar con la solución del problema", active: true },
        { value: "4", label: "4 - Se reconoce responsable, al menos parcialmente", active: true },
        { value: "5", label: "5 - Se siente impotente para resolver el problema", active: true },
        { value: "6", label: "6 - Muestra deseos de colaborar para resolver el problema", active: true },
        { value: "7", label: "7 - Se siente muy culpabilizado", active: true },
        { value: "9", label: "9 - Desesperado", active: true },
        { value: "12", label: "12 - Cree que que sólo los demás tienen la culpa del problema", active: true }
    ],
    "Llamada derivada": [
        { value: "1", label: "1 - Servicio 112", active: true },
        { value: "2", label: "2 - Tráfico UVAT", active: true },
        { value: "3", label: "3 - Médico de Familia", active: true },
        { value: "4", label: "4 - Servicios de salud mental/psiquiatra", active: true },
        { value: "5", label: "5 - Servicios sociales", active: true },
        { value: "6", label: "6 - Policía nacional", active: true },
        { value: "7", label: "7 - Guardia civil", active: true },
        { value: "8", label: "8 - Fundación Anar", active: true },
        { value: "9", label: "9 - Programa SUMATE", active: true },
        { value: "10", label: "10 - Acompañandote 24/7", active: true },
        { value: "11", label: "11 - Teléfono 024", active: true },
        { value: "12", label: "12 - As. V.Frankl", active: true }
    ],
    "Resultado": [
        { value: "1", label: "1 - Se satisface la demanda del llamante, sólo con la llamada", active: true },
        { value: "2", label: "2 - Seguimiento programado por el Telefono", active: true },
        { value: "3", label: "3 - Se recomienda entrevista con profesional del Telefono", active: true },
        { value: "5", label: "5 - Se le da entrevista con un profesional", active: true },
        { value: "6", label: "6 - Se le invita que llame cuando lo necesite", active: true },
        { value: "7", label: "7 - Venir a la sede inmediatamente", active: true },
        { value: "8", label: "8 - Se deriva a otros profesionales o instituciones", active: true },
        { value: "9", label: "9 - No se acepta la ayuda que se le ofrece", active: true },
        { value: "10", label: "10 - Llamada incompleta", active: true },
        { value: "11", label: "11 - Se le deriva hacia otros programas del teléfono", active: true },
        { value: "13", label: "13 - A la persona atendida en la sede, se le invita en general a que venga otras veces, si lo necesita", active: true },
        { value: "14", label: "14 - se le deriva la llamada a la fundación Anar", active: true }
    ],
    "Nivel de ayuda": [
        { value: "2", label: "2 - Orientaciones puntuales", active: true },
        { value: "3", label: "3 - Acción de des angustiante", active: true },
        { value: "4", label: "4 - Compresión empática", active: true },
        { value: "5", label: "5 - Restructuración del problema", active: true },
        { value: "6", label: "6 - programación de nuevos comportamientos", active: true }
    ],
    "Sentimientos": [
        { value: "1", label: "1 - Compasión", active: true },
        { value: "2", label: "2 - Afecto", active: true },
        { value: "4", label: "4 - Aceptación y respeto", active: true },
        { value: "5", label: "5 - Cercanía", active: true },
        { value: "6", label: "6 - Satisfacción", active: true },
        { value: "8", label: "8 - Implicación personal/simpatía", active: true },
        { value: "9", label: "9 - Bloqueo", active: true },
        { value: "11", label: "11 - Confusión", active: true },
        { value: "12", label: "12 - Indiferencia", active: true },
        { value: "14", label: "14 - Incomodidad", active: true },
        { value: "16", label: "16 - Impotencia", active: true }
    ],
    "Autoevaluación": [
        { value: "2", label: "2 - Deficiente", active: true },
        { value: "3", label: "3 - Regular", active: true },
        { value: "4", label: "4 - Positiva", active: true }
    ],
    "Actitudes equivodas": [
        { value: "1", label: "1 - Dirigir, presionar", active: true },
        { value: "2", label: "2 - Aconsejar", active: true },
        { value: "3", label: "3 - Moralizar", active: true },
        { value: "5", label: "5 - Consolar", active: true },
        { value: "6", label: "6 - Discutir", active: true },
        { value: "7", label: "7 - Compadecer", active: true },
        { value: "9", label: "9 - Ninguna", active: true }
    ],
    "Satisfacción del llamante": [
        { value: "1", label: "1 - No dice nada", active: true },
        { value: "2", label: "2 - Expresa disconformidad", active: true },
        { value: "3", label: "3 - Expresa satisfacción", active: true },
        { value: "5", label: "5 - Cuelga sin concluir el proceso de ayuda", active: true }
    ],
    "Relación": [
        { value: "1", label: "1 - Cónyuge o compañero", active: true },
        { value: "2", label: "2 - Excónyuge o excompañero", active: true },
        { value: "3", label: "3 - Padre/madre", active: true },
        { value: "4", label: "4 - Hijo/hija", active: true },
        { value: "5", label: "5 - Hijo/hija del otro miembro de la pareja", active: true },
        { value: "10", label: "10 - Amigo, vecino, compañero", active: true },
        { value: "13", label: "13 - Otros familiares", active: true }
    ],
    "Tercero Actitud ante el problema": [
        { value: "2", label: "2 - El llamante no se atreve a proponerselo", active: true },
        { value: "3", label: "3 - El tercero, niega la existencia del problema", active: true },
        { value: "4", label: "4 - El tercero, piensa que el llamante es el responsable total del problema", active: true },
        { value: "5", label: "5 - No se muestran deseos de querer colaborar con la solución del problema", active: true },
        { value: "6", label: "6 - El tercero reconoce que él colabora, al menos parcialmente en el problema", active: true },
        { value: "7", label: "7 - Desea resolver el problema", active: true }
    ],
    "Condicion Socioeconomica": [
        { value: "1", label: "1 - Bajos recursos", active: true },
        { value: "2", label: "2 - Recursos Medios", active: true },
        { value: "3", label: "3 - Recursos Altos", active: true }
    ],
    "O_clave": [
        { value: "AB", label: "AB - Abril Bello", active: true },
        { value: "CD", label: "CD - Carlos Díaz", active: true },
        { value: "EF", label: "EF - Elena Fuentes", active: true },
        { value: "GH", label: "GH - Gerardo Haya", active: true }
    ],
    "C_duracion": [
        { value: "1", label: "1-5 min", active: true },
        { value: "2", label: "6-10 min", active: true },
        { value: "3", label: "11-20 min", active: true },
        { value: "4", label: "21-30 min", active: true },
        { value: "5", label: "+30 min", active: true }
    ],
    "Volvera a llamar": [
        { value: "S", label: "S - Sí", active: true },
        { value: "N", label: "N - No", active: true }
    ],
    "Comoconoce": [
        { value: "1", label: "1 - Prensa", active: true },
        { value: "2", label: "2 - Radio/TV", active: true },
        { value: "3", label: "3 - Redes Sociales", active: true },
        { value: "4", label: "4 - Otro usuario", active: true },
        { value: "5", label: "5 - Internet", active: true },
        { value: "6", label: "6 - Otros", active: true }
    ]
};

// --- Problem Categories ---
const problemCategories = {
    "A": {
        label: "PROBLEMAS PSICOLÓGICOS Y PSIQUIÁTRICOS", items: [
            { code: "1", label: "Crisis en el proyecto vital. Crisis de valores y de sentido", fullCode: "A1" },
            { code: "2", label: "Soledad e incomunicación", fullCode: "A2" },
            { code: "3", label: "Estado deprimido", fullCode: "A3" },
            { code: "4", label: "Vivencia de duelo", fullCode: "A4" },
            { code: "5", label: "Ideas suicidas", fullCode: "A5" },
            { code: "6", label: "Crisis suicidas", fullCode: "A6" },
            { code: "7", label: "Acto suicida en curso", fullCode: "A7" },
            { code: "8", label: "Trastornos de ansiedad", fullCode: "A8" },
            { code: "9", label: "Trastorno de la personalidad", fullCode: "A9" },
            { code: "10", label: "Trastorno psicótico", fullCode: "A10" },
            { code: "11", label: "Abuso o dependencia de sustancias", fullCode: "A11" },
            { code: "12", label: "Ludopatía", fullCode: "A12" },
            { code: "13", label: "Drogas de síntesis", fullCode: "A13" },
            { code: "14", label: "Trastornos de la alimentación", fullCode: "A14" },
            { code: "15", label: "Trastornos somatomorfos", fullCode: "A15" },
            { code: "16", label: "Otros trastornos psicológicos", fullCode: "A16" },
            { code: "17", label: "Necesidad de ir al psiquiatra", fullCode: "A17" },
            { code: "18", label: "Trastornos psicosexuales", fullCode: "A18" }
        ]
    },
    "B": {
        label: "PROBLEMAS FAMILIARES", items: [
            { code: "1", label: "Separación o divorcio", fullCode: "B1" },
            { code: "2", label: "Ruptura del noviazgo", fullCode: "B2" },
            { code: "3", label: "Dificultades de comunicación", fullCode: "B3" },
            { code: "4", label: "Celos/infidelidad", fullCode: "B4" },
            { code: "5", label: "Insatisfacción sexual", fullCode: "B5" },
            { code: "6", label: "Monotonía/aburrimiento", fullCode: "B6" },
            { code: "7", label: "Convivencia", fullCode: "B7" },
            { code: "8", label: "Incomprensión", fullCode: "B8" },
            { code: "9", label: "Problemas de comunicación padres/hijos", fullCode: "B9" },
            { code: "10", label: "Autoritarismo y rebelión adolescente", fullCode: "B10" },
            { code: "11", label: "Dificultades de socialización en niños", fullCode: "B11" },
            { code: "12", label: "Hijos mayores que no se independizan", fullCode: "B12" },
            { code: "13", label: "Abandono del hogar", fullCode: "B13" },
            { code: "14", label: "Dificultades con el embarazo/maternidad", fullCode: "B14" },
            { code: "15", label: "Hijos con discapacidad", fullCode: "B15" },
            { code: "16", label: "Problemas con los hermanos", fullCode: "B16" },
            { code: "17", label: "Problemas con familia política", fullCode: "B17" },
            { code: "18", label: "Problemas con otros parientes", fullCode: "B18" },
            { code: "19", label: "Muerte de un familiar", fullCode: "B19" },
            { code: "20", label: "Enfermedad de un familiar", fullCode: "B20" },
            { code: "21", label: "Familias desestructuradas", fullCode: "B21" },
            { code: "22", label: "Familias multiproblemáticas", fullCode: "B22" },
            { code: "23", label: "Cuidado de familiares ancianos", fullCode: "B23" },
            { code: "24", label: "Hijos en acogida/adopción", fullCode: "B24" }
        ]
    },
    "C": {
        label: "PROBLEMAS DE LA VIVIENDA", items: [
            { code: "1", label: "Falta de vivienda digna", fullCode: "C1" },
            { code: "2", label: "Problemas económicos de la vivienda", fullCode: "C2" },
            { code: "3", label: "Problemas de convivencia", fullCode: "C3" },
            { code: "4", label: "Vivienda insalubre", fullCode: "C4" }
        ]
    },
    "D": {
        label: "PROBLEMAS CON EL DINERO Y EL TRABAJO", items: [
            { code: "1", label: "Deudas", fullCode: "D1" },
            { code: "2", label: "Pobreza", fullCode: "D2" },
            { code: "3", label: "Desempleo", fullCode: "D3" },
            { code: "4", label: "Problemas con los compañeros", fullCode: "D4" },
            { code: "5", label: "Problemas con el jefe", fullCode: "D5" },
            { code: "6", label: "Mobbing o acoso laboral", fullCode: "D6" },
            { code: "7", label: "Jubilación", fullCode: "D7" },
            { code: "8", label: "Accidentes", fullCode: "D8" },
            { code: "9", label: "Invalidez", fullCode: "D9" },
            { code: "10", label: "Dificultad para encontrar trabajo", fullCode: "D10" }
        ]
    },
    "E": {
        label: "PROBLEMAS DE SALUD", items: [
            { code: "1", label: "Enfermedad crónica o grave", fullCode: "E1" },
            { code: "2", label: "Problemas de salud sin especificar", fullCode: "E2" },
            { code: "3", label: "Problemas de salud física del llamante", fullCode: "E3" },
            { code: "4", label: "Dificultades en el diagnóstico", fullCode: "E4" }
        ]
    },
    "F": {
        label: "PROBLEMAS CON LA VIOLENCIA", items: [
            { code: "1", label: "Maltrato físico conyugal", fullCode: "F1" },
            { code: "2", label: "Maltrato emocional conyugal", fullCode: "F2" },
            { code: "3", label: "Maltrato sexual conyugal", fullCode: "F3" },
            { code: "4", label: "Maltrato físico filio-parental", fullCode: "F4" },
            { code: "5", label: "Maltrato emocional filio-parental", fullCode: "F5" },
            { code: "6", label: "Maltrato sexual filio-parental", fullCode: "F6" },
            { code: "7", label: "Maltrato físico a ancianos", fullCode: "F7" },
            { code: "8", label: "Maltrato emocional a ancianos", fullCode: "F8" },
            { code: "9", label: "Maltrato sexual a ancianos", fullCode: "F9" },
            { code: "10", label: "Maltrato físico de desconocidos", fullCode: "F10" },
            { code: "11", label: "Maltrato emocional de desconocidos", fullCode: "F11" },
            { code: "12", label: "Maltrato sexual de desconocidos", fullCode: "F12" },
            { code: "13", label: "Acoso escolar (bullying)", fullCode: "F13" },
            { code: "14", label: "Acoso sexual", fullCode: "F14" }
        ]
    },
    "G": {
        label: "PROBLEMAS DE JUSTICIA", items: [
            { code: "1", label: "Problemas penales", fullCode: "G1" },
            { code: "2", label: "Problemas civiles", fullCode: "G2" },
            { code: "3", label: "Problemas laborales", fullCode: "G3" }
        ]
    },
    "H": {
        label: "PROBLEMAS SOCIALES", items: [
            { code: "1", label: "Discriminación social", fullCode: "H1" },
            { code: "2", label: "Problemas de inmigración/extranjería", fullCode: "H2" },
            { code: "3", label: "Problemas de raza/cultura", fullCode: "H3" },
            { code: "4", label: "Problemas de orientación sexual", fullCode: "H4" },
            { code: "5", label: "Conflictos vecinales", fullCode: "H5" },
            { code: "6", label: "Otros problemas sociales", fullCode: "H6" }
        ]
    },
    "I": {
        label: "PROBLEMAS DE RECURSOS", items: [
            { code: "1", label: "Falta de recursos económicos", fullCode: "I1" },
            { code: "2", label: "Falta de recursos sanitarios", fullCode: "I2" },
            { code: "3", label: "Falta de recursos sociales", fullCode: "I3" },
            { code: "4", label: "Falta de recursos educativos", fullCode: "I4" },
            { code: "5", label: "Falta de recursos de ocio", fullCode: "I5" },
            { code: "6", label: "Falta de recursos de vivienda", fullCode: "I6" }
        ]
    },
    "J": {
        label: "PROBLEMAS POR CATASTROFES", items: [
            { code: "1", label: "Catástrofes naturales", fullCode: "J1" },
            { code: "2", label: "Accidentes colectivos", fullCode: "J2" },
            { code: "3", label: "Actos terroristas", fullCode: "J3" },
            { code: "4", label: "Otros problemas por catástrofes", fullCode: "J4" }
        ]
    },
    "K": {
        label: "PROBLEMAS POR PROCESOS EVOLUTIVOS", items: [
            { code: "1", label: "Crisis evolutiva: adolescencia", fullCode: "K1" },
            { code: "2", label: "Crisis evolutiva: madurez", fullCode: "K2" },
            { code: "3", label: "Crisis evolutiva: envejecimiento", fullCode: "K3" }
        ]
    },
    "L": {
        label: "PROBLEMAS POR ABUSO SEXUAL", items: [
            { code: "1", label: "Abuso sexual en la infancia", fullCode: "L1" },
            { code: "2", label: "Abuso sexual en la adolescencia", fullCode: "L2" },
            { code: "3", label: "Abuso sexual en la edad adulta", fullCode: "L3" }
        ]
    },
    "M": {
        label: "PROBLEMAS CON VIOLENCIA DOMÉSTICA", items: [
            { code: "1", label: "Violencia física en la pareja", fullCode: "M1" },
            { code: "2", label: "Violencia emocional en la pareja", fullCode: "M2" },
            { code: "3", label: "Violencia sexual en la pareja", fullCode: "M3" },
            { code: "4", label: "Violencia económica en la pareja", fullCode: "M4" },
            { code: "5", label: "Violencia vicaria", fullCode: "M5" }
        ]
    },
    "N": {
        label: "PROBLEMAS CON EL ACOSO (STALKING)", items: [
            { code: "1", label: "Acoso presencial (stalking)", fullCode: "N1" },
            { code: "2", label: "Ciberacoso", fullCode: "N2" }
        ]
    },
    "O": {
        label: "PROBLEMAS CON DISCAPACIDADES", items: [
            { code: "1", label: "Discapacidad física", fullCode: "O1" },
            { code: "2", label: "Discapacidad psíquica", fullCode: "O2" },
            { code: "3", label: "Discapacidad sensorial", fullCode: "O3" },
            { code: "4", label: "Discapacidad por enfermedad mental", fullCode: "O4" }
        ]
    },
    "P": {
        label: "LLAMADAS PERIFÉRICAS", items: [
            { code: "1", label: "Llamada por error", fullCode: "P1" },
            { code: "2", label: "Llamada para comprobar si el T. E. está operativo", fullCode: "P2" },
            { code: "3", label: "Llamada con intención de broma", fullCode: "P3" },
            { code: "4", label: "Llamada con intención de acosar/molestar", fullCode: "P4" },
            { code: "5", label: "Llamada de un profesional", fullCode: "P5" },
            { code: "6", label: "Información sobre persona atendida", fullCode: "P6" },
            { code: "7", label: "Petición de ayuda inmediata", fullCode: "P7" },
            { code: "8", label: "Información acerca del T. E", fullCode: "P8" },
            { code: "9", label: "Información sobre actividades", fullCode: "P9" },
            { code: "10", label: "Ofrecimiento como colaborador", fullCode: "P10" },
            { code: "11", label: "Oferta de recursos", fullCode: "P11" },
            { code: "12", label: "Petición de acudir a sede", fullCode: "P12" },
            { code: "13", label: "Nueva petición de entrevista", fullCode: "P13" },
            { code: "14", label: "Anulación o cambio de hora", fullCode: "P14" },
            { code: "15", label: "Información de recursos para solitarios", fullCode: "P15" },
            { code: "16", label: "Información de recursos de drogadicción", fullCode: "P16" },
            { code: "17", label: "Información de recursos de alcoholismo", fullCode: "P17" },
            { code: "18", label: "Información de recursos de ludopatías", fullCode: "P18" },
            { code: "19", label: "Llamada de comprobación a un llamante", fullCode: "P19" },
            { code: "20", label: "Otro tipo de llamadas periféricas", fullCode: "P20" },
            { code: "21", label: "Llamadas de niños", fullCode: "P21" },
            { code: "22", label: "Llamadas de adolescentes", fullCode: "P22" }
        ]
    },
    "Q": {
        label: "PROBLEMAS DE CONDUCTAS ADICTIVAS", items: [
            { code: "1", label: "Abuso de Alcohol", fullCode: "Q1" },
            { code: "2", label: "Abuso de tabaco", fullCode: "Q2" },
            { code: "3", label: "Abuso de sustancias", fullCode: "Q3" },
            { code: "4", label: "Adicción al juego (Ludopatía)", fullCode: "Q4" },
            { code: "5", label: "Adicción a Internet/Redes", fullCode: "Q5" },
            { code: "6", label: "Adicción al Sexo", fullCode: "Q6" },
            { code: "7", label: "Adicción a compras", fullCode: "Q7" }
        ]
    },
    "R": {
        label: "PROBLEMAS DE SALUD MENTAL EN FAMILIARES", items: [
            { code: "1", label: "Esquizofrenia en familiar", fullCode: "R1" },
            { code: "2", label: "Trastorno bipolar en familiar", fullCode: "R2" },
            { code: "3", label: "Trastorno depresivo en familiar", fullCode: "R3" },
            { code: "4", label: "Trastorno de ansiedad en familiar", fullCode: "R4" },
            { code: "5", label: "Trastorno obsesivo compulsivo en familiar", fullCode: "R5" },
            { code: "6", label: "Trastorno de la personalidad en familiar", fullCode: "R6" },
            { code: "7", label: "Trastornos de la conducta alimentaria en familiar", fullCode: "R7" },
            { code: "8", label: "Trastorno psicótico no especificado en familiar", fullCode: "R8" },
            { code: "9", label: "Ideas o intentos de suicidio en familiar", fullCode: "R9" }
        ]
    }
};

// --- Generate Derived Lists ---
// Problemática: value = letter code (A, B, etc.), label = "A - DESCRIPTION"
const problematicaList = Object.entries(problemCategories).map(([key, category]) => {
    return { value: key, label: `${key} - ${category.label}`, active: true };
});

// Problema: value = full code (A1, B2, etc.), label = "A1 - DESCRIPTION"
const problemaList = [];
Object.values(problemCategories).forEach(category => {
    category.items.forEach(item => {
        problemaList.push({ value: item.fullCode, label: `${item.fullCode} - ${item.label}`, active: true });
    });
});

// --- Combine All Lists ---
const allLists = {
    ...initialDropdowns,
    "Problemática": problematicaList,
    "Problema": problemaList
};

// --- Main Seed Function ---
async function seedLists() {
    console.log("🌱 Starting Firestore lists seeding...\n");

    let successCount = 0;
    let errorCount = 0;

    for (const [listName, items] of Object.entries(allLists)) {
        try {
            await setDoc(doc(db, "lists", listName), { items });
            console.log(`✅ Seeded: ${listName} (${items.length} items)`);
            successCount++;
        } catch (error) {
            console.error(`❌ Error seeding ${listName}:`, error.message);
            errorCount++;
        }
    }

    console.log("\n🎉 Seeding complete!");
    console.log(`   ✅ Success: ${successCount} lists`);
    console.log(`   ❌ Errors: ${errorCount} lists`);
    console.log("\n💡 You can now use your app. The dropdowns should be populated!");

    process.exit(0);
}

seedLists();
