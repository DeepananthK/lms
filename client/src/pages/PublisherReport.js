import {useEffect, useState} from 'react';
import accessdenied from './Assets/Access-Denied-PNG.png';

function PublisherReport() {
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
        getPublishersReport();
    },[]);
 
    async function getPublishersReport() {
     const response=await fetch('http://localhost:9000/staff/publishers',{
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
                    <h1 style={{color:'#810f96'}}>Publisher Reports</h1>
                    {
                        report.length>0 && 
                        <table align="center">
                            <tbody>
                                <tr>
                                    <th>Publisher Id</th>
                                    <th>Publisher Name</th>
                                    <th>No. of Publications</th>
                                </tr>
                                {
                                    report.map((value,index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{value.userId}</td>
                                                <td>{value.firstname} {value.lastname}</td>
                                                <td>{value.count}</td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </table>
                    }
                </div>
            }
        </>
    );
 }
 
 export default PublisherReport;