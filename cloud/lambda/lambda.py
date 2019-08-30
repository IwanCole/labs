import boto3
import json
import inference
from datetime import datetime as dt

print('Loading function')
dynamo = boto3.client('dynamodb')


def respond(err, res=None):
    return {
        'statusCode': '400' if err else '200',
        'body': err.message if err else json.dumps(res),
        'headers': {
            'Content-Type': 'application/json'
        }
    }


def lambda_handler(event, context):

    if not event:
        return respond(ValueError('Invalid request - missing body'))

    print(event)

    if not event['data']:
        return respond(ValueError('Invalid request - missing data'))

    data = str(event['data'])
    if len(data) != 2500:
        return respond(ValueError('Invalid request - invalid data'))

    for char in data:
        if char not in "0123456789abcdef":
            return respond(ValueError('Invalid request - invalid data'))


    UID = str(int(dt.timestamp(dt.now())*10000))

    payload = {
        'TableName': 'catch-images',
        'Item': {
            'uid' : {
                'S':UID
            },
            'device-id': {
                'S':event['devicehash']
            },
            'data': {
                'S':event['data']
            }
        }
    }

    # Attempt to classify drawing
    image = inference.unpack(event['data'])
    preds = inference.classify(image)

    # operations = {
    #     'POST': lambda dynamo, x: dynamo.put_item(**x),
    # }

    # operation = 'POST'
    # if operation in operations:
    dynamo.put_item(**payload)
    return respond(None, preds)
        # return respond(None, operations[operation](dynamo, payload))
    # else:
        # return respond(ValueError('Unsupported method "{}"'.format(operation)))
