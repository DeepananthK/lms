import {useEffect, useState} from 'react';
import accessdenied from './Assets/Access-Denied-PNG.png';
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function BanReader() {
    const [access,setAccess]=useState("");
    useEffect(() => {
        authenticate();
    },[]);
    async function authenticate() {
        const response=await fetch('http://localhost:9000/staff',{
            method: 'POST',
            credentials: 'include',
            headers: {
                'content-Type':'application/json'
            }
        });
        if(response.status===403 || response.status===401) {
            setAccess("Denied");
        } else {
            setAccess("Accepted");
        }
    }

    const [report,setReport]=useState([]);
 
    useEffect(() => {
        getReaderDue();
    },[]);
 
    async function getReaderDue() {
     const response=await fetch('http://localhost:9000/staff/highdues',{
         method: 'GET',
         credentials: 'include',
         headers: {
        }
     });
     const data=await response.json();
     if(data.status==='Login Expired') {
        alert("Login Expired");
        window.location.href='/';
      } else {
          setReport(data);
      }
    }

    async function banReader(userId){
        const response=await fetch('http://localhost:9000/staff/ban',{
            method: 'POST',
            credentials: 'include',
            headers: {
                'content-Type':'application/json'
            },
            body: JSON.stringify({
                userId
            })
        });
        const data=await response.json();
        if(data.status==='error') {
            toast.warning('Cannot Ban',{position: toast.POSITION.TOP_CENTER});
        } else if(data.status==='Login Expired') {
            alert("Login Expired");
            window.location.href='/';
        } else {
            toast.success('Reader Banned',{position: toast.POSITION.TOP_CENTER});
        }
        getReaderDue();
    }

    return (
        <>
            <ToastContainer />
            {
                access==='Denied' &&
                <div align="center">
                    <img src={accessdenied} alt="Access Denied" width="500px" height="500px" />
                </div>
            }
            {
                access==='Accepted' &&
                <div align="center">
                    <h1 style={{color:'#810f96'}}>Readers with Due greater than 10000</h1>
                    {
                        report.length>0 && 
                        <table align="center">
                            <tbody>
                                <tr>
                                    <th>User Id</th>
                                    <th>First Name</th>
                                    <th>Last Name</th>
                                    <th>Due</th>
                                    <th>Ban</th>
                                </tr>
                                {
                                    report.map((value,index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{value.userId}</td>
                                                <td>{value.firstname}</td>
                                                <td>{value.lastname}</td>
                                                <td>{value.Due}</td>
                                                <td><button className='deletebutton' onClick={(e) => banReader(value.userId)}>Ban</button></td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </table>
                    }
                    {
                        report.length>0 ||
                        <h1 style={{color:'#810f96'}}>No Readers with due more than 10000</h1>
                    }
                </div>
            }
        </>
    );
 }
 
 export default BanReader;