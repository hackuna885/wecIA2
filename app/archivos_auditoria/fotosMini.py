import os
from pathlib import Path
from PIL import Image

def redimensionar_imagenes(directorio_base='.'):
    """
    Busca imágenes recursivamente y crea versiones miniatura de 450x450px
    """
    extensiones = ('.jpg', '.jpeg', '.png', '.gif')
    directorio_base = Path(directorio_base)
    
    # Buscar todas las imágenes recursivamente
    for ruta_imagen in directorio_base.rglob('*'):
        if ruta_imagen.suffix.lower() in extensiones:
            # Evitar procesar imágenes que ya están en carpetas 'mini'
            if 'mini' in ruta_imagen.parts:
                continue
            
            try:
                # Crear directorio 'mini' en la misma ubicación
                directorio_mini = ruta_imagen.parent / 'mini'
                directorio_mini.mkdir(exist_ok=True)
                
                # Abrir y redimensionar imagen
                with Image.open(ruta_imagen) as img:
                    # Mantener proporción con thumbnail
                    img.thumbnail((450, 450), Image.Resampling.LANCZOS)
                    
                    # Guardar en directorio mini
                    ruta_salida = directorio_mini / ruta_imagen.name
                    img.save(ruta_salida, quality=85, optimize=True)
                    
                print(f"✓ {ruta_imagen.relative_to(directorio_base)} -> mini/{ruta_imagen.name}")
                
            except Exception as e:
                print(f"✗ Error procesando {ruta_imagen}: {e}")

if __name__ == '__main__':
    redimensionar_imagenes()
    print("\nProceso completado")