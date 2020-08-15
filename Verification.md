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
{
    "createdAt": "2020-08-11T22:31:49.051Z",
    "relDID": "6bTxtm7oxFJnMR1onvRQqm",
    "inviteURL": "http://vas.pps.evernym.com:80/agency/msg?c_i=eyJsYWJlbCI6InJlbDAxIiwic2VydmljZUVuZHBvaW50IjoiaHR0cDovL3Zhcy5wcHMuZXZlcm55bS5jb206ODAvYWdlbmN5L21zZyIsInJlY2lwaWVudEtleXMiOlsiNDNxeVlOTEdNeXdzM2E3YWc0VVZuY3FSNDRoV0FqMnVCVmd5dloxTnFSY1QiXSwicm91dGluZ0tleXMiOlsiNDNxeVlOTEdNeXdzM2E3YWc0VVZuY3FSNDRoV0FqMnVCVmd5dloxTnFSY1QiLCJFeFBGTHg0dU5qRjlqUlFKVjdYeEF0OE1mdVhKRU5nYmdBMXFObVd6bnNSWiJdLCJwcm9maWxlVXJsIjoiaHR0cHM6Ly93d3cudG9wY29kZXIuY29tL3dwLWNvbnRlbnQvdXBsb2Fkcy8yMDE2LzAxL3RvcGNvZGVyLWxvZ28ucG5nIiwiQHR5cGUiOiJkaWQ6c292OkJ6Q2JzTlloTXJqSGlxWkRUVUFTSGc7c3BlYy9jb25uZWN0aW9ucy8xLjAvaW52aXRhdGlvbiIsIkBpZCI6ImY5NmI3ZTk2LTg5ZGItNDkzMi1hMTZkLTIzN2RkZWFjZjYzOSJ9",
    "name": "rel01",
    "id": "5f3320af07bb709e59bb803f"
}
```

Go to a text-to-qrcode website(e.g. https://www.the-qrcode-generator.com/) and convert the value of `inviteURL` to QR code.

## Create a connection
Go to the request body of the `create Connection` request in Postman and
replace the value of relDID with the one from Create a relationship.
Execute the request.
The response body should look like:

``` json
{
    "status": "pending",
    "relDID": "QZ8JhKK29WPFGFkZx5ee4w",
    "createdAt": "2020-08-15T02:44:09.800Z",
    "updatedAt": "2020-08-15T02:44:09.800Z",
    "id": "5f374bf90e998b1d7c893229"
}
```

The value of `id` will be used in the next request.

You can now scan the QR code with Connect.Me to start a connection.
After the connection is established, execute the `get Connection` request with the value of `id` from previous request.
The response body should look like:

``` json
{
    "status": "active",
    "relDID": "QZ8JhKK29WPFGFkZx5ee4w",
    "createdAt": "2020-08-15T02:44:09.800Z",
    "updatedAt": "2020-08-15T02:51:55.753Z",
    "id": "5f374bf90e998b1d7c893229"
}
```

Notice that the value of the status is changed to "active".

## Write a schema to Ledger
Execute the `create Schema` request in Postman.
The response body should look like:

``` json
{
    "createdAt": "2020-08-11T23:23:33.495Z",
    "schemaId": "7hW8w9NNUZ5p523bCcFPGt:2:schema02:0.2",
    "name": "schema02",
    "version": "0.2",
    "id": "5f3329e1938099682eaa55e7"
}
```

The schemaId will be used in the next step.

## Write a credential definition to Ledger
Go to the request body of the `create CredDefinition` request in Postman and
replace the value of schemaId with the one from last step.

Execute the request.
The response body should look like:

``` json
{
    "createdAt": "2020-08-11T23:23:33.493Z",
    "definitionId": "7hW8w9NNUZ5p523bCcFPGt:3:CL:132864:latest",
    "id": "5f332a9a938099682eaa55e8",
    "name": "definition01",
    "schemaId": "7hW8w9NNUZ5p523bCcFPGt:2:schema02:0.2",
    "tag": "latest"
}
```

The definitionId will be used in the next step.

## Issue a credential
Go to the request body of the `create Credential` request in Postman and,

- replace the value of relDID with the one from Create a relationship.
- replace the value of definitionId with the one from Write a credential definition to Ledger.

Execute the request.
The response body should look like:

``` json
{
    "status": "pending",
    "relDID": "6bTxtm7oxFJnMR1onvRQqm",
    "definitionId": "7hW8w9NNUZ5p523bCcFPGt:3:CL:132864:latest",
    "credentialData": {
        "name": "John",
        "degree": "Bachelors"
    },
    "comment": "comment",
    "threadId": "84aad637-4c62-458a-913a-c9857a1978f3",
    "createdAt": "2020-08-15T02:56:04.447Z",
    "updatedAt": "2020-08-15T02:56:04.447Z",
    "id": "5f374ec40e998b1d7c89322a"
}
```

The value of `id` will be used in the next request.

You can now accept the credential with Connect.Me.
After the credential is issued to you, execute the `get Credential` request with the value of `id` from previous request.
The response body should look like:

``` json
{
    "status": "accepted",
    "relDID": "QZ8JhKK29WPFGFkZx5ee4w",
    "definitionId": "9YLRtP7FJgWifeANJ5uKmu:3:CL:134293:latest",
    "credentialData": {
        "name": "John",
        "degree": "Bachelors"
    },
    "comment": "comment",
    "threadId": "5246dd95-6e01-4794-b238-f9a05db319e9",
    "createdAt": "2020-08-15T03:04:10.527Z",
    "updatedAt": "2020-08-15T03:04:28.271Z",
    "id": "5f3750aa0e998b1d7c893230"
}
```

Notice that the value of the status is changed to "accepted".

## Request proof
Go to the request body of the `request Proof` request in Postman and
replace the value of relDID with the one from Create a relationship.

Execute the request.
The response body should look like:

``` json
{
    "attrs": [
        "name",
        "degree"
    ],
    "status": "pending",
    "relDID": "QZ8JhKK29WPFGFkZx5ee4w",
    "name": "proof01",
    "threadId": "708c7604-d51b-4a77-b528-5e805b11a759",
    "createdAt": "2020-08-15T03:07:56.758Z",
    "updatedAt": "2020-08-15T03:07:56.758Z",
    "id": "5f37518c0e998b1d7c893231"
}
```

The value of `id` will be used in the next request.

You can now send your proof with Connect.Me.
After the the presentation result is sent, execute the `get presentationResult` request with the value of `id` from previous request.
The response body should look like:

``` json
{
    "attrs": [
        "name",
        "degree"
    ],
    "status": "ready",
    "relDID": "QZ8JhKK29WPFGFkZx5ee4w",
    "name": "proof01",
    "threadId": "708c7604-d51b-4a77-b528-5e805b11a759",
    "createdAt": "2020-08-15T03:07:56.758Z",
    "updatedAt": "2020-08-15T03:11:37.912Z",
    "data": {
        "verification_result": "ProofValidated",
        "requested_presentation": {
            "revealed_attrs": {
                "name": {
                    "identifier_index": 0,
                    "value": "John"
                },
                "degree": {
                    "identifier_index": 0,
                    "value": "Bachelors"
                }
            },
            "identifiers": [
                {
                    "schema_id": "9YLRtP7FJgWifeANJ5uKmu:2:schema03:0.2",
                    "cred_def_id": "9YLRtP7FJgWifeANJ5uKmu:3:CL:134293:latest"
                }
            ]
        }
    },
    "id": "5f37518c0e998b1d7c893231"
}
```

Notice that the value of the status is changed to "active" and new field "data" is attached.
