import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import os

# Path to your service account key
# The user mentioned it should be at ./service-account.json
SERVICE_ACCOUNT_PATH = 'service-account.json'

def cleanup_lists():
    if not os.path.exists(SERVICE_ACCOUNT_PATH):
        print(f"Error: Service account key not found at {SERVICE_ACCOUNT_PATH}")
        print("Please ensure the file is present before running this script.")
        return

    # Initialize Firebase Admin
    cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
    firebase_admin.initialize_app(cred)
    db = firestore.client()

    redundant_lists = [
        "Tercero Actitud ante el problema"
    ]

    print("--- Starting Firestore Cleanup ---")
    
    for list_name in redundant_lists:
        doc_ref = db.collection('lists').document(list_name)
        doc = doc_ref.get()
        
        if doc.exists:
            print(f"Found redundant list: {list_name}. Deleting...")
            doc_ref.delete()
            print(f"Successfully deleted {list_name}.")
        else:
            print(f"List {list_name} not found in Firestore. Skipping.")

    print("--- Cleanup Complete ---")

if __name__ == "__main__":
    cleanup_lists()
