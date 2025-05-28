#!/bin/bash

# Docker build and test script for WhatsApp Bot
# This script builds the Docker image and tests it locally

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="wabot-typescript-dmr"
CONTAINER_NAME="wabot-test"
TAG="latest"

echo -e "${BLUE}🐳 WhatsApp Bot - Docker Build & Test${NC}"
echo "====================================="

# Function to cleanup containers
cleanup() {
    echo -e "${YELLOW}🧹 Cleaning up test containers...${NC}"
    docker stop "$CONTAINER_NAME" 2>/dev/null || true
    docker rm "$CONTAINER_NAME" 2>/dev/null || true
}

# Function to build Docker image
build_image() {
    echo -e "${BLUE}🔨 Building Docker image...${NC}"
    
    if docker build -t "$IMAGE_NAME:$TAG" .; then
        echo -e "${GREEN}✅ Docker image built successfully${NC}"
    else
        echo -e "${RED}❌ Docker build failed${NC}"
        exit 1
    fi
}

# Function to test Docker image
test_image() {
    echo -e "${BLUE}🧪 Testing Docker image...${NC}"
    
    # Cleanup any existing test containers
    cleanup
    
    # Check if .env file exists for testing
    if [ ! -f ".env" ]; then
        echo -e "${YELLOW}⚠️  No .env file found. Creating test environment...${NC}"
        cp .env.example .env.test
        
        # Set test values
        cat > .env.test << EOF
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wabot_test
DB_USER=postgres
DB_PASSWORD=testpass
OWNER_NUMBER=628123456789
BOT_NAME=Test Bot
PORT=3000
HEADLESS=true
USE_CHROME=true
CHROME_PATH=/usr/bin/chromium-browser
WA_HEADLESS=true
SESSION_DATA_PATH=/app/data
TZ=Asia/Jakarta
EOF
        ENV_FILE=".env.test"
    else
        ENV_FILE=".env"
    fi
    
    echo -e "${BLUE}🚀 Starting test container...${NC}"
    
    # Run container with test environment
    if docker run -d \
        --name "$CONTAINER_NAME" \
        --env-file "$ENV_FILE" \
        -p 3001:3000 \
        "$IMAGE_NAME:$TAG"; then
        
        echo -e "${GREEN}✅ Container started successfully${NC}"
        
        # Wait for container to be ready
        echo -e "${BLUE}⏳ Waiting for application to start...${NC}"
        sleep 10
        
        # Check if container is still running
        if docker ps | grep -q "$CONTAINER_NAME"; then
            echo -e "${GREEN}✅ Container is running${NC}"
            
            # Check logs for errors
            echo -e "${BLUE}📋 Checking container logs...${NC}"
            docker logs "$CONTAINER_NAME" 2>&1 | tail -20
            
            # Test health endpoint if available
            echo -e "${BLUE}🏥 Testing health endpoint...${NC}"
            if curl -f -s http://localhost:3001/health > /dev/null 2>&1; then
                echo -e "${GREEN}✅ Health endpoint responding${NC}"
            else
                echo -e "${YELLOW}⚠️  Health endpoint not available (this is normal for WhatsApp bots)${NC}"
            fi
            
        else
            echo -e "${RED}❌ Container stopped unexpectedly${NC}"
            echo -e "${RED}Container logs:${NC}"
            docker logs "$CONTAINER_NAME" 2>&1
            cleanup
            exit 1
        fi
        
    else
        echo -e "${RED}❌ Failed to start container${NC}"
        exit 1
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  build     Build Docker image only"
    echo "  test      Test Docker image only (requires built image)"
    echo "  clean     Clean up test containers and images"
    echo "  push      Build and push to registry (requires DOCKER_REGISTRY env var)"
    echo "  help      Show this help message"
    echo ""
    echo "If no option is provided, both build and test will be executed."
}

# Function to clean up
clean_all() {
    echo -e "${YELLOW}🧹 Cleaning up Docker resources...${NC}"
    
    cleanup
    
    # Remove test env file
    rm -f .env.test
    
    # Remove Docker image
    docker rmi "$IMAGE_NAME:$TAG" 2>/dev/null || true
    
    echo -e "${GREEN}✅ Cleanup completed${NC}"
}

# Function to push image
push_image() {
    if [ -z "$DOCKER_REGISTRY" ]; then
        echo -e "${RED}❌ DOCKER_REGISTRY environment variable not set${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}📤 Pushing image to registry...${NC}"
    
    # Tag for registry
    docker tag "$IMAGE_NAME:$TAG" "$DOCKER_REGISTRY/$IMAGE_NAME:$TAG"
    
    # Push to registry
    if docker push "$DOCKER_REGISTRY/$IMAGE_NAME:$TAG"; then
        echo -e "${GREEN}✅ Image pushed successfully${NC}"
    else
        echo -e "${RED}❌ Failed to push image${NC}"
        exit 1
    fi
}

# Main execution
case "${1:-all}" in
    "build")
        build_image
        ;;
    "test")
        test_image
        echo -e "${BLUE}🎉 Test completed! Container is running on http://localhost:3001${NC}"
        echo -e "${YELLOW}💡 To stop the test container, run: docker stop $CONTAINER_NAME${NC}"
        ;;
    "clean")
        clean_all
        ;;
    "push")
        build_image
        push_image
        ;;
    "help")
        show_usage
        ;;
    "all")
        build_image
        test_image
        echo -e "${GREEN}🎉 Build and test completed successfully!${NC}"
        echo -e "${YELLOW}💡 To stop the test container, run: docker stop $CONTAINER_NAME${NC}"
        ;;
    *)
        echo -e "${RED}❌ Unknown option: $1${NC}"
        show_usage
        exit 1
        ;;
esac
