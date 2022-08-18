import {useState} from 'react';
import {Link} from 'react-router-dom';
import './Login.css';
import backgroundImage from './Assets/library3.jpg';
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Login() {
    document.body.style.backgroundImage="url("+backgroundImage+")";
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    async function LoginUser(event) {
        event.preventDefault();
        if(!email.match(/^[a-zA-Z][a-zA-Z0-9\.\-]*@[a-z\.]*[a-z]+\.[a-z]+$/)) {
            toast.warning("Invalid Email",{position: toast.POSITION.TOP_CENTER});
            return;
        }
        const response=await fetch('http://localhost:9000/login',{
            method: 'POST',
            credentials: 'include',
            headers: {
                'content-Type':'application/json'
            },
            body: JSON.stringify({
                email,
                password
            })
        });
        //console.log("**");
        const data=await response.json();
        //console.log("-->");
        if(data.status==='error') {
            //alert('Invalid Username or Password');
            toast.warning("Invalid Username or Password",{position: toast.POSITION.TOP_CENTER});
        } else if(data.status==='invalid') {
            //alert("Invalid Username or Password");
            toast.warning("Invalid Username or Password",{position: toast.POSITION.TOP_CENTER});
        } else {
            //console.log(data);
            //alert("okay");
            if(data.role==='Reader') {
                //setCookie('token',data.token);
                window.location.href='/reader';
            } else if(data.role==='Staff') {
                //setCookie('token',data.token);
                window.location.href='/staff';
            } else if(data.role==='Publisher') {
                //setCookie('token',data.token);
                window.location.href='/publisher';
            }
            /*await fetch('http://localhost:9000/reader',{
                method:'POST',
                credentials:'include'
            });*/
        }
    }
    // function toggle() {
    //     const type=document.getElementById('id_password').type;
    //     if(type==='password') {
    //         document.getElementById('id_password').type='text';
    //         setShowPassword(false);
    //     } else if(type==='text') {
    //         document.getElementById('id_password').type='password';
    //         setShowPassword(true);
    //     }
    // }
    return (
        <>
            <ToastContainer />
            <div className="main">
                <p className="lms" align="center">Library Management System</p>
                <p className="sign" align="center">Log in</p>
                <form className="form1" onSubmit={LoginUser} align="center">
                    <input type="email" align="center" className="un" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Username" required/>
                    <input type="password" align="center" className="pass" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password"  required autoComplete='off' />
                    <input type="submit" className="submit" align="center" value="Login"/>
                </form>
                <p className="forgot" align="center">New User? <Link to="/register">Register</Link></p>
            </div>
            {/* <div style={{display:'flex',alignItems:'center'}}>
                <div style={{backgroundColor:'green',width:'25%',height:'100vh',color:'white',display:'flex',alignItems:'center'}}>
                    <div align="center"><h1>Library Management System</h1></div>
                </div>
                <div style={{width:'75%',height:'100vh'}} align="center">
                    <h1>Login</h1>
                    <form onSubmit={LoginUser}>
                        Username<br />
                        <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="email" required/><br />
                        Password<br />
                        <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="password"  id="id_password" required autoComplete='off' />{showPassword && <i className="fa fa-eye" onClick={(e)=>toggle()}></i>}{showPassword || <i className="fa fa-eye-slash" onClick={(e)=>toggle()}></i>}
                        <br />
                        <input type="submit" value="Login" />
                    </form>
                    <h1>New User? Register <Link to="/register">here</Link></h1>
                </div>
            </div> */}
        </>
    );
}

export default Login;