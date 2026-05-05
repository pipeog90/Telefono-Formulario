/**
 * Update Script for Firestore Lists Collection
 * Syncs data to canonical UPPERCASE keys.
 */

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAMU2uJi7fd19tebwA2AgE47O-cYH_oorw",
    authDomain: "telespantgrav.firebaseapp.com",
    projectId: "telesgrav",
    storageBucket: "telesgrav.appspot.com",
    messagingSenderId: "661489752694",
    appId: "1:661489752694:web:f1e137113fd73b2a929d57",
    measurementId: "G-FC62DY559B"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const canonicalKeysMap = {
    "Medio de contacto": "MEDIO_CONTACTO",
    "Sexo": "SEXO",
    "Edad": "EDAD",
    "E.Civil": "ESTADO_CIVIL",
    "Convive": "CONVIVE",
    "Asiduad": "ASIDUIDAD",
    "Naturaleza": "NATURALEZA",
    "Inicio": "INICIO",
    "Actitud ante el orientador": "ACTITUD_ORIENTADOR",
    "Presentación": "PRESENTACION",
    "Paralenguaje": "PARALENGUAJE",
    "Procedencia": "PROCEDENCIA",
    "Petición": "PETICION",
    "Actitud ante el problema": "ACTITUD_PROBLEMA",
    "Llamada derivada": "LLAMADA_DERIVADA",
    "Resultado": "RESULTADO",
    "Nivel de ayuda": "NIVEL_AYUDA",
    "Sentimientos": "SENTIMIENTOS",
    "Autoevaluación": "AUTOEVALUACION",
    "Actitudes equivodas": "ACTITUD_EQUIVOCADA",
    "Satisfacción del llamante": "SATISFACCION",
    "Relación": "RELACION",
    "Tercero Actitud ante el problema": "TERCERO_ACTITUD_PROBLEMA",
    "Condicion Socioeconomica": "CONDICION_SOCIOECONOMICA"
};

