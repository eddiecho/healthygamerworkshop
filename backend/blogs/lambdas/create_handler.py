import boto3
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

    kwargs = {
        'TableName': os.environ['TABLE_NAME'],
        'Item': {
            'Title': {'S': event['Title']},
            'Id': {'S': item_id},
            'CreationTime': {'N': creation_time},
            'Summary': {'S': event['Markdown'][:40]},
            'Author': {'S': event['Author']}
        }
    }

    ddb.put_item(**kwargs)

    return {
        'Id': item_id
    }
