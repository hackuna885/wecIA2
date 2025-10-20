import os
import glob

def replace_in_htaccess():
    """
    Busca todos los archivos .htaccess en el directorio actual y subdirectorios
    Reemplaza /EDFMAN/ por /EDFMAN/
    """
    # Buscar todos los archivos .htaccess recursivamente desde el directorio actual
    htaccess_files = glob.glob("**/.htaccess", recursive=True)
    
    if not htaccess_files:
        print("No se encontraron archivos .htaccess")
        return
    
    print(f"Archivos .htaccess encontrados: {len(htaccess_files)}")
    
    modified_files = 0
    
    for file_path in htaccess_files:
        try:
            # Leer el archivo
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            # Verificar si contiene el texto a reemplazar
            if "/proCorsec/" in content:
                # Hacer el reemplazo
                new_content = content.replace("/proCorsec/", "/wecIA2/")
                
                # Escribir el archivo modificado
                with open(file_path, 'w', encoding='utf-8') as file:
                    file.write(new_content)
                
                print(f"✓ Modificado: {file_path}")
                modified_files += 1
            else:
                print(f"- Sin cambios: {file_path}")
                
        except Exception as e:
            print(f"✗ Error procesando {file_path}: {str(e)}")
    
    print(f"\nResumen: {modified_files} archivos modificados de {len(htaccess_files)} archivos encontrados")

# Ejecutar el script
if __name__ == "__main__":
    print("Buscando archivos .htaccess en el directorio actual y subdirectorios...")
    replace_in_htaccess()