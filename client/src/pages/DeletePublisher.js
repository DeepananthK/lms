import {useEffect, useState} from 'react';
import accessdenied from './Assets/Access-Denied-PNG.png';
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function DeletePublisher() {
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

    const [report,setReport]=useState([[]]);
 
    useEffect(() => {
        getPublishersWithNoReaders();
    },[]);
 
    async function getPublishersWithNoReaders() {
     const response=await fetch('http://localhost:9000/staff/publisherswithnoreaders',{
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

    async function deletePublisher(userId){
        const response=await fetch('http://localhost:9000/staff/deletepublisher',{
            method: 'POST',
            credentials: 'include',
            headers: {
                'content-Type':'application/json'
            },
            body: JSON.stringify({
                userId
            })
        });
        if(response.status===403 || response.status===401) {
            setAccess("Denied");
        } else {
            setAccess("Accepted");
        }
        const data=await response.json();
        if(data.status==='Login Expired') {
            alert("Login Expired");
            window.location.href='/';
        }else if(data.status==='error') {
            toast.warning('Cannot Delete',{position: toast.POSITION.TOP_CENTER});
        } else {
            toast.success('Deleted Publisher',{position: toast.POSITION.TOP_CENTER});
        }
        getPublishersWithNoReaders();
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
                    <h1  style={{color:'#810f96'}}>Publishers With No Readers</h1>
                    {
                        report.length>0 && 
                        <table align="center">
                            <tbody>
                                <tr>
                                    <th>User Id</th>
                                    <th>First Name</th>
                                    <th>Last Name</th>
                                    <th>Delete</th>
                                </tr>
                                {
                                    report.map((value,index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{value.userId}</td>
                                                <td>{value.firstname}</td>
                                                <td>{value.lastname}</td>
                                                <td><button className='deletebutton' onClick={(e) => deletePublisher(value.userId)}>Delete</button></td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </table>
                    }
                    {
                        report.length>0 ||
                        <div>
                            <h1 style={{color:'#810f96'}}>No Publishers with no readers</h1>
                        </div>
                    }
                </div>
            }
        </>
    );
}
 
export default DeletePublisher;