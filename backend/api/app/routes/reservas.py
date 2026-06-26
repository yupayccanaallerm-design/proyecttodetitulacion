from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, List
import random
import string
from database import obtener_conexion
from ..i18n import tr

router = APIRouter(prefix="/api/reservas", tags=["Reservas"])


def _generar_codigo() -> str:
    sufijo = "".join(random.choices(string.ascii_uppercase + string.digits, k=8))
    return f"RES-{sufijo}"


def _obtener_o_crear_cliente(cursor, nombre: str, email: str, telefono: str) -> int:
    cursor.execute("SELECT id FROM clientes WHERE email = %s LIMIT 1", (email,))
    fila = cursor.fetchone()
    if fila:
        cursor.execute(
            "UPDATE clientes SET nombre = %s, telefono = %s, updated_at = NOW() WHERE id = %s",
            (nombre, telefono, fila[0])
        )
        return fila[0]
    cursor.execute(
        "INSERT INTO clientes (nombre, email, telefono, created_at, updated_at) VALUES (%s, %s, %s, NOW(), NOW())",
        (nombre, email, telefono)
    )
    return cursor.lastrowid


class ReservaPaqueteRequest(BaseModel):
    paquete_id: Optional[str] = ""
    paquete_nombre: Optional[str] = ""
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
    usuario_id: Optional[int] = None


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


class ReservaItinerario(BaseModel):
    cliente: ClienteData
    itinerario: List[ItinerarioItem]
    totalDias: int
    totalDestinos: int
    estadisticas: EstadisticasData
    fechaReserva: str
    usuario_id: Optional[int] = None


class ActualizarEstadoRequest(BaseModel):
    estado: str


@router.post("/paquete")
async def crear_reserva_paquete(reserva: ReservaPaqueteRequest, request: Request):
    conexion = obtener_conexion()
    if not conexion:
        raise HTTPException(status_code=500, detail=tr(request, "error_conexion_db"))
    try:
        with conexion.cursor() as cursor:
            cliente_id = _obtener_o_crear_cliente(
                cursor,
                reserva.nombre_cliente,
                reserva.email_cliente,
                reserva.telefono_cliente,
            )
            paquete_id_val = (
                int(reserva.paquete_id)
                if reserva.paquete_id and str(reserva.paquete_id).isdigit()
                else None
            )
            monto = reserva.precio_referencial * reserva.numero_pasajeros
            codigo = _generar_codigo()
            cursor.execute(
                """
                INSERT INTO reservas (
                    codigo, cliente_id, usuario_id, paquete_id,
                    fecha_viaje, num_personas, monto_total,
                    estado, notas, created_at, updated_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                """,
                (
                    codigo,
                    cliente_id,
                    reserva.usuario_id,
                    paquete_id_val,
                    reserva.fecha_viaje,
                    reserva.numero_pasajeros,
                    monto,
                    "pendiente",
                    reserva.comentarios or "",
                ),
            )
            reserva_id = cursor.lastrowid
        conexion.commit()
        return {
            "status": "success",
            "message": tr(request, "reserva_creada"),
            "reserva_id": reserva_id,
            "codigo": codigo,
        }
    except Exception as e:
        conexion.rollback()
        print(f"Error creando reserva paquete: {e}")
        raise HTTPException(status_code=400, detail=f"{tr(request, 'error_detalle')}: {str(e)}")
    finally:
        conexion.close()


