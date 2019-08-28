import boto3
import json
# import tensorflow.keras as keras
# import numpy as np
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
    operations = {
        'POST': lambda dynamo, x: dynamo.put_item(**x),
    }

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

    operation = 'POST'
    if operation in operations:
        return respond(None, operations[operation](dynamo, payload))
    else:
        return respond(ValueError('Unsupported method "{}"'.format(operation)))
