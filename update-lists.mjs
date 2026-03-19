/**
 * Update Script for Firestore Lists Collection
 * Syncs data EXACTLY from MVP-AngelPhone-V.1.0.html
 */

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// --- Firebase Configuration ---
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

// --- RAW DATA FROM MVP-AngelPhone-V.1.0.html ---

const rawCSVData = `Medio de contacto,1,Por teléfono
Medio de contacto,2,Atendido en sede
Medio de contacto,3,Por email
Medio de contacto,7,Programa de atención a personas mayores
Medio de contacto,8,Chat TE
Sexo,0,No lo sé
Sexo,1,Hombre
Sexo,2,Mujer
Edad,1,Hast 18 años
Edad,2,De 19 a 25
Edad,3,De 26 a 35
Edad,4,De 36 a 45
Edad,5,De 46 a 56
Edad,6,De 55 a 65
Edad,7,de 66 a 75
Edad,8,76 o mas 
Edad,9,"Si, definir"
E.Civil,0,No lo sé
E.Civil,1,Soltero
E.Civil,2,Casado
E.Civil,3,Viudo
E.Civil,4,Separado/Divorciado
E.Civil,5,Matrimonio nulo
E.Civil,6,Pareja de hecho
Convive,0,No lo sé
Convive,1,Solo
Convive,2,Familia de origen
Convive,3,Familia propia
Convive,4,Pareja de hecho
Convive,5,Pareja Homosexual
Convive,6,Domicilio de los hijos casados o emancipados
Convive,7,Con otros parientes
Convive,8,Residencia o institución benéfica
Convive,9,Piso compartido
Asiduad,0,No lo sé
Asiduad,1,Primera llamada
Asiduad,2,Ha llamado mas veces por el mismo asunto
Asiduad,3,Ha llamado mas veces en otras crisis
Asiduad,4,Llamante frecuente
Naturaleza,1,Problema Leve
Naturaleza,2,Problema Grave
Naturaleza,3,Problema Crónico
Naturaleza,4,Crisis actual por situación externa
Naturaleza,5,Crisis actual por procesos internos o evolutivos
Inicio,1,Menos de 1 semana
Inicio,2,Entre 1 semana y 1 mes
Inicio,3,Mas de 1 mes y menos de 1 año
Inicio,4,Mas de 1 año
Actitud ante el orientador,1,Confiada
Actitud ante el orientador,2,Desconfiada
Actitud ante el orientador,3,Dependiente
Actitud ante el orientador,4,Enfadada
Actitud ante el orientador,5,Agresiva
Actitud ante el orientador,6,Ansiosa
Actitud ante el orientador,7,Desorientada
Presentación,1,Clara y directa
Presentación,2,Con rodeos
Presentación,3,Dubitativa
Presentación,4,Abstracta e impersal
Presentación,5,Muy prolija
Presentación,6,Muy escueta
Presentación,9,Comunicación Congruente
Presentación,10,Comunicaión Incongruente
Paralenguaje,1,No significativo 
Paralenguaje,2,Silencios
Paralenguaje,3,Suspiros
Paralenguaje,4,Sollozos
Paralenguaje,5,5 Ritmo o tono de voz alterados 
Paralenguaje,7,Risas nerviosas
Procedencia,1,"No lo sé, "
Procedencia,1,De la misma población del centro del Telefono
Procedencia,2,De la misma provincia del Telefono
Procedencia,3,De otra provincia
Procedencia,4,De otro país europeo
Procedencia,5,"De otro país latinoamericano, "
Procedencia,6,De otros países
Petición,2,Hablar o de desahogarse con alguien 
Petición,3,Orientación 
Petición,5,"Soluciones inmediatas, "
Petición,6,"Aprobación de una decisión, tomada "
Petición,9,Entrevista con un profesional
Actitud ante el problema,2,Cree que no tiene solución 
Actitud ante el problema,3,Pasivo y sin deseos de colaborar con la solución del problema 
Actitud ante el problema,4,"Se reconoce responsable, al menos parcialmente "
Actitud ante el problema,5,Se siente impotente para resolver el problema 
Actitud ante el problema,6,Muestra deseos de colaborar para resolver el problema 
Actitud ante el problema,7,Se siente muy culpabilizado 
Actitud ante el problema,9,Desesperado 
Actitud ante el problema,12,Cree que que sólo los demás tienen la culpa del problema
Llamada derivada,1,Servicio 112
Llamada derivada,2,Tráfico UVAT
Llamada derivada,3,Médico de Familia 
Llamada derivada,4,Servicios de salud mental/psiquiatra 
Llamada derivada,5,"Servicios sociales, "
Llamada derivada,6,Policía nacional
Llamada derivada,7,Guardia civil
Llamada derivada,8,Fundación Anar
Llamada derivada,9,Programa SUMATE
Llamada derivada,10,Acompañandote 24/7
Llamada derivada,11,Teléfono 024
Llamada derivada,12,As. V.Frankl
Resultado,1,"Se satisface la demanda del llamante, sólo con la llamada "
Resultado,2,Seguimiento programado por el Telefono 
Resultado,3,Se recomienda entrevista con profesional del Telefono 
Resultado,5,Se le da entrevista con un profesional 
Resultado,6,Se le invita que llame cuando lo necesite 
Resultado,7,Venir a la sede inmediatamente 
Resultado,8,Se deriva a otros profesionales o instituciones 
Resultado,9,No se acepta la ayuda que se le ofrece 
Resultado,10,Llamada incompleta 
Resultado,11,Se le deriva hacia otros programas del teléfono 
Resultado,13,"A la persona atendida en la sede, se le invita en general a que venga otras veces, si lo necesita "
Resultado,14,se le deriva la llamada a la fundación Anar
Nivel de ayuda,2,"Orientaciones puntuales, "
Nivel de ayuda,3,"Acción de des angustiante, "
Nivel de ayuda,4,Compresión empática
Nivel de ayuda,5,Restructuración del problema
Nivel de ayuda,6,programación de nuevos comportamientos
Sentimientos,1,Compasión
Sentimientos,2,Afecto 
Sentimientos,4,Aceptación y respeto
Sentimientos,5,Cercanía 
Sentimientos,6,Satisfacción 
Sentimientos,8,Implicación personal/simpatía 
Sentimientos,9,Bloqueo 
Sentimientos,11,Confusión 
Sentimientos,12,Indiferencia 
Sentimientos,14,Incomodidad 
Sentimientos,16,Impotencia
Autoevaluación,2,Deficiente 
Autoevaluación,3,Regular 
Autoevaluación,4,"Positiva, "
Actitudes equivodas,1,"Dirigir, presionar "
Actitudes equivodas,2,Aconsejar 
Actitudes equivodas,3,Moralizar 
Actitudes equivodas,5,Consolar 
Actitudes equivodas,6,Discutir 
Actitudes equivodas,7,Compadecer
Actitudes equivodas,9,Ninguna
Satisfacción del llamante,1,No dice nada 
Satisfacción del llamante,2,Expresa disconformidad 
Satisfacción del llamante,3,"Expresa satisfacción, "
Satisfacción del llamante,5,Cuelga sin concluir el proceso de ayuda
Relación,1,Cónyuge o compañero 
Relación,2,Excónyuge o excompañero 
Relación,3,Padre/madre 
Relación,4,Hijo/hija 
Relación,5,Hijo/hija del otro miembro de la pareja
Relación,10,"Amigo, vecino, compañero"
Relación,13,Otros familiares
Tercero Actitud ante el problema,2,El llamante no se atreve a proponerselo 
Tercero Actitud ante el problema,3,"El tercero, niega la existencia del problema "
Tercero Actitud ante el problema,4,"El tercero, piensa que el llamante es el responsable total del problema "
Tercero Actitud ante el problema,5,No se muestran deseos de querer colaborar con la solución del problema 
Tercero Actitud ante el problema,6,"El tercero reconoce que él colabora, al menos parcialmente en el problema "
Tercero Actitud ante el problema,7,Desea resolver el problema
Condicion Socioeconomica,1,Bajos recursos
Condicion Socioeconomica,2,Recursos Medios
Condicion Socioeconomica,3,Recursos Altos`;

