"""
ClipControl Backend - API Principal
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Optional
from datetime import datetime
import bcrypt

from config import settings
from database import get_supabase
from models import (
    LoginRequest, LoginResponse, MessageResponse,
    EmpleadoCreate, EmpleadoUpdate,
    EntregaCreate,
    ValidarRetiroRequest, ValidarRetiroResponse,
    PeriodoCreate,
)

# Inicializar FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# RUTAS SALUD
# ==========================================

@app.get("/")
def read_root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "message": "API de ClipControl funcionando correctamente"
    }


@app.get("/health")
def health_check():
    try:
        supabase = get_supabase()
        supabase.table("sucursales").select("count", count="exact").execute()
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": str(datetime.now())
        }
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "error": str(e)}
        )

# ==========================================
# LOGIN (CORREGIDO)
# ==========================================

@app.post("/api/auth/login", response_model=LoginResponse)
def login(request: LoginRequest):
    """Login de usuario"""
    try:
        supabase = get_supabase()
        
        print(f"🔍 Buscando usuario: {request.username}")
        
        # Buscar usuario
        result = supabase.table("usuarios").select("*").eq("username", request.username).execute()
        
        print(f"📊 Resultado query: {result.data}")
        
        if not result.data or len(result.data) == 0:
            print("❌ Usuario NO encontrado")
            raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")
        
        user = result.data[0]
        print(f"✅ Usuario encontrado: {user['username']}")
        print(f"🔐 Hash en BD: {user['password_hash']}")
        print(f"🔑 Password recibida: {request.password}")
        
        # Verificar contraseña
        password_match = bcrypt.checkpw(
            request.password.encode('utf-8'),
            user['password_hash'].encode('utf-8')
        )
        
        print(f"🎯 Password match: {password_match}")
        
        if not password_match:
            print("❌ Contraseña NO coincide")
            raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")
        
        # Verificar que el usuario esté activo
        if not user.get('activo', True):
            print("❌ Usuario inactivo")
            raise HTTPException(status_code=401, detail="Usuario inactivo")
        
        print("✅ Login exitoso!")
        
        # Actualizar último acceso
        supabase.table("usuarios").update({
            "ultimo_acceso": datetime.now().isoformat()
        }).eq("id", user['id']).execute()
        
        # Generar token (simplificado por ahora)
        token = f"token_{user['id']}_{user['username']}"
        
        # Preparar respuesta
        user_data = {
            "id": user['id'],
            "username": user['username'],
            "rol": user['rol'].lower() if user['rol'] else None,
            "nombre_completo": user.get('nombre_completo'),
            "sucursal_id": user.get('sucursal_id')
        }
        
        return LoginResponse(
            access_token=token,
            token_type="bearer",
            user=user_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"💥 Error inesperado: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error en login: {str(e)}")

# ==========================================
# EMPLEADOS
# ==========================================

@app.get("/api/empleados", response_model=List[dict])
def get_empleados(
    sucursal_id: Optional[int] = None,
    tipo_contrato: Optional[str] = None,
    activo: Optional[bool] = True,
    skip: int = 0,
    limit: int = 100
):
    try:
        supabase = get_supabase()
        query = supabase.table("v_empleados_completo").select("*")

        if activo is not None:
            query = query.eq("activo", activo)
        if sucursal_id:
            query = query.eq("sucursal_id", sucursal_id)
        if tipo_contrato:
            query = query.eq("tipo_contrato", tipo_contrato)

        result = query.range(skip, skip + limit - 1).execute()
        return result.data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener empleados: {str(e)}")


@app.get("/api/empleados/{empleado_id}", response_model=dict)
def get_empleado(empleado_id: int):
    try:
        supabase = get_supabase()
        result = supabase.table("empleados").select("*").eq("id", empleado_id).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Empleado no encontrado")

        return result.data[0]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@app.get("/api/empleados/rut/{rut}", response_model=dict)
def get_empleado_by_rut(rut: str):
    try:
        supabase = get_supabase()
        rut_limpio = rut.replace(".", "").replace("-", "")

        result = supabase.table("v_empleados_completo").select("*").eq("rut", rut_limpio).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail=f"Empleado con RUT {rut} no encontrado")

        return result.data[0]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@app.post("/api/empleados", response_model=dict)
def create_empleado(empleado: EmpleadoCreate):
    try:
        supabase = get_supabase()
        existing = supabase.table("empleados").select("id").eq("rut", empleado.rut).execute()

        if existing.data:
            raise HTTPException(status_code=400, detail="Ya existe un empleado con ese RUT")

        result = supabase.table("empleados").insert(empleado.dict()).execute()
        return result.data[0]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@app.put("/api/empleados/{empleado_id}", response_model=dict)
def update_empleado(empleado_id: int, empleado: EmpleadoUpdate):
    try:
        supabase = get_supabase()
        existing = supabase.table("empleados").select("id").eq("id", empleado_id).execute()

        if not existing.data:
            raise HTTPException(status_code=404, detail="Empleado no encontrado")

        update_data = {k: v for k, v in empleado.dict().items() if v is not None}
        result = supabase.table("empleados").update(update_data).eq("id", empleado_id).execute()

        return result.data[0]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

# ==========================================
# VALIDACIÓN RETIRO
# ==========================================

@app.post("/api/validar-retiro", response_model=ValidarRetiroResponse)
def validar_retiro(validacion: ValidarRetiroRequest):
    try:
        supabase = get_supabase()
        rut_limpio = validacion.rut.replace(".", "").replace("-", "")

        # Buscar empleado
        empleado_result = supabase.table("empleados").select("*").eq("rut", rut_limpio).eq("activo", True).execute()

        if not empleado_result.data:
            return ValidarRetiroResponse(
                valido=False,
                mensaje=f"Empleado con RUT {validacion.rut} no encontrado o inactivo",
                ya_retiro=False
            )

        empleado = empleado_result.data[0]

        # Revisar si ya retiró
        entrega_result = supabase.table("entregas").select("id, fecha_hora").eq(
            "empleado_id", empleado['id']
        ).eq(
            "periodo_id", validacion.periodo_id
        ).eq("estado", "COMPLETADO").execute()

        if entrega_result.data:
            entrega = entrega_result.data[0]
            return ValidarRetiroResponse(
                valido=False,
                mensaje=f"Este empleado ya retiró el {entrega['fecha_hora']}",
                empleado=empleado,
                ya_retiro=True,
                tipo_caja=None
            )

        tipo_caja = "PLANTA" if empleado['tipo_contrato'] == "PLANTA" else "PLAZO_FIJO"

        return ValidarRetiroResponse(
            valido=True,
            mensaje="Empleado válido para retiro",
            empleado=empleado,
            ya_retiro=False,
            tipo_caja=tipo_caja
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en validación: {str(e)}")

# ==========================================
# ENTREGAS
# ==========================================

@app.post("/api/entregas", response_model=dict)
def crear_entrega(entrega: EntregaCreate):
    try:
        supabase = get_supabase()

        check = supabase.table("entregas").select("id").eq(
            "empleado_id", entrega.empleado_id
        ).eq(
            "periodo_id", entrega.periodo_id
        ).eq("estado", "COMPLETADO").execute()

        if check.data:
            raise HTTPException(status_code=400, detail="Este empleado ya retiró en este período")

        result = supabase.table("entregas").insert(entrega.dict()).execute()
        return result.data[0]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@app.get("/api/entregas", response_model=List[dict])
def get_entregas(periodo_id: Optional[int] = None, sucursal_id: Optional[int] = None, skip: int = 0, limit: int = 100):
    try:
        supabase = get_supabase()
        query = supabase.table("v_entregas_completo").select("*")

        if periodo_id:
            query = query.eq("periodo_id", periodo_id)
        if sucursal_id:
            query = query.eq("sucursal_id", sucursal_id)

        result = query.range(skip, skip + limit - 1).order("fecha_hora", desc=True).execute()
        return result.data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

# ==========================================
# PERIODOS
# ==========================================

@app.get("/api/periodos", response_model=List[dict])
def get_periodos(activo: Optional[bool] = None):
    try:
        supabase = get_supabase()
        query = supabase.table("periodos_entrega").select("*")

        if activo is not None:
            query = query.eq("activo", activo)

        result = query.order("fecha_inicio", desc=True).execute()
        return result.data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@app.get("/api/periodos/activo", response_model=dict)
def get_periodo_activo():
    try:
        supabase = get_supabase()
        result = supabase.table("periodos_entrega").select("*").eq("activo", True).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="No hay período activo")

        return result.data[0]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@app.post("/api/periodos", response_model=dict)
def create_periodo(periodo: PeriodoCreate):
    try:
        supabase = get_supabase()
        result = supabase.table("periodos_entrega").insert(periodo.dict()).execute()
        return result.data[0]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

# ==========================================
# SUCURSALES
# ==========================================

@app.get("/api/sucursales", response_model=List[dict])
def get_sucursales():
    try:
        supabase = get_supabase()
        result = supabase.table("sucursales").select("*").eq("activa", True).execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

# ==========================================
# EJECUTAR
# ==========================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
