import boto3
import json
import os
import time
import uuid

def create_handler(event):
    ddb = boto3.client('dynamodb')

    blog_id = str(uuid.uuid4())
    creation_time = str(int(time.time()))
    body = json.loads(event.get('body', '{}'))

    kwargs = {
        'TableName': os.environ['TABLE_NAME'],
        'Item': {
            'Title': {'S': body['Title']},
            'CreationTime': {'N': creation_time},
            'Id': {'S': blog_id},
            'Author': {'S': body['Author']},
            'Summary': {'S': body['Markdown']}
        }
    }

    ddb.put_item(**kwargs)

    return {
        'Id': blog_id,
        'Title': body['Title']
    }
