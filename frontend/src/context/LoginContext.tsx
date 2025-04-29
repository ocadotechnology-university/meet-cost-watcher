import React, { createContext, useState } from "react";

interface LoginContextProps {
  login: string;
  setLogin: React.Dispatch<React.SetStateAction<string>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
}

export const LoginContext = createContext<LoginContextProps>({
  login: "",
  setLogin: () => {},
  password: "",
  setPassword: () => {},
});

export const LoginProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  return (
    <LoginContext.Provider value={{ login, setLogin, password, setPassword }}>
      {children}
    </LoginContext.Provider>
  );
};