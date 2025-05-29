import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from '../assets/logo.png'
import login_background from '../assets/login_background.jpg'
import eye from '../assets/eye.png'
import { useContext } from "react";
import { LoginContext } from "../context/LoginContext.tsx";
// import {MeetingResponse} from "../types/responseTypes.ts";
import "../style2.css";

const LoginPage: React.FC = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const { login, setLogin, password, setPassword } = useContext(LoginContext);
  const navigate = useNavigate();
  const backendURL = "http://127.0.0.1:5000";

  const togglePassword = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleLogin = async () => {
    try {
      const credentials = btoa(`${login}:${password}`);
      const bodyData = {
        per_page: 1,
        page: 1
      }
      const response = await fetch(backendURL+"/meetings/all", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${credentials}`, 
        },
        body: JSON.stringify(bodyData)
      });

      if (response.status === 401) {
        setLoginError(true); 
      } else if (response.status === 200) {
        localStorage.setItem('credentials',credentials);
        localStorage.setItem('username', login);
        navigate("/multiple_meetings");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setLoginError(true);
    }
  };

  const handleRedirect = () => {
    navigate("/token_login"); 
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
        <p className={`text-red-500 text-center mu-[2vh] mb-[2vh] ${loginError ? '' : 'invisible'}`}>Błędny login lub hasło</p>
  
        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault(); 
            handleLogin(); 
          }}
          className="w-full flex flex-col items-center"
        >
          <input
            type="text"
            placeholder="login"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            className="w-full mb-4 px-4 py-2 bg-transparent border-b-2 border-blue-main text-blue-main placeholder-blue-main focus:outline-none"
            required
          />
          <div className="relative w-full mb-6">
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-transparent border-b-2 border-blue-main text-blue-main placeholder-blue-main focus:outline-none"
              required
            />
            <button
              type="button"
              onClick={togglePassword}
              style={{ backgroundImage: `url(${eye})` }}
              className="absolute right-2 top-1 text-blue-main bg-cover bg-center bg-no-repeat w-[4vh] h-[4vh] cursor-pointer"
            >
            </button>
          </div>
  
          {/* Login button */}
          <button
            type="submit"
            className="bg-blue-main text-white px-8 py-2 rounded-full font-bold tracking-wide cursor-pointer"
          >
            LOGIN
          </button>
        </form>
  
        {/* Extra link */}
        <p className="text-white text-s mt-6 text-center">
          chcesz zobaczyć pojedyncze spotkanie? Kliknij{" "}
          <span 
            className="underline cursor-pointer"
            onClick={handleRedirect} 
          >tutaj</span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
