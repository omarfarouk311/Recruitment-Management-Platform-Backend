FROM node:22.13.1-bookworm-slim
WORKDIR /src
COPY . .
RUN ["npm","install"]
ENTRYPOINT [ "npm" ]
CMD [ "start" ]