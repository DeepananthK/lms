import {useEffect, useState} from 'react';
import BorrowBook from './BorrowBook';
import ReturnBook from './ReturnBook';
import accessdenied from './Assets/Access-Denied-PNG.png';

function Reader() {
    const [access,setAccess]=useState("");
    const [current,setCurrent]=useState("");
    const [username,setUsername]=useState();
    const [sidebar,setSideBar]=useState(true);
    useEffect(() => {
        authenticate();
    },[]);
    async function authenticate() {
        const response=await fetch('http://localhost:9000/reader',{
            method: 'POST',
            credentials: 'include',
            headers: {
                'content-Type':'application/json',
            }
        });
        if(response.status===403 || response.status===401) {
            setAccess("Denied");
        } else {
            setAccess("Accepted");
            const data=await response.json();
            setUsername(data.username);
        }
    }
    async function logout() {
        await fetch('http://localhost:9000/logout',{
            method: 'POST',
            credentials: 'include',
            headers: {
                'content-Type':'application/json'
            }
        });
        window.location.href='/';
    }
    return (
        <>
            {
                access==='Accepted' &&
                <div className='userdashbaord'>
                    <div className='header'>
                        <div className='flexele' align="left" >
                            <p onClick={(e)=>setSideBar(sidebar?false:true)} className='hamburger'>
                                <i className="fa-solid fa-bars hovers"></i>
                            </p>
                        </div>
                        <div className='flexele' align="center">
                            <p className='lms2'>Library Management System</p>
                        </div>
                        <div className='flexele' align="right">
                            <div style={{padding: '0',margin: '0',marginTop: '8px',paddingRight:'2%'}}>
                                <span style={{paddingRight: '3%'}}>{username}</span>
                                <i className="fa fa-sign-out hovers" aria-hidden="true" onClick={logout} style={{cursor:'pointer'}} title="Logout"></i>
                            </div>
                        </div>
                    </div>
                    <div className='body' style={{height:'100%'}}>
                        {sidebar && 
                            <div className='sidebar'>
                                <div align="center"><h2 onClick={(e) => setCurrent("borrowbook")} style={{cursor:'pointer'}}>Borrow Book</h2></div>
                                <div align="center"><h2 onClick={(e) => setCurrent("returnbook")} style={{cursor:'pointer'}}>Return Book</h2></div>
                            </div>
                        }
                        <div style={{width:'100%',alignItems:'center'}} className="mainContent">
                            {current==="" && <div align="center"><h1 style={{color:'#810f96'}}>Hello Reader</h1></div>}
                            {current==="borrowbook" && <BorrowBook />}
                            {current==="returnbook" && <ReturnBook />}
                        </div>
                    </div>
                </div>
                // <div style={{display:'flex'}}>
                //     <div style={{backgroundColor:'green',width:'25%',height:'100vh',color:'white',display:'flex',flexDirection:'column'}}>
                //         <div align="center"><h1>Library Management System</h1></div>
                //         <div align="center"><h4>Welcome {username}</h4></div>
                //         <div align="left"><u onClick={logout} style={{cursor:'pointer'}}><h4>Logout</h4></u></div>
                //         <div align="center"><h2 onClick={(e) => setCurrent("borrowbook")} style={{cursor:'pointer'}}>Borrow Book</h2></div>
                //         <div align="center"><h2 onClick={(e) => setCurrent("returnbook")} style={{cursor:'pointer'}}>Return Book</h2></div>
                //     </div>
                //     <div style={{width:'75%',height:'100vh'}}>
                //         {current==="" && <div align="center"><h1>Hello Reader</h1></div>}
                //         {current==="borrowbook" && <BorrowBook />}
                //         {current==="returnbook" && <ReturnBook />}
                //     </div>
                // </div>
            }
            {
                access==='Denied' && 
                <div align="center">
                    <img src={accessdenied} alt="Access Denied" width="500px" height="500px" />
                </div>
            }
        </>
    );
}
export default Reader;