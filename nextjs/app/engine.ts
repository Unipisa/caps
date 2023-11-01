'use client'

import { useState, createContext, useContext } from 'react'
import { useQuery, useQueryClient, useMutation } from 'react-query'
import axios from 'axios'

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000'
const api_root = `${SERVER_URL}/api/v0/`


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

    const flashMessage = (message: String, type="primary") => {
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

export function useGet<T>(path:string, id:string|undefined) {
    return useQuery<T,any>({
        queryKey: [path, id],
        queryFn: async () => {
            const res = await axios.get(`${api_root}${path}${id}`)
            return res.data
        },
        enabled: !!id,
    })
}        

export function useIndex<T>(path:string, query={}) {
    const url = `${api_root}${path}`
    console.log(`useIndex: ${url}`)
    return useQuery<{items: T[]}>({
        queryKey: [path, query],
        queryFn: async () => {
            const res = await axios.get(url, { params: query })
            return res.data
        },
        suspense: true,
        enabled: query !== false,    
    })
}

export function usePost<T>(path: string) {
    // funziona anche per Multipart Post
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: T) => {
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

export type ExamGet = {
    _id: string,
    name: string,
    code: string,
    sector: string,
    credits: number,
    tags: string[],
    notes: string,
}

export function useGetExam(id:string|undefined) {
    return useGet<ExamGet>('exams/', id) 
}

export function useIndexExam(query={}) {
    return useIndex<ExamGet>('exams/', query)
}

export function usePatchExam(id:string) {
    return usePatch('exams/', id)
}

export function usePostExam() {
    return usePost('exams/')
}

export function useDeleteExam(id:string) {
    return useDelete('exams/', id)
}

export type DegreeGet = {
    _id: string
    name: string,
    academic_year: number,
    years: number,
    groups: {
        [key: string]: string[],
    },
    enabled: boolean,
    enable_sharing: boolean,
    default_group: string, 
    approval_confirmation: boolean,
    rejection_confirmation: boolean,
    submission_confirmation: boolean,
    approval_message: string,
    rejection_message: string,
    submission_message: string,
    free_choice_message: string,
}

export function useGetDegree(id:string|undefined) {
    return useGet<DegreeGet>('degrees/', id) 
}

export function useIndexDegree(query={}) {
    return useIndex<DegreeGet>('degrees/', query)
}   

export function useDeleteDegree(id:string) {
    return useDelete('degrees/', id)
}

export type CurriculumGet = {
    _id: string,
    name: string,
    notes: string,
    degree_id: string,
    degree: {
        enabled: boolean,
        name: string,
        academic_year: number,
    }
    years: {
        credits: number,
        exams: CurriculumExamGet[]
    }[]
}

export type CurriculumExamGet = {
    __t: 'CompulsoryExam',
    exam_id: string,
}|{
    __t: 'CompulsoryGroup',
    group: string,
}|{
    __t: 'FreeChoiceGroup',
    group: string,
}|{
    __t: 'FreeChoiceExam',
}

export function useGetCurriculum(id:string|undefined) {
    return useGet<CurriculumGet>('curricula/', id) 
}

export function useIndexCurriculum(query={}) {
    return useIndex<CurriculumGet>('curricula/', query)
}

export type ProposalGet = {
    _id: string,
    degree_id: string,
    degree_academic_year: number,
    degree_name: string,
    curriculum_id: string,
    curriculum_name: string,
    user_id: string,   
    user_last_name: string,
    user_first_name: string,
    user_name: string,
    user_id_number: string,
    user_email: string,
    user_username: string,
    state: 'draft'|'submitted'|'approved'|'rejected',
    date_modified: string,
    date_submitted: string,
    date_managed: string,
    exams: (ProposalExamGet|null)[][],
    attachments: ProposalAttachmentGet[],
}

export type ProposalExamGet = 
    ProposalCompulsoryExamGet |
    ProposalCompulsoryGroupGet | 
    ProposalFreeChoiceGroupGet |
    ProposalFreeChoiceGet |
    ProposalExternalExamGet

export type ProposalCompulsoryExamGet = {
    __t: "CompulsoryExam",
    exam_id: string,
    exam_name: string,
    exam_code: string,
    exam_credits: number,
}

export type ProposalCompulsoryGroupGet = {
    __t: "CompulsoryGroup", 
    group: string,
    exam_id: string,
    exam_name: string,
    exam_code: string,
    exam_credits: number,
}

export type ProposalFreeChoiceGroupGet = {
    __t: "FreeChoiceGroup",
    group: string,     
    exam_id: string,
    exam_name: string,
    exam_code: string,
    exam_credits: number,
}

export type ProposalFreeChoiceGet = {
    __t: "FreeChoiceExam",
    exam_id: string,
    exam_name: string,
    exam_code: string,
    exam_credits: number,
}

export type ProposalExternalExamGet = {
    __t: "ExternalExam", 
   exam_name: string,
   exam_credits: number,
}

export interface ProposalAttachmentGet {
}

export type ProposalPost = {
    _id: string,
    curriculum_id: string,
    state: 'draft'|'submitted',
    exams: ProposalExamPost[][], // year-> n -> exam_id|name
}

/**
 * null: un esame non scelto (perché opzionale)
 * ExamId: id dell'esame scelto
 * ExternalExamPost: nome e crediti di un esame esterno
 */
export type ProposalExamPost = null | ExamId | ExternalExamPost

export type ExamId = string

export type ExternalExamPost = {
    exam_name: string,
    exam_credits: number,
}

export function useGetProposal(id:string|undefined) {
    return useGet<ProposalGet>('proposals/', id) 
}

export function usePostProposal() {
    return usePost<ProposalPost>('proposals/')
}

export function useIndexProposal(query={}) {
    return useIndex<ProposalGet>('proposals/', query)
}

export function useDeleteProposal(id:string) {
    return useDelete('proposals/', id)
}

