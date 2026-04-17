#!/bin/bash

# HELLCORP GLOBAL ENTERPRISE (HGE) - SETUP INITIALIZATION
# ========================================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${CYAN}----------------------------------------------------------${NC}"
echo -e "${CYAN}   HELLCORP GLOBAL ENTERPRISE (HGE) - SYSTEM INITIALIZER  ${NC}"
echo -e "${CYAN}----------------------------------------------------------${NC}"

# Check for .env.example
if [ ! -f .env.example ]; then
    echo -e "${RED}[ERROR] .env.example not found. Please run this from the project root.${NC}"
    exit 1
fi

# Create .env if it doesn't exist
if [ -f .env ]; then
    echo -e "${YELLOW}[INFO] .env already exists. Backing up to .env.bak...${NC}"
    cp .env .env.bak
fi

echo -e "${GREEN}[STEP 1/3] Initializing environment variables...${NC}"
cp .env.example .env

# Generate random secrets using openssl or /dev/urandom
generate_secret() {
    if command -v openssl >/dev/null 2>&1; then
        openssl rand -hex 32
    else
        cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 64 | head -n 1
    fi
}

echo -e "${GREEN}[STEP 2/3] Generating secure session secrets...${NC}"
JWT_SECRET=$(generate_secret)
REFRESH_SECRET=$(generate_secret)
SESSION_SECRET=$(generate_secret)

# Inject secrets into .env
# Use a temporary file for portability with sed on different systems
sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
sed -i "s/JWT_REFRESH_SECRET=.*/JWT_REFRESH_SECRET=$REFRESH_SECRET/" .env
sed -i "s/SESSION_SECRET=.*/SESSION_SECRET=$SESSION_SECRET/" .env

echo -e "${GREEN}[STEP 3/3] Verifying system dependencies...${NC}"
DOCKER_OK=true
if ! command -v docker >/dev/null 2>&1; then
    echo -e "${YELLOW}[WARN] Docker not found. Please install it to use HGE.${NC}"
    DOCKER_OK=false
fi

if ! command -v docker-compose >/dev/null 2>&1; then
    # Check for docker compose V2
    if ! docker compose version >/dev/null 2>&1; then
        echo -e "${YELLOW}[WARN] Docker Compose not found.${NC}"
        DOCKER_OK=false
    fi
fi

echo -e "${CYAN}----------------------------------------------------------${NC}"
if [ "$DOCKER_OK" = true ]; then
    echo -e "${GREEN}SUCCESS: HGE is ready for deployment.${NC}"
    echo -e "Run the following command to start the lab:"
    echo -e "${YELLOW}  docker-compose up --build -d${NC}"
else
    echo -e "${YELLOW}MANUAL ACTION REQUIRED: Please install Docker and then run:${NC}"
    echo -e "  docker-compose up --build -d"
fi
echo -e "${CYAN}----------------------------------------------------------${NC}"
