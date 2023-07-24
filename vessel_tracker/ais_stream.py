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

subscription_message = {"APIKey": "bfd68e21d74dbfc0ce161987264dedb3ea8b34da",
            "BoundingBoxes": [[[50.008747, 21.141895],[35.997054, 59.637987]]],
            "FilterMessageTypes": ["PositionReport", "ShipStaticData"]}

async def connect_ais_stream():                                                                 # Subscribe and recieve messages from the websocket
    async with websockets.connect("wss://stream.aisstream.io/v0/stream") as websocket:
        subscription_message_json = json.dumps(subscription_message)

        await websocket.send(subscription_message_json)

        async for message_json in websocket:
            message = json.loads(message_json)
            message_type = message["MessageType"]

            if message_type == "PositionReport":                                                 # Handle the PositionReport message type
                ais_message = message["Message"]["PositionReport"]
                handle_position_report(ais_message)

            elif message_type == "ShipStaticData":                                               # Handle the ShipStaticData messsage type
                ais_message = message["Message"]["ShipStaticData"]
                handle_ship_static_data(ais_message)

            else:                                                                                # Handle other message type.
                print(f"Unrecognised message type: {message_type}")
                
def handle_position_report(message):                                                            # Function to handle PositionReport
    vessel_id = message["UserID"]  

    print(f"Position Report recieved, MMSI: {vessel_id}")                                                              

    if vessel_id in pending_vessels:                                                             # Check if there is an entry with the vessel_id in the pending_vessels dictionary
        print(f"MMSI: {vessel_id} found in pending vessels")
        if pending_vessels[vessel_id]["Type"] == "ShipStaticData":                               # If there is an entry with the message type "ShipStaticData" then a new entry can be added to the table
            print("Pending ShipStaticData found")
            add_new_entry(message, pending_vessels[vessel_id]["Message"])                        # Handle the addition of this new entry
    else:
        exists_query = f"SELECT id FROM vessels WHERE id = %s;"                                  # Check if there is an entry with the same vessel_id in the table already

        with connection.cursor() as exists_cursor:
            exists_cursor.execute(exists_query,(vessel_id,))
            exists = exists_cursor.fetchone() is not None;
        
        print(f"MMSI: {vessel_id} exists in database: {exists}")

        if exists:                                                                              # If there is then update the table with the new data from the message
            update_query = f"UPDATE vessels SET lat = %s, long = %s, status = %s, cog = %s, sog = %s, timestamp = %s"
            with connection.cursor() as update_cursor :
                update_cursor.execute(update_query, (message["Latitude"], message["Longitude"], message["NavigationalStatus"], message["Cog"], message["Sog"], datetime.now().astimezone(pytz.utc).strftime("%Y-%m-%d %H:%M:%S")))

            connection.commit()

            print(f"Successfully updated MMSI: {vessel_id}")
            
        else:                                                                                   # If there isn't then add the message to the pending_vessels dictionary
            pending_vessels[vessel_id] = {"Message" : message, "Type" : "PositionReport"}
            print(f""" Added new entry to pending vessels, MMSI: {message["UserID"]} """)
        
def handle_ship_static_data(message):                                                           # Function to handle ShipStaticData
    vessel_id = message["UserID"]

    print(f"Ship Static Date recieved, MMSI: {vessel_id}")

    if vessel_id in pending_vessels:                                                            # Check if there is an entry with the vessel_id in the pending_vessels dictionary
        print(f"MMSI: {vessel_id} found in pending vessels")
        if pending_vessels[vessel_id]["Type"] == "PositionReport":                              # If there is an entry with the message type "PositionReport" then a new entry can be added to the table
            print("Pending PositionReport found")
            add_new_entry(pending_vessels[vessel_id]["Message"], message)                       # Handle the addition of this new entry

    else:
        exists_query = f"SELECT id FROM vessels WHERE id = %s;"                                  # Check if there is an entry with the same vessel_id in the table already

        with connection.cursor() as exists_cursor:
            exists_cursor.execute(exists_query,(vessel_id,))
            exists = exists_cursor.fetchone() is not None;
        
        print(f"MMSI: {vessel_id} exists in database: {exists}")

        if exists:                                                                              # If there is then update the table with the new data from the message
            update_query = f"UPDATE vessels SET name = %s, imo = %s, type = %s, length = %s"
            with connection.cursor() as update_cursor :
                update_cursor.execute(update_query, (message["Name"], message["ImoNumber"], message["Type"], (message["Dimension"]["A"] + message["Dimension"]["B"]),))

            connection.commit()

            print(f"Successfully updated MMSI: {vessel_id}")
            
        else:                                                                                   # If there isn't then add the message to the pending_vessels dictionary
            pending_vessels[vessel_id] = {"Message" : message, "Type" : "ShipStaticData"}
            print(f""" Added new entry to pending vessels, MMSI: {message["UserID"]} """)

def add_new_entry(position_report, ship_static_data):                                           # Function to handle the addition of a new entry to the table

    create_query = f"INSERT INTO vessels (id,name,imo,type,length,lat,long,status,cog,sog,timestamp) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"

    with connection.cursor() as create_cursor:
        create_cursor.execute(create_query, (ship_static_data['UserID'],ship_static_data["Name"],ship_static_data["ImoNumber"],ship_static_data["Type"],(ship_static_data["Dimension"]["A"] + ship_static_data["Dimension"]["B"]), position_report["Latitude"], position_report["Longitude"], position_report["NavigationalStatus"], position_report["Cog"], position_report["Sog"], datetime.now().astimezone(pytz.utc).strftime("%Y-%m-%d %H:%M:%S"),))

    connection.commit()

    print(f""" Added new entry MMSI: {ship_static_data['UserID']} """)

if __name__ == "__main__":
    asyncio.run(asyncio.run(connect_ais_stream()))