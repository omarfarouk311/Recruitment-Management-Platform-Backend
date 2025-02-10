const constants = require('./config');
const Mailjet = require('node-mailjet');

const mailjet = Mailjet.apiConnect(
    constants.mailjet_public_key,
    constants.mailjet_private_key
);

module.exports = mailjet;