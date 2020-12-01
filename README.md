universal-identity-api
===

# Dependencies

- Nodejs v12
- `libindy`(https://github.com/hyperledger/indy-sdk) v1.15.0
- ngrok(https://www.npmjs.com/package/ngrok)
- DynamoDB
- Docker
- Google Firebase
- AWS SNS

# Install `libindy`
See [docs/install_libindy.md](./docs/install_libindy.md).

# Configuration
All configuration values can be found in `./config/default.js`.

# Local Services
To run DynamoDB and S3 compatible service in docker, go to the `./local` folder and execute `docker-compose up`.

# Google Firebase Setup
1. In the [Firebase console](https://console.firebase.google.com/), choose your project or add a new project following the instruction.
2. In the left navigation pane, choose the gear icon, and then choose **Project settings**.
3. Under **General**, find **Your apps** section, add Firebase to android app by clicking the android icon.
4. Follow the instruction to input app's package name(example: `com.google.firebase.quickstart.fcm`), click **Register app** and download config file(**google-services.json**).
5. You need to place the config file under `PROJECT_ROOT/app` folder, `PROJECT_ROOT` is the root folder of your project.
6. After finish the app creation, go back to **Project settings** page and choose **Cloud Messaging**.
7. Under **Project credentials**, find the **Server key** and mark it down.

# Amazon SNS Setup
1. In the [AWS SNS console](https://console.aws.amazon.com/sns), choose **Push notifications** on the left navigation menu.
2. Click **create platform application** menu, input the application name, choose **Firebase Cloud Messaging (FCM)** in **Push notification platform** drop-down menu.
3. Input the API key using **Server key** retrieved from [Google Firebase Setup](#google-firebase-setup) step 7
4. Click **Create platform application** button and mark down the ARN in the platform application detail page. You need to use this ARN value to setup configuration `AMAZON.SNS_PLATFORM_APPLICATION_ANDROID_ARN` in `config/default.js` file. Or you can set up the process environment `SNS_PLATFORM_APPLICATION_ANDROID_ARN`

# Example Android App Setup
1. Run command `git clone https://github.com/firebase/quickstart-android.git` to clone example project, let is assume the project name is `quickstart-android`
2. Copy **google-services.json** mentioned in step 4 of [Goole Firebase Setup](#google-firebase-setup) to folder `quickstart-android/messaging/app`
3. Open `quickstart-android/messaging` in Android Studio, make sure you have create an emulator(create one under **Tools**->**AVD Manager** if not), choose **Run 'app'** under `Run` menu.

# Ngrok Setup
Run `ngrok http 3001`.

You can see a publicly accessable URL(e.g. `http://de0d4e5ac44a.ngrok.io`) from the output.
Write down the URL. It will be used in `VERITY_WEBHOOK_ENDPOINT_URL`.

# Available Scripts
- `npm run create-tables` create tables in DynamoDB.
- `npm run delete-tables` delete tables in DynamoDB.
- `npm run init-db` clear all data in DB.

# Local Deployment
- Make sure you are using Nodejs v12 and then install deps: `npm install`
- Lint: `npm run lint`
- Lint fix: `npm run lint:fix`
- Run DynamoDB and Local S3(see [Local Services](#local-services)).
- Forward the API via ngrok(see [Ngrok Setup](#ngrok-setup)).
- Follow instruction to setup Google Firebase(see [Google Firebase Setup](#google-firebase-setup)), Amazon SNS(see [Amazon SNS Setup](#amazon-sns-setup)), Example Android App (see [Example Android App Setup](#example-android-app-setup))
- Configure `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `SNS_PLATFORM_APPLICATION_ANDROID_ARN`, `VERITY_PROVISION_TOKEN` and `VERITY_WEBHOOK_ENDPOINT_URL`. **Important Notes**: you need to use your real AWS credentials since you need to use AWS SNS service, don't use fake credentials.

  ``` bash
  export AWS_ACCESS_KEY_ID=<your AWS access key id>
  export AWS_SECRET_ACCESS_KEY=<your AWS secret key>
  export SNS_PLATFORM_APPLICATION_ANDROID_ARN=<your AWS SNS Platform application ARN>
  export VERITY_PROVISION_TOKEN=<your provision token>
  export VERITY_WEBHOOK_ENDPOINT_URL=<your ngrok url>
  ```

- Start the app: `npm start`

By default the app is listening on port 3001.

# Verification
See [Verification.md](./Verification.md)
