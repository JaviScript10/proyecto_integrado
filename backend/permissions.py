# permissions.py
"""
Sistema de permisos por roles
"""
from functools import wraps
from fastapi import HTTPException, Header
from typing import Optional

# Definición de permisos por rol
PERMISOS = {
    'SUPERADMIN': [
        'all',  # Acceso completo
    ],
    'ADMIN': [
        'empleados:read',
        'empleados:create',
        'empleados:update',
        'empleados:delete',
        'entregas:read',
        'reportes:read',
        'usuarios:read',  # Solo para ver guardias
        'usuarios:create',  # Solo crear GUARDIAS
        'periodos:read',
        'periodos:create',
        'periodos:update',
        'sucursales:read',
    ],
    'ADMIN_RRHH': [
        'empleados:read',
        'empleados:create',  # Subir nómina
        'empleados:update',  # Actualizar datos de empleados
        'entregas:read',
        'reportes:read',
        'reportes:export',
    ],
    'GUARDIA': [
        # Los guardias NO acceden al dashboard web
        # Solo usan la app móvil
    ]
}

def tiene_permiso(rol: str, permiso: str) -> bool:
    """Verificar si un rol tiene un permiso específico"""
    if rol == 'SUPERADMIN':
        return True
    return permiso in PERMISOS.get(rol, [])

def requiere_rol(*roles_permitidos):
    """Decorador para requerir roles específicos"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Aquí verificarías el token JWT y extraerías el rol
            # Por ahora, asumimos que se pasa en el header
            # En producción, usarías JWT
            return await func(*args, **kwargs)
        return wrapper
    return decorator

def puede_gestionar_usuario(rol_solicitante: str, rol_objetivo: str) -> bool:
    """Verificar si un rol puede gestionar a otro rol"""
    jerarquia = {
        'SUPERADMIN': 4,
        'ADMIN': 3,
        'ADMIN_RRHH': 2,
        'GUARDIA': 1
    }
    
    # SUPERADMIN puede gestionar a todos
    if rol_solicitante == 'SUPERADMIN':
        return True
    
    # ADMIN solo puede crear/editar GUARDIAS
    if rol_solicitante == 'ADMIN' and rol_objetivo == 'GUARDIA':
        return True
    
    # ADMIN_RRHH no puede gestionar usuarios
    return False

# Funciones de validación para endpoints
def validar_acceso_dashboard(rol: str) -> bool:
    """Solo SUPERADMIN, ADMIN y ADMIN_RRHH pueden acceder al dashboard"""
    return rol in ['SUPERADMIN', 'ADMIN', 'ADMIN_RRHH']

def validar_gestion_usuarios(rol: str, rol_nuevo: str) -> bool:
    """Validar si puede crear/editar usuarios"""
    return puede_gestionar_usuario(rol, rol_nuevo)

def validar_configuracion_sistema(rol: str) -> bool:
    """Solo SUPERADMIN puede modificar configuración"""
    return rol == 'SUPERADMIN'