#!/bin/bash

# Tuabi Docker Management Script
# Usage: ./docker-scripts.sh [command]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to check if docker-compose is available
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_error "docker-compose is not installed. Please install it and try again."
        exit 1
    fi
}

# Start development environment
start_dev() {
    print_header "Starting Development Environment"
    check_docker
    check_docker_compose
    
    print_status "Starting all services..."
    docker-compose up -d
    
    print_status "Waiting for services to be ready..."
    sleep 10
    
    print_status "Checking service status..."
    docker-compose ps
    
    print_status "Development environment is ready!"
    print_status "API: http://localhost:3000"
    print_status "pgAdmin: http://localhost:8080 (admin@tuabi.com / admin123)"
    print_status "Redis Commander: http://localhost:8081"
}

# Start production environment
start_prod() {
    print_header "Starting Production Environment"
    check_docker
    check_docker_compose
    
    print_status "Starting production services..."
    docker-compose -f docker-compose.yml up -d
    
    print_status "Waiting for services to be ready..."
    sleep 15
    
    print_status "Checking service status..."
    docker-compose ps
    
    print_status "Production environment is ready!"
    print_status "API: http://localhost:3000"
}

# Stop all services
stop() {
    print_header "Stopping All Services"
    check_docker_compose
    
    print_status "Stopping services..."
    docker-compose down
    
    print_status "All services stopped."
}

# Stop and remove volumes
stop_clean() {
    print_header "Stopping All Services and Cleaning Volumes"
    check_docker_compose
    
    print_warning "This will remove all data including the database!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Stopping services and removing volumes..."
        docker-compose down -v
        print_status "All services stopped and volumes removed."
    else
        print_status "Operation cancelled."
    fi
}

# View logs
logs() {
    local service=${1:-""}
    
    if [ -z "$service" ]; then
        print_header "Viewing All Logs"
        docker-compose logs -f
    else
        print_header "Viewing Logs for $service"
        docker-compose logs -f "$service"
    fi
}

# Rebuild images
rebuild() {
    print_header "Rebuilding Docker Images"
    check_docker_compose
    
    print_status "Rebuilding images..."
    docker-compose build --no-cache
    
    print_status "Images rebuilt successfully."
}

# Database operations
db() {
    local operation=${1:-"status"}
    
    case $operation in
        "migrate")
            print_header "Running Database Migrations"
            docker-compose exec api npx prisma migrate deploy
            ;;
        "studio")
            print_header "Opening Prisma Studio"
            docker-compose exec api npx prisma studio
            ;;
        "reset")
            print_warning "This will reset the database and remove all data!"
            read -p "Are you sure? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                print_status "Resetting database..."
                docker-compose exec api npx prisma migrate reset --force
            else
                print_status "Operation cancelled."
            fi
            ;;
        "generate")
            print_status "Generating Prisma client..."
            docker-compose exec api npx prisma generate
            ;;
        *)
            print_header "Database Status"
            docker-compose exec api npx prisma db push --accept-data-loss
            ;;
    esac
}

# Health check
health() {
    print_header "Health Check"
    
    # Check if services are running
    if docker-compose ps | grep -q "Up"; then
        print_status "Services are running."
        
        # Check API health
        if curl -s http://localhost:3000/health > /dev/null; then
            print_status "API is healthy."
        else
            print_error "API is not responding."
        fi
        
        # Check database
        if docker-compose exec -T api npx prisma db push --accept-data-loss > /dev/null 2>&1; then
            print_status "Database is healthy."
        else
            print_error "Database connection failed."
        fi
        
        # Check Redis
        if docker-compose exec redis redis-cli ping | grep -q "PONG"; then
            print_status "Redis is healthy."
        else
            print_error "Redis is not responding."
        fi
    else
        print_error "No services are running."
    fi
}

# Show status
status() {
    print_header "Service Status"
    docker-compose ps
}

# Show help
help() {
    print_header "Tuabi Docker Management Script"
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  start-dev     Start development environment"
    echo "  start-prod    Start production environment"
    echo "  stop          Stop all services"
    echo "  stop-clean    Stop and remove all data"
    echo "  logs [service] View logs (all or specific service)"
    echo "  rebuild       Rebuild Docker images"
    echo "  db [operation] Database operations"
    echo "  health        Check service health"
    echo "  status        Show service status"
    echo "  help          Show this help message"
    echo ""
    echo "Database operations:"
    echo "  db migrate    Run database migrations"
    echo "  db studio     Open Prisma Studio"
    echo "  db reset      Reset database (WARNING: removes all data)"
    echo "  db generate   Generate Prisma client"
    echo ""
    echo "Examples:"
    echo "  $0 start-dev"
    echo "  $0 logs api"
    echo "  $0 db studio"
}

# Main script logic
case "${1:-help}" in
    "start-dev")
        start_dev
        ;;
    "start-prod")
        start_prod
        ;;
    "stop")
        stop
        ;;
    "stop-clean")
        stop_clean
        ;;
    "logs")
        logs "$2"
        ;;
    "rebuild")
        rebuild
        ;;
    "db")
        db "$2"
        ;;
    "health")
        health
        ;;
    "status")
        status
        ;;
    "help"|*)
        help
        ;;
esac 