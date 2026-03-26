FROM nginx:alpine
LABEL authors="calebzaleski"


COPY . /calebzaleski.com/ /usr/share/nginx/html/

COPY default.conf /etc/nginx/conf.d/default.conf


EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
