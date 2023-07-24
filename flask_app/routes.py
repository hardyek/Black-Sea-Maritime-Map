from flask import current_app as app
from flask import render_template

@app.route('/')
#
# North Black Sea Map
#
def black():
    return render_template("black.HTML",)

@app.route('/world')
#
# Ships coming to / from Ukrainian Ports on the world map
#
def world():
    return render_template("world.HTML",)

@app.route('/vessel/<vesselid>')
#
# Specific Vessel Map
#
def vessel(vesselid):
    return render_template("vessel.HTML",)

@app.route('/historic/<start>/<end>')
@app.route('/historic/<start>/<end>/<area>')
#
# Historic North Black Sea Map
#
def historic(start,end,area='black'):
    return render_template("historic.HTML",)

#
# Error Codes
#
@app.errorhandler(404)
def page_not_found(error):
    return """<h1><a href="/">Error, 404</a></h1>"""
@app.errorhandler(500)
def unknown_request(error):
    return """<h1><a href="/">Error, 500</a></h1>"""