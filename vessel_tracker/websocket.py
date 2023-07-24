import psycopg2

connection = psycopg2.connect(database = "vessel_tracking",
                              host="localhost",
                              port="5432",
                              user="postgres",
                              password="postgres")

cursor = connection.cursor()

try:
    # Create a cursor
    cursor = connection.cursor()

    # Execute a simple query
    cursor.execute("SELECT version();")
    version = cursor.fetchone()
    print("PostgreSQL version:", version[0])

    # Don't forget to close the cursor and connection when done
    cursor.close()
    connection.close()
    print("Connection closed.")
except psycopg2.Error as e:
    print("Error executing the query:", e)

