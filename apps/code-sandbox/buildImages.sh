#!/bin/bash
set -e

# Support running from root or within apps/code-sandbox
PROJECT_ROOT=$(pwd)
if [[ "$PROJECT_ROOT" == *"/apps/code-sandbox"* ]]; then
  DOCKER_DIR="docker"
else
  DOCKER_DIR="apps/code-sandbox/docker"
fi

echo "🚀 Checking Code Sandbox environment images..."

# Map of language -> Dockerfile
declare -A images=(
  ["python"]="$DOCKER_DIR/python.Dockerfile"
  ["node"]="$DOCKER_DIR/node.Dockerfile"
  ["java"]="$DOCKER_DIR/java.Dockerfile"
  ["cpp"]="$DOCKER_DIR/cpp.Dockerfile"
)

# Function to build a single image if it doesn't exist
build_image() {
  lang=$1
  dockerfile=$2
  image_name="devio-sandbox-$lang"
  
  if docker image inspect "$image_name" >/dev/null 2>&1; then
    echo "✅ $image_name already exists, skipping build."
  else
    echo "🛠 Building $image_name from $dockerfile..."
    docker build -f "$dockerfile" -t "$image_name" .
  fi
}

# Loop through all images and build sequentially (safer for shared daemon)
for lang in "${!images[@]}"; do
  build_image "$lang" "${images[$lang]}"
done

echo "✅ All sandbox images are ready!"
