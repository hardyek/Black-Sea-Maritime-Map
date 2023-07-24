import asyncio
import websockets
import json
from datetime import datetime
import pytz
import psycopg2

try:                                                                                            # Connect to the database
    connection = psycopg2.connect(database = "vessel_tracking",
                                host="localhost",
                                port="5432",
                                user="postgres",
                                password="postgres")
    print("Database connected successfully")
except:
    print("Failed to connect to database")

exists_query = f"SELECT id FROM vessels WHERE id = %s;"                                  # Check if there is an entry with the same vessel_id in the table already

with connection.cursor() as exists_cursor:
    exists_cursor.execute(exists_query,(255806259,))
    exists = exists_cursor.fetchone() is not None;

print(exists)