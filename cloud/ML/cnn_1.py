import os
import numpy as np
from PIL import Image
from tensorflow import keras
from helpers import load_image

INPUT_DIR = 'C:\\Users\\Iwan\\Desktop\\sketch_data\\'
NUM_SAMPLES = 3500
VAL_SPLIT = 0.2

# Read in data
labelNames = os.listdir(INPUT_DIR)

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
    for sample in allSamples:
        img = load_image(f'{INPUT_DIR}{label}\\{sample}')
        allData.append(img)
        allLabels.append(encodedLabels[label])


perm = np.random.permutation(12000)
allData = np.asarray(allData)
allData = allData.reshape(12000, 100, 100, 1)
allLabels = np.asarray(allLabels)

allData = allData[perm]
allLabels = allLabels[perm]


# Build model
model = keras.Sequential()
# Adding bigger strides reduces training time
model.add(keras.layers.Conv2D(32, kernel_size=11, strides=(2, 2), activation='relu', input_shape=(100,100,1)))
model.add(keras.layers.Conv2D(32, kernel_size=5, strides=(2, 2), activation='relu'))
model.add(keras.layers.Conv2D(64, kernel_size=3, activation='relu'))

model.add(keras.layers.Flatten())
model.add(keras.layers.Dense(4, activation='softmax'))

model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])

model.fit(allData[:NUM_SAMPLES], allLabels[:NUM_SAMPLES], validation_split=VAL_SPLIT, epochs=5)

model.save('testModel.h5')


# Train
