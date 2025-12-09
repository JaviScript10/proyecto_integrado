"""
ClipControl Backend - Modelos de datos
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
from enum import Enum

# ==========================================
# ENUMS
# ==========================================

class Rol(str, Enum):
    SUPERADMIN = "SUPERADMIN"
    ADMIN = "ADMIN"
    ADMIN_RRHH = "ADMIN_RRHH"
    GUARDIA = "GUARDIA"

# ==========================================
# AUTENTICACIÓN
# ==========================================

class LoginRequest(BaseModel):
    username: str
    password: str
    sucursal_id: Optional[int] = None

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

# ==========================================
# USUARIOS
# ==========================================

class UsuarioCreate(BaseModel):
    username: str
    password: str
    rol: str  # 'SUPERADMIN', 'ADMIN', 'ADMIN_RRHH', 'GUARDIA'
    nombre_completo: str
    sucursal_id: Optional[int] = None
    activo: bool = True

class UsuarioUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    nombre_completo: Optional[str] = None
    sucursal_id: Optional[int] = None
    activo: Optional[bool] = None

# ==========================================
# EMPLEADOS
# ==========================================

class EmpleadoBase(BaseModel):
    rut: str
    nombre: str
    apellido: str
    email: Optional[str] = None
    telefono: Optional[str] = None
    tipo_contrato: str
    seccion: Optional[str] = None
    sucursal_id: int
    activo: bool = True
    fecha_ingreso: Optional[date] = None

class EmpleadoCreate(EmpleadoBase):
    pass

class EmpleadoUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    email: Optional[str] = None
    telefono: Optional[str] = None
    tipo_contrato: Optional[str] = None
    seccion: Optional[str] = None
    sucursal_id: Optional[int] = None
    activo: Optional[bool] = None

class Empleado(EmpleadoBase):
    id: int
    nombre_completo: Optional[str] = None
    created_at: datetime
    updated_at: datetime

# ==========================================
# ENTREGAS
# ==========================================

class EntregaCreate(BaseModel):
    empleado_id: int
    periodo_id: Optional[int] = None
    sucursal_id: Optional[int] = None
    guardia: Optional[str] = None
    tipo_caja: Optional[str] = None
    observaciones: Optional[str] = None
    metodo: Optional[str] = "QR"
    estado: Optional[str] = "COMPLETADO"
    usuario_id: Optional[int] = None
    foto_url: Optional[str] = None

class Entrega(BaseModel):
    id: int
    empleado_id: int
    periodo_id: int
    sucursal_id: int
    fecha_hora: datetime
    guardia: str
    tipo_caja: str
    metodo: str
    observaciones: Optional[str] = None
    foto_url: Optional[str] = None
    estado: str = "COMPLETADO"
    created_at: datetime

# ==========================================
# VALIDACIÓN DE RETIRO
# ==========================================

class ValidarRetiroRequest(BaseModel):
    rut: str
    periodo_id: int
    sucursal_id: int

class ValidarRetiroResponse(BaseModel):
    valido: bool
    mensaje: str
    empleado: Optional[dict] = None
    ya_retiro: bool = False
    tipo_caja: Optional[str] = None

# ==========================================
# PERÍODOS
# ==========================================

class PeriodoCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    fecha_inicio: date
    fecha_fin: date
    tipo_entrega: str = "GENERAL"
    criterio_grupos: Optional[str] = None

class Periodo(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str] = None
    fecha_inicio: date
    fecha_fin: date
    tipo_entrega: str
    criterio_grupos: Optional[str] = None
    activo: bool
    created_at: datetime

# ==========================================
# ESTADÍSTICAS
# ==========================================

class EstadisticasResponse(BaseModel):
    total_empleados: int
    total_entregas: int
    entregas_con_foto: int
    porcentaje_completado: float
    pendientes: int
    por_sucursal: dict
    por_tipo_contrato: dict

# ==========================================
# RESPUESTAS GENÉRICAS
# ==========================================

class MessageResponse(BaseModel):
    message: str
    success: bool = True
    data: Optional[dict] = None

# ==========================================
# QR MASIVO
# ==========================================

class GenerarQRMasivoRequest(BaseModel):
    empleados_ids: Optional[List[int]] = None