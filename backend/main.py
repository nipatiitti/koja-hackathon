from fastapi import FastAPI

app = FastAPI()

cad_address = "https://cad.koja.fi/api/v1"


@app.get("/")
def read_root():
    return {"health": "ok"}

@app.get("/server/rack")
def create_server_rack(servers: int = None):
    