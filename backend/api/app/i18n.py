from fastapi import Request

try:
    from deep_translator import GoogleTranslator
    _TRANSLATOR_AVAILABLE = True
except ImportError:
    _TRANSLATOR_AVAILABLE = False


def translate_content(text: str, target_lang: str) -> str:
    """Traduce contenido dinámico de la BD usando Google Translate. Sin cambio si lang=es."""
    if not text or target_lang == "es" or not _TRANSLATOR_AVAILABLE:
        return text
    try:
        return GoogleTranslator(source="es", target=target_lang).translate(text[:4500]) or text
    except Exception:
        return text


MESSAGES = {
    "es": {
        # Auth
        "login_exitoso": "¡Inicio de sesión exitoso!",
        "credenciales_invalidas": "El correo o la contraseña son incorrectos.",
        # DB
        "error_conexion_db": "Error de conexión a la base de datos",
        "error_conexion": "Error de conexión",
        # Tours
        "tour_no_encontrado": "Tour no encontrado",
        "tour_registrado": "Tour e imagen indexados en la BD de forma binaria-base64",
        "error_registrar_tour": "Error al registrar en MySQL",
        # Paquetes
        "paquete_no_encontrado": "Paquete no encontrado",
        "paquete_creado": "Paquete creado exitosamente",
        "paquete_actualizado": "Paquete actualizado exitosamente",
        "paquete_eliminado": "Paquete eliminado (desactivado) exitosamente",
        "error_mysql": "Error en MySQL",
        # Reservas
        "reserva_creada": "Reserva registrada exitosamente",
        "reserva_no_encontrada": "Reserva no encontrada",
        "reserva_actualizada": "Estado de reserva actualizado",
        # Tours nuevos
        "tour_actualizado": "Tour actualizado exitosamente",
        "tour_eliminado": "Tour desactivado exitosamente",
        # Usuarios
        "usuario_creado": "Usuario registrado con éxito",
        "usuario_no_encontrado": "Usuario no encontrado.",
        "perfil_actualizado": "Perfil actualizado correctamente.",
        "password_incorrecta": "La contraseña actual es incorrecta.",
        "password_cambiada": "Contraseña modificada exitosamente.",
        "usuario_editado": "Usuario modificado correctamente.",
        "usuario_eliminado": "Usuario eliminado correctamente.",
        "error_crear_usuario": "El correo ya existe o hubo un error",
        "error_actualizar": "Error al actualizar",
        "error_editar_usuario": "Error al editar usuario",
        "error_eliminar_usuario": "Error al eliminar usuario",
        "error_listar_usuarios": "Error en el servidor al listar",
        "error_detalle": "Error",
    },
    "en": {
        # Auth
        "login_exitoso": "Login successful!",
        "credenciales_invalidas": "Email or password is incorrect.",
        # DB
        "error_conexion_db": "Database connection error",
        "error_conexion": "Connection error",
        # Tours
        "tour_no_encontrado": "Tour not found",
        "tour_registrado": "Tour and image indexed in the database as base64",
        "error_registrar_tour": "Error registering in MySQL",
        # Paquetes
        "paquete_no_encontrado": "Package not found",
        "paquete_creado": "Package created successfully",
        "paquete_actualizado": "Package updated successfully",
        "paquete_eliminado": "Package deactivated successfully",
        "error_mysql": "MySQL error",
        # Reservas
        "reserva_creada": "Reservation registered successfully",
        "reserva_no_encontrada": "Reservation not found",
        "reserva_actualizada": "Reservation status updated",
        # Tours nuevos
        "tour_actualizado": "Tour updated successfully",
        "tour_eliminado": "Tour deactivated successfully",
        # Usuarios
        "usuario_creado": "User registered successfully",
        "usuario_no_encontrado": "User not found.",
        "perfil_actualizado": "Profile updated successfully.",
        "password_incorrecta": "Current password is incorrect.",
        "password_cambiada": "Password changed successfully.",
        "usuario_editado": "User updated successfully.",
        "usuario_eliminado": "User deleted successfully.",
        "error_crear_usuario": "Email already exists or an error occurred",
        "error_actualizar": "Error updating",
        "error_editar_usuario": "Error editing user",
        "error_eliminar_usuario": "Error deleting user",
        "error_listar_usuarios": "Server error while listing",
        "error_detalle": "Error",
    }
}


def get_lang(request: Request) -> str:
    """Detecta el idioma desde el header Accept-Language. Por defecto 'es'."""
    accept = request.headers.get("accept-language", "es")
    lang = accept.split(",")[0].split("-")[0].strip().lower()
    return lang if lang in MESSAGES else "es"


def tr(request: Request, key: str) -> str:
    """Retorna el mensaje traducido según el idioma del request."""
    lang = get_lang(request)
    return MESSAGES[lang].get(key, MESSAGES["es"].get(key, key))
