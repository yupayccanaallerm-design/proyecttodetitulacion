"""
Módulo de autenticación y autorización para rutas administrativas.
Implementa un token store en memoria válido por sesión del servidor.
"""
from threading import Lock
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

_token_store: dict[str, int] = {}
_store_lock = Lock()

_http_bearer = HTTPBearer(auto_error=False)


def store_token(token: str, user_id: int) -> None:
    with _store_lock:
        _token_store[token] = user_id


def revoke_token(token: str) -> None:
    with _store_lock:
        _token_store.pop(token, None)


def require_admin(
    credentials: HTTPAuthorizationCredentials = Security(_http_bearer),
) -> int:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Autenticación requerida",
            headers={"WWW-Authenticate": "Bearer"},
        )
    with _store_lock:
        user_id = _token_store.get(credentials.credentials)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user_id
