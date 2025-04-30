import React, { createContext} from "react";

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