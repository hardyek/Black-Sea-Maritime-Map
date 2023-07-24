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

                                                                                                # Initialising the subscription message and the pending vessels dictionary
pending_vessels = {}

async def connect_ais_stream():                                                                 # Subscribe and recieve messages from the websocket
    async with websockets.connect("wss://stream.aisstream.io/v0/stream") as websocket:
        subscription_message = {"APIKey": "bfd68e21d74dbfc0ce161987264dedb3ea8b34da",
            "BoundingBoxes": [[[50.008747, 21.141895],[35.997054, 59.637987]]],
            "FilterMessageTypes": ["PositionReport", "ShipStaticData"]}
        
        subscription_message_json = json.dumps(subscription_message)

        print(subscription_message_json)
        await websocket.send(subscription_message_json)

        async for message_json in websocket:
            message = json.loads(message_json)
            print(message)

            message_type = message["MessageType"]
            if message_type == "PositionReport":                                                 # Handle the PositionReport message type
                ais_message = message["Message"]["PositionReport"]
                print(ais_message)

            elif message_type == "ShipStaticData":                                               # Handle the ShipStaticData messsage type
                ais_message = message["Message"]["ShipStaticData"]
                print(ais_message)

            else:                                                                                # Handle other message type.
                print(f"Unrecognised message type: {message_type}")

if __name__ == "__main__":
    asyncio.run(asyncio.run(connect_ais_stream()))