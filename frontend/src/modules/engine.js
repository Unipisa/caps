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
        },
        user: null,
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
    const onPossibleValidationError = (err) => {
        if (err.code === 403) { 
            // Either show the error as a flash message or as a text near the
            // form input, not both

            // let errMessage = []
            // for (const issue in err.issues) {
            //     errMessage.push(err.issues[issue])
            // }
            // flashMessage(`Errore di validazione: ${errMessage.join(", ")}`, 'error')
        } else
            onError(err)
    }

    return {
        state,
/*
        user: {
            id: '000000000000000000000017',
            username: "ginnasta",
            name: "Pippo Ginnasta",
            number: "123456",
            givenname: "Ginnasta",
            surname: "Pippo",
            email: "ginnasta@mailinator.com",
            admin: true,
        },
*/
        modalConfirm: (title, content) => {
            return new Promise((resolve) => {
                async function callback(ans) {
                    await setState(state => ({
                        ...state, 
                        modalConfirmData: {
                            title: null,
                            content: null,
                            callback: null
                        }
                    }))
                    resolve(ans);
                }
                setState(state => ({
                    ...state,
                    modalConfirmData: {
                        title,
                        content,
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

        useUpdate: (Model, id) => useMutation({
            mutationFn: async (data) => {
                return await api.post(`${Model.api_url}${id}`, data)
            },
            onSuccess: async () => {
                await queryClient.invalidateQueries({ queryKey: [Model.api_url, id]})
            },
            onError: onPossibleValidationError,
        }),

        useInsert:  (Model) => useMutation({
            mutationFn: async (data) => {
                return await api.post(`${Model.api_url}`, data)
            },
            onSuccess: async () => {
                await queryClient.invalidateQueries({ queryKey: [Model.api_url] })
            },
            onError: onPossibleValidationError,
        }),
        
        useMultipartInsert:  (Model) => useMutation({
            mutationFn: async (data) => {
                return await api.post(`${Model.api_url}`, data, true)
            },
            onSuccess: async () => {
                await queryClient.invalidateQueries({ queryKey: [Model.api_url] })
            },
            onError: onPossibleValidationError,
        }),

        useDelete: (Model, id) => useMutation({
            mutationFn: async () => {
                return await api.post(`${Model.api_url}delete/${id}`)
            },
            onSuccess: async () => {
                await queryClient.invalidateQueries({ queryKey: [Model.api_url] })
            },
            onError
        }),

        useIndex: (Model, query) => useQuery(
            [Model.api_url, query],
            async () => {
                let data = await api.get(`${ Model.api_url }`, query)
                data.items = data.items.map(item => new Model(item))
                return data
            },
            { 
                onError,
                enabled: query !== false,
            }
        ),

        connect: async () => {
            try {
                let { user } = await api.post('/login')

                if (user != null) {
                    user = new_user(user);
                }

                setState(s => ({...s, user }))

                return config
            } catch(err) {
                console.error(err)
                return null
            }
        },

        login: async (username, password) => {
            /**
             * if username and password are provided use credentials
             * otherwise check for existing session
             */
            try {
                const res = await api.post('login/password', {username, password})
                let { user } = res
                // console.log(`user: ${JSON.stringify(user)}`)
                if (user !== null) {
                    user = new_user(user)
                }

                setState(s => ({...s, user}))
            } catch(err) {
                // err is ApiError
                if (err.code === 401) {
                    flashMessage("Credenziali errate", 'error')
                } else {
                    flashMessage(`${err.name}: ${err.message}`, 'error')
                }
            }
        },

        start_oauth2: async () => {
            let url = api.BASE_URL + 'login/oauth2'
            console.log(`start_oauth2: redirecting to ${url}`)
            sessionStorage.setItem('redirect_after_login', window.location.pathname)
            window.location.href = url
        },

        logout: async () => {
            await api.post("logout")
            setState(s => ({...s, user: null}))
            return true
        },

        loggedIn: state.user !== null,

        user: state.user,
    }
}