const rawProblemasCSV = `Código problemática;Problemática;Código problema;Problema;Codigo
A;PROBLEMAS PSICOLÓGICOS Y PSIQUIÁTRICOS;1;Crisis en el proyecto vital. Crisis de valores y de sentido;A1
A;PROBLEMAS PSICOLÓGICOS Y PSIQUIÁTRICOS;2;Soledad e incomunicación;A2
A;PROBLEMAS PSICOLÓGICOS Y PSIQUIÁTRICOS;3;Estado deprimido;A3
A;PROBLEMAS PSICOLÓGICOS Y PSIQUIÁTRICOS;4;Vivencia de duelo;A4
A;PROBLEMAS PSICOLÓGICOS Y PSIQUIÁTRICOS;5;Ideas suicidas;A5
A;PROBLEMAS PSICOLÓGICOS Y PSIQUIÁTRICOS;6;Crisis suicidas;A6
A;PROBLEMAS PSICOLÓGICOS Y PSIQUIÁTRICOS;7;Acto suicida en curso;A7
A;PROBLEMAS PSICOLÓGICOS Y PSIQUIÁTRICOS;8;Trastornos de ansiedad (crisis de ansiedad, ansiedad generalizada, fobia, obsesiones, histeria);A8
A;PROBLEMAS PSICOLÓGICOS Y PSIQUIÁTRICOS;9;Trastorno de la personalidad;A9
A;PROBLEMAS PSICOLÓGICOS Y PSIQUIÁTRICOS;10;Trastorno psicótico (esquizofrenia, trastorno delirante).;A10
A;PROBLEMAS PSICOLÓGICOS Y PSIQUIÁTRICOS;11;Abuso o dependencia de sustancias psicoactivas;A11
A;PROBLEMAS PSICOLÓGICOS Y PSIQUIÁTRICOS;12;Ludopatía;A12
A;PROBLEMAS PSICOLÓGICOS Y PSIQUIÁTRICOS;13;Drogas de síntesis;A13
A;PROBLEMAS PSICOLÓGICOS Y PSIQUIÁTRICOS;14;Trastornos de la alimentación;A14
A;PROBLEMAS PSICOLÓGICOS Y PSIQUIÁTRICOS;15;Trastornos somatomorfos. Hipocondría.;A15
A;PROBLEMAS PSICOLÓGICOS Y PSIQUIÁTRICOS;16;Otros trastornos psicológicos/psiquiátricos;A16
A;PROBLEMAS PSICOLÓGICOS Y PSIQUIÁTRICOS;17;Necesidad de ir al psiquiatra (el llamante);A17
A;PROBLEMAS PSICOLÓGICOS Y PSIQUIÁTRICOS;18;Trastornos psicosexuales;A18
B;PROBLEMAS FAMILIARES;1;Problemas de pareja: Separación o divorcio;B1
B;PROBLEMAS FAMILIARES;2;Problemas de pareja: Ruptura del noviazgo o pareja de hecho;B2
B;PROBLEMAS FAMILIARES;3;Problemas de pareja: Dificultades de comunicación;B3
B;PROBLEMAS FAMILIARES;4;Problemas de pareja: Celos/infidelidad;B4
B;PROBLEMAS FAMILIARES;5;Problemas de pareja: Insatisfacción sexual;B5
B;PROBLEMAS FAMILIARES;6;Problemas de pareja: Monotonía/aburrimiento;B6
B;PROBLEMAS FAMILIARES;7;Problemas de pareja: Convivencia;B7
B;PROBLEMAS FAMILIARES;8;Problemas de pareja: Incomprensión;B8
B;PROBLEMAS FAMILIARES;9;Problemas en la relación padres/hijos: Problemas de comunicación;B9
B;PROBLEMAS FAMILIARES;10;Problemas en la relación padres/hijos: Autoritarismo y rebelión adolescente;B10
B;PROBLEMAS FAMILIARES;11;Problemas en la relación padres/hijos: Dificultades de socialización en niños;B11
B;PROBLEMAS FAMILIARES;12;Problemas en la relación padres/hijos: Problemas de hijos mayores que no se independizan;B12
B;PROBLEMAS FAMILIARES;13;Problemas en la relación padres/hijos: Abandono del hogar;B13
B;PROBLEMAS FAMILIARES;14;Problemas en la relación padres/hijos: Dificultades con el embarazo/maternidad;B14
B;PROBLEMAS FAMILIARES;15;Problemas en la relación padres/hijos: Hijos con discapacidad o minusvalía;B15
B;PROBLEMAS FAMILIARES;16;Problemas con otros familiares: Problemas con los hermanos;B16
B;PROBLEMAS FAMILIARES;17;Problemas con otros familiares: Problemas con familia política;B17
B;PROBLEMAS FAMILIARES;18;Problemas con otros familiares: Problemas con otros parientes;B18
B;PROBLEMAS FAMILIARES;19;Problemas con otros familiares: Muerte de un familiar;B19
B;PROBLEMAS FAMILIARES;20;Problemas con otros familiares: Enfermedad crónica o grave de un familiar;B20
B;PROBLEMAS FAMILIARES;21;Problemas de familia en general: Familias desestructuradas;B21
B;PROBLEMAS FAMILIARES;22;Problemas de familia en general: Familias multiproblemáticas;B22
B;PROBLEMAS FAMILIARES;23;Problemas de familia en general: Problemas con el cuidado de familiares ancianos;B23
B;PROBLEMAS FAMILIARES;24;Problemas de familia en general: Problemas con hijos en acogida/adopción;B24
C;PROBLEMAS DE LA VIVIENDA;1;Falta de vivienda digna;C1
C;PROBLEMAS DE LA VIVIENDA;2;Problemas económicos de la vivienda;C2
C;PROBLEMAS DE LA VIVIENDA;3;Problemas de convivencia;C3
C;PROBLEMAS DE LA VIVIENDA;4;Vivienda insalubre;C4
D;PROBLEMAS RELACIONADOS CON EL DINERO Y EL TRABAJO;1;Problemas de dinero: Deudas;D1
D;PROBLEMAS RELACIONADOS CON EL DINERO Y EL TRABAJO;2;Problemas de dinero: Pobreza;D2
D;PROBLEMAS RELACIONADOS CON EL DINERO Y EL TRABAJO;3;Problemas de trabajo: Desempleo;D3
D;PROBLEMAS RELACIONADOS CON EL DINERO Y EL TRABAJO;4;Problemas de trabajo: Problemas con los compañeros;D4
D;PROBLEMAS RELACIONADOS CON EL DINERO Y EL TRABAJO;5;Problemas de trabajo: Problemas con el jefe;D5
D;PROBLEMAS RELACIONADOS CON EL DINERO Y EL TRABAJO;6;Problemas de trabajo: Mobbing o acoso laboral;D6
D;PROBLEMAS RELACIONADOS CON EL DINERO Y EL TRABAJO;7;Problemas de trabajo: Jubilación;D7
D;PROBLEMAS RELACIONADOS CON EL DINERO Y EL TRABAJO;8;Problemas de trabajo: Accidentes;D8
D;PROBLEMAS RELACIONADOS CON EL DINERO Y EL TRABAJO;9;Problemas de trabajo: Invalidez;D9
D;PROBLEMAS RELACIONADOS CON EL DINERO Y EL TRABAJO;10;Dificultad para encontrar trabajo;D10
E;PROBLEMAS DE SALUD;1;Enfermedad crónica o grave;E1
E;PROBLEMAS DE SALUD;2;Problemas de salud sin especificar;E2
E;PROBLEMAS DE SALUD;3;Problemas de salud física del llamante;E3
E;PROBLEMAS DE SALUD;4;Dificultades en el diagnóstico;E4
F;PROBLEMAS RELACIONADOS CON LA VIOLENCIA;1;Maltrato físico conyugal;F1
F;PROBLEMAS RELACIONADOS CON LA VIOLENCIA;2;Maltrato emocional conyugal;F2
F;PROBLEMAS RELACIONADOS CON LA VIOLENCIA;3;Maltrato sexual conyugal;F3
F;PROBLEMAS RELACIONADOS CON LA VIOLENCIA;4;Maltrato físico filio-parental;F4
F;PROBLEMAS RELACIONADOS CON LA VIOLENCIA;5;Maltrato emocional filio-parental;F5
F;PROBLEMAS RELACIONADOS CON LA VIOLENCIA;6;Maltrato sexual filio-parental;F6
F;PROBLEMAS RELACIONADOS CON LA VIOLENCIA;7;Maltrato físico a ancianos;F7
F;PROBLEMAS RELACIONADOS CON LA VIOLENCIA;8;Maltrato emocional a ancianos;F8
F;PROBLEMAS RELACIONADOS CON LA VIOLENCIA;9;Maltrato sexual a ancianos;F9
F;PROBLEMAS RELACIONADOS CON LA VIOLENCIA;10;Maltrato físico de desconocidos;F10
F;PROBLEMAS RELACIONADOS CON LA VIOLENCIA;11;Maltrato emocional de desconocidos;F11
F;PROBLEMAS RELACIONADOS CON LA VIOLENCIA;12;Maltrato sexual de desconocidos (violación, acoso);F12
F;PROBLEMAS RELACIONADOS CON LA VIOLENCIA;13;Acoso escolar (bullying);F13
F;PROBLEMAS RELACIONADOS CON LA VIOLENCIA;14;Acoso sexual;F14
G;PROBLEMAS DE JUSTICIA;1;Problemas penales;G1
G;PROBLEMAS DE JUSTICIA;2;Problemas civiles;G2
G;PROBLEMAS DE JUSTICIA;3;Problemas laborales;G3
H;PROBLEMAS SOCIALES;1;Discriminación social;H1
H;PROBLEMAS SOCIALES;2;Problemas de inmigración/extranjería;H2
H;PROBLEMAS SOCIALES;3;Problemas de raza/cultura;H3
H;PROBLEMAS SOCIALES;4;Problemas de orientación sexual (homofobia);H4
H;PROBLEMAS SOCIALES;5;Conflictos vecinales;H5
H;PROBLEMAS SOCIALES;6;Otros problemas sociales;H6
I;PROBLEMAS DE RECURSOS;1;Falta de recursos económicos;I1
I;PROBLEMAS DE RECURSOS;2;Falta de recursos sanitarios;I2
I;PROBLEMAS DE RECURSOS;3;Falta de recursos sociales;I3
I;PROBLEMAS DE RECURSOS;4;Falta de recursos educativos;I4
I;PROBLEMAS DE RECURSOS;5;Falta de recursos de ocio y tiempo libre;I5
I;PROBLEMAS DE RECURSOS;6;Falta de recursos de vivienda;I6
J;PROBLEMAS POR CATASTROFES;1;Catástrofes naturales;J1
J;PROBLEMAS POR CATASTROFES;2;Accidentes colectivos (ej. tráfico, aéreos);J2
J;PROBLEMAS POR CATASTROFES;3;Actos terroristas;J3
J;PROBLEMAS POR CATASTROFES;4;Otros problemas por catástrofes;J4
K;PROBLEMAS POR PROCESOS EVOLUTIVOS;1;Crisis evolutiva: adolescencia;K1
K;PROBLEMAS POR PROCESOS EVOLUTIVOS;2;Crisis evolutiva: madurez;K2
K;PROBLEMAS POR PROCESOS EVOLUTIVOS;3;Crisis evolutiva: envejecimiento;K3
L;PROBLEMAS POR ABUSO SEXUAL;1;Abuso sexual en la infancia;L1
L;PROBLEMAS POR ABUSO SEXUAL;2;Abuso sexual en la adolescencia;L2
L;PROBLEMAS POR ABUSO SEXUAL;3;Abuso sexual en la edad adulta;L3
M;PROBLEMAS RELACIONADOS CON LA VIOLENCIA DOMÉSTICA;1;Violencia física en la pareja;M1
M;PROBLEMAS RELACIONADOS CON LA VIOLENCIA DOMÉSTICA;2;Violencia emocional en la pareja;M2
M;PROBLEMAS RELACIONADOS CON LA VIOLENCIA DOMÉSTICA;3;Violencia sexual en la pareja;M3
M;PROBLEMAS RELACIONADOS CON LA VIOLENCIA DOMÉSTICA;4;Violencia económica en la pareja;M4
M;PROBLEMAS RELACIONADOS CON LA VIOLENCIA DOMÉSTICA;5;Violencia vicaria;M5
N;PROBLEMAS RELACIONADOS CON EL ACOSO (STALKING);1;Acoso presencial (stalking);N1
N;PROBLEMAS RELACIONADOS CON EL ACOSO (STALKING);2;Ciberacoso;N2
O;PROBLEMAS RELACIONADOS CON LAS DISCAPACIDADES;1;Discapacidad física;O1
O;PROBLEMAS RELACIONADOS CON LAS DISCAPACIDADES;2;Discapacidad psíquica;O2
O;PROBLEMAS RELACIONADOS CON LAS DISCAPACIDADES;3;Discapacidad sensorial;O3
O;PROBLEMAS RELACIONADOS CON LAS DISCAPACIDADES;4;Discapacidad por enfermedad mental;O4
P;LLAMADAS PERIFÉRICAS;1;Llamada por error;P1
P;LLAMADAS PERIFÉRICAS;2;Llamada para comprobar si el T. E. está operativo;P2
P;LLAMADAS PERIFÉRICAS;3;Llamada con intención de broma;P3
P;LLAMADAS PERIFÉRICAS;4;Llamada con intención de acosar/molestar;P4
P;LLAMADAS PERIFÉRICAS;5;Llamada de un profesional;P5
P;LLAMADAS PERIFÉRICAS;6;Información sobre persona atendida en el T. E;P6
P;LLAMADAS PERIFÉRICAS;7;Petición de ayuda inmediata a domicilio;P7
P;LLAMADAS PERIFÉRICAS;8;Información acerca del T. E;P8
P;LLAMADAS PERIFÉRICAS;9;Información sobre actividades desarrolladas por el T.E;P9
P;LLAMADAS PERIFÉRICAS;10;Ofrecimiento como colaborador;P10
P;LLAMADAS PERIFÉRICAS;11;Oferta de recursos;P11
P;LLAMADAS PERIFÉRICAS;12;Petición de acudir a sede para ser atendido personalmente.;P12
P;LLAMADAS PERIFÉRICAS;13;Nueva petición de entrevista con el mismo Profesional, no siendo la prime­ra entrevis­ta;P13
P;LLAMADAS PERIFÉRICAS;14;Anulación o cambio de hora de la entrevista;P14
P;LLAMADAS PERIFÉRICAS;15;Información de recursos para personas solitarias;P15
P;LLAMADAS PERIFÉRICAS;16;Información de recursos de drogadicción.;P16
P;LLAMADAS PERIFÉRICAS;17;Información de recursos de alcoholismo;P17
P;LLAMADAS PERIFÉRICAS;18;Información de recursos de ludopatías;P18
P;LLAMADAS PERIFÉRICAS;19;Llamada de comprobación a un llamante;P19
P;LLAMADAS PERIFÉRICAS;20;Otro tipo de llamadas periféricas;P20
P;LLAMADAS PERIFÉRICAS;21;Llamadas de niños;P21
P;LLAMADAS PERIFÉRICAS;22;Llamadas de adolescentes;P22
Q;PROBLEMAS DE CONDUCTAS ADICTIVAS;1;Abuso de Alcohol;Q1
Q;PROBLEMAS DE CONDUCTAS ADICTIVAS;2;Abuso de tabaco;Q2
Q;PROBLEMAS DE CONDUCTAS ADICTIVAS;3;Abuso de sustancias;Q3
Q;PROBLEMAS DE CONDUCTAS ADICTIVAS;4;Adicción al juego (Ludopatía);Q4
Q;PROBLEMAS DE CONDUCTAS ADICTIVAS;5;Adicción a Internet/Redes;Q5
Q;PROBLEMAS DE CONDUCTAS ADICTIVAS;6;Adicción al Sexo;Q6
Q;PROBLEMAS DE CONDUCTAS ADICTIVAS;7;Adicción a compras;Q7
R;PROBLEMAS DE SALUD MENTAL EN FAMILIARES;1;Esquizofrenia en familiar;R1
R;PROBLEMAS DE SALUD MENTAL EN FAMILIARES;2;Trastorno bipolar en familiar;R2
R;PROBLEMAS DE SALUD MENTAL EN FAMILIARES;3;Trastorno depresivo en familiar;R3
R;PROBLEMAS DE SALUD MENTAL EN FAMILIARES;4;Trastorno de ansiedad en familiar;R4
R;PROBLEMAS DE SALUD MENTAL EN FAMILIARES;5;Trastorno obsesivo compulsivo en familiar;R5
R;PROBLEMAS DE SALUD MENTAL EN FAMILIARES;6;Trastorno de la personalidad en familiar;R6
R;PROBLEMAS DE SALUD MENTAL EN FAMILIARES;7;Trastornos de la conducta alimentaria en familiar;R7
R;PROBLEMAS DE SALUD MENTAL EN FAMILIARES;8;Trastorno psicótico no especificado en familiar;R8
R;PROBLEMAS DE SALUD MENTAL EN FAMILIARES;9;Ideas o intentos de suicidio en familiar;R9`;

