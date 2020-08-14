universal-identity-api
===

# Dependencies

- Nodejs v12
- `libindy`(https://github.com/hyperledger/indy-sdk) v1.15.0
- ngrok(https://www.npmjs.com/package/ngrok)
- Docker

# Install `libindy`
See [docs/install_libindy.md](./docs/install_libindy.md).

# Configuration
All configuration values can be found in `./config/default.js`.

# MongoDB in Docker
To run the mongoDB in docker, go to the `./local` folder and execute `docker-compose up`.

# Ngrok Setup
Run `ngrok http 3001`.

You can see a publicly accessable URL(e.g. `http://de0d4e5ac44a.ngrok.io`) from the output.
Write down the URL. It will be used in `VERITY_WEBHOOK_ENDPOINT_URL`.

# Local Deployment
- Make sure you are using Nodejs v12 and then install deps: `npm install`
- Lint: `npm run lint`
- Lint fix: `npm run lint:fix`
- Run the mongoDB(see [MongoDB in Docker](#mongodb-in-docker)).
- Forward the API via ngrok(see [Ngrok Setup](#ngrok-setup)).
- Configure `VERITY_PROVISION_TOKEN` and `VERITY_WEBHOOK_ENDPOINT_URL`

``` bash
export VERITY_PROVISION_TOKEN=<your provision token>
export VERITY_WEBHOOK_ENDPOINT_URL=<your ngrok url>/verity/webhook
```

- Start the app: `npm start`

By default the app is listening on port 3001.

# Verification
See [Verification.md](./Verification.md)
