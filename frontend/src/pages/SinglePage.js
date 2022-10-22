import React, { useState } from "react"
import {
    BrowserRouter, Routes, Route, Link
} from "react-router-dom"

import engine from "../modules/engine"
import {useCreateEngine, EngineProvider} from '../modules/engine'

import Proposals from "./Proposals"
import Proposal from "./Proposal"
import Forms from "./Forms"
import Form from "./Form"
import Degrees from "./Degrees"
import Degree from "./Degree"
import Curricula from "./Curricula"
import Curriculum from "./Curriculum"
import FormTemplates from './FormTemplates'
import Exams from "./Exams"
import Exam from "./Exam"
import Users from "./Users"
import User from "./User"

import Modal from '../components/Modal'
import Flash from "../components/Flash"
import NavBar from '../components/NavBar'
import TopBar from '../components/TopBar'
import Footer from '../components/Footer'

import {QueryClient, QueryClientProvider } from 'react-query'

const queryClient = new QueryClient()

function SinglePageInternal () {
    const engine = useCreateEngine()
    // engine.sync(useState(engine.state))
    const modalConfirmData = engine.state.modalConfirmData

    return <EngineProvider value={engine}>
        <div id="wrapper">
            <BrowserRouter>
                <NavBar/>
                <div id="content-wrapper" className="d-flex flex-column">
                    <TopBar/>
                    <Modal title={ modalConfirmData.title } content={ modalConfirmData.content } callback={ modalConfirmData.callback }></Modal>
                    <Flash messages={ engine.state.flashMessages } onClick={ () => engine.hideFlash() }></Flash>
                    <div id="content">
                        <Routes>
                            <Route path="/" element={<Splash/>}/>
                            <Route path="/index.html" element={<Splash/>}/>
                            <Route path="/proposals" element={<Proposals/>}/>
                            <Route path="/proposals/:id" element={<Proposal/>}/>
                            <Route path="/forms" element={<Forms/>}/>
                            <Route path="/forms/:id" element={<Form/>}/>
                            <Route path="/degrees" element={<Degrees/>}/>
                            <Route path="/degrees/:id" element={<Degree/>}/>
                            <Route path="/curricula" element={<Curricula/>}/>
                            <Route path="/curricula/:id" element={<Curriculum/>}/>
                            <Route path="/form-templates" element={<FormTemplates/>}/>
                            <Route path="/exams/:id" element={<Exam/>}/>
                            <Route path="/exams" element={<Exams/>}/>
                            <Route path="/users" element={<Users/>}/>
                            <Route path="/users/:id" element={<User/>}/>
                        </Routes>
                    </div>
                    <Footer/>
                </div>
            </BrowserRouter>
        </div>
    </EngineProvider>
}

export default function SinglePage() {
    return <QueryClientProvider client={queryClient}>
    <SinglePageInternal/>
    </QueryClientProvider> 
}

function Splash(props) {
    return <p>Splash!</p>
}
