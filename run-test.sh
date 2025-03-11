
#!/bin/bash

# Colors for better output
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
NC="\033[0m" # No Color

echo -e "${YELLOW}Starting local business scraper test for Carleton Place, Ontario, Canada...${NC}"
echo -e "${YELLOW}Using format: City, Province, Country${NC}"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}Error: Supabase CLI is not installed.${NC}"
    echo "Please install it with: npm install -g supabase"
    exit 1
fi

# Directory containing the Supabase functions
FUNCTIONS_DIR="./supabase/functions"

# Check if the functions directory exists
if [ ! -d "$FUNCTIONS_DIR" ]; then
    echo -e "${RED}Error: Functions directory not found at $FUNCTIONS_DIR${NC}"
    exit 1
fi

echo -e "${GREEN}Starting Supabase Functions server...${NC}"
echo "This will run in the background. Press Ctrl+C to stop when testing is complete."

# Start Supabase Functions server in the background
supabase functions serve --no-verify-jwt &
SUPABASE_PID=$!

# Give the server a moment to start up
echo "Waiting for server to start..."
sleep 5

echo -e "\n${GREEN}Running enhanced test script...${NC}"
echo "This will test the scraper with location: 'Carleton Place, Ontario, Canada'"

# Run the test script with Node.js
node test-enhanced-scraper.js

echo -e "\n${YELLOW}Test completed. Shutting down Supabase Functions server...${NC}"

# Kill the Supabase Functions server
kill $SUPABASE_PID

echo -e "${GREEN}Done!${NC}"
