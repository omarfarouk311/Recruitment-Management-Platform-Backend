#!/bin/bash

# Check if the correct number of arguments is provided
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <app_name> <path>"
    exit 1
fi

# Assign arguments to variables
APP_NAME=$1
PATH=$2

# Create the specified files
touch "$PATH/${APP_NAME}Authorization.js"
touch "$PATH/${APP_NAME}Validation.js"
touch "$PATH/${APP_NAME}Router.js"
touch "$PATH/${APP_NAME}Controller.js"
touch "$PATH/${APP_NAME}Service.js"
touch "$PATH/${APP_NAME}Model.js"

echo "Files created successfully in $PATH"