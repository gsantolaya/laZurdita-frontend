import React from 'react'
import './Welcome.css';
// import logo from '../components/img/Picsart_23-08-25_21-47-45-119.png';

export const Welcome = () => {
    return (
        <>
            <div className='welcomeContainer text-center'>
                <h1 className='p-3 textWelcome'><b>Bienvenido a La Zurdita App</b></h1>
                {/* <img src={logo} className=" mb-5 appLogo" alt="logo" /> */}
            </div>
        </>
    )
}