import { useState } from 'react'

const initial_state = {
    flashMessages: [],
    modalConfirmData: {
        title: null,
        content: null,
        callback: null
    }
}

class Engine {
    constructor(state, setState) {
        this.state = state
        this.setState = setState
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
                ...flashMessages, 
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

export default function useEngine() {
    const [state, setState] = useState(initial_state)

    return new Engine(state, setState)
}