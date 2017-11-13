IMAGE=mg/alexa-lms

build:
	docker build -t ${IMAGE} -f Dockerfile ../

# build-dev:
# 	docker build -t ${IMAGE} -f Dockerfile ../

# build-all: build build-cron

run:
	docker-compose -c docker-compose.yml run --service-ports web
	# docker-compose -c docker-compose.yml -c development.yml run --service-ports web

dev:
	docker-compose -c docker-compose.yml run --service-ports dev
	# docker-compose run --service-ports web carton exec morbo -w app.pl -l http://*:5000 ./app.pl

shell:
	docker-compose -c docker-compose.yml run /bin/bash
	# docker-compose -c docker-compose.yml -c development.yml run bash
	# docker-compose run web bash

# cron:
# 	docker-compose run cron

up:
	docker-compose -c docker-compose.yml up
	docker-compose -c docker-compose.yml -c development.yml up
	# docker-compose up

push:
	docker tag ${IMAGE}:latest registry.peculier.com/${IMAGE}
	docker push registry.peculier.com/${IMAGE}

# backup:
# 	docker-compose run web ./script/pasa-backup-db
