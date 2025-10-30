import json
import base64
import uuid
import urllib.request
import urllib.error
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Upload video/image files to cloud storage via poehali.dev API
    Args: event with httpMethod, body containing base64 file data
    Returns: HTTP response with file URL
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    file_data = body_data.get('file')
    file_name = body_data.get('fileName', 'upload')
    file_type = body_data.get('fileType', 'video/mp4')
    
    if not file_data:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'No file data provided'})
        }
    
    try:
        clean_file_data = file_data
        if ',' in file_data:
            clean_file_data = file_data.split(',')[1]
        
        clean_file_data = clean_file_data.replace(' ', '+')
        
        padding = len(clean_file_data) % 4
        if padding:
            clean_file_data += '=' * (4 - padding)
        
        file_bytes = base64.b64decode(clean_file_data)
        file_extension = file_name.split('.')[-1] if '.' in file_name else 'mp4'
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        
        upload_url = 'https://api.poehali.dev/storage/upload'
        
        boundary = f"----WebKitFormBoundary{uuid.uuid4().hex[:16]}"
        body = []
        body.append(f'--{boundary}'.encode())
        body.append(f'Content-Disposition: form-data; name="file"; filename="{unique_filename}"'.encode())
        body.append(f'Content-Type: {file_type}'.encode())
        body.append(b'')
        body.append(file_bytes)
        body.append(f'--{boundary}--'.encode())
        body.append(b'')
        
        body_bytes = b'\r\n'.join(body)
        
        req = urllib.request.Request(
            upload_url,
            data=body_bytes,
            headers={
                'Content-Type': f'multipart/form-data; boundary={boundary}',
                'Content-Length': str(len(body_bytes))
            },
            method='POST'
        )
        
        with urllib.request.urlopen(req, timeout=300) as response:
            response_data = json.loads(response.read().decode())
            file_url = response_data.get('url', f"https://cdn.poehali.dev/files/{unique_filename}")
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'url': file_url,
                'filename': unique_filename
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': f'Upload failed: {str(e)}'
            })
        }