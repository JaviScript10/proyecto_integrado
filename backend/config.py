"""
ClipControl Backend - Configuración
"""
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

class Settings:
    """Configuración de la aplicación"""
    
    # Supabase
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    
    # Seguridad
    SECRET_KEY: str = os.getenv("SECRET_KEY", "secret")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    
    # App
    APP_NAME: str = os.getenv("APP_NAME", "ClipControl")
    APP_VERSION: str = os.getenv("APP_VERSION", "1.0.0")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    # CORS
    CORS_ORIGINS: list = os.getenv("CORS_ORIGINS", "").split(",")
    
    def validate(self):
        """Validar que las configuraciones necesarias están presentes"""
        if not self.SUPABASE_URL:
            raise ValueError("SUPABASE_URL no está configurado en .env")
        if not self.SUPABASE_KEY:
            raise ValueError("SUPABASE_KEY no está configurado en .env")
        return True

settings = Settings()

# PRINTS DE DEBUG
print("=" * 50)
print("🔧 CONFIGURACIÓN CARGADA:")
print(f"📍 SUPABASE_URL: {settings.SUPABASE_URL}")
print(f"🔑 SUPABASE_KEY: {settings.SUPABASE_KEY[:30]}...")
print(f"🌐 CORS_ORIGINS: {settings.CORS_ORIGINS}")
print("=" * 50)