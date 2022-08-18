import {useEffect, useState} from 'react';
import accessdenied from './Assets/Access-Denied-PNG.png';

function BookWithIssues() {
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
        getBookIssues();
    },[]);
 
    async function getBookIssues() {
     const response=await fetch('http://localhost:9000/staff/bookswithissues',{
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

    return (
        <>
            {
                access==='Denied' &&
                <div align="center">
                    <img src={accessdenied} alt="Access Denied" width="500px" height="500px" />
                </div>
            }
            {
                access==='Accepted' &&
                <div align="center">
                    <h1 style={{color:'#810f96'}}>Book with Issues</h1>
                    {
                        report.length>0 && 
                        <table align="center">
                            <tbody>
                                <tr>
                                    <th>Report Id</th>
                                    <th>Reader Id</th>
                                    <th>ISBN</th>
                                    <th>Title</th>
                                    <th>Issue</th>
                                </tr>
                                {
                                    report.map((value,index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{value.reportId}</td>
                                                <td>{value.userId}</td>
                                                <td>{value.bookno}</td>
                                                <td>{value.title}</td>
                                                <td>{value.issue}</td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </table>
                    }
                    {
                        report.length>0 ||
                        <h1 style={{color:'#810f96'}}>No Issues reported</h1>
                    }
                </div>
            }
        </>
    );
 }
 
 export default BookWithIssues;