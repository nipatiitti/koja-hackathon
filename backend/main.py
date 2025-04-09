from fastapi import FastAPI

app = FastAPI()

cad_address = "https://cad.koja.fi/api/v1"
server_rack_product = "blockCoil"


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

    
  Data json:
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

"""

def inchToCm(inch: float) -> float:
    return inch * 2.54

server_depth = inchToCm(36)

def create_server_rack(servers: int = None):
    """
    Args:
        servers (int): Number of servers in the rack. Default is 10.
    """
    if servers is None:
        servers = 10
    # Example request body
    request_body = {
        "orientation": "R",
        "face_width": 1780,
        "inst_depth": 380,
        "n_rows": servers,
        "tube_pitch_x": 28.84,
        "tube_pitch_y": 33.3,
        "plate_thickness": 1.5,
        "inst_tolerance": 1,
        "n_transverse_rows": [servers, servers, servers]
    }
    return request_body

@app.get("/")
def read_root():
    return {"health": "ok"}

@app.get("/server/rack")
def create_server_rack(servers: int = None):
    