#!/bin/bash
set -e

echo "🚀 Building CodeJudge Docker images in parallel..."

# Map of language -> Dockerfile
declare -A images=(
  ["python"]="docker/python.Dockerfile"
  ["node"]="docker/node.Dockerfile"
  ["java"]="docker/java.Dockerfile"
  ["cpp"]="docker/cpp.Dockerfile"
)

# Function to build a single image
build_image() {
  lang=$1
  dockerfile=$2
  image_name="devio-sandbox-$lang"
  echo "🛠 Building $image_name from $dockerfile..."
  docker build -f "$dockerfile" -t "$image_name" . &
}

# Loop through all images and build in background
for lang in "${!images[@]}"; do
  build_image "$lang" "${images[$lang]}"
done

# Wait for all background jobs to finish
wait

echo "✅ All Docker images built successfully!"
