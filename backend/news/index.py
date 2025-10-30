import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manage news articles - create, read, and delete
    Args: event with httpMethod, body, queryStringParameters
    Returns: HTTP response with news data or success status
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    database_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(database_url)
    
    try:
        if method == 'GET':
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    SELECT id, title, content, image_url, created_at, updated_at
                    FROM t_p76178691_anime_dubbing_site.news
                    ORDER BY created_at DESC
                """)
                news = cur.fetchall()
                
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'news': news}, default=str)
            }
        
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            admin_password = body_data.get('admin_password', '')
            correct_password = os.environ.get('ADMIN_PASSWORD', '')
            
            if admin_password != correct_password:
                return {
                    'statusCode': 403,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Неверный пароль'})
                }
            
            title = body_data.get('title')
            content = body_data.get('content')
            image_url = body_data.get('image_url', '')
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    INSERT INTO t_p76178691_anime_dubbing_site.news 
                    (title, content, image_url)
                    VALUES (%s, %s, %s)
                    RETURNING id, title, content, image_url, created_at, updated_at
                """, (title, content, image_url))
                new_article = cur.fetchone()
                conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'news': new_article}, default=str)
            }
        
        if method == 'DELETE':
            params = event.get('queryStringParameters', {}) or {}
            news_id = params.get('id')
            admin_password = params.get('password', '')
            correct_password = os.environ.get('ADMIN_PASSWORD', '')
            
            if admin_password != correct_password:
                return {
                    'statusCode': 403,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Неверный пароль'})
                }
            
            with conn.cursor() as cur:
                cur.execute("""
                    DELETE FROM t_p76178691_anime_dubbing_site.news 
                    WHERE id = %s
                """, (news_id,))
                conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'success': True})
            }
        
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        conn.close()