const rawCSVData = `MEDIO_CONTACTO,1,Por teléfono
MEDIO_CONTACTO,2,Atendido en sede
MEDIO_CONTACTO,3,Por email
MEDIO_CONTACTO,7,Programa de atención a personas mayores
MEDIO_CONTACTO,8,Chat TE
SEXO,0,No lo sé
SEXO,1,Hombre
SEXO,2,Mujer
EDAD,1,Hast 18 años
EDAD,2,De 19 a 25
EDAD,3,De 26 a 35
EDAD,4,De 36 a 45
EDAD,5,De 46 a 56
EDAD,6,De 55 a 65
EDAD,7,de 66 a 75
EDAD,8,76 o mas 
EDAD,9,"Si, definir"
ESTADO_CIVIL,0,No lo sé
ESTADO_CIVIL,1,Soltero
ESTADO_CIVIL,2,Casado
ESTADO_CIVIL,3,Viudo
ESTADO_CIVIL,4,Separado/Divorciado
ESTADO_CIVIL,5,Matrimonio nulo
ESTADO_CIVIL,6,Pareja de hecho
CONVIVE,0,No lo sé
CONVIVE,1,Solo
CONVIVE,2,Familia de origen
CONVIVE,3,Familia propia
CONVIVE,4,Pareja de hecho
CONVIVE,5,Pareja Homosexual
CONVIVE,6,Domicilio de los hijos casados o emancipados
CONVIVE,7,Con otros parientes
CONVIVE,8,Residencia o institución benéfica
CONVIVE,9,Piso compartido
ASIDUIDAD,0,No lo sé
ASIDUIDAD,1,Primera llamada
ASIDUIDAD,2,Ha llamado mas veces por el mismo asunto
ASIDUIDAD,3,Ha llamado mas veces en otras crisis
ASIDUIDAD,4,Llamante frecuente
NATURALEZA,1,Problema Leve
NATURALEZA,2,Problema Grave
NATURALEZA,3,Problema Crónico
NATURALEZA,4,Crisis actual por situación externa
NATURALEZA,5,Crisis actual por procesos internos o evolutivos
INICIO,1,Menos de 1 semana
INICIO,2,Entre 1 semana y 1 mes
INICIO,3,Mas de 1 mes y menos de 1 año
INICIO,4,Mas de 1 año
ACTITUD_ORIENTADOR,1,Confiada
ACTITUD_ORIENTADOR,2,Desconfiada
ACTITUD_ORIENTADOR,3,Dependiente
ACTITUD_ORIENTADOR,4,Enfadada
ACTITUD_ORIENTADOR,5,Agresiva
ACTITUD_ORIENTADOR,6,Ansiosa
ACTITUD_ORIENTADOR,7,Desorientada
PRESENTACION,1,Clara y directa
PRESENTACION,2,Con rodeos
PRESENTACION,3,Dubitativa
PRESENTACION,4,Abstracta e impersal
PRESENTACION,5,Muy prolija
PRESENTACION,6,Muy escueta
PRESENTACION,9,Comunicación Congruente
PRESENTACION,10,Comunicaión Incongruente
PARALENGUAJE,1,No significativo 
PARALENGUAJE,2,Silencios
PARALENGUAJE,3,Suspiros
PARALENGUAJE,4,Sollozos
PARALENGUAJE,5,Ritmo o tono de voz alterados 
PARALENGUAJE,7,Risas nerviosas
PROCEDENCIA,0,No lo sé
PROCEDENCIA,1,De la misma población del centro del Telefono
PROCEDENCIA,2,De la misma provincia del Telefono
PROCEDENCIA,3,De otra provincia
PROCEDENCIA,4,De otro país europeo
PROCEDENCIA,5,De otro país latinoamericano
PROCEDENCIA,6,De otros países
PETICION,2,Hablar o de desahogarse con alguien 
PETICION,3,Orientación 
PETICION,5,Soluciones inmediatas
PETICION,6,Aprobación de una decisión, tomada 
PETICION,9,Entrevista con un profesional
ACTITUD_PROBLEMA,2,Cree que no tiene solución 
ACTITUD_PROBLEMA,3,Pasivo y sin deseos de colaborar con la solución del problema 
ACTITUD_PROBLEMA,4,Se reconoce responsable, al menos parcialmente 
ACTITUD_PROBLEMA,5,Se siente impotente para resolver el problema 
ACTITUD_PROBLEMA,6,Muestra deseos de colaborar para resolver el problema 
ACTITUD_PROBLEMA,7,Se siente muy culpabilizado 
ACTITUD_PROBLEMA,9,Desesperado 
ACTITUD_PROBLEMA,12,Cree que que sólo los demás tienen la culpa del problema
LLAMADA_DERIVADA,1,Servicio 112
LLAMADA_DERIVADA,2,Tráfico UVAT
LLAMADA_DERIVADA,3,Médico de Familia 
LLAMADA_DERIVADA,4,Servicios de salud mental/psiquiatra 
LLAMADA_DERIVADA,5,Servicios sociales
LLAMADA_DERIVADA,6,Policía nacional
LLAMADA_DERIVADA,7,Guardia civil
LLAMADA_DERIVADA,8,Fundación Anar
LLAMADA_DERIVADA,9,Programa SUMATE
LLAMADA_DERIVADA,10,Acompañandote 24/7
LLAMADA_DERIVADA,11,Teléfono 024
LLAMADA_DERIVADA,12,As. V.Frankl
RESULTADO,1,Se satisface la demanda del llamante, sólo con la llamada 
RESULTADO,2,Seguimiento programado por el Telefono 
RESULTADO,3,Se recomienda entrevista con profesional del Telefono 
RESULTADO,5,Se le da entrevista con un profesional 
RESULTADO,6,Se le invita que llame cuando lo necesite 
RESULTADO,7,Venir a la sede inmediatamente 
RESULTADO,8,Se deriva a otros profesionales o instituciones 
RESULTADO,9,No se acepta la ayuda que se le ofrece 
RESULTADO,10,Llamada incompleta 
RESULTADO,11,Se le deriva hacia otros programas del teléfono 
RESULTADO,13,A la persona atendida en la sede, se le invita en general a que venga otras veces, si lo necesita 
RESULTADO,14,se le deriva la llamada a la fundación Anar
NIVEL_AYUDA,2,Orientaciones puntuales
NIVEL_AYUDA,3,Acción de des angustiante
NIVEL_AYUDA,4,Compresión empática
NIVEL_AYUDA,5,Restructuración del problema
NIVEL_AYUDA,6,programación de nuevos comportamientos
SENTIMIENTOS,1,Compasión
SENTIMIENTOS,2,Afecto 
SENTIMIENTOS,4,Aceptación y respeto
SENTIMIENTOS,5,Cercanía 
SENTIMIENTOS,6,Satisfacción 
SENTIMIENTOS,8,Implicación personal/simpatía 
SENTIMIENTOS,9,Bloqueo 
SENTIMIENTOS,11,Confusión 
SENTIMIENTOS,12,Indiferencia 
SENTIMIENTOS,14,Incomodidad 
SENTIMIENTOS,16,Impotencia
AUTOEVALUACION,2,Deficiente 
AUTOEVALUACION,3,Regular 
AUTOEVALUACION,4,Positiva
ACTITUD_EQUIVOCADA,1,Dirigir, presionar 
ACTITUD_EQUIVOCADA,2,Aconsejar 
ACTITUD_EQUIVOCADA,3,Moralizar 
ACTITUD_EQUIVOCADA,5,Consolar 
ACTITUD_EQUIVOCADA,6,Discutir 
ACTITUD_EQUIVOCADA,7,Compadecer
ACTITUD_EQUIVOCADA,9,Ninguna
SATISFACCION,1,No dice nada 
SATISFACCION,2,Expresa disconformidad 
SATISFACCION,3,Expresa satisfacción
SATISFACCION,5,Cuelga sin concluir el proceso de ayuda
RELACION,1,Cónyuge o compañero 
RELACION,2,Excónyuge o excompañero 
RELACION,3,Padre/madre 
RELACION,4,Hijo/hija 
RELACION,5,Hijo/hija del otro miembro de la pareja
RELACION,10,Amigo, vecino, compañero
RELACION,13,Otros familiares
TERCERO_ACTITUD_PROBLEMA,2,El llamante no se atreve a proponerselo 
TERCERO_ACTITUD_PROBLEMA,3,El tercero, niega la existencia del problema 
TERCERO_ACTITUD_PROBLEMA,4,El tercero, piensa que el llamante es el responsable total del problema 
TERCERO_ACTITUD_PROBLEMA,5,No se muestran deseos de querer colaborar con la solución del problema 
TERCERO_ACTITUD_PROBLEMA,6,El tercero reconoce que él colabora, al menos parcialmente en el problema 
TERCERO_ACTITUD_PROBLEMA,7,Desea resolver el problema
CONDICION_SOCIOECONOMICA,1,Bajos recursos
CONDICION_SOCIOECONOMICA,2,Recursos Medios
CONDICION_SOCIOECONOMICA,3,Recursos Altos`;

async function updateLists() {
    console.log("\n🔄 Syncing lists to canonical UPPERCASE keys...\n");
    const lists = {};
    rawCSVData.split('\n').forEach(line => {
        const parts = line.split(',');
        if (parts.length >= 3) {
            const listName = parts[0];
            const value = parts[1];
            const description = parts.slice(2).join(',').trim();
            if (!lists[listName]) lists[listName] = [];
            lists[listName].push({ value, label: `${value} - ${description}`, active: true });
        }
    });

    for (const [listName, items] of Object.entries(lists)) {
        try {
            await setDoc(doc(db, "lists", listName), { items });
            console.log(`✅ Updated: ${listName}`);
        } catch (error) {
            console.error(`❌ Error: ${listName}`, error.message);
        }
    }
    console.log("\n🎉 Done.");
    process.exit(0);
}

updateLists();
