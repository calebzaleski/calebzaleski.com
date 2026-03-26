FROM nginx:alpine
LABEL authors="calebzaleski"

RUN rm -rf /usr/share/nginx/html/*

COPY . /usr/share/nginx/html/

COPY default.conf /etc/nginx/conf.d/default.conf


EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
