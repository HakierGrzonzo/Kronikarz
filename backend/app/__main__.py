from . import app
from sys import argv
from json import dump

if __name__ == "__main__":
    with open(argv[1], "w+") as f:
        dump(app.openapi(), f, indent=4)
