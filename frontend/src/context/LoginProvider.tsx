import React, { useState } from "react";
import { LoginContext } from "./LoginContext";

type Props = {
  children: React.ReactNode
}

export const LoginProvider = ({ children }: Props) => {
  const [login, setLogin] = useState("");
  // @review do not store password in state, use session or token instead
  const [password, setPassword] = useState("");

  return (
    <LoginContext.Provider value={{ login, setLogin, password, setPassword }}>
      {children}
    </LoginContext.Provider>
  );
};