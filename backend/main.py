from fastapi import FastAPI, HTTPException
import os
import requests
import json

app = FastAPI()

cad_address = "https://cad.koja.fi/api/v1"
server_rack_product = "blockCoil"

model_directory = "models"
# Create the directory if it doesn't exist
if not os.path.exists(model_directory):
    os.makedirs(model_directory)

# Cache that is request body => Koja CAD API response
# This is used to avoid sending the same request multiple times
# and to speed up the response time
request_cache = {}

"""
Example request:
curl 'https://cad.koja.fi/api/v1/products/blockCoil/model?format=stl' \
  -H 'Accept: */*' \
  -H 'Accept-Language: fi-FI,fi;q=0.9,en-US;q=0.8,en;q=0.7' \
  -H 'Connection: keep-alive' \
  -H 'Origin: https://cad.koja.fi' \
  -H 'Referer: https://cad.koja.fi/' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Site: same-origin' \
  -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36' \
  -H 'content-type: application/json' \
  -H 'sec-ch-ua: "Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "Linux"' \
  --data-raw '{"orientation":"R","face_width":1780,"inst_depth":380,"n_rows":10,"tube_pitch_x":28.84,"tube_pitch_y":33.3,"plate_thickness":1.5,"inst_tolerance":1,"n_transverse_rows":[10,10,10]}'

    
  Body json:
{
    "orientation": "R",
    "face_width": 1780,
    "inst_depth": 380,
    "n_rows": 10,
    "tube_pitch_x": 28.84,
    "tube_pitch_y": 33.3,
    "plate_thickness": 1.5,
    "inst_tolerance": 1,
    "n_transverse_rows": [10, 10, 10] # Each number is the height of a server in the rack
}


Response:
{
    "id": "5b2f7f18-7b8b-422f-aa0a-e5dd59095158",
    "models": [
        "model_1.stl",
        "model_2.stl",
        "model_3.stl",
        "model_4.stl",
        "model_5.stl",
        "model_6.stl",
        "model_7.stl",
        "model_8.stl",
        "model_9.stl",
        "model_10.stl",
        "model_11.stl",
        "model_12.stl"
    ],
    "min": [
        -5333.5,
        -2473.0,
        -1.5
    ],
    "max": [
        5333.5,
        2473.0,
        1006.5
    ],
    "center": [
        0.0,
        0.0,
        502.5
    ],
    "size": [
        10667.0,
        4946.0,
        1008.0
    ],
    "materials": [],
    "lines": [],
    "spheres": []
}

"""

server_depth = 1067 # mm
server_width = 1270 # cm
server_height = 5 # cm

"""
Args:
    servers (int): Number of servers in the rack. Default is 3.
"""
def create_server_rack(servers: int = 3):
    if servers is None:
        servers = 3

    # Array of server_height for each server
    # Each number is the height of a server in the rack
    n_transverse_rows = []
    for i in range(servers):
        n_transverse_rows.append(server_height)

    # Example request body
    request_body = {
        "orientation": "R",
        "face_width": server_width,
        "inst_depth": server_depth * 10, # cm to mm
        "n_rows": 10,
        "tube_pitch_x": 28.84,
        "tube_pitch_y": 33.3,
        "plate_thickness": 1.5,
        "inst_tolerance": 1,
        "n_transverse_rows": n_transverse_rows
    }
    return request_body

def save_files(id: str, models: list):
    # Save the files to models/:id/:file
    # Create the directory if it doesn't exist
    if not os.path.exists(f"models/{id}"):
        os.makedirs(f"models/{id}")

    # Save the files to a local directory
    for model in models:
        response = requests.get(f"{cad_address}/model/{id}/{model}")
        if response.status_code == 200:
            with open(f"{model_directory}/{id}/{model}", "wb") as f:
                f.write(response.content)
            print(f"Downloaded {model} to models/{id}/{model}")
        else:
            print(f"Failed to download {model}")

@app.get("/")
def read_root():
    return {"health": "ok"}

@app.get("/server-rack")
def server_rack(servers: int = None):
    # Atleast 3 servers
    if servers is None:
        servers = 3
    if servers < 3:
        return {"error": "Atleast 3 servers are required"}

    body = create_server_rack(servers)

    # Check if the request body is already in the cache
    if str(body) in request_cache:
        # Return the cached response
        return request_cache[str(body)]

    # Send request to Koja CAD API
    print(body)
    response = requests.post(
        f"{cad_address}/products/{server_rack_product}/model?format=stl",
        headers={
            "Content-Type": "application/json",
            "Accept": "*/*"
        },
        json=body
    )
    # Check if the request was successful
    if response.status_code == 200:
        json = response.json()

        # Cache the response
        request_cache[str(body)] = json

        id = json.get("id")
        models = json.get("models")

        # Save the files to models/:id/:file
        save_files(id, models)
        # Return the response
        return json


    else:
        # Print the error message
        print(f"Error: {response.status_code} - {response.text}")
        
        # Return an error message
        return {"error": "Failed to create server rack", "status_code": response.status_code}
    

# Fetch the stl asset for a model based on id
@app.get("/models/{id}")
def get_models(id: str, file: str = None):
    # Check if the directory exists
    if not os.path.exists(f"models/{id}"):
        return {"error": "Model not found"}
    
    # Check if the file exists
    if file is None:
        return {"error": "File not found"}
    if not os.path.exists(f"models/{id}/{file}"):
        return {"error": "File not found"}
    
    # Return the file
    with open(f"models/{id}/{file}", "rb") as f:
        content = f.read()
        return content

@app.get("/koja/air_conditioner")
def create_air_conditioner(width: int, height: int, depth: int, hole_size: int, hole_x: int, hole_y: int):
    """
    Get air conditioner whole parts
    """
    if hole_size > width or hole_size > height:
        raise HTTPException(status_code=400, detail="hole_size is larger than widht or height")

    panel_request_body = {
        "width": width,
        "depth": height,
        "extra_holes":[{
             "x": hole_x,
             "y": hole_y,
             "width": hole_size,
             "length": hole_size,
             "type": "circle"
        }]
    }
    panel = requests.post("https://cad.koja.fi/api/v1/products/panel/model?format=stl", json = panel_request_body)

    box_request_body = {
        "width": width,
        "depth": depth,
        "height": height,
        "visualize": False,
        "panelXPos": True,
        "panelXNeg": True,
        "panelYPos": False,
        "panelYNeg": True,
        "panelZPos": True,
        "panelZNeg": True
    }
    box = requests.post("https://cad.koja.fi/api/v1/products/module/model?format=stl", json = box_request_body)

    json = [panel.json(), box.json()]
    return json
