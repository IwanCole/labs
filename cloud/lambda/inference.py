import keras
import numpy as np
from keras.models import load_model
from keras.utils import CustomObjectScope
from keras.initializers import glorot_uniform

def unpack(data):
    '''
    Unpack a strin of 2500 hex characters into a binary 100x100 image array.
    Each HEX char represents 4 binary pixels.
    Flip pixel values at the end (inline with training set)
    '''
    finalOutput = []
    line = []
    for i, x in enumerate(data):
        if i != 0 and i % 25 == 0:
            finalOutput.append(line)
            line = []

        pixels = bin(int(x, 16))[2:].zfill(4)
        for p in pixels:
            line.append(int(p))

    finalOutput.append(line)
    finalOutput = np.expand_dims(finalOutput, 2)
    flip = np.vectorize(lambda x: abs(x-1))
    finalOutput = flip(finalOutput)
    return finalOutput


def classify(input):
    with CustomObjectScope({'GlorotUniform': glorot_uniform()}):
        model = load_model('model_cnn2.h5')
        preds = model.predict(np.array([input]))[0]

        return {
            'bird': str(preds[0]),
            'cat':  str(preds[1]),
            'dog':  str(preds[2]),
            'fish': str(preds[3])
        }
