import React from "react"

export default function LoadingMessage({children}:{
    children?: any
}) {
    return <div style={{ display: "flex", alignItems: "center" }}>
        <div className="spinner-border spinner-border-sm text-primary mr-2" role="status"></div>
        <div>{children}</div>
    </div>;
}
