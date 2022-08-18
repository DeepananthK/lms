import { useState,useEffect } from "react";
import accessdenied from './Assets/Access-Denied-PNG.png';

function MyPublications() {
    const [access,setAccess]=useState("");
    useEffect(() => {
        authenticate();
    },[]);
    async function authenticate() {
        const response=await fetch('http://localhost:9000/publisher/canpublish',{
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
        getPublications();
    },[]);
 
    async function getPublications() {
     const response=await fetch("http://localhost:9000/publisher/mypublications",{
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
                    <h1 style={{color:'#810f96'}}>My Publications</h1>
                    {
                        report.length>0 && 
                        <table align="center">
                            <tbody>
                                <tr>
                                    <th>ISBN</th>
                                    <th>Book Name</th>
                                    <th>Year</th>
                                </tr>
                                {
                                    report.map((value,index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{value.isbn}</td>
                                                <td>{value.bookname}</td>
                                                <td>{value.year}</td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </table>
                    }
                    {report.length>0 || <h1 style={{color:'#810f96'}}>No Publications Available</h1>}
                </div>
            }
        </>
    );
}

export default MyPublications;