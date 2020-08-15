/*
 * Constants.
 */

module.exports = {
  JWT: {
    Algorithms: ['HS256']
  },
  Pagination: {
    MinPage: 1,
    MinPerPage: 1,
    DefaultPage: 1,
    DefaultPerPage: 20
  },
  NetType: {
    StagingNet: 'stagingnet'
  },
  MessageType: {
    ProblemReport: 'problem-report'
  },
  Status: {
    Connection: {
      Pending: 'pending',
      Active: 'active'
    },
    Credential: {
      Pending: 'pending',
      Offered: 'offered',
      Accepted: 'accepted'
    },
    PresentationResult: {
      Pending: 'pending',
      Ready: 'ready'
    }
  }
}
