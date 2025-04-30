import React, { useState } from "react";
import { LoginContext } from "./LoginContext";

export const LoginProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  return (
    <LoginContext.Provider value={{ login, setLogin, password, setPassword }}>
      {children}
    </LoginContext.Provider>
  );
};