import mongoose from "mongoose"

const settingsSchema = new mongoose.Schema({
    userInstructions: {
        type: String,
        default: 'configurare le istruzioni utente',
    },
    cds: {
        type: String,
        default: 'configurare il corso di studi',
    },
    disclaimer: {
        type: String,
        default: 'configurare il disclaimer',
    },
    department: {
        type: String,
        default: 'configurare il dipartimento',
    },
    notifiedEmails: {
        type: String,
        default: 'configurare le email di notifica',
    },
    approvalSignatureText: {
        type: String,
        default: 'configurare la firma per i piani',
    },
    pdfName: {
        type: String,
        default: 'configurare_il_nome_del_file_pdf',
    },
})

const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema)

export default Settings