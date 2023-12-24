import { useContext } from 'react';

// auth provider
import AuthContext from 'contexts/ottrAuthContext';
// import AuthContext from 'contexts/FirebaseContext';
// import AuthContext from 'contexts/AWSCognitoContext';
// import AuthContext from 'contexts/JWTContext';
// import AuthContext from 'contexts/Auth0Context';

// ==============================|| AUTH HOOKS ||============================== //

const useAuth = () => {
  const { isLoggedIn, handleLogin, logout } = useContext(AuthContext);

  // console.log("islogged in useAuth : " ,isLoggedIn)
  // // if (!context) throw new Error('context must be use inside provider');

  // useEffect(()=> {
  //   console.log("islogged in useAuth11 : " ,isLoggedIn)

  // }, [isLoggedIn])

  return { isLoggedIn, handleLogin, logout };
};

export default useAuth;