@router.post("/")
async def crear_reserva_itinerario(reserva: ReservaItinerario, request: Request):
    conexion = obtener_conexion()
    if not conexion:
        raise HTTPException(status_code=500, detail=tr(request, "error_conexion_db"))
    try:
        with conexion.cursor() as cursor:
            cliente_id = _obtener_o_crear_cliente(
                cursor,
                reserva.cliente.nombre,
                reserva.cliente.email,
                reserva.cliente.telefono,
            )
            primer_fecha = (
                reserva.itinerario[0].fechaInicio
                if reserva.itinerario
                else reserva.fechaReserva[:10]
            )
            lugares = ", ".join(d.lugar for d in reserva.itinerario)
            notas = f"Itinerario: {lugares}. {reserva.cliente.comentarios or ''}".strip()
            codigo = _generar_codigo()
            cursor.execute(
                """
                INSERT INTO reservas (
                    codigo, cliente_id, usuario_id,
                    fecha_viaje, num_personas, monto_total,
                    estado, notas, created_at, updated_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                """,
                (
                    codigo,
                    cliente_id,
                    reserva.usuario_id,
                    primer_fecha,
                    reserva.totalDestinos,
                    0,
                    "pendiente",
                    notas,
                ),
            )
            reserva_id = cursor.lastrowid
        conexion.commit()
        return {
            "status": "success",
            "message": tr(request, "reserva_creada"),
            "reserva_id": reserva_id,
            "codigo": codigo,
        }
    except Exception as e:
        conexion.rollback()
        print(f"Error creando reserva itinerario: {e}")
        raise HTTPException(status_code=400, detail=f"{tr(request, 'error_detalle')}: {str(e)}")
    finally:
        conexion.close()


@router.get("/")
async def listar_reservas(request: Request):
    conexion = obtener_conexion()
    if not conexion:
        raise HTTPException(status_code=500, detail=tr(request, "error_conexion"))
    try:
        with conexion.cursor(dictionary=True) as cursor:
            cursor.execute(
                """
                SELECT
                    r.id,
                    r.codigo,
                    r.estado,
                    r.estado_ia,
                    r.fecha_viaje,
                    r.num_personas  AS numero_pasajeros,
                    r.monto_total,
                    r.notas         AS comentarios,
                    r.paquete_id,
                    r.usuario_id,
                    r.created_at    AS fecha_solicitud,
                    r.updated_at,
                    c.nombre        AS nombre_cliente,
                    c.email         AS email_cliente,
                    c.telefono      AS telefono_cliente,
                    p.nombre        AS paquete_nombre,
                    p.precio_sugerido AS precio_referencial,
                    p.duracion_dias AS duracion,
                    p.perfil_usuario AS tipo
                FROM reservas r
                LEFT JOIN clientes c ON r.cliente_id = c.id
                LEFT JOIN paquetes p ON r.paquete_id = p.id
                ORDER BY r.created_at DESC
                """
            )
            reservas = cursor.fetchall()
            for r in reservas:
                for campo in ("fecha_viaje", "fecha_solicitud", "updated_at"):
                    if r.get(campo) and hasattr(r[campo], "strftime"):
                        r[campo] = r[campo].strftime("%Y-%m-%d %H:%M:%S")
        return {"reservas": reservas, "total": len(reservas)}
    except Exception as e:
        print(f"Error listando reservas: {e}")
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
            cursor.execute(
                """
                SELECT r.*,
                    c.nombre  AS nombre_cliente,
                    c.email   AS email_cliente,
                    c.telefono AS telefono_cliente,
                    p.nombre  AS paquete_nombre
                FROM reservas r
                LEFT JOIN clientes c ON r.cliente_id = c.id
                LEFT JOIN paquetes p ON r.paquete_id = p.id
                WHERE r.id = %s
                """,
                (reserva_id,),
            )
            reserva = cursor.fetchone()
            if not reserva:
                raise HTTPException(status_code=404, detail=tr(request, "reserva_no_encontrada"))
            for campo in ("fecha_viaje", "created_at", "updated_at"):
                if reserva.get(campo) and hasattr(reserva[campo], "strftime"):
                    reserva[campo] = reserva[campo].strftime("%Y-%m-%d %H:%M:%S")
            return reserva
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conexion.close()


@router.put("/{reserva_id}/estado")
async def actualizar_estado_reserva(
    reserva_id: int, data: ActualizarEstadoRequest, request: Request
):
    conexion = obtener_conexion()
    if not conexion:
        raise HTTPException(status_code=500, detail=tr(request, "error_conexion"))
    try:
        with conexion.cursor() as cursor:
            cursor.execute(
                "UPDATE reservas SET estado = %s, updated_at = NOW() WHERE id = %s",
                (data.estado, reserva_id),
            )
        conexion.commit()
        return {"status": "success", "message": tr(request, "reserva_actualizada")}
    except Exception as e:
        conexion.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conexion.close()
