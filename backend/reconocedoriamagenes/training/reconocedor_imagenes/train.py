import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import os

# =========================
# CONFIGURACIÓN
# =========================

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

data_dir = r'E:\Modelo_imagenes\datasets'
model_dir = r'E:\Modelo_imagenes\trained_models'

os.makedirs(model_dir, exist_ok=True)

print(f"📁 Dataset: {data_dir}")

# =========================
# DATA AUGMENTATION
# =========================

train_datagen = ImageDataGenerator(
    rescale=1./255,
    validation_split=0.2,

    rotation_range=20,
    zoom_range=0.20,
    width_shift_range=0.15,
    height_shift_range=0.15,
    shear_range=0.15,

    horizontal_flip=True,
    fill_mode='nearest'
)

# =========================
# TRAIN
# =========================

train_generator = train_datagen.flow_from_directory(
    data_dir,
    target_size=(224, 224),
    batch_size=32,
    class_mode='categorical',
    subset='training',
    shuffle=True
)

# =========================
# VALIDATION
# =========================

validation_generator = train_datagen.flow_from_directory(
    data_dir,
    target_size=(224, 224),
    batch_size=32,
    class_mode='categorical',
    subset='validation',
    shuffle=False
)

# =========================
# CLASES
# =========================

print("\n📋 Clases detectadas:")

for nombre, indice in train_generator.class_indices.items():
    print(f"{indice}: {nombre}")

num_classes = len(train_generator.class_indices)

# =========================
# MOBILENETV2
# =========================

base_model = tf.keras.applications.MobileNetV2(
    input_shape=(224, 224, 3),
    include_top=False,
    weights='imagenet'
)

# Congelar pesos
base_model.trainable = False

model = tf.keras.Sequential([
    base_model,

    tf.keras.layers.GlobalAveragePooling2D(),

    tf.keras.layers.Dense(
        256,
        activation='relu'
    ),

    tf.keras.layers.Dropout(0.4),

    tf.keras.layers.Dense(
        num_classes,
        activation='softmax'
    )
])

# =========================
# COMPILAR
# =========================

model.compile(
    optimizer='adam',
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

model.summary()

# =========================
# CALLBACKS
# =========================

checkpoint = tf.keras.callbacks.ModelCheckpoint(
    os.path.join(model_dir, "mejor_modelo.keras"),
    monitor="val_accuracy",
    save_best_only=True,
    verbose=1
)

early_stop = tf.keras.callbacks.EarlyStopping(
    monitor="val_accuracy",
    patience=8,
    restore_best_weights=True,
    verbose=1
)

reduce_lr = tf.keras.callbacks.ReduceLROnPlateau(
    monitor='val_loss',
    factor=0.5,
    patience=3,
    min_lr=1e-6,
    verbose=1
)

# =========================
# ENTRENAMIENTO
# =========================

print("\n🚀 Entrenando modelo...")

history = model.fit(
    train_generator,
    validation_data=validation_generator,
    epochs=25,
    callbacks=[
        checkpoint,
        early_stop,
        reduce_lr
    ]
)

# =========================
# GUARDAR MODELO FINAL
# =========================

ruta_final = os.path.join(
    model_dir,
    "modelo_final.keras"
)

model.save(ruta_final)

print("\n✅ Modelo guardado:")
print(ruta_final)

# =========================
# RESULTADOS
# =========================

print(
    f"\n📊 Mejor accuracy entrenamiento: "
    f"{max(history.history['accuracy']):.2%}"
)

print(
    f"📊 Mejor accuracy validación: "
    f"{max(history.history['val_accuracy']):.2%}"
)

# =========================
# GUARDAR CLASES
# =========================

with open(
    os.path.join(model_dir, "clases.txt"),
    "w",
    encoding="utf-8"
) as f:

    for clase in train_generator.class_indices:
        f.write(clase + "\n")

print("✅ clases.txt guardado")