/*
 * Define individual route.
 */

module.exports = {
  '/relationships': {
    get: {
      controller: 'RelationshipController',
      method: 'searchRelationships'
    },
    post: {
      controller: 'RelationshipController',
      method: 'createRelationship'
    }
  },
  '/relationships/:id': {
    get: {
      controller: 'RelationshipController',
      method: 'getRelationship'
    },
    delete: {
      controller: 'RelationshipController',
      method: 'deleteRelationship'
    }
  },
  '/connections': {
    get: {
      controller: 'ConnectionController',
      method: 'searchConnections'
    },
    post: {
      controller: 'ConnectionController',
      method: 'createConnection'
    }
  },
  '/connections/:id': {
    get: {
      controller: 'ConnectionController',
      method: 'getConnection'
    },
    delete: {
      controller: 'ConnectionController',
      method: 'deleteConnection'
    }
  },
  '/schemas': {
    get: {
      controller: 'SchemaController',
      method: 'searchSchemas'
    },
    post: {
      controller: 'SchemaController',
      method: 'createSchema'
    }
  },
  '/schemas/:id': {
    get: {
      controller: 'SchemaController',
      method: 'getSchema'
    },
    delete: {
      controller: 'SchemaController',
      method: 'deleteSchema'
    }
  },
  '/credDefinitions': {
    get: {
      controller: 'CredDefinitionController',
      method: 'searchCredDefinitions'
    },
    post: {
      controller: 'CredDefinitionController',
      method: 'createCredDefinition'
    }
  },
  '/credDefinitions/:id': {
    get: {
      controller: 'CredDefinitionController',
      method: 'getCredDefinition'
    },
    delete: {
      controller: 'CredDefinitionController',
      method: 'deleteCredDefinition'
    }
  },
  '/credentials': {
    get: {
      controller: 'CredentialController',
      method: 'searchCredentials'
    },
    post: {
      controller: 'CredentialController',
      method: 'createCredential'
    }
  },
  '/credentials/:id': {
    get: {
      controller: 'CredentialController',
      method: 'getCredential'
    },
    delete: {
      controller: 'CredentialController',
      method: 'deleteCredential'
    }
  },
  '/verity/webhook': {
    post: {
      controller: 'VerityController',
      method: 'handleMessage'
    }
  },
  '/verity/requestProof': {
    post: {
      controller: 'VerityController',
      method: 'requestProof'
    }
  },
  '/verity/presentationResults/:id': {
    get: {
      controller: 'VerityController',
      method: 'getPresentationResult'
    }
  },
  '/subscribe': {
    post: {
      controller: 'NotificationController',
      method: 'createSubscriber'
    }
  },
  '/webhook': {
    post: {
      controller: 'NotificationController',
      method: 'sendNotification'
    }
  },
  '/qr/:name': {
    get: {
      controller: 'QRController',
      method: 'getQR'
    }
  }
}
