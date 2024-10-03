
#!/bin/bash

# remimber to chmod +x publish.sh :)

# Define paths
PROJECT_DIR=~/nasa-project-v-1
BUILD_DIR=$PROJECT_DIR/build
TARGET_DIR=/var/www/html

# Navigate to the project directory
echo "Navigating to the project directory..."
cd $PROJECT_DIR || exit

# Pull the latest changes from the repository
echo "Pulling the latest changes from Git..."
git pull origin main # Change 'main' to your default branch if different

# Build the project (uncomment if you're using a build step)
# echo "Building the project..."
# npm install
# npm run build

# Remove old build files
echo "Removing old build files from $TARGET_DIR..."
sudo rm -rf $TARGET_DIR/*

# Copy new build files
echo "Copying new build files from $BUILD_DIR to $TARGET_DIR..."
sudo cp -r $BUILD_DIR/* $TARGET_DIR/

# Test Nginx configuration
echo "Testing Nginx configuration..."
if sudo nginx -t; then
    echo "Nginx configuration is OK."
else
    echo "Nginx configuration test failed!"
    exit 1
fi

# Restart Nginx
echo "Restarting Nginx..."
sudo systemctl restart nginx

echo "Deployment complete!"