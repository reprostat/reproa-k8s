# Use the official Python image from the Docker Hub
FROM python:3.12-slim

# Set the working directory inside the container
WORKDIR /app

COPY . .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Ensure the storage directory exists
RUN mkdir -p storage

# Expose the port Flask is running on
EXPOSE 8000

# Command to run the app
CMD ["python", "rest-file.py"]
