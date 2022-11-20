import { useState, createContext, useContext } from 'react'
import { useQuery, useQueryClient, useMutation } from 'react-query'
import Model from '../models/Model'

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

    const onError = (err) => flashMessage(`${err.name}: ${err.message}`, 'error')

    return {
        state,

        user: {
            id: 17,
            username: "ginnasta",
            name: "Pippo Ginnasta",
            number: "123456",
            givenname: "Ginnasta",
            surname: "Pippo",
            email: "ginnasta@mailinator.com",
            admin: true,
        },

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

        useGet: (Model, id) => useQuery(
            [Model.api_url, id], 
            async () => {
                const obj = await api.get(`${Model.api_url}${id}`)
                return new Model(obj)
            },
            { 
                onError, 
                enabled: id !== null 
            }
        ),

        useIndex: (Model, query) => useQuery(
            [Model.api_url, query],
            async () => {
                let data = await api.get(`${ Model.api_url }`, query)
                data.items = data.items.map(item => new Model(item))
                return data
            },
            { onError }
        ),
    }
}
