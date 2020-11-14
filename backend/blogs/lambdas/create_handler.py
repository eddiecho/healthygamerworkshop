import boto3
import json
import os
import uuid
import time

def create_handler(event):
    ddb = boto3.client('dynamodb')

    print(event)
    print(event)
    print(event)
    print(event)
    print(event)
    print(event)
    print(event)
    print(event)
    print(event)
    print(event)
    print(event)
    print(event)

    item_id = str(uuid.uuid4())
    creation_time = time.time()
    body = json.loads(event['body'])

    kwargs = {
        'TableName': os.environ['TABLE_NAME'],
        'Item': {
            'Title': {'S': body['Title']},
            'Id': {'S': item_id},
            'CreationTime': {'N': creation_time},
            'Summary': {'S': body['Markdown'][:40]},
            'Author': {'S': body['Author']}
        }
    }

    ddb.put_item(**kwargs)

    return {
        'Id': item_id
    }
