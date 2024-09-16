# Use an official Python runtime as a parent image
FROM python:3.12-slim

# Set the working directory inside the container
WORKDIR /app

# Copy everything into the container
COPY . .

# Install any required Python packages (add here if needed)
RUN pip install --no-cache-dir -r requirements.txt

# Run the processor script when the container starts
CMD ["python", "processor.py"]
