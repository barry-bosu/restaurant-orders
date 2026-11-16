
FROM nginx:alpine

# Copiar los archivos de la interfaz
COPY index.html /usr/share/nginx/html/index.html
COPY style.css /usr/share/nginx/html/style.css
COPY app.js /usr/share/nginx/html/app.js

# Copiar la carpeta de imágenes
COPY images/ /usr/share/nginx/html/images/

EXPOSE 80
