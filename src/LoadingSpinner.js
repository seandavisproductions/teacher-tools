import { useEffect, useState } from "react";

export function LoadingSpinner() {
    const [text, setText] = useState()
    const [spinner, setSpinner] = useState()
    

    useEffect(() => {setTimeout(() => {setText(`can you see something here`);}, 3000);}, []);

    return (
    <>
        <div>
            {spinner ? (<img src="public/Pacman Spinner.gif" alt="Loading..."/>) : (<h3>{text}</h3>)}
        </div>
    </>)
}