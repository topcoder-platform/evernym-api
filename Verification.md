Verification
===

# Preparation
## Start the app
Follow the section [Local Deployment](README.md#local-deployment) to start the app.

Here is what you can see from the output when you run the app the first time:

``` bash
> node app.js

APP is listening on 3001
2020-08-11T22:24:54.545Z info creating context...
2020-08-11T22:24:57.668Z info context created
2020-08-11T22:24:58.349Z info webhook endpoint updated
2020-08-11T22:24:59.025Z info institution info updated
2020-08-11T22:24:59.025Z info quering public identifier...
2020-08-11T22:24:59.835Z info Creating issuer identifier...
2020-08-11T22:25:00.646Z info issuer identifier created
2020-08-11T22:25:03.210Z info issuer initilized successfully
```

The context will be saved to local file(the pathname of the file is defined by `VERITY_CONTEXT_PATH`) which will be reused when you run the app again.

**Note**  in the case that the app hang up at stage "info quering public identifier..." you should check if the ngrok url is valid and is correctly hooked up with the app port.

## Setup Postman
Import the postman collection and environment files located at `./docs` to Postman program.
We are going to request the API via Postman.

## Setup Connect.Me
Please follow the instruction on [./docs/getting_connect_me.md](./docs/getting_connect_me.md).

# Make requests
## Create a relationship
Execute the `create RelationShip` request in Postman.
The response body should look like:

``` json

    "relDID": "QC4vxHYqtzxAaMQ1gUXcFh",
    "inviteURL": "http://vas.pps.evernym.com:80/agency/msg?c_i=eyJsYWJlbCI6InJlbDAxIiwic2VydmljZUVuZHBvaW50IjoiaHR0cDovL3Zhcy5wcHMuZXZlcm55bS5jb206ODAvYWdlbmN5L21zZyIsInJlY2lwaWVudEtleXMiOlsiRGU3RjhZZ1FmNzhCdWZaUGplZWdTdDFoYzRNM0xxVnFwcnlNWmdzbVZ6V2kiXSwicm91dGluZ0tleXMiOlsiRGU3RjhZZ1FmNzhCdWZaUGplZWdTdDFoYzRNM0xxVnFwcnlNWmdzbVZ6V2kiLCJFeFBGTHg0dU5qRjlqUlFKVjdYeEF0OE1mdVhKRU5nYmdBMXFObVd6bnNSWiJdLCJwcm9maWxlVXJsIjoiaHR0cHM6Ly9yb2JvaGFzaC5vcmcvMjM0IiwiQHR5cGUiOiJkaWQ6c292OkJ6Q2JzTlloTXJqSGlxWkRUVUFTSGc7c3BlYy9jb25uZWN0aW9ucy8xLjAvaW52aXRhdGlvbiIsIkBpZCI6ImQ5ZTJjMzI4LWM2MDUtNGNiMC1iNzY2LWE2YjJkOWI3YmYzMiJ9",
    "name": "rel01",
    "id": "533e7959-e5ac-4aaa-901b-077d64085a5e",
    "createdAt": "2020-11-12T07:48:08.395Z"
}
```

Go to a text-to-qrcode website(e.g. https://www.the-qrcode-generator.com/) and convert the value of `inviteURL` to QR code.

## Create a connection
Execute the `create Connection` request in Postman.
The response body should look like:

``` json
{
    "relDID": "QC4vxHYqtzxAaMQ1gUXcFh",
    "id": "1ea15950-7d3d-49da-9846-91d778735bb8",
    "status": "pending",
    "createdAt": "2020-11-12T07:51:53.745Z",
    "updatedAt": "2020-11-12T07:51:53.745Z"
}
```

You can now scan the QR code with Connect.Me to start a connection.
After the connection is established, execute the `get Connection` request.
The response body should look like:

``` json
{
    "createdAt": "2020-11-12T07:51:53.745Z",
    "id": "1ea15950-7d3d-49da-9846-91d778735bb8",
    "relDID": "QC4vxHYqtzxAaMQ1gUXcFh",
    "status": "active",
    "updatedAt": "2020-11-12T07:52:53.699Z"
}
```

Notice the value of the status is changed to "active".

## Issue a credential
- Write a schema to Ledger by executing the `create Schema` request in Postman.
- Write a credential definition to Ledger by executing the `create CredDefinition` request in Postman.
- Execute the `create Credential` request in Postman.
  The response body should look like:

  ``` json
  {
      "relDID": "QC4vxHYqtzxAaMQ1gUXcFh",
      "definitionId": "T51WZZbsAbbfY4xfR9vhmw:3:CL:160435:latest",
      "credentialData": {
          "name": "John",
          "degree": "Bachelors"
      },
      "comment": "comment",
      "threadId": "adbe3e6e-43c7-4f97-92bc-e4cf677e79a5",
      "id": "96661743-7359-44d4-9b8b-257965b233fa",
      "status": "pending",
      "createdAt": "2020-11-12T08:07:34.522Z",
      "updatedAt": "2020-11-12T08:07:34.522Z"
  }
  ```

  You will receive a message in your Connect.Me app. Accept it.
  After the credential is issued to you, execute the `get Credential` request.
  The response body should look like:

  ``` json
  {
      "threadId": "adbe3e6e-43c7-4f97-92bc-e4cf677e79a5",
      "createdAt": "2020-11-12T08:07:34.522Z",
      "comment": "comment",
      "credentialData": {
          "name": "John",
          "degree": "Bachelors"
      },
      "id": "96661743-7359-44d4-9b8b-257965b233fa",
      "relDID": "QC4vxHYqtzxAaMQ1gUXcFh",
      "definitionId": "T51WZZbsAbbfY4xfR9vhmw:3:CL:160435:latest",
      "status": "accepted",
      "updatedAt": "2020-11-12T08:08:04.990Z"
  }
  ```

  Notice the value of the status is changed to "accepted".

## Request proof
Execute the `request Proof` request in Postman.
The response body should look like:

``` json
{
    "relDID": "QC4vxHYqtzxAaMQ1gUXcFh",
    "name": "proof01",
    "attrs": [
        "name",
        "degree"
    ],
    "threadId": "8723e11d-cb52-4797-b5c0-0eed9ab03bdf",
    "id": "660275ac-4160-40e7-9752-abc50649bdb6",
    "status": "pending",
    "createdAt": "2020-11-12T08:20:57.168Z",
    "updatedAt": "2020-11-12T08:20:57.168Z"
}
```

You will receive a message in your Connect.Me app. Send your proof.
After the presentation result is sent, execute the `get presentationResult` request.
The response body should look like:

``` json
{
    "threadId": "8723e11d-cb52-4797-b5c0-0eed9ab03bdf",
    "createdAt": "2020-11-12T08:20:57.168Z",
    "data": {
        "requested_presentation": {
            "predicates": {},
            "revealed_attrs": {
                "degree": {
                    "identifier_index": 0,
                    "value": "Bachelors"
                },
                "name": {
                    "identifier_index": 0,
                    "value": "John"
                }
            },
            "self_attested_attrs": {},
            "unrevealed_attrs": {},
            "identifiers": [
                {
                    "schema_id": "T51WZZbsAbbfY4xfR9vhmw:2:schema03:0.2",
                    "cred_def_id": "T51WZZbsAbbfY4xfR9vhmw:3:CL:160435:latest"
                }
            ]
        },
        "verification_result": "ProofValidated"
    },
    "name": "proof01",
    "id": "660275ac-4160-40e7-9752-abc50649bdb6",
    "relDID": "QC4vxHYqtzxAaMQ1gUXcFh",
    "attrs": [
        "name",
        "degree"
    ],
    "status": "ready",
    "updatedAt": "2020-11-12T08:23:08.973Z"
}
```

Notice the value of the status is changed to "ready" and new field "data" is attached.

## Notification

1. Create subscriber
You need to first retrieve the token of your app running in your device. Following `README.md`, you emulator is now running an app `Firebase Cloud Messaging`. You need to click `LOT TOKEN` button, check the [screen shot](https://github.com/firebase/quickstart-android/tree/master/messaging#result) for reference. Now in android studio, the token will be logged in logcat, mark it down.
Update the `token` parameter in request body, execute the `create subscriber` request in postman.

2. Send notification
Wait for a while after create subscriber. Execute the `send notification` request in postman. Wait for a while and you would find the notification message/data in logcat. Now let the app running in background, and execute the `send notification` request in postman again, system notification should be displayed.

3. Verification video
https://drive.google.com/file/d/1_ysBni1wR7KSm1pye_0gB9ffrbEw3pAD/view?usp=sharing