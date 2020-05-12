'''
Script used for generating a CNN to train on all 49 classes in the dataset.
'''

import os
import numpy as np
from PIL import Image
from tensorflow import keras
from helpers import load_image

INPUT_DIR = 'D:\\sketch_data\\'
NUM_SAMPLES = 10000
NUM_CLASSES = 49
BATCH_SIZE = 32
VAL_SPLIT = 0.2
TOTAL_SAMPLES = NUM_SAMPLES * NUM_CLASSES


class SketchGenerator(keras.utils.Sequence):
    def __init__(self, image_filenames, labels, batch_size):
        self.image_filenames = image_filenames
        self.labels = labels
        self.batch_size = batch_size

    def __len__(self):
        return (np.ceil(len(self.image_filenames) / float(self.batch_size))).astype(np.int)

    def __getitem__(self, idx):
        batch_x = self.image_filenames[idx * self.batch_size : (idx+1) * self.batch_size]
        batch_y = self.labels[idx * self.batch_size : (idx+1) * self.batch_size]

        return np.array([load_image(file_name) for file_name in batch_x]), np.array(batch_y)


# Read in data
classNames = os.listdir(INPUT_DIR)

# Create label encodings
allFilenames  = []
allLabels     = []
encodedLabels = {}
for i, label in enumerate(classNames): encodedLabels[label] = i


'''
Pre-requisite => Each of the 49 classes has 80,000 samples generated, and stored
in the format of:
    INPUT_DIR/className/className_n.jpg
where n in range(0,80000).
'''
for className in classNames:
    print(f'Loading {className} samples...')
    classLabel = encodedLabels[className]
    for n in range(NUM_SAMPLES):
        allFilenames.append(f'{INPUT_DIR}{className}\\{className}_{n}.jpg')
        allLabels.append(classLabel)


print('Loaded data. Pre-processing...')
allLabels = np.asarray(allLabels)
allFilenames = np.asarray(allFilenames)

perm      = np.random.permutation(TOTAL_SAMPLES)
allLabels = allLabels[perm]
allFilenames = allFilenames[perm]

dataSplit = int(TOTAL_SAMPLES*VAL_SPLIT)

trainData, trainLabels = allFilenames[:dataSplit*4], allLabels[:dataSplit*4]
valData, valLabels = allFilenames[dataSplit*4:], allLabels[dataSplit*4:]


trainGenerator = SketchGenerator(image_filenames=trainData, labels=trainLabels, batch_size=BATCH_SIZE)
valGenerator   = SketchGenerator(image_filenames=valData,   labels=valLabels,   batch_size=BATCH_SIZE)

print('Building model...')
# Build model
model = keras.Sequential()
# Adding bigger strides reduces training time
model.add(keras.layers.Conv2D(64, kernel_size=11, strides=(2, 2), padding='same', activation='relu', input_shape=(100,100,1)))
model.add(keras.layers.MaxPooling2D(pool_size=(3,3), strides=(2,2), padding='same'))
model.add(keras.layers.Conv2D(128, kernel_size=5, strides=(2, 2), padding='same', activation='relu'))
model.add(keras.layers.MaxPooling2D(pool_size=(3,3), strides=(2,2), padding='same'))
model.add(keras.layers.Conv2D(128, kernel_size=3, strides=(1, 1), padding='same', activation='relu'))
model.add(keras.layers.MaxPooling2D(pool_size=(3,3), strides=(2,2), padding='same'))
model.add(keras.layers.Conv2D(64, kernel_size=3, strides=(1, 1), padding='same', activation='relu'))
model.add(keras.layers.Flatten())
model.add(keras.layers.Dense(250, activation='relu'))
model.add(keras.layers.Dense(49, activation='softmax'))

model.compile(optimizer='adam',
              loss='sparse_categorical_crossentropy',
              metrics=['accuracy'])
print(model.summary())

print(f'Training model on {len(allFilenames)} samples')

model.fit_generator(generator=trainGenerator,
                    steps_per_epoch = int(len(trainData) // BATCH_SIZE),
                    epochs = 10,
                    verbose = 1,
                    validation_data = valGenerator,
                    validation_steps = int(len(valData) // BATCH_SIZE))

model.save('model_cnn_A1.h5')
