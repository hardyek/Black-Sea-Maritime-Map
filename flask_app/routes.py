from flask import Flask, render_template, jsonify
from flask import current_app as app
import psycopg2
import json

connection = psycopg2.connect(database = "vessel_tracking",
                        host="localhost",
                        port="5432",
                        user="postgres",
                        password="postgres")

@app.route('/')
#
# North Black Sea Map
#
def black():
    return render_template("black.HTML")

@app.route('/get_vessel_data')
#
# Get Ship Data from Database
#
def get_data():
    with connection.cursor() as get_data_cursor:
        get_data_cursor.execute("SELECT id, name, imo, type, length, lat, long, status, cog, sog, timestamp  FROM vessels;")
        data = get_data_cursor.fetchall()
    vessel_data = [{"id":id, "name":name, "imo":imo, "type":shiptype, "length":length, "lat":lat, "long":long, "status":status, "cog":cog, "sog":sog, "timestamp":timestamp} for id,name,imo,shiptype,length,lat,long,status,cog,sog,timestamp in data]
    return jsonify(vessel_data)
#
# Error Codes
#
@app.errorhandler(404)
def page_not_found(error):
    return """<h1><a href="/">Error, 404</a></h1>"""
@app.errorhandler(500)
def unknown_request(error):
    return """<h1><a href="/">Error, 500</a></h1>"""