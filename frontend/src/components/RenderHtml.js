'use strict';

import React, {useEffect} from 'react'

export function RenderHtml({text, vars, data, setData}) {
    const parser = new DOMParser()
    const doc = parser.parseFromString(text, 'text/html')
    return <RenderElement el={doc.body} key="body"
         vars={vars} data={data || {}} setData={setData} />
}

function Error({key, children}) {
    return <span key={key} className='text-danger bg-warning'>{'<'}{children}{'>'}</span>
}

function RenderElement({el, vars, data, setData}) {
    const nodeName = el.nodeName.toLowerCase()
    if (nodeName === '#text') return el.textContent
    const children = [...el.childNodes].map((child, i) => 
        <RenderElement el={child} key={i} vars={vars} 
            data={data} setData={setData} />)
    //return <>({nodeName}){children}(/{nodeName})</>
    if (nodeName === 'var') {
        if (!vars) return <Error>internal error: no vars</Error>
        const varName = el.textContent
        if (!vars[varName]) return <Error>invalid var: {`"${varName}"`}</Error>
        return <span>{vars[varName]}</span>
    }
    if (nodeName === 'br') return <br />
    if (nodeName === 'p') return <p>{children}</p>
    if (nodeName === 'b') return <b>{children}</b>
    if (nodeName === 'i') return <i>{children}</i>
    if (nodeName === 'tt') return <tt>{children}</tt>
    if (nodeName === 'ul') return <ul>{children}</ul>
    if (nodeName === 'li') return <li>{children}</li>
    if (nodeName === 'input') return <RenderInput el={el} data={data} setData={setData} />
    if (nodeName === 'select') return <RenderSelect el={el} data={data} setData={setData}>{children}</RenderSelect>
    if (nodeName === 'textarea') return <RenderTextarea el={el} data={data} setData={setData} />
    if (nodeName === 'option') return <option value={el.value}>{children}</option>
    if (nodeName === 'a') return <a href={el.href}>{children}</a>
    if (nodeName === 'body') return <>{children}</>
    return <>[{nodeName} ignored]{children}</>
}

function RenderInput({el, data, setData}) {
    const name = el.name
    const value = data[el.name] || el.value
    useEffect(() => {
        if (data[name] !== value && setData) {
            setData(data => ({...data, [name]: value}))
        }
    }, [data, name, value, setData])
    if (!name) return <Error>input without name</Error>
    if (el.value && !data[el.name]) return <>...loading...</> 
    return <input
        className="form form-control"
        name={name}
        value={value}
        onChange={ evt => setData(data => ({
            ...data, [name]: evt.target.value}))} />
}

function RenderSelect({el, data, setData, children}) {
    const name = el.name
    const value = data[el.name] || el.value
    useEffect(() => {
        if (data[name] !== value && setData) {
            setData(data => ({...data, [name]: value}))
        }
    }, [data, name, value, setData])
    if (!name) return <Error>select without name</Error>
    if (el.value && !data[el.name]) return <>...loading...</> 
    return <select className="form form-control"
        name={name} value={value}
        onChange={ evt => setData(data => ({
            ...data, [name]: evt.target.value}))}>
        {children}
    </select>
}

function RenderTextarea({el, data, setData}) {
    const name = el.name
    const value = data[el.name] || el.value
    useEffect(() => {
        if (data[name] !== value && setData) {
            setData(data => ({...data, [name]: value}))
        }
    }, [data, name, value, setData])
    if (!name) return <Error>textarea without name</Error>
    if (el.value && !data[el.name]) return <>...loading...</> 
    return <textarea
        className="form form-control"
        name={name}
        onChange={ evt => setData(data => ({
            ...data, [name]: evt.target.value}))} value={value} />
}

