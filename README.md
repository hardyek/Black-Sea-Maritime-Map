Live shipping map for the Black Sea

#### Setup

1. Install Python
2. Install Python dependencies using following command:
pip install Flask, pytz, psycopg2
3. Install PostgreSQL
4. Createa a new database (Name used here is vessel_tracking)
5. Create a new table with the following command:
CREATE TABLE [IF NOT EXISTS] vessels(
   id INTEGER UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    imo INTEGER NOT NULL,
    type INTEGER NOT NULL,
    length DOUBLE PRECISION NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    long DOUBLE PRECISION NOT NULL,
    status INTEGER NOT NULL,
    cog DOUBLE PRECISION NOT NULL,
    sog DOUBLE PRECISION NOT NULL,
    timestamp TIMESTAMP NOT NULL 
);
6. Update ais_stream.py and routes.py database connection to connect to your local database.
7. Run ais_stream.py
8. Start the app using Flask run and open it in your browser.


#### Understanding the Map

<b>Colors</b> - Type of Ship

Black : Special (Anything other than listed below)
Red : Military / SAR / Law Enforce
Grey : Tug / Port Operated Vessel
Blue : Fishing
Pink : Passenger
Green : Cargo
Yellow : Tanker

<b>Icon</b> - Navigational Status

Double Arrow - Under way using engine
Anchor - At anchor / Moored
Fishing Hook - Engaged in Fishing
Sail - Under way sailing
Danger - Aground
Single Arrow - All Else

<i>Commits to this repo from my laptop are for some reason listed as being by the user "SomeName0"</i>