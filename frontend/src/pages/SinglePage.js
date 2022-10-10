import React, { useState } from "react"
import {
    BrowserRouter, Routes, Route, Link
} from "react-router-dom"

import engine from "../modules/engine"

import Proposals from "./Proposals"
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

export const PageContext = React.createContext({
    flashCatch: () => {}
});

export default function SinglePage () {
    engine.sync(useState(engine.state))
    const modalConfirmData = engine.state.modalConfirmData

    return <>
    <div id="wrapper">
        <BrowserRouter>
            <NavBar />
            <div id="content-wrapper" className="d-flex flex-column">
                <TopBar />
                <Modal title={ modalConfirmData.title } content={ modalConfirmData.content } callback={ modalConfirmData.callback }></Modal>
                <Flash messages={ engine.state.flashMessages } onClick={ () => engine.hideFlash() }></Flash>
                <div id="content">
                    <Routes>
                        <Route path="/" element={<Splash engine={engine}/>} />
                        <Route path="/index.html" element={<Splash engine={engine} />} />
                        <Route path="/proposals" element={<Proposals engine={engine} />} />
                        {/*<Route path="/proposals/:id" element={<Proposal engine={ engine } />} />*/}
                        <Route path="/forms" element={<Forms engine={engine} />} />
                        <Route path="/forms/:id" element={<Form engine={ engine } />} />
                        <Route path="/degrees" element={<Degrees engine={engine} />} />
                        <Route path="/degrees/:id" element={<Degree engine={ engine } />} />
                        <Route path="/curricula" element={<Curricula engine={engine} />} />
                        <Route path="/curricula/:id" element={<Curriculum engine={engine} />} />
                        <Route path="/form-templates" element={<FormTemplates engine={engine} />} />
                        <Route path="/exams/:id" element={<Exam engine={ engine } />} />
                        <Route path="/exams" element={<Exams engine={engine} />} />
                        <Route path="/users" element={<Users engine={engine} />} />
                        <Route path="/users/:id" element={<User engine={engine} />} />
                    </Routes>
                </div>
                <Footer />
            </div>
        </BrowserRouter>
    </div>
    </>
}

function Splash(props) {
    return <p>Splash!</p>
}

