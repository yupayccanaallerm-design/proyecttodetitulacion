import tensorflow as tf
from tensorflow.keras.preprocessing import image
import numpy as np
import os

BASE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..")
)

MODEL_DIR = os.path.join(BASE_DIR, "trained_models")

model_path = os.path.join(MODEL_DIR, "mejor_modelo.keras")
clases_path = os.path.join(MODEL_DIR, "clases.txt")
test_image = os.path.join(os.path.dirname(__file__), "tests.jpg")

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