/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onRequest} from "firebase-functions/v2/https"; // Para funciones HTTP v2
import * as logger from "firebase-functions/logger";   // Para registrar logs

// Tu primera función HTTP usando la sintaxis v2
export const miPrimeraFuncionV2 = onRequest(
    {
        // Opciones de la función (puedes omitir este objeto de opciones si quieres usar los valores por defecto):
        region: "us-central1", // Región donde se desplegará esta función.
                               // Puedes usar la misma que elegiste para el SSR de Next.js,
                               // o alguna otra como "southamerica-east1" (São Paulo) si te conviene más.
        // memory: "512MiB",    // Ejemplo: Especificar la memoria asignada
        // timeoutSeconds: 60,   // Ejemplo: Especificar el tiempo máximo de ejecución
    }, 
    async (request, response) => { // El manejador de la petición
        logger.info("¡Log desde miPrimeraFuncionV2! Petición recibida.", {
            query: request.query, // Muestra los parámetros de la URL en los logs
            // structuredData: true // Puedes añadir más datos estructurados a tus logs
        });
        
        // Obtener un parámetro 'name' de la query string de la URL
        // Por ejemplo, si la URL es ".../miPrimeraFuncionV2?name=Carlos", name será "Carlos"
        const name = request.query.name || 'Mundo (v2)'; // Valor por defecto si no se provee 'name'

        // Enviar una respuesta HTTP
        response.status(200).send(`¡Saludos, ${name}, desde hibillX Conexión Autónoma (Cloud Function v2)! Hora: ${new Date().toLocaleTimeString()}`);
    }
);

// Puedes añadir más funciones aquí en el futuro, por ejemplo:
// export const otraFuncion = onRequest( ... );
// export const miTriggerDeFirestore = onDocumentWritten( ... );