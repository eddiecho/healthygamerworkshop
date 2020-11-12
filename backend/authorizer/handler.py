import os

from google.oauth2 import id_token
from google.auth.exceptions import GoogleAuthError
from google.auth.transport import requests

def handler(event, context):
    try:
        id_info = id_token.verify_oauth2_token(
            event['token'],
            requests.Request(),
            os.environ['OAUTH_CLIENT_ID']
        )

        if id_info['iss'] != 'https://accounts.google.com':
            raise ValueError('Wrong issuer.')

        userid = id_info['sub']

        return {
            "principalId": userid,
            "policyDocument": {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Action": "execute-api:Invoke",
                        "Effect": "Allow",
                        "Resource": event["methodArn"]
                    }
                ]
            },
        }
    except GoogleAuthError as e:
        raise Exception("Unauthorized")
    except ValueError as e:
        raise Exception("Unauthorized")

