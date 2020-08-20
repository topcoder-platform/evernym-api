# Heroku Deployment Guide

Link to Heroku Official Guide : https://devcenter.heroku.com/articles/container-registry-and-runtime

## Building Docker Image

Build the docker image locally to push it to heroku

```
$ docker build -t evernym-api .
```

## Deploying using Heroku CLI

1. Install `heroku-cli` from https://devcenter.heroku.com/articles/heroku-cli.
2. Go to project root
3. Login to heroku and heroku container registry, then create new App, if doesn't exist, with a name for deployment
   ```
   $ heroku login
   $ heroku container:login
   $ heroku create APP_NAME
   ```
4. Push your container to heroku, then release it
   ```
   $ heroku container:push web
   $ heroku container:release web
   ```

## Configuring Environment Variables

You can set the configuration values in `./config/default.js` or as deployment environment variable values ie heroku `config vars`.
<br/>
To set config vars (after creation of app), you can use heroku dashboard (Dashboard > App_Name > Settings > Config Vars) or the heroku cli: [Link to Article](https://devcenter.heroku.com/articles/config-vars).
For Example.

```
$ heroku config:set VERITY_WALLET_NAME="mywallet" VERITY_WALLET_KEY="xxx123"
```

\*\*\* Important: Set the `VERITY_WEBHOOK_ENDPOINT_URL` to heroku app url manually, with the following command

```
$ heroku config:set VERITY_WEBHOOK_ENDPOINT_URL=$(heroku info -s | grep web_url | cut -d= -f2)
```

# Mongo

https://elements.heroku.com/addons/mongolab

Please note: mLab has discontinued the MongoDB add-on. Please migrate to a new MongoDB provider before November 10, 2020.

After installing mLab MongoDB, MONGODB_URI env is set automatically
