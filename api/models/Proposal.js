
const mongoose = require('mongoose');
const { ProposalSchema } = require('./ProposalSchema')

const Proposal = mongoose.model('Proposal', ProposalSchema)

module.exports = Proposal