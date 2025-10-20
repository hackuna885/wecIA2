#!/usr/bin/env python3
"""
Compresor de imágenes recursivo que sobrescribe archivos originales
Busca en todos los subdirectorios desde donde se ejecuta
"""

import os
import sys
from PIL import Image
import pillow_heif
from pathlib import Path
import tempfile

# Registrar soporte para HEIF/HEIC
pillow_heif.register_heif_opener()

class ImageCompressor:
    def __init__(self):
        self.supported_formats = {'.jpg', '.jpeg', '.png', '.webp'}
        self.processed_count = 0
        self.total_original_size = 0
        self.total_compressed_size = 0
    
    def optimize_png(self, image_path, quality=85):
        """
        Optimiza PNG manteniendo el tamaño original
        """
        with Image.open(image_path) as img:
            # Crear archivo temporal
            with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp:
                tmp_path = tmp.name
            
            try:
                # Mantener modo original (incluye transparencia)
                img.save(
                    tmp_path,
                    format='PNG',
                    optimize=True,
                    compress_level=9  # Máxima compresión sin pérdida
                )
                
                # Sobrescribir archivo original
                os.replace(tmp_path, image_path)
                
            except Exception as e:
                # Limpiar archivo temporal si hay error
                if os.path.exists(tmp_path):
                    os.unlink(tmp_path)
                raise e
    
    def optimize_jpeg(self, image_path, quality=85):
        """
        Optimiza JPEG manteniendo el tamaño original
        """
        with Image.open(image_path) as img:
            # Crear archivo temporal
            with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
                tmp_path = tmp.name
            
            try:
                # Convertir a RGB si es necesario
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Guardar con optimizaciones (SIN redimensionar)
                img.save(
                    tmp_path,
                    format='JPEG',
                    quality=quality,
                    optimize=True,
                    progressive=True,
                    subsampling=0  # Mejor calidad de color
                )
                
                # Sobrescribir archivo original
                os.replace(tmp_path, image_path)
                
            except Exception as e:
                # Limpiar archivo temporal si hay error
                if os.path.exists(tmp_path):
                    os.unlink(tmp_path)
                raise e
    
    def compress_image(self, image_path, quality=85):
        """
        Comprime una imagen sobrescribiendo el archivo original
        """
        image_path = Path(image_path)
        
        if not image_path.exists():
            return False
        
        # Verificar formato soportado
        if image_path.suffix.lower() not in self.supported_formats:
            return False
        
        original_size = image_path.stat().st_size
        
        try:
            print(f"Procesando: {image_path}")
            
            # Aplicar compresión según formato
            if image_path.suffix.lower() == '.png':
                self.optimize_png(image_path, quality)
            else:  # JPEG, JPG
                self.optimize_jpeg(image_path, quality)
            
            # Verificar tamaño final
            final_size = image_path.stat().st_size
            compression_ratio = (1 - final_size/original_size) * 100 if original_size > 0 else 0
            
            print(f"  Antes: {original_size/1024:.1f} KB")
            print(f"  Después: {final_size/1024:.1f} KB")
            print(f"  Reducción: {compression_ratio:.1f}%")
            
            # Actualizar estadísticas
            self.processed_count += 1
            self.total_original_size += original_size
            self.total_compressed_size += final_size
            
            return True
                
        except Exception as e:
            print(f"❌ Error procesando {image_path}: {str(e)}")
            return False
    
    def scan_and_compress(self, root_path=".", quality=85):
        """
        Busca recursivamente todas las imágenes y las comprime
        """
        root_path = Path(root_path).resolve()
        print(f"Buscando imágenes en: {root_path}")
        print(f"Formatos soportados: {', '.join(self.supported_formats)}")
        print("-" * 50)
        
        # Buscar recursivamente todos los archivos de imagen
        image_files = []
        for ext in self.supported_formats:
            # Usar glob recursivo para encontrar todos los archivos
            pattern = f"**/*{ext}"
            image_files.extend(root_path.glob(pattern))
            # También buscar en mayúsculas
            pattern = f"**/*{ext.upper()}"
            image_files.extend(root_path.glob(pattern))
        
        # Eliminar duplicados
        image_files = list(set(image_files))
        
        if not image_files:
            print("No se encontraron imágenes para procesar.")
            return
        
        print(f"Encontradas {len(image_files)} imágenes")
        print("-" * 50)
        
        # Procesar cada imagen
        for image_path in sorted(image_files):
            self.compress_image(image_path, quality)
        
        # Mostrar resumen final
        print("-" * 50)
        print("RESUMEN FINAL:")
        print(f"Imágenes procesadas: {self.processed_count}")
        
        if self.processed_count > 0:
            total_reduction = (1 - self.total_compressed_size/self.total_original_size) * 100
            print(f"Tamaño original total: {self.total_original_size/1024/1024:.2f} MB")
            print(f"Tamaño comprimido total: {self.total_compressed_size/1024/1024:.2f} MB")
            print(f"Reducción total: {total_reduction:.1f}%")
            print(f"Espacio ahorrado: {(self.total_original_size-self.total_compressed_size)/1024/1024:.2f} MB")

def main():
    """
    Función principal
    """
    print("=== COMPRESOR DE IMÁGENES RECURSIVO ===")
    print("⚠️  ADVERTENCIA: Este script SOBRESCRIBE los archivos originales")
    print("    Asegúrate de tener respaldo de tus imágenes importantes")
    print()
    
    # Confirmar ejecución
    confirm = input("¿Deseas continuar? (s/N): ").lower().strip()
    if confirm not in ['s', 'si', 'sí', 'y', 'yes']:
        print("Operación cancelada.")
        return
    
    # Obtener calidad desde argumentos o usar default
    quality = 85
    if len(sys.argv) > 1:
        try:
            quality = int(sys.argv[1])
            if quality < 10 or quality > 100:
                print("⚠️  Calidad debe estar entre 10-100, usando 85 por defecto")
                quality = 85
        except ValueError:
            print("⚠️  Calidad inválida, usando 85 por defecto")
    
    print(f"Calidad de compresión: {quality}")
    print()
    
    # Crear compresor y ejecutar
    compressor = ImageCompressor()
    
    # Obtener directorio donde se ejecuta el script
    script_dir = Path(__file__).parent if '__file__' in globals() else Path.cwd()
    
    compressor.scan_and_compress(script_dir, quality)
    
    print("\n✅ Proceso completado.")

if __name__ == "__main__":
    main()

# Para uso programático:
"""
# Comprimir todas las imágenes del directorio actual y subdirectorios
compressor = ImageCompressor()
compressor.scan_and_compress(".", quality=80)

# O comprimir desde un directorio específico
compressor.scan_and_compress("/ruta/a/mis/imagenes", quality=90)
"""