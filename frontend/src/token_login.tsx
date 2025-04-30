import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from './assets/logo.png'
import login_background from './assets/login_background.jpg'
import "./style2.css";

const TokenLoginPage: React.FC = () => {
  const [loginError, setLoginError] = useState(false);
  const navigate = useNavigate();

  
  // TODO: implement login logic
  const handleLogin = () => {
    const isValidLogin = false;
    if (!isValidLogin) {
      setLoginError(true);
    }
  };

  const handleRedirect = () => {
    navigate("/"); 
  };

  return (
    <div
        style={{ backgroundImage: `url(${login_background})` }}
        className="w-screen h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center box-border"
    >
      <div className="min-h-fit bg-white/60 backdrop-blur-md border-white border-2 rounded-[4vh] p-10 sm:w-4/10 md:w-4/10 lg:w-2/10 h-6/10 flex flex-col items-center shadow-xl">
        {/* Logo */}
        <div 
            style={{ backgroundImage: `url(${logo})` }}
            className="rounded-[4vh] box-border overflow-hidden min-h-[20vh] min-w-[20vh] bg-size-[130%] bg-center bg-no-repeat mb-6 sm:mb-4">
        </div>

        {/* Error message */}
        <p className={`text-red-500 text-center mu-[2vh] mb-[2vh] ${loginError ? '' : 'invisible'}`}>Podane spotkanie nie istnieje</p>

        {/* Form */}
        <input
          type="text"
          placeholder="token spotkania"
          className="w-full mb-4 px-4 py-2 bg-transparent border-b-2 border-blue-main text-blue-main placeholder-blue-main focus:outline-none"
          required
        />

        {/* Login button */}
        <button
          className="bg-blue-main text-white px-8 py-2 rounded-full font-bold tracking-wide cursor-pointer mb-[5vh]"
          onClick={handleLogin}
        >
          ZOBACZ
        </button>

        {/* Extra link */}
        <p className="text-white text-s mt-6 text-center">
          Zaloguj się do swojego konta. Kliknij{" "}
          <span 
            className="underline cursor-pointer"
            onClick={handleRedirect} 
          >tutaj</span>
        </p>
      </div>
    </div>
  );
};

export default TokenLoginPage;
