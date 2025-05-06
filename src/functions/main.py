
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
# Import Flask for handling HTTP requests in Cloud Functions v2/Python
from flask import Request, jsonify
import functions_framework # Required for Python Cloud Functions v2

# Initialize Firebase Admin SDK if not already initialized
if not firebase_admin._apps:
    try:
        # Use Application Default Credentials (ADC) - suitable for Cloud Functions environment
        cred = credentials.ApplicationDefault()
        firebase_admin.initialize_app(cred)
        print("Firebase Admin SDK initialized successfully using ADC.")
    except Exception as e:
        print(f"Error initializing Firebase Admin SDK: {e}")
        # Fallback or specific credential handling might be needed for local testing
        # cred = credentials.Certificate("path/to/your/serviceAccountKey.json")
        # firebase_admin.initialize_app(cred)

# Get Firestore client only after initialization
try:
    db = firestore.client()
except Exception as e:
    print(f"Error getting Firestore client: {e}")
    db = None # Ensure db is None if initialization failed

def obtener_datos_accion(simbolo, periodo="1mo", intervalo="1d"):
  """
  Obtiene datos históricos de una acción desde Yahoo Finance.

  Args:
    simbolo (str): El símbolo de la acción (ej. AAPL para Apple).
    periodo (str): El periodo de los datos a descargar (ej. "1mo", "6mo", "1y", "5y", "max").
    intervalo (str): La frecuencia de los datos (ej. "1d", "1wk", "1mo", "1h").

  Returns:
    pandas.DataFrame: Un DataFrame con los datos históricos de la acción,
                      o None si ocurre un error.
  """
  try:
    print(f"Attempting to download data for {simbolo} | Period: {periodo} | Interval: {intervalo}")
    data = yf.download(simbolo, period=periodo, interval=intervalo)
    if data.empty:
        print(f"No data downloaded for {simbolo}. The symbol might be invalid or delisted for the period.")
        return None
    print(f"Successfully downloaded {len(data)} rows for {simbolo}.")
    return data
  except Exception as e:
    print(f"Error downloading data for {simbolo} using yfinance: {e}")
    return None

# Define the HTTP-triggered function using functions_framework
@functions_framework.http
def obtener_y_guardar_datos(request: Request):
    """
    Cloud Function (HTTP Triggered) that gets stock data and saves it to Firestore.
    """
    if db is None:
        print("Firestore client not available. Aborting.")
        return jsonify({"error": "Firestore client not initialized."}), 500

    # Get symbol from request query parameters or use default
    simbolo = request.args.get('symbol', default="GOOGL", type=str)
    periodo = request.args.get('period', default="6mo", type=str)
    intervalo = request.args.get('interval', default="1d", type=str)

    print(f"Processing request for symbol: {simbolo}, period: {periodo}, interval: {intervalo}")

    try:
        data = obtener_datos_accion(simbolo, periodo, intervalo)

        if data is not None and not data.empty:
            # Convert timestamps to Firestore Timestamps (or strings if preferred)
            # Firestore prefers native Timestamps for querying
            data.index = data.index.tz_convert(None) # Remove timezone if present (Firestore might handle naive better)
            data_dict = data.to_dict('index')

            # Convert pandas Timestamps within the nested dicts to Python datetimes
            # Firestore client handles Python datetimes correctly
            processed_data_dict = {}
            for timestamp_key, values in data_dict.items():
                # timestamp_key is already a pandas Timestamp index
                py_datetime = timestamp_key.to_pydatetime()
                # Firestore needs string keys for documents/fields if using timestamp as key is complex
                # Using ISO format string as key is safer for Firestore field names
                str_timestamp_key = py_datetime.isoformat()
                processed_data_dict[str_timestamp_key] = {k: (v if pd.notna(v) else None) for k, v in values.items()} # Handle NaN

            # Save data to Firestore collection 'historical_data', document ID is the symbol
            doc_ref = db.collection('historical_data').document(simbolo)
            doc_ref.set({
                'updated_at': firestore.SERVER_TIMESTAMP,
                'symbol': simbolo,
                'period': periodo,
                'interval': intervalo,
                'data': processed_data_dict # Use the processed dictionary
            })
            print(f"Data for {simbolo} saved successfully to Firestore.")
            return jsonify({"message": f"Data for {simbolo} saved successfully."}), 200
        else:
            print(f"Could not obtain valid data for {simbolo}.")
            return jsonify({"message": f"Could not obtain valid data for {simbolo}."}), 404
    except Exception as e:
        error_message = f"Error processing or saving data for {simbolo}: {e}"
        print(error_message)
        return jsonify({"error": error_message}), 500


# Example of how a Pub/Sub triggered function (for Cloud Scheduler) might look
# @functions_framework.cloud_event
# def obtener_y_guardar_diariamente(cloud_event):
#     """
#     Function to be triggered by Pub/Sub (e.g., from Cloud Scheduler).
#     """
#     if db is None:
#         print("Firestore client not available. Aborting.")
#         return
#
#     # You might get the symbol from the Pub/Sub message attributes or use defaults
#     # import base64
#     # message_data = base64.b64decode(cloud_event.data["message"]["data"]).decode()
#     # import json
#     # payload = json.loads(message_data)
#     # simbolo = payload.get("symbol", "AAPL")
#
#     simbolo = "AAPL" # Default for example
#     periodo = "1mo" # Fetch recent data daily
#     intervalo = "1d"
#     print(f"Scheduled run: Processing symbol: {simbolo}")
#
#     try:
#         data = obtener_datos_accion(simbolo, periodo, intervalo)
#         if data is not None and not data.empty:
#             data.index = data.index.tz_convert(None)
#             data_dict = data.to_dict('index')
#             processed_data_dict = {}
#             for timestamp_key, values in data_dict.items():
#                 py_datetime = timestamp_key.to_pydatetime()
#                 str_timestamp_key = py_datetime.isoformat()
#                 processed_data_dict[str_timestamp_key] = {k: (v if pd.notna(v) else None) for k, v in values.items()}
#
#             doc_ref = db.collection('historical_data').document(simbolo)
#             # Merge=True might be useful here if you're adding daily data points
#             doc_ref.set({
#                 'updated_at': firestore.SERVER_TIMESTAMP,
#                 'symbol': simbolo,
#                 'period': periodo,
#                 'interval': intervalo,
#                 'daily_data': processed_data_dict # Maybe store daily data differently
#             }, merge=True)
#             print(f"Daily data for {simbolo} saved/updated in Firestore.")
#         else:
#             print(f"Could not obtain valid daily data for {simbolo}.")
#     except Exception as e:
#         print(f"Error during scheduled run for {simbolo}: {e}")

    