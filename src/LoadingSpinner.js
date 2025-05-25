import { useEffect, useState } from "react";

export function LoadingSpinner() {
    const [text, setText] = useState()
    const [spinner, setSpinner] = useState()
    

    useEffect(() => {setTimeout(() => {setText(`loading...`);}, 3000);}, []);

    return (
    <>
        <div>
            {spinner ? (<img src={`${process.env.PUBLIC_URL}/FullScreen Logo.png`} alt="Loading..."/>) : (<h3>{text}</h3>)}
        </div>
    </>)
}