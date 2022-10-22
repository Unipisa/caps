import { useState, createContext, useContext } from 'react'
import { useQuery, useQueryClient, useMutation } from 'react-query'

import api from './api'

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
            return flashMessage(`${error.name}: ${error.message}`, 'error')
        },
    
        hideFlash: () => {
            setState(state => ({
                ...state,
                flashMessages: []
            }))
        },

        useGet: (path,id) => useQuery(
            [path, id], 
            () => api.get(`${path}/${id}`),
            { onError: (err) => flashMessage(`${err.name}: ${err.message}`, 'error') }),
    }
}
