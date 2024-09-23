# reprostat/reproa-k8s_frontend:dev

# Use the official Nginx image
FROM nginx:alpine

# Copy the custom Nginx configuration file
COPY ./config/nginx.conf /etc/nginx/nginx.conf

# Copy the files into the Nginx HTML folder
COPY ./src /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
