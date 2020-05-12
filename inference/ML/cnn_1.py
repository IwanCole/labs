'''
Script used to train a model on 4 classes (live demo at https://labs.iwancole.me/inference)
'''

import os
import numpy as np
from PIL import Image
from tensorflow import keras
from helpers import load_image

TARGET_CLASSES = ['cat',
                  'dog',
                  'fish',
                  'bird']
INPUT_DIR = 'D:\\sketch_data\\'
NUM_SAMPLES = 20000
VAL_SPLIT = 0.2
TOTAL_SAMPLES = NUM_SAMPLES * len(TARGET_CLASSES)

# Read in data
labelNames = os.listdir(INPUT_DIR)
labelNames = [label for label in labelNames if label in TARGET_CLASSES]

# Create label encodings
encodedLabels = {}
for i, label in enumerate(labelNames): encodedLabels[label] = i

allData = []
allLabels = []

# Flatten images to be binary
norm = np.vectorize(lambda x: 0 if x < 128 else 1)
for label in labelNames:
    print(f'Loading {label} samples...')
    allSamples = os.listdir(f'{INPUT_DIR}{label}')
    count = 0
    for sample in allSamples:
        img = load_image(f'{INPUT_DIR}{label}\\{sample}')
        allData.append(img)
        allLabels.append(encodedLabels[label])
        count += 1
        if count == NUM_SAMPLES: break

print('Loaded data. Pre-processing...')
perm = np.random.permutation(TOTAL_SAMPLES)
allData = np.asarray(allData)
allData = allData.reshape(TOTAL_SAMPLES, 100, 100, 1)
allLabels = np.asarray(allLabels)

allData = allData[perm]
allLabels = allLabels[perm]

print('Building model...')
# Build model
model = keras.Sequential()
# Adding bigger strides reduces training time
model.add(keras.layers.Conv2D(32, kernel_size=11, strides=(4, 4), padding='same', activation='relu', input_shape=(100,100,1)))
model.add(keras.layers.MaxPooling2D(pool_size=(3,3), strides=(2,2), padding='same'))
model.add(keras.layers.Conv2D(64, kernel_size=3, strides=(1, 1), padding='same', activation='relu'))
model.add(keras.layers.MaxPooling2D(pool_size=(3,3), strides=(2,2), padding='same'))
model.add(keras.layers.Conv2D(64, kernel_size=3, strides=(1, 1), padding='same', activation='relu'))
model.add(keras.layers.Flatten())
model.add(keras.layers.Dense(100, activation='relu'))
model.add(keras.layers.Dense(4, activation='softmax'))

model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
print(model.summary())
print('Training model...')
model.fit(allData, allLabels, validation_split=VAL_SPLIT, epochs=10)

model.save('model_name_here.h5')
