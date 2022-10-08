class Engine {
    constructor(state, setState) {
        this.state = {
            flashMessages: [],
            modalConfirmData: {
                title: null,
                content: null,
                callback: null
            }
        }
        this.setState = null // need to call sync
    }

    sync(pair) {
        this.state = pair[0]
        this.setState = pair[1]
    }

    async modalConfirm(title, message) {
        return new Promise((resolve) => {
            async function callback(ans) {
                await this.setState({
                    ...this.state, 
                    modalConfirmData: {
                        title: null,
                        message: null,
                        callback: null
                    }
                })
                resolve(ans);
            }
            this.setState({
                ...this.state,
                modalConfirmData: {
                    title,
                    message,
                    callback
                }
            })
        })
    }

    flashMessage(message, type="primary") {
        this.setState({
            ...this.state,
            flashMessages: [
                ...this.state.flashMessages, 
                { message, type }]
        })
    }

    flashSuccess(message) {
        this.flashMessage(message, 'success');
    }

    flashError(message) {
        this.flashMessage(message, 'error');
    }

    flashCatch(error) {
        console.error(error);
        this.flashError(`${error.name}: ${error.message}`);
    }

    hideFlash() {
        this.setState({
            ...this.state,
            flashMessages: []
        })
    }
}

const engine = new Engine()

export default engine
/*
function useEngine() {
    const [state, setState] = useState(initial_state)

    return new Engine(state, setState)
}
*/