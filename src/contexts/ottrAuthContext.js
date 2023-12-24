import { createContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedin] = useState(!!localStorage.getItem('authToken'));

  const handleLogin = (token) => {
    localStorage.setItem('authToken', token);
    setIsLoggedin(true);

    console.log('isLiggedIn in handlelogin ', isLoggedIn);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedin(false);
  };
  console.log('isLiggedIn in context ', isLoggedIn);

  return <AuthContext.Provider value={{ isLoggedIn, handleLogin, logout }}>{children}</AuthContext.Provider>;
};

export default AuthContext;
