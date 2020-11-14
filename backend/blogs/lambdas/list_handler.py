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

    body = event['body']
    if 'NextToken' in body:
        kwargs['ExclusiveStartKey'] = {
            "Id": {
                "S": body["NextToken"]
            }
        }

    items = ddb.scan(**kwargs)
    blogs = []
    for item in items['Items']:
        blogs.append({
            'Title': item['Title']['S'],
            'Id': item['Id']['S'],
            'CreationTime': int(item['CreationTime']['N']),
            'Summary': item['Summary']['S'],
            'Author': item['Author']['S'],
        })

    ret = {
        "Blogs": blogs
    }
    if 'LastEvaluatedKey' in items:
        ret['NextToken'] = items['LastEvaluatedKey']['Id']['S']

    return ret

