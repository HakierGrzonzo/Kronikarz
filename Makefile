# Docker will run the app in UTC, so we use UTC during dev
TZ=UTC

.Phony: install devBackend format openapi nuke_db devFrontend prod

# Install dependencies for frontend and backend
install:
	./.scripts/install.sh

# Run surreal in docker and backend with autoreloading
devBackend:
	./.scripts/runBackend.sh

# Run backend and surreal in docker, run liveserver for frontend
devFrontend:
	./.scripts/runFrontend.sh

# Format frontend and backend
format:
	./.scripts/format.sh

# Generate openapi schema from backend
openapi:
	./.scripts/openapi.sh

# Drop the database, like completely
nuke_db:
	rm -rf ./db/* ./data/*

# Run the whole application
prod:
	docker-compose up --build

efekt2: docs/uwarunkowania.md
	./.scripts/make_presentation.sh docs/uwarunkowania.md docs/uwarunkowania.pdf
