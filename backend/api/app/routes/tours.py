import base64
import json
import os
from fastapi import APIRouter, HTTPException, Request, UploadFile, File, Form, Query
from ...database import obtener_conexion
from ..i18n import tr, translate_content

router = APIRouter(prefix="/api", tags=["Tours"])


@router.post("/tours")
async def registrar_tour(
    request: Request,
    nombre: str = Form(...),
    zona_geografica: str = Form(...),
    descripcion: str = Form(...),
    itinerario: str = Form(...),
    inclusiones: str = Form(...),
    estado: int = Form(1),
    imagen: UploadFile = File(...),
):
    conexion = obtener_conexion()
    if not conexion:
        raise HTTPException(status_code=500, detail=tr(request, "error_conexion_db"))
    try:
        contenido_bytes = await imagen.read()
        base64_encoded = base64.b64encode(contenido_bytes).decode("utf-8")
        tipo_contenido = imagen.content_type or "image/jpeg"
        string_imagen = f"data:{tipo_contenido};base64,{base64_encoded}"

        with conexion.cursor() as cursor:
            cursor.execute(
                "INSERT INTO tours (nombre, zona_geografica, descripcion, itinerario, inclusiones, estado) VALUES (%s, %s, %s, %s, %s, %s)",
                (nombre, zona_geografica, descripcion, itinerario, inclusiones, estado),
            )
            tour_id = cursor.lastrowid
            cursor.execute(
                "INSERT INTO tour_imagenes (tour_id, imagen_url) VALUES (%s, %s)",
                (tour_id, string_imagen),
            )
        conexion.commit()
        return {"status": "success", "message": tr(request, "tour_registrado"), "tour_id": tour_id}
    except Exception as e:
        conexion.rollback()
        raise HTTPException(status_code=400, detail=f"{tr(request, 'error_registrar_tour')}: {str(e)}")
    finally:
        conexion.close()


@router.get("/tours")
async def listar_tours(lang: str = Query("es")):
    conexion = obtener_conexion()
    try:
        with conexion.cursor(dictionary=True) as cursor:
            cursor.execute(
                """
                SELECT t.id, t.nombre, t.zona_geografica, t.descripcion,
                       t.itinerario, t.inclusiones, t.estado, ti.imagen_url
                FROM tours t
                LEFT JOIN tour_imagenes ti ON t.id = ti.tour_id
                WHERE t.estado = 1
                ORDER BY t.id DESC
                """
            )
            rows = cursor.fetchall()
            if lang != "es":
                for row in rows:
                    row["descripcion"] = translate_content(row.get("descripcion", ""), lang)
            return rows
    finally:
        conexion.close()


@router.get("/tours/admin/todos")
async def listar_todos_tours():
    """Lista todos los tours (incluyendo inactivos) para el panel admin."""
    conexion = obtener_conexion()
    try:
        with conexion.cursor(dictionary=True) as cursor:
            cursor.execute(
                """
                SELECT t.id, t.nombre, t.zona_geografica, t.descripcion,
                       t.itinerario, t.inclusiones, t.estado, ti.imagen_url
                FROM tours t
                LEFT JOIN tour_imagenes ti ON t.id = ti.tour_id
                ORDER BY t.id DESC
                """
            )
            return cursor.fetchall()
    finally:
        conexion.close()


@router.get("/tours/{id}")
async def obtener_tour(id: int, request: Request):
    conexion = obtener_conexion()
    try:
        with conexion.cursor(dictionary=True) as cursor:
            cursor.execute(
                """
                SELECT t.id, t.nombre, t.zona_geografica, t.descripcion,
                       t.itinerario, t.inclusiones, ti.imagen_url
                FROM tours t
                LEFT JOIN tour_imagenes ti ON t.id = ti.tour_id
                WHERE t.id = %s
                """,
                (id,),
            )
            resultado = cursor.fetchone()
            if not resultado:
                raise HTTPException(status_code=404, detail=tr(request, "tour_no_encontrado"))
            return resultado
    finally:
        conexion.close()


@router.put("/tours/{id}")
async def actualizar_tour(
    id: int,
    request: Request,
    nombre: str = Form(...),
    zona_geografica: str = Form(...),
    descripcion: str = Form(...),
    itinerario: str = Form(...),
    inclusiones: str = Form(...),
    estado: int = Form(1),
    imagen: UploadFile = File(None),
):
    conexion = obtener_conexion()
    if not conexion:
        raise HTTPException(status_code=500, detail=tr(request, "error_conexion_db"))
    try:
        with conexion.cursor() as cursor:
            cursor.execute("SELECT id FROM tours WHERE id = %s", (id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail=tr(request, "tour_no_encontrado"))

            cursor.execute(
                """UPDATE tours SET nombre = %s, zona_geografica = %s, descripcion = %s,
                   itinerario = %s, inclusiones = %s, estado = %s, updated_at = NOW()
                   WHERE id = %s""",
                (nombre, zona_geografica, descripcion, itinerario, inclusiones, estado, id),
            )

            if imagen and imagen.filename:
                contenido_bytes = await imagen.read()
                base64_encoded = base64.b64encode(contenido_bytes).decode("utf-8")
                tipo_contenido = imagen.content_type or "image/jpeg"
                string_imagen = f"data:{tipo_contenido};base64,{base64_encoded}"
                cursor.execute("SELECT id FROM tour_imagenes WHERE tour_id = %s LIMIT 1", (id,))
                if cursor.fetchone():
                    cursor.execute(
                        "UPDATE tour_imagenes SET imagen_url = %s WHERE tour_id = %s",
                        (string_imagen, id),
                    )
                else:
                    cursor.execute(
                        "INSERT INTO tour_imagenes (tour_id, imagen_url) VALUES (%s, %s)",
                        (id, string_imagen),
                    )
        conexion.commit()
        return {"status": "success", "message": tr(request, "tour_actualizado")}
    except HTTPException:
        raise
    except Exception as e:
        conexion.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conexion.close()


@router.delete("/tours/{id}")
async def eliminar_tour(id: int, request: Request):
    conexion = obtener_conexion()
    if not conexion:
        raise HTTPException(status_code=500, detail=tr(request, "error_conexion_db"))
    try:
        with conexion.cursor() as cursor:
            cursor.execute(
                "UPDATE tours SET estado = 0, updated_at = NOW() WHERE id = %s", (id,)
            )
        conexion.commit()
        return {"status": "success", "message": tr(request, "tour_eliminado")}
    except Exception as e:
        conexion.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conexion.close()
