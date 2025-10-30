import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manage anime video uploads and retrieval
    Args: event with httpMethod, body, queryStringParameters
    Returns: HTTP response with video data or success status
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
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
                    SELECT id, title, description, video_url, thumbnail_url, 
                           episode_number, created_at, updated_at
                    FROM t_p76178691_anime_dubbing_site.anime_videos
                    ORDER BY created_at DESC
                """)
                videos = cur.fetchall()
                
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'videos': videos}, default=str)
            }
        
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            title = body_data.get('title')
            description = body_data.get('description', '')
            video_url = body_data.get('video_url')
            thumbnail_url = body_data.get('thumbnail_url', '')
            episode_number = body_data.get('episode_number')
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    INSERT INTO t_p76178691_anime_dubbing_site.anime_videos 
                    (title, description, video_url, thumbnail_url, episode_number)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING id, title, description, video_url, thumbnail_url, 
                              episode_number, created_at, updated_at
                """, (title, description, video_url, thumbnail_url, episode_number))
                new_video = cur.fetchone()
                conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'video': new_video}, default=str)
            }
        
        if method == 'DELETE':
            params = event.get('queryStringParameters', {}) or {}
            video_id = params.get('id')
            
            with conn.cursor() as cur:
                cur.execute("""
                    DELETE FROM t_p76178691_anime_dubbing_site.anime_videos 
                    WHERE id = %s
                """, (video_id,))
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
