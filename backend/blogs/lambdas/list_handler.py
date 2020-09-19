import boto3
import os

def list_handler(event):
    """
    event: Dict[str] -> str
    event[NextToken] can be null
    """

    ddb = boto3.client('dynamodb')
    kwargs = {
        'TableName': os.environ['TABLE_NAME'],
        'Limit': 4
    }
    if 'NextToken' in event:
        kwargs['ExclusiveStartKey'] = event['NextToken']
    items = ddb.scan(**kwargs)

    return items['Items']
