import { useState,useEffect } from "react";
import accessdenied from './Assets/Access-Denied-PNG.png';
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ReturnBook() {
    const [access,setAccess]=useState("");
    useEffect(() => {
        authenticate();
    },[]);
    async function authenticate() {
        const response=await fetch('http://localhost:9000/reader',{
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
    const [borrowId,setBorrowId]=useState();
    const [issueflag,setIssueFlag]=useState('no');
    const [issue,setIssue]=useState("");
    const [bookno,setBookno]=useState(0);
    const [bookname,setBookName]=useState("");

    useEffect(() => {
        getBorrows();
    },[]);
 
    async function getBorrows() {
     const response=await fetch(`http://localhost:9000/borrowings`,{
         method: 'GET',
         credentials: 'include',
         headers: {
             'content-Type':'application/json'
         }
     });
     const data=await response.json();
     setReport(data);
    }

    async function returnBook(event){
        event.preventDefault();
        if(issueflag==='yes' && issue.length>50) {
            alert('Issue Length is high');
            return;
        }
        if(issueflag==='yes' && issue==="") {
            alert('Enter the Issue');
            return;
        }
        const response=await fetch(`http://localhost:9000/return/${borrowId}`,{
            method:'PUT',
            credentials: 'include',
            headers: {
                'content-Type': 'application/json'
            },
            body: JSON.stringify({
                bookno,
                issueflag,
                issue,
            })
        });
        const data=await response.json();
        console.log(data);
        if(data.status==='Login Expired') {
            alert("Login Expired");
            window.location.href='/';
        } else if(data.status==='error') {
            toast.warning('Cannot Return',{position: toast.POSITION.TOP_CENTER});
        } else {
            setBorrowId();
            toast.success('Returned!!',{position: toast.POSITION.TOP_CENTER});
        }
        getBorrows();
    }

    function getDate(date1) {
        const date=new Date(date1);
        return date.getDate()+"/"+date.getMonth()+"/"+date.getFullYear();
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
                    <h1 style={{color:'#810f96'}}>My Borrowings</h1>
                    {
                        report.length>0 && 
                        <table align="center">
                            <tbody>
                                <tr>
                                    <th>Borrow Id</th>
                                    <th>ISBN</th>
                                    <th>Title</th>
                                    <th>Issue Date</th>
                                    <th>Return</th>
                                </tr>
                                {
                                    report.map((value,index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{value.borrowId}</td>
                                                <td>{value.bookno}</td>
                                                <td>{value.title}</td>
                                                <td>{getDate(value.issuedate)}</td>
                                                <td><button className="updatebutton" onClick={()=>{setBorrowId(value.borrowId);setBookno(value.bookno);setBookName(value.title);}}>Return</button></td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </table>
                    }
                    {report.length>0 || <h1 style={{color:'#810f96'}}>No Borrowings</h1>}
                    {borrowId && 
                        <form className="formstyle2" onSubmit={returnBook}>
                            <h3>Returning: {bookname}</h3><br />
                            Issue with book?
                            <input type="radio" name="issue" value="yes" onChange={(e)=>setIssueFlag('yes')} required/>Yes
                            <input type="radio" name="issue" value="No" onChange={(e)=>setIssueFlag('no')} required/>No
                            <br />
                            <br />
                            {issueflag==='yes' && <input className="inputstyle2" type="text" placeholder="Type Your Issue Here" onChange={(e) => setIssue(e.target.value)} required/>}
                            <br />
                            <input type="submit" value="Return" className="reservebutton"/>
                        </form>
                    }
                </div>
            }
        </>
    );
}

export default ReturnBook;