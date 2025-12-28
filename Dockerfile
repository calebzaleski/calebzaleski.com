FROM nginx:alpine
LABEL authors="calebzaleski"


COPY . /usr/share/nginx/html/


EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
