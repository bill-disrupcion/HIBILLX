#!/bin/bash

# --- Configuración ---
DEFAULT_FIRESTORE_RULES_FILE="firestore.rules"
DEFAULT_DATABASE_RULES_FILE="database.rules.json"
DEFAULT_STORAGE_RULES_FILE="storage.rules"
DEFAULT_INDEXES_FILE="firestore.indexes.json" # Necesario para Firestore deploy

# --- Funciones Auxiliares ---
ask_yes_no() {
    while true; do
        read -p "$1 (s/n): " yn
        case $yn in
            [Ss]* ) return 0;; # Sí
            [Nn]* ) return 1;; # No
            * ) echo "Por favor, responde s o n.";;
        esac
    done
}

# --- Inicio del Script ---
echo "-----------------------------------------------------"
echo "Herramienta de Bloqueo de Reglas de Firebase"
echo "-----------------------------------------------------"

# Opcional: Limpiar directorio de ejecución anterior fallida
read -p "¿Hubo una ejecución anterior de este script que falló y creó un directorio? (Deja en blanco si no): " PREVIOUS_FAILED_DIR
if [ -n "$PREVIOUS_FAILED_DIR" ]; then
    if [ -d "$PREVIOUS_FAILED_DIR" ]; then
        echo "Intentando eliminar el directorio anterior: $PREVIOUS_FAILED_DIR"
        if rm -rf "$PREVIOUS_FAILED_DIR"; then
            echo "Directorio $PREVIOUS_FAILED_DIR eliminado con éxito."
        else
            echo "Error: No se pudo eliminar el directorio $PREVIOUS_FAILED_DIR. Verifica los permisos o elimínalo manualmente."
            # Considera salir o preguntar si continuar
        fi
    else
        echo "El directorio $PREVIOUS_FAILED_DIR no existe. Continuando."
    fi
    echo ""
fi

# 1. Obtener el ID del Proyecto
read -p "Ingresa el ID del Proyecto Firebase a asegurar: " PROJECT_ID
if [ -z "$PROJECT_ID" ]; then
    echo "Error: El ID del Proyecto no puede estar vacío."
    exit 1
fi
echo "Se trabajará sobre el proyecto: $PROJECT_ID"
echo ""

# 2. Confirmar Servicios a Asegurar
USE_FIRESTORE=0
USE_DATABASE=0
USE_STORAGE=0

if ask_yes_no "¿Deseas bloquear las reglas de Cloud Firestore?"; then
    USE_FIRESTORE=1
fi
if ask_yes_no "¿Deseas bloquear las reglas de Realtime Database?"; then
    USE_DATABASE=1
fi
if ask_yes_no "¿Deseas bloquear las reglas de Cloud Storage?"; then
    USE_STORAGE=1
fi

if [ "$USE_FIRESTORE" -eq 0 ] && [ "$USE_DATABASE" -eq 0 ] && [ "$USE_STORAGE" -eq 0 ]; then
    echo "No se seleccionó ningún servicio para asegurar. Saliendo."
    exit 0
fi

echo ""
echo "Resumen de acciones:"
[ "$USE_FIRESTORE" -eq 1 ] && echo "  - Bloquear Cloud Firestore para el proyecto $PROJECT_ID"
[ "$USE_DATABASE" -eq 1 ] && echo "  - Bloquear Realtime Database para el proyecto $PROJECT_ID"
[ "$USE_STORAGE" -eq 1 ] && echo "  - Bloquear Cloud Storage para el proyecto $PROJECT_ID"
echo ""

if ! ask_yes_no "¿Estás seguro de que deseas continuar con estas acciones?"; then
    echo "Operación cancelada por el usuario."
    exit 0
fi

echo "Procediendo con el bloqueo..."
echo ""

# 3. Crear archivos de reglas restrictivas
TARGET_DIR="firebase_lockdown_rules_$(date +%Y%m%d_%H%M%S)"
echo "Creando directorio de trabajo: $TARGET_DIR"
mkdir "$TARGET_DIR"
if [ $? -ne 0 ]; then
    echo "Error: No se pudo crear el directorio de trabajo $TARGET_DIR."
    exit 1
fi
cd "$TARGET_DIR" || exit 1 # Salir si no se puede acceder al directorio
echo "Archivos de reglas se crearán en el directorio: $(pwd)"

FIREBASE_JSON_CONTENT="{\n"
DEPLOY_COMMANDS=()
FIRST_ENTRY_ADDED=0 # Variable para controlar la coma

