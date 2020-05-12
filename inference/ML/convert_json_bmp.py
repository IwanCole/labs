'''
Script used to bulk create images from the .ndjson dataset files.
'''

import os, sys
import ndjson
import helpers
import numpy as np
from PIL import Image
from multiprocessing import Pool

LINE_WIDTH = 2
NUMBER_OF_IMAGES = 80000
INPUT_DIR = 'D:\\sketch_input\\'
OUTPUT_BASE_DIR = 'D:\\sketch_data\\'

def generate_image(sample):
    canvas = np.zeros((256,256))
    for stroke in sample['drawing']:
        X, Y = stroke
        for i in range(len(X) - 1):
            x0, y0 = X[i],   Y[i]
            x1, y1 = X[i+1], Y[i+1]
            points = helpers.get_line((x0,y0), (x1, y1))
            for point in points:
                canvas[point[1]][point[0]] = 255    # rotates image correctly
                for i in range(-LINE_WIDTH, LINE_WIDTH + 1):
                    for j in range(-LINE_WIDTH, LINE_WIDTH + 1):
                        try: canvas[point[1]+i][point[0]+j] = 255
                        except: pass # Ignore if out of canvas bounds
    return canvas


def resize_image(canvas):
    return np.array(Image.fromarray(canvas).resize((100,100)))


def save_image(canvas, CLASS_NAME, index):
    im = Image.fromarray(canvas).convert('L')
    im.save(f'{OUTPUT_BASE_DIR}{CLASS_NAME}\\{CLASS_NAME}_{index}.jpg')


def generate_class(filename):
    CLASS_NAME = filename.replace('.ndjson', '').replace('full_simplified_', '')
    print(f'Begin generating {CLASS_NAME} images...')

    try: os.mkdir(f'{OUTPUT_BASE_DIR}{CLASS_NAME}')
    except: pass    # Ignore if dir already exists

    with open(f'{INPUT_DIR}{filename}') as f:
        data = ndjson.load(f)
        print(f"Size of {CLASS_NAME}s set: {len(data)}")

        count = 0
        for sample in data:
            if sample['recognized'] != True: continue
            canvas = generate_image(sample)
            canvas = resize_image(canvas)
            save_image(canvas, CLASS_NAME, count)
            count += 1
            if count % (NUMBER_OF_IMAGES/4) == 0: print(f"Generated {(count*100)/NUMBER_OF_IMAGES}% of {CLASS_NAME} images...")
            if count == NUMBER_OF_IMAGES: break

    print(f'Finished generating {CLASS_NAME} images.')
    return


if __name__ == "__main__":
    files = os.listdir(INPUT_DIR)

    confirm = input(f'This will generate {len(files) * NUMBER_OF_IMAGES} image files, continute? Y/N ')
    if confirm not in ['Y', 'y']: sys.exit()

    with Pool() as pool:
        pool.map(generate_class, files)
