from fastapi import APIRouter, HTTPException, Request
from ...database import obtener_conexion
from ..i18n import tr

router = APIRouter(prefix="/api/clientes", tags=["Clientes"])


@router.get("")
async def listar_clientes(request: Request):
    conexion = obtener_conexion()
    if not conexion:
        raise HTTPException(status_code=500, detail=tr(request, "error_conexion_db"))
    try:
        with conexion.cursor(dictionary=True) as cursor:
            cursor.execute(
                """
                SELECT
                    c.id,
                    c.nombre,
                    c.email,
                    c.telefono,
                    c.pais_procedencia,
                    c.idioma,
                    c.created_at,
                    COUNT(r.id)      AS total_reservas,
                    MAX(r.created_at) AS ultima_reserva,
                    MAX(r.estado)    AS ultimo_estado
                FROM clientes c
                LEFT JOIN reservas r ON r.cliente_id = c.id
                GROUP BY c.id
                ORDER BY c.created_at DESC
                """
            )
            clientes = cursor.fetchall()
            for c in clientes:
                if c.get("created_at") and hasattr(c["created_at"], "strftime"):
                    c["created_at"] = c["created_at"].strftime("%Y-%m-%d %H:%M:%S")
                if c.get("ultima_reserva") and hasattr(c["ultima_reserva"], "strftime"):
                    c["ultima_reserva"] = c["ultima_reserva"].strftime("%Y-%m-%d %H:%M:%S")
        return {"clientes": clientes, "total": len(clientes)}
    except Exception as e:
        print(f"Error listando clientes: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conexion.close()


@router.get("/{cliente_id}/reservas")
async def historial_cliente(cliente_id: int, request: Request):
    conexion = obtener_conexion()
    if not conexion:
        raise HTTPException(status_code=500, detail=tr(request, "error_conexion_db"))
    try:
        with conexion.cursor(dictionary=True) as cursor:
            cursor.execute(
                "SELECT id, nombre, email, telefono, pais_procedencia, idioma, created_at FROM clientes WHERE id = %s",
                (cliente_id,),
            )
            cliente = cursor.fetchone()
            if not cliente:
                raise HTTPException(status_code=404, detail="Cliente no encontrado")
            if cliente.get("created_at") and hasattr(cliente["created_at"], "strftime"):
                cliente["created_at"] = cliente["created_at"].strftime("%Y-%m-%d %H:%M:%S")

            cursor.execute(
                """
                SELECT
                    r.id, r.codigo, r.estado, r.fecha_viaje, r.num_personas,
                    r.monto_total, r.notas, r.created_at,
                    p.nombre AS paquete_nombre
                FROM reservas r
                LEFT JOIN paquetes p ON r.paquete_id = p.id
                WHERE r.cliente_id = %s
                ORDER BY r.created_at DESC
                """,
                (cliente_id,),
            )
            reservas = cursor.fetchall()
            for r in reservas:
                for campo in ("fecha_viaje", "created_at"):
                    if r.get(campo) and hasattr(r[campo], "strftime"):
                        r[campo] = r[campo].strftime("%Y-%m-%d %H:%M:%S")

        return {"cliente": cliente, "reservas": reservas, "total": len(reservas)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conexion.close()
