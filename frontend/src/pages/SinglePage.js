import React, { useEffect } from "react"
import {
    BrowserRouter, Routes, Route
} from "react-router-dom"
import axios from 'axios'

import {useEngine, useCreateEngine, EngineProvider} from '../modules/engine'

import ProposalsPage from "./ProposalsPage"
import { default as ProposalPage, EditProposalPage, NewProposalPage } from "./ProposalPage"
import ProposalPagePdf from "./ProposalPagePdf"
import FormsPage from "./FormsPage"
import FormPage from "./FormPage"
import DegreesPage from "./DegreesPage"
import DegreePage from "./DegreePage"
import CurriculaPage from "./CurriculaPage"
import CurriculumPage from "./CurriculumPage"
import FormTemplatesPage from './FormTemplatesPage'
import { default as FormTemplatePage, EditFormTemplatePage, AddFormTemplatePage } from './FormTemplatePage'
import ExamsPage from "./ExamsPage"
import { default as  ExamPage, EditExamPage, AddExamPage } from "./ExamPage"
import UsersPage from "./UsersPage"
import UserPage from "./UserPage"
import SettingsPage from "./SettingsPage"
import {QueryClient, QueryClientProvider } from 'react-query'

import Login from "../components/Login"
import Modal from '../components/Modal'
import Flash from "../components/Flash"
import NavBar from '../components/NavBar'
import TopBar from '../components/TopBar'
import Footer from '../components/Footer'
import LoadingMessage from '../components/LoadingMessage'
import {api_root} from '../modules/engine'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            queryFn: async ({queryKey}) => {
                let url = api_root.replace(/\/$/, "") // remove trailing slash
                let params = {}
                for (const key of queryKey) {
                    if (typeof key === 'object') {
                        params = key
                        break
                    }
                    url += '/' + key
                }
                const out = await axios.get(url, {params})
                return out.data
            }
        }
    }
  })  

export default function SinglePage({config}) {
    return <QueryClientProvider client={queryClient}>
        <SinglePageInternal config={config}/>
    </QueryClientProvider> 
}

function SinglePageInternal({config}) {
    const engine = useCreateEngine(config)
    // engine.sync(useState(engine.state))

    useEffect(engine.connect, [])
    if (!engine.state.connected) return <LoadingMessage>connecting...</LoadingMessage>

    if (!engine.user) return <EngineProvider value={engine}><Login /></EngineProvider>
    return <EngineProvider value={engine}>
        <div id="wrapper">
            <BrowserRouter>
                <Routes>
                    Routes
                    <Route path="/proposals/:id/pdf" element={<ProposalPagePdf/>}/>
                    <Route path="*" element={<PageWithNavBar />}>
                    </Route>
                </Routes>
            </BrowserRouter>
        </div>
    </EngineProvider>
}

function Splash(props) {
    return <p>Splash!</p>
}

function PageWithNavBar(props) {
    const engine = useEngine()
    const modalConfirmData = engine.state.modalConfirmData
    return <>
        <NavBar/>
        <div id="content-wrapper" className="d-flex flex-column">
            <TopBar/>
            <Modal title={ modalConfirmData.title } content={ modalConfirmData.content } callback={ modalConfirmData.callback }></Modal>
            <Flash messages={ engine.state.flashMessages } onClick={ () => engine.hideFlash() }></Flash>
            <div id="content" className="px-4">
                <Routes>
                    <Route path="/" element={<Splash/>}/>
                    <Route path="/index.html" element={<Splash/>}/>
                    <Route path="/proposals/edit/:id" element={<EditProposalPage/>}/>
                    <Route path="/proposals/:id" element={<ProposalPage/>}/>
                    <Route path="/proposals" element={<ProposalsPage/>}/>
                    {/* <Route path="/proposals/new" element={<ProposalPage/>}/> */}
                    <Route path="/forms" element={<FormsPage/>}/>
                    <Route path="/forms/:id" element={<FormPage/>}/>
                    <Route path="/degrees" element={<DegreesPage/>}/>
                    <Route path="/degrees/:id" element={<DegreePage/>}/>
                    <Route path="/curricula" element={<CurriculaPage/>}/>
                    <Route path="/curricula/:id" element={<CurriculumPage/>}/>
                    <Route path="/form_templates/:id" element={<FormTemplatePage/>}/>
                    <Route path="/form_templates" element={<FormTemplatesPage/>}/>
                    <Route path="/form_templates/edit/:id" element={<EditFormTemplatePage/>}/>
                    <Route path="/form_templates/edit" element={<AddFormTemplatePage/>} />
                    <Route path="/exams/edit/:id" element={<EditExamPage/>}/>
                    <Route path="/exams/:id" element={<ExamPage/>}/>
                    <Route path="/exams" element={<ExamsPage/>}/>
                    <Route path="/users" element={<UsersPage/>}/>
                    <Route path="/users/:id" element={<UserPage/>}/>
                    <Route path="/settings" element={<SettingsPage/>}/>
                </Routes>
            </div>
            <Footer/>
        </div>                        
   </>
}