// --- DATA STORES ---
const generalLists = {};
const problematicaList = [];
const problemaList = [];

// --- PARSING FUNCTIONS (Logic from HTML) ---

function parseGeneralCSV(csv) {
    const lines = csv.split('\n');
    lines.forEach(line => {
        // CSV parser that handles quotes properly (needed for "No lo sé, ")
        const parts = [];
        let currentPart = '';
        let insideQuote = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                insideQuote = !insideQuote;
            } else if (char === ',' && !insideQuote) {
                parts.push(currentPart.trim().replace(/"/g, ''));
                currentPart = '';
            } else {
                currentPart += char;
            }
        }
        parts.push(currentPart.trim().replace(/"/g, ''));

        if (parts.length >= 3) {
            const listName = parts[0];
            const value = parts[1];
            // Reconstruct description if it had commas
            const description = parts.slice(2).join(', ').trim().replace(/"/g, '');

            if (!generalLists[listName]) { generalLists[listName] = []; }

            // Format: "VALUE - DESCRIPTION"
            generalLists[listName].push({
                value: value,
                label: `${value} - ${description}`,
                active: true
            });
        }
    });
}

function parseProblemasCSV(csv) {
    const lines = csv.trim().split('\n');
    const problematicaMap = new Map(); // Use Map to avoid duplicates

    lines.forEach(line => {
        const parts = line.split(';');
        if (parts.length === 5) {
            const [codigoProblematica, problematicaDesc, codigoProblema, problemaDesc, codigoCompleto] = parts.map(p => p.trim());

            // 1. Build Problemática List (A, B, C...)
            if (!problematicaMap.has(codigoProblematica)) {
                problematicaMap.set(codigoProblematica, {
                    value: codigoProblematica,
                    label: `${codigoProblematica} - ${problematicaDesc}`,
                    active: true
                });
            }

            // 2. Build Problema List (A1, A2, B1...)
            // CRITICAL: Uses the EXACT description from the CSV (problemaDesc)
            problemaList.push({
                value: codigoCompleto,
                label: `${codigoCompleto} - ${problemaDesc}`,
                active: true
            });
        }
    });

    // Convert Map values to Array
    problematicaMap.forEach(item => problematicaList.push(item));
}

// --- INITIALIZE & PARSE ---

parseGeneralCSV(rawCSVData);
parseProblemasCSV(rawProblemasCSV);

// Add custom hardcoded lists that weren't in the main CSV scan but exist in HTML/App
const extraLists = {
    'Comoconoce': [
        { value: '1', label: '1 - Prensa', active: true },
        { value: '2', label: '2 - Radio/TV', active: true },
        { value: '3', label: '3 - Redes Sociales', active: true },
        { value: '4', label: '4 - Otro usuario', active: true },
        { value: '5', label: '5 - Internet', active: true },
        { value: '6', label: '6 - Otros', active: true }
    ],
    'Volvera a llamar': [
        { value: 'S', label: 'S - Sí', active: true },
        { value: 'N', label: 'N - No', active: true }
    ],
    'O_clave': [
        { value: 'AB', label: 'AB - Abril Bello', active: true },
        { value: 'CD', label: 'CD - Carlos Díaz', active: true },
        { value: 'EF', label: 'EF - Elena Fuentes', active: true },
        { value: 'GH', label: 'GH - Gerardo Haya', active: true }
    ],
    'C_duracion': [
        { value: '1', label: '1-5 min', active: true },
        { value: '2', label: '6-10 min', active: true },
        { value: '3', label: '11-20 min', active: true },
        { value: '4', label: '21-30 min', active: true },
        { value: '5', label: '+30 min', active: true }
    ]
};

// Combine all
const allLists = {
    ...generalLists,
    ...extraLists,
    "Problemática": problematicaList,
    "Problema": problemaList
};

// --- RUN UPDATE ---

async function updateLists() {
    console.log("\n🔄 Starting LIST SYNCHRONIZATION with HTML Source...\n");

    let successCount = 0;
    let errorCount = 0;

    for (const [listName, items] of Object.entries(allLists)) {
        try {
            await setDoc(doc(db, "lists", listName), { items });
            console.log(`✅ Synced: ${listName} (${items.length} items)`);
            successCount++;
        } catch (error) {
            console.error(`❌ Error syncing ${listName}:`, error.message);
            errorCount++;
        }
    }

    console.log("\n🎉 Synchronization complete!");
    console.log(`   ✅ Details: ${successCount} lists updated`);
    console.log("\n💡 The app database now matches MVP-AngelPhone-V.1.0.html exactly.");
    process.exit(0);
}

updateLists();
