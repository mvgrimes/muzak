FROM node:6

WORKDIR /srv/app

# Create a user to run our app
RUN groupadd -r app && useradd --no-log-init -r -m -g app app

# Install prereqs for XML::LibXML, XML::LibXSLT, etc
# RUN apt-get update && apt-get install -y \
#       libgdbm-dev   \
#       libexpat1-dev \
#       libxml2-dev   \
#       libxslt1-dev

# Set ENV variables
# ENV MOJO_LOG_LEVEL=info  \
#   MOJO_MODE=production   \
#   MOJO_REVERSE_PROXY=1   \
#   PORT=5000

# Install prereqs
COPY ./package.json ./
RUN npm install

# Copy the app (make sure .dockerignore is properly populated)
COPY . ./

USER app:app
CMD npm start
