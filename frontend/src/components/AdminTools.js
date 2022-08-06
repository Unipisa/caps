function AdminTools({ self }) {
    if (!self.state.user) return "";
    if (!self.state.user.admin) return "";
    if (self.state.proposal.state != 'submitted') return "";

    return <>
        <button type="button" 
            className="btn btn-sm btn-success mr-2"
            onClick={() => self.approve() }>
            <i className="fas fa-check" />
            <span className="d-none d-md-inline">Accetta</span>
        </button>
        <button type="button" 
            className="btn btn-sm btn-danger mr-2"
            onClick={() => self.reject() }>
            <i className="fas fa-times" /> 
            <span className="d-none d-md-inline">Rifiuta</span>
        </button>
    </>
}

export default AdminTools;