# backend/routes/reservas.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from api.database import obtener_conexion

router = APIRouter(
    prefix="/api/reservas",
    tags=["Reservas"]
)

# ============================================================
# MODELO
# ============================================================

class ReservaCreate(BaseModel):
    paquete_id: Optional[str] = ""
    paquete_nombre: str
    precio_referencial: Optional[float] = 0
    nombre_cliente: str
    email_cliente: str
    telefono_cliente: str
    fecha_viaje: str
    numero_pasajeros: int
    comentarios: Optional[str] = ""
    tipo: Optional[str] = ""
    duracion: Optional[str] = ""

# ============================================================
# ENDPOINTS - ORDEN CORRECTO
# ============================================================

# 1️⃣ ENDPOINT DE TEST
@router.get("/test")
async def test_reservas():
    """Endpoint de prueba para verificar que el router funciona"""
    return {
        "status": "ok",
        "message": "El router de reservas está funcionando correctamente",
        "timestamp": datetime.now().isoformat()
    }


# 2️⃣ ENDPOINT POST - CREAR RESERVA
@router.post("/")
async def crear_reserva(reserva: ReservaCreate):
    """Guardar solicitud de reserva del cliente"""
    print("=" * 50)
    print("📥 Recibida solicitud de reserva")
    print(f"   Paquete: {reserva.paquete_nombre}")
    print(f"   Cliente: {reserva.nombre_cliente}")
    print(f"   Email: {reserva.email_cliente}")
    print(f"   Fecha: {reserva.fecha_viaje}")
    print(f"   Pasajeros: {reserva.numero_pasajeros}")
    print("=" * 50)
    
    conexion = obtener_conexion()
    if not conexion:
        print("❌ Error de conexión a la base de datos")
        raise HTTPException(status_code=500, detail="Error de conexión a la base de datos")
    
    try:
        with conexion.cursor() as cursor:
            # ✅ Verificar si la tabla existe ANTES de crearla
            cursor.execute("""
                SELECT COUNT(*)
                FROM information_schema.tables
                WHERE table_schema = DATABASE()
                AND table_name = 'reservas'
            """)
            table_exists = cursor.fetchone()[0] > 0
            
            # ✅ Solo crear la tabla si NO existe
            if not table_exists:
                cursor.execute("""
                    CREATE TABLE reservas (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        paquete_id VARCHAR(50),
                        paquete_nombre VARCHAR(255) NOT NULL,
                        precio_referencial DECIMAL(10,2) DEFAULT 0,
                        nombre_cliente VARCHAR(255) NOT NULL,
                        email_cliente VARCHAR(255) NOT NULL,
                        telefono_cliente VARCHAR(50) NOT NULL,
                        fecha_viaje DATE NOT NULL,
                        numero_pasajeros INT NOT NULL,
                        comentarios TEXT,
                        tipo VARCHAR(50),
                        duracion VARCHAR(50),
                        fecha_solicitud DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                print("✅ Tabla 'reservas' creada")
            else:
                print("✅ Tabla 'reservas' ya existe")
            
            # ✅ Insertar la reserva
            sql = """
                INSERT INTO reservas (
                    paquete_id, paquete_nombre, precio_referencial,
                    nombre_cliente, email_cliente, telefono_cliente,
                    fecha_viaje, numero_pasajeros, comentarios,
                    tipo, duracion, fecha_solicitud
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            cursor.execute(sql, (
                reserva.paquete_id,
                reserva.paquete_nombre,
                reserva.precio_referencial,
                reserva.nombre_cliente,
                reserva.email_cliente,
                reserva.telefono_cliente,
                reserva.fecha_viaje,
                reserva.numero_pasajeros,
                reserva.comentarios,
                reserva.tipo,
                reserva.duracion,
                now
            ))
            
            reserva_id = cursor.lastrowid
            conexion.commit()
            
            print(f"✅ Reserva guardada con ID: {reserva_id}")
            print("=" * 50)
            
            return {
                "status": "success",
                "message": "Solicitud registrada exitosamente",
                "reserva_id": reserva_id
            }
            
    except Exception as e:
        conexion.rollback()
        print(f"❌ Error en MySQL: {str(e)}")
        print("=" * 50)
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")
    finally:
        conexion.close()
        print("🔌 Conexión cerrada")


# 3️⃣ ENDPOINT GET - LISTAR RESERVAS
@router.get("/")
async def listar_reservas():
    """Listar todas las reservas"""
    conexion = obtener_conexion()
    if not conexion:
        raise HTTPException(status_code=500, detail="Error de conexión")
    
    try:
        with conexion.cursor(dictionary=True) as cursor:
            cursor.execute("""
                SELECT * FROM reservas 
                ORDER BY fecha_solicitud DESC
            """)
            reservas = cursor.fetchall()
            
            # Formatear fechas
            for r in reservas:
                if r.get('fecha_solicitud'):
                    r['fecha_solicitud'] = r['fecha_solicitud'].strftime("%Y-%m-%d %H:%M:%S")
                if r.get('fecha_viaje'):
                    r['fecha_viaje'] = r['fecha_viaje'].strftime("%Y-%m-%d")
            
            return {
                "reservas": reservas,
                "total": len(reservas)
            }
            
    except Exception as e:
        print(f"❌ Error listando reservas: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conexion.close()


# 4️⃣ ENDPOINT GET - OBTENER RESERVA POR ID (DEBE IR AL FINAL)
@router.get("/{reserva_id}")
async def obtener_reserva(reserva_id: int):
    """Obtener detalle de una reserva específica"""
    conexion = obtener_conexion()
    if not conexion:
        raise HTTPException(status_code=500, detail="Error de conexión")
    
    try:
        with conexion.cursor(dictionary=True) as cursor:
            cursor.execute("SELECT * FROM reservas WHERE id = %s", (reserva_id,))
            reserva = cursor.fetchone()
            
            if not reserva:
                raise HTTPException(status_code=404, detail="Reserva no encontrada")
            
            if reserva.get('fecha_solicitud'):
                reserva['fecha_solicitud'] = reserva['fecha_solicitud'].strftime("%Y-%m-%d %H:%M:%S")
            if reserva.get('fecha_viaje'):
                reserva['fecha_viaje'] = reserva['fecha_viaje'].strftime("%Y-%m-%d")
            
            return reserva
            
    except Exception as e:
        print(f"❌ Error obteniendo reserva: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conexion.close()