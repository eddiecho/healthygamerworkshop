import json
import logging

from lambdas.create_handler import create_handler
from lambdas.list_handler import list_handler

def __finalize_response(body, status_code):
    return {
        'statusCode': status_code,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': True,
            'Access-Control-Allow-Methods': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key'
        },
        'body': json.dumps(body)
    }

def list_func(event, context):
    try:
        body = list_handler(event)
        return __finalize_response(body, 200)
    except Exception as e:
        error = {
            "errorMessage": repr(e)
        }
        return __finalize_response(error, 500)

def create_func(event, context):
    try:
        body = create_handler(event)
        return __finalize_response(body, 200)
    except Exception as e:
        error = {
            "errorMessage": repr(e)
        }
        return __finalize_response(error, 500)
