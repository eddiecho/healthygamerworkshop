import os

from google.oauth2 import id_token
from google.auth.exceptions import GoogleAuthError
from google.auth.transport import requests

def authorizer(event, context):
    try:
        id_info = token.verify_oauth2_token(
            event['authorizationToken'],
            requests.Request(),
            "412905520657-kp7kfhnj9qd285lhlrh1pnnt090k0948.apps.googleusercontent.com"
        )

        if id_info['iss'] != 'accounts.google.com':
            raise ValueError('Wrong issuer')

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
            }
        }
    except GoogleAuthError:
        raise Exception('Unauthorized')
    except Exception:
        raise Exception('Unauthorized')
