import {Link} from 'react-router-dom';
import { useState } from 'react';
import './Register.css';
import backgroundImage from './Assets/library3.jpg';
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Register() {
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    const [firstname,setFirstName]=useState("");
    const [lastname,setLastName]=useState("");
    const [address,setAddress]=useState("");
    const [phone,setPhone]=useState([]);
    const [phnocnt,setPhnocnt]=useState(0);
    const [role,setRole]=useState("");
    const [invalidPassword,setInvalidPassword]=useState(false);
    const [invalidEmail,setInvalidEmail]=useState(false);

    document.body.style.backgroundImage="url("+backgroundImage+")";
    async function register(event) {
        event.preventDefault();
        if(!firstname.match(/^[a-zA-Z]*$/)) {
            toast.warning("Enter a valid Firstname",{position: toast.POSITION.TOP_CENTER});
            return;
        }
        if(!lastname.match(/^[a-zA-Z ]*$/)) {
            toast.warning("Enter a valid Lastname",{position: toast.POSITION.TOP_CENTER});
            return;
        }
        if(role==='') {
            toast.warning('Select a Role',{position: toast.POSITION.TOP_CENTER});
            return;
        }
        if(role!=='Staff' && role!=="Reader" && role!=="Publisher") {
            toast.warning('Select a valid Role',{position: toast.POSITION.TOP_CENTER});
            return;
        }
        if(role==='Reader') {
            if(!address.match(/^[a-zA-Z0-9]+[a-zA-Z0-9 .\-,\n]*$/)) {
                toast.warning("Enter valid address",{position: toast.POSITION.TOP_CENTER});
                return;
            }
            if(address.length>60) {
                toast.warning("Address is so lengthy",{position: toast.POSITION.TOP_CENTER});
                return;
            }
            for(var x=0;x<phone.length;x++) {
                for(var y=x+1;y<phone.length;y++) {
                    if(!phone[x].match(/^[6-9][0-9]{9}$/)){
                        toast.warning("Invalid Phone no!",{position: toast.POSITION.TOP_CENTER})
                    }
                    if(phone[x]===phone[y]) {
                        toast.warning('Duplicate Phone no!!',{position: toast.POSITION.TOP_CENTER});
                        return;
                    }
                }
            }
        }
        if(!email.match(/^[a-zA-Z][a-zA-Z0-9\.\-]*@[a-z\.]*[a-z]+\.[a-z]+$/)) {
            toast.warning("Invalid Email",{position: toast.POSITION.TOP_CENTER});
            setInvalidEmail(true);
            return;
        } else {
            setInvalidEmail(false);
        }
        if(password===""){
            toast.warning("Password Should Meet the requirements",{position: toast.POSITION.TOP_CENTER});
            setInvalidPassword(true);
            return;
        }
        else if((!password[0].match(/[A-Z]/)) || (!password.match(/[0-9]+/)) || (!password.match(/[!@#\$%\^&\*\(\)\[\]\{\}\.\,<>]+/)) || (password.length<6)) {
            toast.warning("Password Should Meet the requirements",{position: toast.POSITION.TOP_CENTER});
            setInvalidPassword(true);
            return;
        } else {
            setInvalidPassword(false);
        }
        const response=await fetch('http://localhost:9000/register',{
            method: 'POST',
            credentials: 'include',
            headers: {
                'content-Type':'application/json'
            },
            body: JSON.stringify({
                email,
                password,
                firstname,
                lastname,
                role,
                address,
                phone
            })
        });
        const data=await response.json();
        if(data.status==='error') {
            toast.warning("Duplicate Email",{position: toast.POSITION.TOP_CENTER});
        } else if(data.status==='okay') {
            if(data.role==='Reader') {
                window.location.href='/reader';
            } else if(data.role==='Publisher') {
                window.location.href='/publisher';
            } else if(data.role==='Staff') {
                window.location.href='/staff';
            }
        }else {
            toast.warning(data.status,{position: toast.POSITION.TOP_CENTER});
        }
    }
    
    function addPhoneno(index,inp) {
        phone[index]=inp;
    }
    function addField(event) {
        setPhnocnt(phnocnt+1);
    }
    function removeField(index) {
        setPhnocnt(phnocnt-1);
        phone.pop();
    }
    function validateEmail(email1) {
        if(!email1.match(/^[a-zA-Z][a-zA-Z0-9\.\-]*@[a-z\.]*[a-z]+\.[a-z]+$/)) {
            setInvalidEmail(true);
        } else {
            setInvalidEmail(false);
        }
    }
    function validatePassword(password1) {
        if(password1===""){
            setInvalidPassword(true);
            return;
        }
        if((!password1[0].match(/[A-Z]/)) || (!password1.match(/[0-9]+/)) || (!password1.match(/[!@#\$%\^&\*\(\)\[\]\{\}\.\,<>]+/)) || (password1.length<6)) {
            setInvalidPassword(true);
        } else {
            setInvalidPassword(false);
        }
    }
    return (
        <>
            <ToastContainer />
            <div className='main1'>
                <p className="lms1" align="center">Library Management System</p>
                <p className="sign1" align="center">Register</p>
                <form onSubmit={register} align="center">
                        <input className='un1' type="email" value={email} onChange={(e)=>{setEmail(e.target.value);validateEmail(e.target.value);}} placeholder="Email" required/>
                        {invalidEmail && <p style={{color:'Red'}}>Enter a valid Email</p>}
                        <input type="password" className='pass1' value={password} onChange={(e)=>{setPassword(e.target.value);validatePassword(e.target.value);}} placeholder="Password" id="id_password" required/>
                        {invalidPassword && <p style={{color:'Red'}}>Password should start with a Upper Case and should atleast have one number,one special character and minimum of 6 characters</p>}
                        <input type="text" className='un1' value={firstname} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" pattern="[A-Z][a-z]*" required /><br />
                        <input type="text" className='un1' value={lastname} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" pattern="[A-Z][a-z]*" required /><br />
                        <select className='un1' onChange={(e) => {setRole(e.target.value);setAddress("");setPhone([]);setPhnocnt(0);}} defaultValue={'Select a Role'} value={role}>
                            <option className='opts' value='Select a Role' hidden>Select a Role</option>
                            <option className='opts' value="Staff">Staff</option>
                            <option className='opts' value="Publisher">Publisher</option>
                            <option className='opts' value="Reader">Reader</option>
                        </select>
                        <br />
                        {
                            role==='Reader' &&
                            <>
                                <textarea value={address} onChange={(e) => {setAddress(e.target.value)}} className="un1" placeholder='Address' required></textarea>
                                <input type="tel" className='un1' onChange={(e) => addPhoneno(0,e.target.value)} pattern="[6-9][0-9]{9}" placeholder='Phone number' required/>
                                {
                                    Array.from(Array(phnocnt)).map((c, index) => {
                                        return (
                                            <div key={index+1}>
                                                <input type="tel" className='un1' onChange={(e) => addPhoneno(index+1,e.target.value)} pattern="[6-9][0-9]{9}" placeholder='Phone number' required/>
                                            </div>
                                        );
                                    })}
                                    {phnocnt<2 && <u className='add'><h4 onClick={addField}>Add another number</h4></u>}
                                    {phnocnt>0 && <><u className='add'><h4 onClick={removeField}>Remove Last number</h4></u></>
                                }
                            </>
                        }
                        <input type="submit" className='submit1' value="Register" />
                    </form>
                    <p className="forgot" align="center">Existing User? <Link to="/">Login</Link></p>
            </div>
            {/* <div style={{display:'flex'}}>
                <div style={{backgroundColor:'green',width:'25%',height:'100vh',color:'white',display:'flex',alignItems:'center'}}>
                    <div align="center"><h1>Library Management System</h1></div>
                </div>
                <div style={{width:'75%',height:'100vh'}}>
                    <div align="center">
                        <h1>Register</h1>
                        <form onSubmit={register}>
                            Email<br />
                            <input type="email" value={email} onChange={(e)=>{setEmail(e.target.value);validateEmail(e.target.value);}} placeholder="email" required/><br />
                            {invalidEmail && <p style={{color:'Red'}}>Enter a valid Email</p>}
                            Password<br />
                            <input type="password" value={password} onChange={(e)=>{setPassword(e.target.value);validatePassword(e.target.value);}} placeholder="password" id="id_password" required/>{showPassword && <i className="fa fa-eye" onClick={(e)=>toggle()}></i>}{showPassword || <i className="fa fa-eye-slash" onClick={(e)=>toggle()}></i>}
                            <br />
                            {invalidPassword && <p style={{color:'Red'}}>Password should start with a Upper Case and should atleast have one number,one special character and minimum of 6 characters</p>}
                            First Name<br/ >
                            <input type="text" value={firstname} onChange={(e) => setFirstName(e.target.value)} placeholder="first name" pattern="[A-Z][a-z]*" required /><br />
                            Last Name<br/ >
                            <input type="text" value={lastname} onChange={(e) => setLastName(e.target.value)} placeholder="last name" pattern="[A-Z][a-z]*" required /><br />
                            Role<br />
                            <select onChange={(e) => {setRole(e.target.value);setAddress("");setPhone([]);setPhnocnt(0);}} defaultValue={'Select a Role'}>
                                <option value='Select a Role' hidden>Select a Role</option>
                                <option value="Staff">Staff</option>
                                <option value="Publisher">Publisher</option>
                                <option value="Reader">Reader</option>
                            </select>
                            <br />
                            {
                                role==='Reader' &&
                                <>
                                    Address<br/ >
                                    <textarea value={address} onChange={(e) => {setAddress(e.target.value)}} required></textarea><br />
                                    Phone No<br />
                                    <input type="tel" onChange={(e) => addPhoneno(0,e.target.value)} pattern="[6-9][0-9]{9}" required/>
                                    {
                                        Array.from(Array(phnocnt)).map((c, index) => {
                                            return (
                                                <div key={index+1}>
                                                    <input type="tel" onChange={(e) => addPhoneno(index+1,e.target.value)} pattern="[6-9][0-9]{9}" required/>
                                                    <br />
                                                </div>
                                            );
                                        })}
                                        <u className='add'><h4 onClick={addField}>Add another number</h4></u>
                                        {phnocnt>0 && <><u className='add'><h4 onClick={removeField}>Remove Last number</h4></u><br /></>
                                    }
                                </>
                            }
                            <input type="submit" value="Register" />
                        </form>
                        <h1 align="center">Existing User? Login <Link to="/">here</Link></h1>
                    </div>
                </div>
            </div> */}
        </>
    );
}

export default Register;