from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
import os
import requests
import json

from mesh import generate

app = FastAPI()

# Add CORS middleware to allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

cad_address = "https://cad.koja.fi/api/v1"
server_rack_product = "blockCoil"

model_directory = "models"
cache_file = "request_cache.json"

# Create the directory if it doesn't exist
if not os.path.exists(model_directory):
    os.makedirs(model_directory)

# Load cache from file if it exists
if os.path.exists(cache_file):
    with open(cache_file, 'r') as f:
        request_cache = json.load(f)
else:
    request_cache = {}

def save_cache():
    with open(cache_file, 'w') as f:
        json.dump(request_cache, f)

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
        "inst_depth": server_depth,
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
        save_cache()  # Save cache after updating

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
@app.get("/models/{id}/{file}")
def get_models(id: str, file: str = None):
    # Check if the directory exists
    if not os.path.exists(f"models/{id}"):
        return {"error": "Model not found"}
    
    # Check if the file exists
    if file is None:
        return {"error": "File not found"}
    if not os.path.exists(f"models/{id}/{file}"):
        return {"error": "File not found"}
    
    # Return the file as binary data with proper content type
    with open(f"models/{id}/{file}", "rb") as f:
        content = f.read()
        return Response(content=content, media_type="application/octet-stream")

@app.get("/koja/air_conditioner")
def create_air_conditioner(
        width: int = 1000,
        height: int =900,
        depth: int = 1000,
        hole_size: int = 200,
        hole_x: int = 0,
        hole_y: int = 0
):
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


    if panel.status_code != 200:
        raise HTTPException(status_code=400, detail="error getting stuff")

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

    if box.status_code != 200:
        raise HTTPException(status_code=400, detail="error getting stuff")

    panel_json = panel.json()
    box_json = box.json()

    save_files(panel_json.get("id"), panel_json.get("models"))
    save_files(box_json.get("id"), box_json.get("models"))

    return [panel_json, box_json]

@app.get("/koja/air_conditioner_pipe")
def create_air_conditioner_pipe(
    wall_thickness: float = 1.0,
    circular_radius: int = 10,
    square_width: int = 50,
    square_height: int = 30,
    length: int = 60,
):
   return generate(wall_thickness, circular_radius, square_width, square_height, length)
