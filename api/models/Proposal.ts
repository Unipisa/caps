import mongoose from 'mongoose'
import { ProposalSchema } from './ProposalSchema'

const Proposal = mongoose.model('Proposal', ProposalSchema)

export default Proposal
