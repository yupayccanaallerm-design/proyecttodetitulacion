import tensorflow as tf
from tensorflow.keras.preprocessing import image
import numpy as np
import os

# Configuración
model_path = r'E:\Modelo_imagenes\trained_models\mejor_modelo.keras'  # Cambia a modelo_final.keras si quieres
clases_path = r'E:\Modelo_imagenes\trained_models\clases.txt'
test_image = r'inference\tests.jpg'  # Cambia por tu imagen de test

# Cargar clases
with open(clases_path, 'r', encoding='utf-8') as f:
    class_names = [linea.strip() for linea in f.readlines()]

# Cargar modelo
print(f"📚 Modelo: {os.path.basename(model_path)}")
print(f"🎯 Clases: {len(class_names)}")
model = tf.keras.models.load_model(model_path)
print("✅ Listo!\n")

# Probar imagen
if os.path.exists(test_image):
    img = image.load_img(test_image, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0) / 255.0
    
    pred = model.predict(img_array, verbose=0)
    idx = np.argmax(pred[0])
    
    print(f"📸 {os.path.basename(test_image)}")
    print(f"🎯 → {class_names[idx]} ({pred[0][idx]:.2%})")
else:
    print(f"❌ No encuentra: {test_image}")