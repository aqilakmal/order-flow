docker compose build --no-cache &&
docker image prune -f &&  # Cleans up dangling images
docker compose up -d
