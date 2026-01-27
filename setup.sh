#!/bin/bash

# ============================================
# FAIL FRENZY - Setup Script
# Automated installation and deployment
# ============================================

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ $1${NC}"
}

# Banner
clear
echo -e "${CYAN}"
cat << "EOF"
 ███████╗ █████╗ ██╗██╗          ███████╗██████╗ ███████╗███╗   ██╗███████╗██╗   ██╗
 ██╔════╝██╔══██╗██║██║          ██╔════╝██╔══██╗██╔════╝████╗  ██║╚══███╔╝╚██╗ ██╔╝
 █████╗  ███████║██║██║          █████╗  ██████╔╝█████╗  ██╔██╗ ██║  ███╔╝  ╚████╔╝ 
 ██╔══╝  ██╔══██║██║██║          ██╔══╝  ██╔══██╗██╔══╝  ██║╚██╗██║ ███╔╝    ╚██╔╝  
 ██║     ██║  ██║██║███████╗     ██║     ██║  ██║███████╗██║ ╚████║███████╗   ██║   
 ╚═╝     ╚═╝  ╚═╝╚═╝╚══════╝     ╚═╝     ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚══════╝   ╚═╝   
                                                                                       
                     Premium Game Engine Setup v2.0.0
EOF
echo -e "${NC}\n"

# ============================================
# 1. Check Prerequisites
# ============================================
print_header "1. Checking Prerequisites"

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js not found. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js 18+ required. Current version: $(node -v)"
    exit 1
fi
print_success "Node.js $(node -v) found"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm not found"
    exit 1
fi
print_success "npm $(npm -v) found"

# Check Git
if ! command -v git &> /dev/null; then
    print_warning "Git not found (optional for deployment)"
else
    print_success "Git $(git --version | cut -d' ' -f3) found"
fi

# ============================================
# 2. Install Dependencies
# ============================================
print_header "2. Installing Dependencies"

if [ -d "node_modules" ]; then
    print_info "Dependencies already installed. Skipping..."
else
    npm install
    print_success "Dependencies installed"
fi

# ============================================
# 3. Build Project
# ============================================
print_header "3. Building Project"

npm run build
print_success "Build completed successfully"

# ============================================
# 4. Setup Cloudflare (Optional)
# ============================================
print_header "4. Cloudflare Setup (Optional)"

read -p "Do you want to deploy to Cloudflare Pages? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    
    # Check wrangler
    if ! command -v wrangler &> /dev/null; then
        print_info "Installing Wrangler CLI..."
        npm install -g wrangler
        print_success "Wrangler installed"
    else
        print_success "Wrangler $(wrangler --version) found"
    fi
    
    # Login
    print_info "Logging in to Cloudflare..."
    npx wrangler login
    
    # Create D1 Database
    print_info "Creating D1 Database..."
    echo "Running: npx wrangler d1 create failfrenzy-production"
    npx wrangler d1 create failfrenzy-production || print_warning "Database might already exist"
    
    print_warning "IMPORTANT: Copy the database_id from above and update wrangler.jsonc"
    read -p "Press Enter after updating wrangler.jsonc..."
    
    # Apply Migrations
    print_info "Applying database migrations..."
    npx wrangler d1 migrations apply failfrenzy-production
    print_success "Migrations applied"
    
    # Create KV Namespace
    print_info "Creating KV Namespace..."
    npx wrangler kv:namespace create failfrenzy_KV || print_warning "KV namespace might already exist"
    
    print_warning "IMPORTANT: Copy the namespace_id from above and update wrangler.jsonc if needed"
    read -p "Press Enter to continue..."
    
    # Create Pages Project
    print_info "Creating Cloudflare Pages project..."
    npx wrangler pages project create failfrenzy-engine --production-branch main || print_warning "Project might already exist"
    
    # Deploy
    print_info "Deploying to Cloudflare Pages..."
    npx wrangler pages deploy dist --project-name failfrenzy-engine
    
    print_success "Deployment complete!"
    print_info "Your game is now live at: https://failfrenzy-engine.pages.dev"
else
    print_info "Skipping Cloudflare deployment"
fi

# ============================================
# 5. Local Development
# ============================================
print_header "5. Local Development"

read -p "Do you want to start the development server? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Starting development server..."
    print_success "Server will start at http://localhost:5173"
    print_info "Press Ctrl+C to stop"
    sleep 2
    npm run dev
else
    print_info "You can start the dev server later with: npm run dev"
fi

# ============================================
# 6. Summary
# ============================================
print_header "Setup Complete! 🎉"

echo -e "${GREEN}✓ Project built successfully${NC}"
echo -e "${GREEN}✓ Ready for development${NC}"
echo ""
echo -e "${CYAN}Next steps:${NC}"
echo -e "  ${YELLOW}→${NC} Start dev server: ${GREEN}npm run dev${NC}"
echo -e "  ${YELLOW}→${NC} Open in browser: ${GREEN}http://localhost:5173${NC}"
echo -e "  ${YELLOW}→${NC} Build for production: ${GREEN}npm run build${NC}"
echo -e "  ${YELLOW}→${NC} Deploy to Cloudflare: ${GREEN}npx wrangler pages deploy dist${NC}"
echo ""
echo -e "${CYAN}Documentation:${NC}"
echo -e "  ${YELLOW}→${NC} Quick Start: ${GREEN}QUICK_START.md${NC}"
echo -e "  ${YELLOW}→${NC} README: ${GREEN}README.md${NC}"
echo -e "  ${YELLOW}→${NC} Tech Stack: ${GREEN}TECH_STACK.md${NC}"
echo -e "  ${YELLOW}→${NC} Game Design: ${GREEN}GAME_DESIGN.md${NC}"
echo ""
echo -e "${CYAN}Live Demo:${NC}"
echo -e "  ${YELLOW}→${NC} ${GREEN}https://3000-i11ms75x9cfbfo1jisle0-02b9cc79.sandbox.novita.ai${NC}"
echo ""
print_success "Happy coding! 🚀"
