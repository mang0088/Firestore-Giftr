import { useEffect, useState } from 'react';
import LogoutIcon from '@mui/icons-material/Logout';
//import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import Home from './Home';
import {auth} from "../firebase";
import {  GithubAuthProvider,  TwitterAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";



export default function AuthContext() {
  const [user, setUser] = useState({});
////Twitter SignIn
const hendelSignin = async (e) => {
  const provider = new TwitterAuthProvider();
    try{
        signInWithPopup(auth, provider);
    }catch(error){
        console.log(error);
    } 
    };
////Github SignIn
const GithubSignin = async (e) => {
  const provider = new GithubAuthProvider();
     try{
         signInWithPopup(auth, provider);
     }catch(error){
         console.log(error);
     } 
     };
///Signout
const handleSignOut = async (e)=>{
    signOut(auth);
};
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
          //console.log('User', currentUser);
          if(currentUser!==null){
          sessionStorage.setItem("accessToken", currentUser.uid);
          }
          else{
            sessionStorage.clear();
          }
        });
        return () => {
          unsubscribe();
        };
      }, []);
 const accessToken = sessionStorage.getItem("accessToken");    
  return (
    <div>
       <header>
      <h1>Fire-Giftr</h1>
      <h2>All Gifts Must Go!</h2>
      {user?.email ? (
        <div>
          <table className='dtable'>
   <tbody>
       <tr >
           <td >Wellcome, {user.email}</td>
           <td className='icologout'><LogoutIcon className='mainico' onClick={handleSignOut}/></td>
        </tr>
   </tbody>
</table>
      
        
      </div>
      ) : (
        <div></div>
      )}
    </header>
  {accessToken ? 
       <div>
<Home/>

     </div>
:
<div>
<main>
<section className="people">
  <div className="signinpart">
<h1><strong>Welcome.</strong> Please login.</h1>
<div>
  <p className="facebook-before"><span className="fontawesome-github"></span></p>
  <button className="facebook" onClick={GithubSignin}>Login Using Gitgub</button>
</div>
<br />
<div>
  <p className="twitter-before"><span className="fontawesome-twitter"></span></p>
  <button className="twitter" onClick={hendelSignin}>Login Using Twitter</button>
</div>
</div>
</section>
<section className="ideas"></section>
</main>
</div>
    }
        
    </div>
  )
}
