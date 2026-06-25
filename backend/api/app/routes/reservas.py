# backend/routes/reservas.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from api.database import obtener_conexion
import json

router = APIRouter(
    prefix="/api/reservas",
    tags=["Reservas"]
)

# ============================================================
# MODELOS
# ============================================================

class ItinerarioItem(BaseModel):
    lugar: str
    tipo: str
    fechaInicio: str
    duracion: int
    nivelExigencia: int
    tourRecomendado: str
    actividades: List[str]

class ClienteData(BaseModel):
    nombre: str
    email: str
    telefono: str
    comentarios: Optional[str] = ""

class EstadisticasData(BaseModel):
    totalDias: int
    nivelPromedio: int
    tipos: List[str]
    actividades: List[str]

class ReservaCompleta(BaseModel):
    cliente: ClienteData
    itinerario: List[ItinerarioItem]
    totalDias: int
    totalDestinos: int
    estadisticas: EstadisticasData
    fechaReserva: str

# ============================================================
# ENDPOINTS
# ============================================================

@router.post("/")
async def crear_reserva(reserva: ReservaCompleta):
    """Guardar reserva en la tabla existente"""
    print("=" * 50)
    print("📥 Recibida reserva")
    print(f"   Cliente: {reserva.cliente.nombre}")
    print(f"   Email: {reserva.cliente.email}")
    print(f"   Destinos: {reserva.totalDestinos}")
    print("=" * 50)
    
    conexion = obtener_conexion()
    if not conexion:
        raise HTTPException(status_code=500, detail="Error de conexión a la base de datos")
    
    try:
        with conexion.cursor() as cursor:
            
            # ✅ INSERTAR EN LA TABLA EXISTENTE
            sql = """
                INSERT INTO reservas (
                    paquete_id,
                    paquete_nombre,
                    precio_referencial,
                    nombre_cliente,
                    email_cliente,
                    telefono_cliente,
                    fecha_viaje,
                    numero_pasajeros,
                    comentarios,
                    tipo,
                    duracion,
                    fecha_solicitud
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            # Tomar el primer destino como referencia
            primer_destino = reserva.itinerario[0] if reserva.itinerario else None
            
            # Construir lista de destinos para el campo "paquete_nombre"
            nombres_destinos = ", ".join([d.lugar for d in reserva.itinerario])
            
            # Construir tipos
            tipos_str = ", ".join(reserva.estadisticas.tipos)
            
            cursor.execute(sql, (
                "",  # paquete_id (vacío porque viene del itinerario)
                nombres_destinos,  # paquete_nombre (todos los destinos)
                0,  # precio_referencial
                reserva.cliente.nombre,
                reserva.cliente.email,
                reserva.cliente.telefono,
                primer_destino.fechaInicio if primer_destino else now,  # fecha_viaje
                reserva.totalDestinos,  # numero_pasajeros (usamos total destinos)
                reserva.cliente.comentarios or "",
                tipos_str,  # tipo
                f"{reserva.totalDias} días",  # duracion
                now  # fecha_solicitud
            ))
            
            reserva_id = cursor.lastrowid
            conexion.commit()
            
            print(f"✅ Reserva guardada con ID: {reserva_id}")
            print("=" * 50)
            
            return {
                "status": "success",
                "message": "Reserva registrada exitosamente",
                "reserva_id": reserva_id
            }
            
    except Exception as e:
        conexion.rollback()
        print(f"❌ Error en MySQL: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")
    finally:
        conexion.close()
        print("🔌 Conexión cerrada")


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