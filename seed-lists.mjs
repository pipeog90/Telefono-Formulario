/**
 * Seed Script for Firestore Lists Collection
 * Run with: node seed-lists.js
 * 
 * This script populates the 'lists' collection in Firestore with all dropdown data.
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

const initialDropdowns = {
    "MEDIO_CONTACTO": [
        { value: "1", label: "1 - Por teléfono", active: true },
        { value: "2", label: "2 - Atendido en sede", active: true },
        { value: "3", label: "3 - Por email", active: true },
        { value: "7", label: "7 - Programa de atención a personas mayores", active: true },
        { value: "8", label: "8 - Chat TE", active: true }
    ],
    "SEXO": [
        { value: "0", label: "0 - No lo sé", active: true },
        { value: "1", label: "1 - Hombre", active: true },
        { value: "2", label: "2 - Mujer", active: true }
    ],
    "EDAD": [
        { value: "1", label: "1 - Hasta 18 años", active: true },
        { value: "2", label: "2 - De 19 a 25", active: true },
        { value: "3", label: "3 - De 26 a 35", active: true },
        { value: "4", label: "4 - De 36 a 45", active: true },
        { value: "5", label: "5 - De 46 a 56", active: true },
        { value: "6", label: "6 - De 55 a 65", active: true },
        { value: "7", label: "7 - De 66 a 75", active: true },
        { value: "8", label: "8 - 76 o mas", active: true }
    ],
    "ESTADO_CIVIL": [
        { value: "0", label: "0 - No lo sé", active: true },
        { value: "1", label: "1 - Soltero", active: true },
        { value: "2", label: "2 - Casado", active: true },
        { value: "3", label: "3 - Viudo", active: true },
        { value: "4", label: "4 - Separado/Divorciado", active: true },
        { value: "5", label: "5 - Matrimonio nulo", active: true },
        { value: "6", label: "6 - Pareja de hecho", active: true }
    ],
    "CONVIVE": [
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
    "ASIDUIDAD": [
        { value: "0", label: "0 - No lo sé", active: true },
        { value: "1", label: "1 - Primera llamada", active: true },
        { value: "2", label: "2 - Ha llamado mas veces por el mismo asunto", active: true },
        { value: "3", label: "3 - Ha llamado mas veces en otras crisis", active: true },
        { value: "4", label: "4 - Llamante frecuente", active: true }
    ],
    "NATURALEZA": [
        { value: "1", label: "1 - Problema Leve", active: true },
        { value: "2", label: "2 - Problema Grave", active: true },
        { value: "3", label: "3 - Problema Crónico", active: true },
        { value: "4", label: "4 - Crisis actual por situación externa", active: true },
        { value: "5", label: "5 - Crisis actual por procesos internos o evolutivos", active: true }
    ],
    "INICIO": [
        { value: "1", label: "1 - Menos de 1 semana", active: true },
        { value: "2", label: "2 - Entre 1 semana y 1 mes", active: true },
        { value: "3", label: "3 - Mas de 1 mes y menos de 1 año", active: true },
        { value: "4", label: "4 - Mas de 1 año", active: true }
    ],
    "ACTITUD_ORIENTADOR": [
        { value: "1", label: "1 - Confiada", active: true },
        { value: "2", label: "2 - Desconfiada", active: true },
        { value: "3", label: "3 - Dependiente", active: true },
        { value: "4", label: "4 - Enfadada", active: true },
        { value: "5", label: "5 - Agresiva", active: true },
        { value: "6", label: "6 - Ansiosa", active: true },
        { value: "7", label: "7 - Desorientada", active: true }
    ],
    "PRESENTACION": [
        { value: "1", label: "1 - Clara y directa", active: true },
        { value: "2", label: "2 - Con rodeos", active: true },
        { value: "3", label: "3 - Dubitativa", active: true },
        { value: "4", label: "4 - Abstracta e impersal", active: true },
        { value: "5", label: "5 - Muy prolija", active: true },
        { value: "6", label: "6 - Muy escueta", active: true },
        { value: "9", label: "9 - Comunicación Congruente", active: true },
        { value: "10", label: "10 - Comunicaión Incongruente", active: true }
    ],
    "PARALENGUAJE": [
        { value: "1", label: "1 - No significativo", active: true },
        { value: "2", label: "2 - Silencios", active: true },
        { value: "3", label: "3 - Suspiros", active: true },
        { value: "4", label: "4 - Sollozos", active: true },
        { value: "5", label: "5 - Ritmo o tono de voz alterados", active: true },
        { value: "7", label: "7 - Risas nerviosas", active: true }
    ],
    "PROCEDENCIA": [
        { value: "1", label: "1 - De la misma población del centro del Telefono", active: true },
        { value: "2", label: "2 - De la misma provincia del Telefono", active: true },
        { value: "3", label: "3 - De otra provincia", active: true },
        { value: "4", label: "4 - De otro país europeo", active: true },
        { value: "5", label: "5 - De otro país latinoamericano", active: true },
        { value: "6", label: "6 - De otros países", active: true }
    ],
    "PETICION": [
        { value: "2", label: "2 - Hablar o de desahogarse con alguien", active: true },
        { value: "3", label: "3 - Orientación", active: true },
        { value: "5", label: "5 - Soluciones inmediatas", active: true },
        { value: "6", label: "6 - Aprobación de una decisión, tomada", active: true },
        { value: "9", label: "9 - Entrevista con un profesional", active: true }
    ],
    "ACTITUD_PROBLEMA": [
        { value: "2", label: "2 - Cree que no tiene solución", active: true },
        { value: "3", label: "3 - Pasivo y sin deseos de colaborar con la solución del problema", active: true },
        { value: "4", label: "4 - Se reconoce responsable, al menos parcialmente", active: true },
        { value: "5", label: "5 - Se siente impotente para resolver el problema", active: true },
        { value: "6", label: "6 - Muestra deseos de colaborar para resolver el problema", active: true },
        { value: "7", label: "7 - Se siente muy culpabilizado", active: true },
        { value: "9", label: "9 - Desesperado", active: true },
        { value: "12", label: "12 - Cree que que sólo los demás tienen la culpa del problema", active: true }
    ],
    "LLAMADA_DERIVADA": [
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
    "RESULTADO": [
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
    "NIVEL_AYUDA": [
        { value: "2", label: "2 - Orientaciones puntuales", active: true },
        { value: "3", label: "3 - Acción de des angustiante", active: true },
        { value: "4", label: "4 - Compresión empática", active: true },
        { value: "5", label: "5 - Restructuración del problema", active: true },
        { value: "6", label: "6 - programación de nuevos comportamientos", active: true }
    ],
    "SENTIMIENTOS": [
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
    "AUTOEVALUACION": [
        { value: "2", label: "2 - Deficiente", active: true },
        { value: "3", label: "3 - Regular", active: true },
        { value: "4", label: "4 - Positiva", active: true }
    ],
    "ACTITUD_EQUIVOCADA": [
        { value: "1", label: "1 - Dirigir, presionar", active: true },
        { value: "2", label: "2 - Aconsejar", active: true },
        { value: "3", label: "3 - Moralizar", active: true },
        { value: "5", label: "5 - Consolar", active: true },
        { value: "6", label: "6 - Discutir", active: true },
        { value: "7", label: "7 - Compadecer", active: true },
        { value: "9", label: "9 - Ninguna", active: true }
    ],
    "SATISFACCION": [
        { value: "1", label: "1 - No dice nada", active: true },
        { value: "2", label: "2 - Expresa disconformidad", active: true },
        { value: "3", label: "3 - Expresa satisfacción", active: true },
        { value: "5", label: "5 - Cuelga sin concluir el proceso de ayuda", active: true }
    ],
    "RELACION": [
        { value: "1", label: "1 - Cónyuge o compañero", active: true },
        { value: "2", label: "2 - Excónyuge o excompañero", active: true },
        { value: "3", label: "3 - Padre/madre", active: true },
        { value: "4", label: "4 - Hijo/hija", active: true },
        { value: "5", label: "5 - Hijo/hija del otro miembro de la pareja", active: true },
        { value: "10", label: "10 - Amigo, vecino, compañero", active: true },
        { value: "13", label: "13 - Otros familiares", active: true }
    ],
    "TERCERO_ACTITUD_PROBLEMA": [
        { value: "2", label: "2 - El llamante no se atreve a proponerselo", active: true },
        { value: "3", label: "3 - El tercero, niega la existence del problema", active: true },
        { value: "4", label: "4 - El tercero, piensa que el llamante es el responsable total del problema", active: true },
        { value: "5", label: "5 - No se muestran deseos de querer colaborar con la solución del problema", active: true },
        { value: "6", label: "6 - El tercero reconoce que él colabora, al menos parcialmente en el problema", active: true },
        { value: "7", label: "7 - Desea resolver el problema", active: true }
    ],
    "CONDICION_SOCIOECONOMICA": [
        { value: "1", label: "1 - Bajos recursos", active: true },
        { value: "2", label: "2 - Recursos Medios", active: true },
        { value: "3", label: "3 - Recursos Altos", active: true }
    ],
    "O_CLAVE": [
        { value: "AB", label: "AB - Abril Bello", active: true },
        { value: "CD", label: "CD - Carlos Díaz", active: true },
        { value: "EF", label: "EF - Elena Fuentes", active: true },
        { value: "GH", label: "GH - Gerardo Haya", active: true }
    ],
    "RANGO_DURACION": [
        { value: "1", label: "1-5 min", active: true },
        { value: "2", label: "6-10 min", active: true },
        { value: "3", label: "11-20 min", active: true },
        { value: "4", label: "21-30 min", active: true },
        { value: "5", label: "+30 min", active: true }
    ],
    "VOLVERA_LLAMAR": [
        { value: "S", label: "S - Sí", active: true },
        { value: "N", label: "N - No", active: true }
    ],
    "COMO_CONOCE": [
        { value: "1", label: "1 - Prensa", active: true },
        { value: "2", label: "2 - Radio/TV", active: true },
        { value: "3", label: "3 - Redes Sociales", active: true },
        { value: "4", label: "4 - Otro usuario", active: true },
        { value: "5", label: "5 - Internet", active: true },
        { value: "6", label: "6 - Otros", active: true }
    ]
};

async function seedLists() {
    console.log("🌱 Starting Firestore lists seeding...\n");
    let successCount = 0;
    for (const [listName, items] of Object.entries(initialDropdowns)) {
        try {
            await setDoc(doc(db, "lists", listName), { items });
            console.log(`✅ Seeded: ${listName}`);
            successCount++;
        } catch (error) {
            console.error(`❌ Error seeding ${listName}:`, error.message);
        }
    }
    console.log(`\n🎉 Seeding complete! ${successCount} lists updated.`);
    process.exit(0);
}

seedLists();
