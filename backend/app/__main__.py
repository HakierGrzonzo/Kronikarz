from json import dump
from sys import argv

from . import app

if __name__ == "__main__":
    with open(argv[1], "w+") as f:
        dump(app.openapi(), f, indent=4)
