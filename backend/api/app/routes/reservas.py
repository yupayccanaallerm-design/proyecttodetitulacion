from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, List
import random
import string
from ...database import obtener_conexion

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


# ============================================================
# MODELOS
# ============================================================

class ReservaPaqueteRequest(BaseModel):
    paquete_id: Optional[str] = ""
    paquete_nombre: Optional[str] = ""
    tour_id: Optional[str] = ""  # ✅ AGREGADO
    tour_nombre: Optional[str] = ""  # ✅ AGREGADO
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


class ActualizarEstadoRequest(BaseModel):
    estado: str


# ============================================================
# ENDPOINTS
# ============================================================

@router.post("/paquete")
async def crear_reserva_paquete(reserva: ReservaPaqueteRequest, request: Request):
    """Crear reserva desde un paquete o tour"""
    conexion = obtener_conexion()
    if not conexion:
        raise HTTPException(status_code=500, detail="Error de conexión a la base de datos")
    
    try:
        with conexion.cursor() as cursor:
            # Crear o obtener cliente
            cliente_id = _obtener_o_crear_cliente(
                cursor,
                reserva.nombre_cliente,
                reserva.email_cliente,
                reserva.telefono_cliente,
            )
            
            # ✅ Validar paquete_id
            paquete_id_val = (
                int(reserva.paquete_id)
                if reserva.paquete_id and str(reserva.paquete_id).isdigit()
                else None
            )
            
            # ✅ Validar tour_id (NUEVO)
            tour_id_val = (
                int(reserva.tour_id)
                if reserva.tour_id and str(reserva.tour_id).isdigit()
                else None
            )
            
            # Calcular monto total
            monto = reserva.precio_referencial * reserva.numero_pasajeros
            codigo = _generar_codigo()
            
            # ✅ INSERT con paquete_id y tour_id
            cursor.execute(
                """
                INSERT INTO reservas (
                    codigo, cliente_id, paquete_id, tour_id,
                    fecha_viaje, num_personas, monto_total,
                    estado, notas, created_at, updated_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                """,
                (
                    codigo,
                    cliente_id,
                    paquete_id_val,
                    tour_id_val,  # ✅ AGREGADO
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
                "message": "Reserva creada exitosamente",
                "reserva_id": reserva_id,
                "codigo": codigo,
            }
            
    except Exception:
        conexion.rollback()
        raise HTTPException(status_code=500, detail="Error interno al crear la reserva")
    finally:
        conexion.close()


@router.post("/itinerario")
async def crear_reserva_itinerario(reserva: ReservaItinerario, request: Request):
    """Crear reserva desde el itinerario completo"""
    conexion = obtener_conexion()
    if not conexion:
        raise HTTPException(status_code=500, detail="Error de conexión a la base de datos")
    
    try:
        with conexion.cursor() as cursor:
            # Crear o obtener cliente
            cliente_id = _obtener_o_crear_cliente(
                cursor,
                reserva.cliente.nombre,
                reserva.cliente.email,
                reserva.cliente.telefono,
            )
            
            # Obtener primera fecha del itinerario
            primer_fecha = (
                reserva.itinerario[0].fechaInicio
                if reserva.itinerario
                else reserva.fechaReserva[:10]
            )
            
            # Lista de lugares
            lugares = ", ".join(d.lugar for d in reserva.itinerario)
            notas = f"Itinerario: {lugares}. {reserva.cliente.comentarios or ''}".strip()
            codigo = _generar_codigo()
            
            cursor.execute(
                """
                INSERT INTO reservas (
                    codigo, cliente_id,
                    fecha_viaje, num_personas, monto_total,
                    estado, notas, created_at, updated_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                """,
                (
                    codigo,
                    cliente_id,
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
                "message": "Reserva creada exitosamente",
                "reserva_id": reserva_id,
                "codigo": codigo,
            }
            
    except Exception:
        conexion.rollback()
        raise HTTPException(status_code=500, detail="Error interno al crear la reserva")
    finally:
        conexion.close()


@router.get("/")
async def listar_reservas(request: Request):
    """Listar todas las reservas con datos de clientes, paquetes y tours"""
    conexion = obtener_conexion()
    if not conexion:
        raise HTTPException(status_code=500, detail="Error de conexión")
    
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
                    r.num_personas AS numero_pasajeros,
                    r.monto_total,
                    r.notas AS comentarios,
                    r.paquete_id,
                    r.tour_id,
                    r.created_at AS fecha_solicitud,
                    r.updated_at,
                    c.nombre AS nombre_cliente,
                    c.email AS email_cliente,
                    c.telefono AS telefono_cliente,
                    p.nombre AS paquete_nombre,
                    p.precio_sugerido AS precio_referencial,
                    p.duracion_dias AS duracion,
                    p.perfil_usuario AS tipo,
                    t.nombre AS tour_nombre,
                    t.zona_geografica AS tour_zona
                FROM reservas r
                LEFT JOIN clientes c ON r.cliente_id = c.id
                LEFT JOIN paquetes p ON r.paquete_id = p.id
                LEFT JOIN tours t ON r.tour_id = t.id
                ORDER BY r.created_at DESC
                """
            )
            reservas = cursor.fetchall()
            
            # Formatear fechas
            for r in reservas:
                for campo in ("fecha_viaje", "fecha_solicitud", "updated_at"):
                    if r.get(campo) and hasattr(r[campo], "strftime"):
                        r[campo] = r[campo].strftime("%Y-%m-%d %H:%M:%S")
            
            return {"reservas": reservas, "total": len(reservas)}
            
    except Exception:
        raise HTTPException(status_code=500, detail="Error interno al listar reservas")
    finally:
        conexion.close()


@router.get("/{reserva_id}")
async def obtener_reserva(reserva_id: int, request: Request):
    """Obtener detalle de una reserva específica"""
    conexion = obtener_conexion()
    if not conexion:
        raise HTTPException(status_code=500, detail="Error de conexión")
    
    try:
        with conexion.cursor(dictionary=True) as cursor:
            cursor.execute(
                """
                SELECT 
                    r.*,
                    c.nombre AS nombre_cliente,
                    c.email AS email_cliente,
                    c.telefono AS telefono_cliente,
                    p.nombre AS paquete_nombre,
                    t.nombre AS tour_nombre
                FROM reservas r
                LEFT JOIN clientes c ON r.cliente_id = c.id
                LEFT JOIN paquetes p ON r.paquete_id = p.id
                LEFT JOIN tours t ON r.tour_id = t.id
                WHERE r.id = %s
                """,
                (reserva_id,),
            )
            reserva = cursor.fetchone()
            
            if not reserva:
                raise HTTPException(status_code=404, detail="Reserva no encontrada")
            
            # Formatear fechas
            for campo in ("fecha_viaje", "created_at", "updated_at"):
                if reserva.get(campo) and hasattr(reserva[campo], "strftime"):
                    reserva[campo] = reserva[campo].strftime("%Y-%m-%d %H:%M:%S")
            
            return reserva
            
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Error interno al obtener la reserva")
    finally:
        conexion.close()


@router.put("/{reserva_id}/estado")
async def actualizar_estado_reserva(
    reserva_id: int, data: ActualizarEstadoRequest, request: Request
):
    """Actualizar el estado de una reserva"""
    estados_validos = ["pendiente", "confirmada", "cancelada", "finalizada", "notificada"]
    
    if data.estado not in estados_validos:
        raise HTTPException(
            status_code=400, 
            detail=f"Estado inválido. Opciones: {', '.join(estados_validos)}"
        )
    
    conexion = obtener_conexion()
    if not conexion:
        raise HTTPException(status_code=500, detail="Error de conexión")
    
    try:
        with conexion.cursor() as cursor:
            cursor.execute(
                "UPDATE reservas SET estado = %s, updated_at = NOW() WHERE id = %s",
                (data.estado, reserva_id),
            )
            conexion.commit()
            
            return {
                "status": "success",
                "message": f"Estado actualizado a '{data.estado}'"
            }
            
    except Exception:
        conexion.rollback()
        raise HTTPException(status_code=500, detail="Error interno al actualizar el estado")
    finally:
        conexion.close()
