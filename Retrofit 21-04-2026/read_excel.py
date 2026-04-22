import pandas as pd
import os
import sys

def excel_to_text(file_path, output_path):
    print(f"Reading {file_path}...")
    try:
        xls = pd.ExcelFile(file_path)
        with open(output_path, 'w', encoding='utf-8') as f:
            for sheet_name in xls.sheet_names:
                f.write(f"\n--- Sheet: {sheet_name} ---\n")
                df = pd.read_excel(xls, sheet_name=sheet_name)
                f.write(df.to_string(index=False))
                f.write("\n")
        print(f"Saved to {output_path}")
    except Exception as e:
        print(f"Error reading {file_path}: {e}")

folder = r"c:\Users\pipeo\Documents\Telefono Formulario\Retrofit 21-04-2026"
files = ["TelEsperanzaMed-Catalogo.xlsx", "TelEsperanzaMed-DataMaestra.xlsx", "TelEsperanzaMed-Parametrizacion.xlsx"]

for file in files:
    excel_to_text(os.path.join(folder, file), os.path.join(folder, file + ".txt"))
