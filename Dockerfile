FROM nginx:alpine
LABEL authors="calebzaleski"


COPY . /usr/share/nginx/html/

COPY nginx.conf /etc/nginx/nginx.conf



EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
