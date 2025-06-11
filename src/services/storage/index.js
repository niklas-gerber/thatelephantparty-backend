// services/storage/index.js
const path = require('path');
const localUpload = require('./localUpload');
const localDelete = require('./localDelete');

// Local storage configurations
const savePublicFile = localUpload(
  path.join(__dirname, '../../../private/uploads/payslips'),
  { useUuid: true }
);

const savePrivateFile = localUpload(
  path.join(__dirname, '../../../public/posters'),
  { useUuid: false }
);

// Control for AWS implementation
module.exports = process.env.NODE_ENV === 'production'
  ? {
      savePublicFile: require('./s3Upload').savePublicFile,
      savePrivateFile: require('./s3Upload').savePrivateFile,
      deleteFile: require('./s3Upload').deleteFile
    }
  : {
      savePublicFile,
      savePrivateFile,
      deleteFile: localDelete
    };