#!/bin/bash

# Set up script for Termux to configure project environment

# Update package list
pkg update && pkg upgrade -y

# Install necessary dependencies
pkg install git -y
pkg install python -y
pkg install nodejs -y
pkg install curl -y

# Clone the repository
git clone https://github.com/xerox1989/QCV.git

# Navigate into the project directory
cd QCV

# Install Python dependencies
pip install -r requirements.txt

# Install Node.js dependencies
npm install

# Additional setup commands (if necessary)

echo "Setup completed successfully!"