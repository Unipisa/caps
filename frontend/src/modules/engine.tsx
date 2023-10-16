import { useState, createContext, useContext } from 'react'
import { useQuery, useQueryClient, useMutation } from 'react-query'
import axios from 'axios'

const api_root = '/api/v0/'

export const EngineContext = createContext<Engine|null>(null)

export const EngineProvider = EngineContext.Provider
  
export function useEngine(): Engine {
    const engine = useContext(EngineContext)
    if (!engine) throw new Error("useEngine must be used inside EngineProvider")
    return engine
}

interface EngineState {
    flashMessages: Array<{ message: string, type: string }>,
    modalConfirmData: {
        title: string | null,
        content: string | null,
        callback: ((ans: boolean) => void) | null
    },
    user: any,
    connected: boolean,
}

interface Engine {
    state: EngineState,
    user: any,
    modalConfirm: (title: string, content: string) => Promise<boolean>,
    flashMessage: (message: string, type?: string) => void,
    flashSuccess: (message: string) => void,
    flashError: (message: string) => void,
    flashCatch: (error: Error) => void,
    hideFlash: () => void,
    connect: () => void,
    login: (username: string, password: string) => void,
    start_oauth2: () => void,
    logout: () => void,
}

export function useCreateEngine(): Engine {
    const [state, setState] = useState<EngineState>({
        flashMessages: [],
        modalConfirmData: {
            title: null,
            content: null,
            callback: null
        },
        user: null,
        connected: false,
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
        if (err.code === 422) { 
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
        user: state.user,
        
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

        connect: async () => {
            try {
                const { data } = await axios.post<any>(`${api_root}login`)
                const { user } = data
                setState(s => ({...s, user, connected: true }))
            } catch(err) {
                setState(s => ({...s, user: null, connected: false }))
                console.error(err)
            }
        },

        login: async (username: string, password: string) => {
            /**
             * if username and password are provided use credentials
             * otherwise check for existing session
             */
            try {
                const { data } = await axios.post<any>(`${api_root}login/password`, {username, password})
                let { user } = data
                setState(s => ({...s, user}))
            } catch(err) {
                // err is ApiError
                if (err.code === 401) {
                    flashMessage("Credenziali errate", 'error')
                } else {
                    flashMessage(`${err.name}: ${err.message}`, 'error')
                    console.error(err)
                }
            }
        },

        start_oauth2: async () => {
            let url = api_root + 'login/oauth2'
            console.log(`start_oauth2: redirecting to ${url}`)
            sessionStorage.setItem('redirect_after_login', window.location.pathname)
            window.location.href = url
        },

        logout: async () => {
            await axios.post(`${api_root}logout`)
            setState(s => ({...s, user: null}))
        },
    }
}

export function useGet(path:string, id:string|undefined) {
    return useQuery<any,any>({
        queryKey: [path, id],
        queryFn: async () => {
            const res = await axios.get(`${api_root}${path}${id}`)
            return res.data
        },
        enabled: !!id,
    })
}        

export function useIndex(path:string, query={}) {
    return useQuery({
        queryKey: [path, query],
        queryFn: async () => {
            const res = await axios.get(`${api_root}${path}`, { params: query })
            return res.data
        },
        enabled: query !== false,    
    })
}

export function usePost(path: string) {
    // funziona anche per Multipart Post
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data) => {
            return await axios.post(`${api_root}${path}`, data)
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: [path] })
        },
    })
}

export function useDelete(path:string, id:string) {
    const queryClient = useQueryClient()
    return useMutation<any, any, any>({
        mutationFn: async () => {
            return await axios.delete(`${api_root}${path}${id}`)
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: [path] })
        },
    })
}

export function usePatch(path:string, id:string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data) => {
            return await axios.patch(`${api_root}${path}${id}`, data)
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: [path] })
        },
    })
}

