import React, { useState } from "react"
import {
    BrowserRouter, Routes, Route, Link
} from "react-router-dom"

import useEngine from "../modules/Engine"
import Exams from "./Exams"
import Exam from "./Exam"
import Users from "./Users"
import Degrees from "./Degrees"
import Degree from "./Degree"
import Curricula from "./Curricula"
import Modal from './Modal'
import Flash from "./Flash"
import NavBar from './NavBar'
import TopBar from './TopBar'
import Footer from './Footer'
import FormTemplates from './FormTemplates'

export const PageContext = React.createContext({
    flashCatch: () => {}
});


export default function SinglePage () {
    const engine = useEngine()
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
                        <Route path="/" element={<Splash />} />
                        <Route path="/index.html" element={<Splash />} />
                        <Route path="/exams/:id" element={<Exam engine={ engine } />} />
                        <Route path="/exams" element={<Exams />} />
                        <Route path="/users" element={<Users />} />
                        <Route path="/degrees/:id" element={<Degree engine={ engine } />} />
                        <Route path="/degrees" element={<Degrees />} />
                        <Route path="/curricula" element={<Curricula />} />
                        <Route path="/form-templates" element={<FormTemplates />} />
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

