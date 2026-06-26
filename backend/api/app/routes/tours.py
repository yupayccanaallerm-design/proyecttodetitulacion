import base64
import os
from fastapi import APIRouter, HTTPException, Request, UploadFile, File, Form, Query
from database import obtener_conexion
from ..i18n import tr, translate_content

router = APIRouter(
    prefix="/api",
    tags=["Visión e Imágenes"]
)


@router.post("/tours")
async def registrar_tour(
    request: Request,
    nombre: str = Form(...),
    zona_geografica: str = Form(...),
    descripcion: str = Form(...),
    itinerario: str = Form(...),
    inclusiones: str = Form(...),
    estado: int = Form(1),
    imagen: UploadFile = File(...)
):
    conexion = obtener_conexion()
    if not conexion:
        raise HTTPException(status_code=500, detail=tr(request, "error_conexion_db"))

    try:
        contenido_bytes = await imagen.read()
        base64_encoded = base64.b64encode(contenido_bytes).decode('utf-8')

        tipo_contenido = imagen.content_type or "image/jpeg"
        string_imagen_base64 = f"data:{tipo_contenido};base64,{base64_encoded}"

        with conexion.cursor() as cursor:
            sql_tour = """
                INSERT INTO tours (nombre, zona_geografica, descripcion, itinerario, inclusiones, estado)
                VALUES (%s, %s, %s, %s, %s, %s)
            """
            cursor.execute(sql_tour, (nombre, zona_geografica, descripcion, itinerario, inclusiones, estado))
            tour_id = cursor.lastrowid

            sql_imagen = """
                INSERT INTO tour_imagenes (tour_id, imagen_url)
                VALUES (%s, %s)
            """
            cursor.execute(sql_imagen, (tour_id, string_imagen_base64))

        conexion.commit()
        return {
            "status": "success",
            "message": tr(request, "tour_registrado"),
            "tour_id": tour_id
        }

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
            sql = """
                SELECT t.id, t.nombre, t.zona_geografica, t.descripcion,
                       t.itinerario, t.inclusiones, t.estado, ti.imagen_url
                FROM tours t
                LEFT JOIN tour_imagenes ti ON t.id = ti.tour_id
                WHERE t.estado = 1
                ORDER BY t.id DESC
            """
            cursor.execute(sql)
            rows = cursor.fetchall()
            if lang != "es":
                for row in rows:
                    row["descripcion"] = translate_content(row.get("descripcion", ""), lang)
            return rows
    finally:
        conexion.close()


@router.get("/tours/{id}")
async def obtener_tour(id: int, request: Request):
    conexion = obtener_conexion()
    try:
        with conexion.cursor(dictionary=True) as cursor:
            sql = """
                SELECT t.id, t.nombre, t.zona_geografica, t.descripcion,
                       t.itinerario, t.inclusiones, ti.imagen_url
                FROM tours t
                LEFT JOIN tour_imagenes ti ON t.id = ti.tour_id
                WHERE t.id = %s
            """
            cursor.execute(sql, (id,))
            resultado = cursor.fetchone()
            if not resultado:
                raise HTTPException(status_code=404, detail=tr(request, "tour_no_encontrado"))
            return resultado
    finally:
        conexion.close()
