
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
# Import Flask for handling HTTP requests in Cloud Functions v2/Python
from flask import Request, jsonify
import os # Import the os module to access environment variables
# Import libraries for OpenAI and Mistral
import requests # Import the requests library for making HTTP requests
import openai
from mistralai.client import MistralClient # Assuming you are using the official mistralai library
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

# Initialize OpenAI and Mistral clients using API keys from environment variables
openai_api_key = os.environ.get("OPENAI_API_KEY")
mistral_api_key = os.environ.get("MISTRAL_API_KEY")

# Check if keys are available before initializing clients to avoid errors
openai_client = openai.OpenAI(api_key=openai_api_key) if openai_api_key else None
mistral_client = MistralClient(api_key=mistral_api_key) if mistral_api_key else None

# Define the URL of your Genkit flow endpoint
# **IMPORTANT:** Replace with the actual URL of your deployed or local Genkit endpoint
GENKIT_FLOW_URL = os.environ.get("GENKIT_FLOW_URL", "http://localhost:3400/analyzeFinancialTextFlow") # Default to local for example

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

def get_openai_analysis(text):
    """
    Gets analysis from OpenAI API.
    Replace with specific prompt and model based on your needs.
    """
    if not openai_client:
        print("OpenAI client not initialized. API key not set.")
        return {"error": "OpenAI API key not set."}
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",  # Or another suitable model
            messages=[
                {"role": "system", "content": "You are a financial analyst."},
                {"role": "user", "content": f"Analyze the following financial text: {text}"}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error getting analysis from OpenAI: {e}")
        return {"error": str(e)}

def get_mistral_analysis(text):
    """
    Gets analysis from Mistral API.
    Replace with specific prompt and model based on your needs.
    """
    if not mistral_client:
        print("Mistral client not initialized. API key not set.")
        return {"error": "Mistral API key not set."}
    try:
        response = mistral_client.chat(
            model="mistral-large-latest", # Or another suitable model
            messages=[
                {"role": "system", "content": "You are a financial analyst."},
                {"role": "user", "content": f"Analyze the following financial text: {text}"}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error getting analysis from Mistral: {e}")
        return {"error": str(e)}

def get_gemini_analysis_from_genkit(text):
    """
    Calls the Genkit flow for Gemini analysis via HTTP.
    """
    if not GENKIT_FLOW_URL:
         print("GENKIT_FLOW_URL environment variable not set.")
         return {"error": "GENKIT_FLOW_URL not set."}
    try:
        # Assuming your Genkit flow endpoint expects a JSON body with the input text
        response = requests.post(GENKIT_FLOW_URL, json={"input": text})
        response.raise_for_status() # Raise an HTTPError for bad responses (4xx or 5xx)
        return response.json() # Assuming the flow returns JSON
    except requests.exceptions.RequestException as e:
        print(f"Error calling Genkit flow: {e}")
        return {"error": str(e)}

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
    financial_text = request.args.get('financial_text', default="", type=str) # Added to get text for analysis

    print(f"Processing request for symbol: {simbolo}, period: {periodo}, interval: {intervalo}")

    try:
        openai_analysis = None
        mistral_analysis = None
        gemini_analysis = None # Added for Gemini analysis

        if financial_text:
            print("Performing AI analysis on provided text...")
            openai_analysis = get_openai_analysis(financial_text)
            mistral_analysis = get_mistral_analysis(financial_text)
            gemini_analysis_response = get_gemini_analysis_from_genkit(financial_text) # Call Genkit flow

            if gemini_analysis_response and not "error" in gemini_analysis_response:
                 # Assuming the Genkit flow returns the analysis text directly or within a specific key
                 # Adjust this based on the actual response format of your Genkit flow
                 gemini_analysis = gemini_analysis_response.get("output", gemini_analysis_response) # Try to get 'output' key, or use the whole response
            print("AI analysis completed.")

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
            # Save data and AI analysis to Firestore
            doc_ref = db.collection('historical_data').document(simbolo)
            update_data = {
                'updated_at': firestore.SERVER_TIMESTAMP,
                'symbol': simbolo,
                'period': periodo,
                'interval': intervalo,
                'data': processed_data_dict # Use the processed dictionary
            }

            if openai_analysis and not isinstance(openai_analysis, dict) and not "error" in openai_analysis:
                 update_data['openai_analysis'] = openai_analysis

            if mistral_analysis and not isinstance(mistral_analysis, dict) and not "error" in mistral_analysis:
                 update_data['mistral_analysis'] = mistral_analysis

            if gemini_analysis and not "error" in gemini_analysis:
                 update_data['gemini_analysis'] = gemini_analysis # Added Gemini analysis

            doc_ref.set(update_data) # Use set to create or overwrite the document

            print(f"Data and AI analysis for {simbolo} saved successfully to Firestore.")
            return jsonify({"message": f"Data and AI analysis for {simbolo} saved successfully."}), 200
        else:
            print(f"Could not obtain valid data for {simbolo}.")
            # Even if no historical data, maybe save the AI analysis if text was provided
            if (openai_analysis and not isinstance(openai_analysis, dict) and not "error" in openai_analysis) or \
               (mistral_analysis and not isinstance(mistral_analysis, dict) and not "error" in mistral_analysis) or \
               (gemini_analysis and not "error" in gemini_analysis): # Check if any analysis was successful
             doc_ref = db.collection('historical_data').document(simbolo + "_analysis") # Use a different document for analysis without historical data
             update_data = {
                'updated_at': firestore.SERVER_TIMESTAMP,
                'symbol': simbolo,
                'analysis_only': True
             }
             if openai_analysis and not isinstance(openai_analysis, dict) and not "error" in openai_analysis:
                'symbol': simbolo,
                'analysis_only': True
             }
             if openai_analysis and not isinstance(openai_analysis, dict) and not "error" in openai_analysis:
                  update_data['openai_analysis'] = openai_analysis
             if mistral_analysis and not isinstance(mistral_analysis, dict) and not "error" in mistral_analysis:
                  update_data['mistral_analysis'] = mistral_analysis
             if gemini_analysis and not "error" in gemini_analysis:
                  update_data['gemini_analysis'] = gemini_analysis # Added Gemini analysis
             doc_ref.set(update_data)
             print(f"AI analysis for {simbolo} saved successfully to Firestore (no historical data).")
             return jsonify({"message": f"AI analysis for {simbolo} saved successfully (no historical data).", "openai_analysis": openai_analysis, "mistral_analysis": mistral_analysis, "gemini_analysis": gemini_analysis}), 200 # Include Gemini analysis in response
            else:
                return jsonify({"message": f"Could not obtain valid data or perform analysis for {simbolo}."}), 404
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

    