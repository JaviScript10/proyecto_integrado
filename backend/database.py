"""
ClipControl Backend - Database Connection
"""
from supabase import create_client, Client
from config import settings

def get_supabase() -> Client:
    """Crear y retornar cliente de Supabase"""
    
    print(f"🔌 Conectando a Supabase...")
    print(f"   URL: {settings.SUPABASE_URL}")
    print(f"   KEY: {settings.SUPABASE_KEY[:20]}...")
    
    try:
        client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        
        # Test de conexión - listar tablas
        print(f"🧪 Probando conexión...")
        
        # Intentar query simple
        result = client.table("usuarios").select("*").limit(1).execute()
        print(f"✅ Conexión exitosa")
        print(f"📊 Datos en tabla usuarios: {len(result.data)} registros encontrados")
        
        if result.data:
            print(f"👤 Primer usuario: {result.data[0].get('username')}")
        
        return client
        
    except Exception as e:
        print(f"❌ Error al conectar con Supabase: {e}")
        raise

# Crear instancia global (para reusar)
_supabase_client = None

def get_supabase() -> Client:
    global _supabase_client
    if _supabase_client is None:
        print(f"🔌 Creando nueva conexión Supabase...")
        print(f"   URL: {settings.SUPABASE_URL}")
        _supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        
        # Test
        try:
            test = _supabase_client.table("usuarios").select("count", count="exact").execute()
            print(f"✅ Conexión OK - Total usuarios en BD: {test.count}")
        except Exception as e:
            print(f"❌ Error en test de conexión: {e}")
    
    return _supabase_client