if [ "$USE_FIRESTORE" -eq 1 ]; then
    echo "Creando $DEFAULT_FIRESTORE_RULES_FILE..."
    cat > "$DEFAULT_FIRESTORE_RULES_FILE" << EOL
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
EOL
    echo "Creando $DEFAULT_INDEXES_FILE (necesario para Firestore)..."
    echo "{}" > "$DEFAULT_INDEXES_FILE"

    if [ "$FIRST_ENTRY_ADDED" -eq 1 ]; then FIREBASE_JSON_CONTENT="${FIREBASE_JSON_CONTENT},\n"; fi
    FIREBASE_JSON_CONTENT="${FIREBASE_JSON_CONTENT}  \"firestore\": {\n    \"rules\": \"$DEFAULT_FIRESTORE_RULES_FILE\",\n    \"indexes\": \"$DEFAULT_INDEXES_FILE\"\n  }"
    FIRST_ENTRY_ADDED=1
    DEPLOY_COMMANDS+=("firebase deploy --only firestore:rules --project $PROJECT_ID")
fi

if [ "$USE_DATABASE" -eq 1 ]; then
    echo "Creando $DEFAULT_DATABASE_RULES_FILE..."
    cat > "$DEFAULT_DATABASE_RULES_FILE" << EOL
{
  "rules": {
    ".read": false,
    ".write": false
  }
}
EOL
    if [ "$FIRST_ENTRY_ADDED" -eq 1 ]; then FIREBASE_JSON_CONTENT="${FIREBASE_JSON_CONTENT},\n"; fi
    FIREBASE_JSON_CONTENT="${FIREBASE_JSON_CONTENT}  \"database\": {\n    \"rules\": \"$DEFAULT_DATABASE_RULES_FILE\"\n  }"
    FIRST_ENTRY_ADDED=1
    DEPLOY_COMMANDS+=("firebase deploy --only database:rules --project $PROJECT_ID")
fi

if [ "$USE_STORAGE" -eq 1 ]; then
    echo "Creando $DEFAULT_STORAGE_RULES_FILE..."
    cat > "$DEFAULT_STORAGE_RULES_FILE" << EOL
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
EOL
    if [ "$FIRST_ENTRY_ADDED" -eq 1 ]; then FIREBASE_JSON_CONTENT="${FIREBASE_JSON_CONTENT},\n"; fi
    FIREBASE_JSON_CONTENT="${FIREBASE_JSON_CONTENT}  \"storage\": {\n    \"rules\": \"$DEFAULT_STORAGE_RULES_FILE\"\n  }"
    FIRST_ENTRY_ADDED=1
    DEPLOY_COMMANDS+=("firebase deploy --only storage:rules --project $PROJECT_ID")
fi

FIREBASE_JSON_CONTENT="${FIREBASE_JSON_CONTENT}\n}\n" # Añade el salto de línea final y cierra el JSON

echo "Creando firebase.json..."
echo -e "$FIREBASE_JSON_CONTENT" > firebase.json

echo "Contenido de firebase.json generado:"
cat firebase.json
echo ""

# 4. Autenticar y Desplegar
echo "Asegúrate de estar autenticado en Firebase CLI."
echo "Si no lo estás, el script podría fallar o pedirte que inicies sesión."
# firebase login # Comentado porque ya estás logueado, pero se puede reactivar si es necesario

echo ""
echo "Iniciando despliegues..."
ALL_SUCCESSFUL=1
for cmd in "${DEPLOY_COMMANDS[@]}"; do
    echo "Ejecutando: $cmd"
    if $cmd; then
        echo "Éxito: $cmd"
    else
        echo "ERROR al ejecutar: $cmd"
        echo "Por favor, revisa los mensajes de error."
        ALL_SUCCESSFUL=0
        # Podrías optar por salir aquí si un comando falla
        # echo "Saliendo debido a un error en el despliegue."
        # exit 1
    fi
    echo ""
done

echo "-----------------------------------------------------"
if [ "$ALL_SUCCESSFUL" -eq 1 ]; then
    echo "Proceso de bloqueo completado con ÉXITO para todos los servicios seleccionados."
else
    echo "Proceso de bloqueo completado con ERRORES. Algunos servicios podrían no estar asegurados."
fi
echo "Verifica las reglas en la Consola de Firebase para el proyecto $PROJECT_ID."
echo "Los archivos de configuración utilizados están en: $(pwd)"
echo "-----------------------------------------------------"

# cd .. # Volver al directorio original (opcional)
