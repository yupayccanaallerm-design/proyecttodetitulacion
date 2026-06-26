# backend/routes/reservas.py

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from database import obtener_conexion
from ..i18n import tr
import json

router = APIRouter(
    prefix="/api/reservas",
    tags=["Reservas"]
)


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


class ReservaPaquete(BaseModel):
    paquete_id: Optional[str] = ""
    paquete_nombre: str
    precio_referencial: float = 0
    nombre_cliente: str
    email_cliente: str
    telefono_cliente: str
    fecha_viaje: str
    numero_pasajeros: int = 1
    comentarios: Optional[str] = ""
    tipo: Optional[str] = "Cultural"
    duracion: Optional[str] = ""
    fecha_solicitud: Optional[str] = None


@router.post("/paquete")
async def crear_reserva_paquete(reserva: ReservaPaquete, request: Request):
    conexion = obtener_conexion()
    if not conexion:
        raise HTTPException(status_code=500, detail=tr(request, "error_conexion_db"))

    try:
        with conexion.cursor() as cursor:
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
            paquete_id_val = int(reserva.paquete_id) if reserva.paquete_id and reserva.paquete_id.isdigit() else None

            cursor.execute(sql, (
                paquete_id_val,
                reserva.paquete_nombre,
                reserva.precio_referencial,
                reserva.nombre_cliente,
                reserva.email_cliente,
                reserva.telefono_cliente,
                reserva.fecha_viaje,
                reserva.numero_pasajeros,
                reserva.comentarios or "",
                reserva.tipo,
                reserva.duracion,
                reserva.fecha_solicitud or now
            ))

            reserva_id = cursor.lastrowid
            conexion.commit()

            return {
                "status": "success",
                "message": tr(request, "reserva_creada"),
                "reserva_id": reserva_id
            }

    except Exception as e:
        conexion.rollback()
        print(f"❌ Error en MySQL: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")
    finally:
        conexion.close()


@router.post("/")
async def crear_reserva(reserva: ReservaCompleta, request: Request):
    print("=" * 50)
    print("📥 Recibida reserva")
    print(f"   Cliente: {reserva.cliente.nombre}")
    print(f"   Destinos: {reserva.totalDestinos}")
    print("=" * 50)

    conexion = obtener_conexion()
    if not conexion:
        raise HTTPException(status_code=500, detail=tr(request, "error_conexion_db"))

    try:
        with conexion.cursor() as cursor:
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
            primer_destino = reserva.itinerario[0] if reserva.itinerario else None
            nombres_destinos = ", ".join([d.lugar for d in reserva.itinerario])
            tipos_str = ", ".join(reserva.estadisticas.tipos)

            cursor.execute(sql, (
                "",
                nombres_destinos,
                0,
                reserva.cliente.nombre,
                reserva.cliente.email,
                reserva.cliente.telefono,
                primer_destino.fechaInicio if primer_destino else now,
                reserva.totalDestinos,
                reserva.cliente.comentarios or "",
                tipos_str,
                f"{reserva.totalDias} días",
                now
            ))

            reserva_id = cursor.lastrowid
            conexion.commit()
            print(f"✅ Reserva guardada con ID: {reserva_id}")

            return {
                "status": "success",
                "message": tr(request, "reserva_creada"),
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
async def listar_reservas(request: Request):
    conexion = obtener_conexion()
    if not conexion:
        raise HTTPException(status_code=500, detail=tr(request, "error_conexion"))

    try:
        with conexion.cursor(dictionary=True) as cursor:
            cursor.execute("""
                SELECT * FROM reservas
                ORDER BY fecha_solicitud DESC
            """)
            reservas = cursor.fetchall()

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
async def obtener_reserva(reserva_id: int, request: Request):
    conexion = obtener_conexion()
    if not conexion:
        raise HTTPException(status_code=500, detail=tr(request, "error_conexion"))

    try:
        with conexion.cursor(dictionary=True) as cursor:
            cursor.execute("SELECT * FROM reservas WHERE id = %s", (reserva_id,))
            reserva = cursor.fetchone()

            if not reserva:
                raise HTTPException(status_code=404, detail=tr(request, "reserva_no_encontrada"))

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
