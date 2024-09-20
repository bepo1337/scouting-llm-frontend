# LLM4Scouting-Frontend
General explanation abt the proj

## Disclaimer 
This project is a university project for the course [Web Interfaces for Language Processing Systems](https://www.inf.uni-hamburg.de/en/inst/ab/lt/teaching/ma-projects/master-project-web-interfaces.html) at the [University of Hamburg](https://www.uni-hamburg.de/).

# Prerequisites
- Install Node and npm https://nodejs.org/en
- Yarn (after installing npm run `npm install -g yarn`)

# Install
`yarn install`

# Run
`yarn dev`

# Docker
To build & run the docker image locally, run: \
`docker build -t scouting-frontend .` \
`docker run -p 3000:3000 scouting-frontend` \

To change the default values for port and backend server, they can be passed when starting the container like \
`docker run -e VITE_PORT=4000 -e VITE_BACKEND_URL=mytest:4999 -p 4000:4000 scouting-frontend`

The compose file to start Frontend and Backend together with appropriate defaults will be provided in the backend under https://github.com/bepo1337/scouting-llm 
## Authors

* **Benjamin Pöhlmann** - [bepo1337](https://github.com/bepo1337)

* **Marvin Schmohl**    - [marvinschmohl](https://github.com/marvinschmohl)
