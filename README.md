# LLM4Scouting-Frontend
This is the frontend client for the LLM4Scouting application. It offers a UI for the "Scouting as a Prompt", "Compare Players" and "Player Network" features. They are further described in the [backend repository](https://github.com/bepo1337/scouting-llm).

It was written using the following main technologies:
- React
- Vite
- Shadcn
- Tailwind
- Vis

## Disclaimer 🎓
This project is a university project for the course [Web Interfaces for Language Processing Systems](https://www.inf.uni-hamburg.de/en/inst/ab/lt/teaching/ma-projects/master-project-web-interfaces.html) at the [University of Hamburg](https://www.uni-hamburg.de/).

# How to run

## Prerequisites
- Install Node and npm https://nodejs.org/en 
- Yarn (after installing npm run `npm install -g yarn`)

## Install dependencies
To install the libraries we are using, run the following command: \
`yarn install`

## Start
To start the frontend run the following command: \
`yarn dev`

# Build and run Docker container 🐋
To build & run the docker image locally, run: \
`docker build -t scouting-llm-frontend:1.0.0 .` \
`docker run -p 3000:3000 scouting-llm-frontend:1.0.0` 

To change the default values for port and backend server, they can be passed when starting the container like \
`docker run -e VITE_PORT=4000 -e VITE_BACKEND_URL=http://my-backend-server:5000 -p 4000:4000 scouting-llm-frontend`

The compose file to start the full stack together with appropriate defaults will be provided in the backend repository under https://github.com/bepo1337/scouting-llm 
## Authors

* **Benjamin Pöhlmann** - [bepo1337](https://github.com/bepo1337)

* **Marvin Schmohl**    - [marvinschmohl](https://github.com/marvinschmohl)
