import mysql.connector
from mysql.connector import Error

def obtener_conexion():
    try:
        # Declaramos el diccionario config de manera correcta
        config = {
            'host': '193.203.175.228',
            'port': 3306,
            'database': 'u796907883_agenciaGTP',
            'user': 'u796907883_agenciaGTP',
            'password': 'Agencia#26',
            'raise_on_warnings': True
        }
        
        # Conectamos usando los parámetros correctos
        conexion = mysql.connector.connect(**config)
        
        if conexion.is_connected():
            return conexion
        else:
            print("No se pudo establecer conexión con la base de datos.")
            return None
    except Error as e:
        print(f"Error crítico al conectar a Hostinger: {e}")
        return None