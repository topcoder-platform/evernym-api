/*
 * Constants.
 */
const config = require('config')
const path = require('path')

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
  },
  AMAZON: {
    S3ApiVersion: '2006-03-01',
    SNSApiVersion: '2010-03-31'
  },
  VerityWalletFile: {
    DbBasename: 'sqlite.db',
    ShmBasename: 'sqlite.db-shm',
    WalBasename: 'sqlite.db-wal',
    Pathname: path.join(require('os').homedir(), '.indy_client', 'wallet', config.VERITY_WALLET_NAME),
    DbPathname: path.join(require('os').homedir(), '.indy_client', 'wallet', config.VERITY_WALLET_NAME, 'sqlite.db'),
    ShmPathname: path.join(require('os').homedir(), '.indy_client', 'wallet', config.VERITY_WALLET_NAME, 'sqlite.db-shm'),
    WalPathname: path.join(require('os').homedir(), '.indy_client', 'wallet', config.VERITY_WALLET_NAME, 'sqlite.db-wal')
  }
}
