import { useState, createContext, useContext } from 'react'
import { useQuery, useQueryClient, useMutation } from 'react-query'

export const EngineContext = createContext(null)

export const EngineProvider = EngineContext.Provider
  
export function useEngine() {
    return useContext(EngineContext)
}

export function useCreateEngine() {
    const [state, setState] = useState({
        flashMessages: [],
        modalConfirmData: {
            title: null,
            content: null,
            callback: null
        }
    })

    const queryClient=useQueryClient()

    const flashMessage = (message, type="primary") => {
        setState(state => ({
            ...state,
            flashMessages: [
                ...state.flashMessages, 
                { message, type }]
        }))
    }

    return {
        state,

        modalConfirm: (title, message) => {
            return new Promise((resolve) => {
                async function callback(ans) {
                    await setState(state => ({
                        ...state, 
                        modalConfirmData: {
                            title: null,
                            message: null,
                            callback: null
                        }
                    }))
                    resolve(ans);
                }
                setState(state => ({
                    ...state,
                    modalConfirmData: {
                        title,
                        message,
                        callback
                    }
                }))
            })
        },

        flashMessage,

        flashSuccess: (message) => flashMessage(message, 'success'),        
    
        flashError: (message) => flashMessage(message, 'error'),
    
        flashCatch: (error) => {
            console.error(error)
            return flashMessage(`${error.name}: ${error.message}`, 'error');
        },
    
        hideFlash: () => {
            setState(state => ({
                ...state,
                flashMessages: []
            }))
        }
    }
}


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