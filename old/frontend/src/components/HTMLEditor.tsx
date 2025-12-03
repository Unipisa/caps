import React from "react"
import { Editor } from "@tinymce/tinymce-react"

// Rich text editor based on TinyMCE
export default function HTMLEditor({ content, setContent }) {
    return <Editor
                licenseKey='gpl'
                tinymceScriptSrc='/js/tinymce/tinymce.min.js'ì
                value={content || ''}
                init={{
                height: 500,
                menubar: false,
                plugins: [
                    'autolink', 'lists', 'link', 'charmap', 'preview',
                    'anchor', 'searchreplace', 'visualblocks', 'code', 'table', 
                    'code', 'help', 'wordcount'
                ],
                toolbar: 'undo redo | blocks | ' +
                    'bold italic forecolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'removeformat | help',
                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                }}
                onEditorChange = {(content, editor) => {
                    setContent(content)
                }}
            ></Editor>
}