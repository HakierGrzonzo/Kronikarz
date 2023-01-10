# Kronikarz

Work in progress

A project for Software Engineering course at Silesian University of Technology

## Required tools:

- `npm`
- `poetry`
- `docker` and `docker-compose`
- `make`
- `bash`
- `pandoc` and `latex` for compiling presentations

## Basic operations:

- Run `make install` command to install all dependencies.
- Run `make openapi` to generate the openapi client for the Frontend.
- Run `make format` to format your code with prettier and black.
- Run `make prod` to run the whole application in docker.

If some `make` commands fail for you, you might need to use `sudo` as you might
require additional permissions.

### Frontend:

Frontend is a web application built using the `solid-start` framework.

Use the `make devFrontend` command to start the backend and database in docker 
and the dev server.

### Backend:

Backend is a FastAPI application, that provides the CRUD functionalities for 
frontend. It uses the SurrealDB database and `fastapi_users` library with a 
custom backend for user authentication.

Use the `make devBackend` command to start SurrealDB in docker and uvicorn with 
live code reload.

#### Exporter:

#TODO - DOCS + openapi do frontu
Use `make devExporter`

#### `surreal_orm`:

Backend uses a simple ORM for SurrealDB in the `./backend/app/surreal_orm/`
directory. It is a separate python module. Look at its readme for details.

### Database:

We use SurrealDB with docker as our database.

You can use the `make nuke_db` command to drop the database.

### Docs:

Most docs are located in the `./docs` directory. Some docs can be compiled into
beamer presentations.

- Efekt 2 - `make efekt2`
