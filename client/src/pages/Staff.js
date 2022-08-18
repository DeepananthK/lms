import {useEffect, useState} from 'react';
import AddBooks from "./AddBooks";
import UpdateBook from './UpdateBook';
import DeleteBook from './DeleteBook';
import PublisherReport from './PublisherReport';
import BookWithIssues from './BookIssues';
import BooksHeld from './BooksHeld';
import DueAmount from './DueAmount';
import DeletePublisher from './DeletePublisher';
import BannedReaders from './BannedReaders';
import BanReader from './BanReader';
import accessdenied from './Assets/Access-Denied-PNG.png';
import './User.css';

function Staff() {
    const [access,setAccess]=useState("");
    const [current,setCurrent]=useState("");
    const [drop,setDrop]=useState("");
    const [username,setUsername]=useState();
    const [sidebar,setSideBar]=useState(true);
    useEffect(() => {
        authenticate();
    },[]);
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
            const data=await response.json();
            setUsername(data.username);
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
                                <div align="center"><h2 onClick={(e) => {setDrop(drop==="managebooks"?"":"managebooks");setCurrent("");}} style={{cursor:'pointer'}}>Manage Books</h2></div>
                                {
                                    drop==='managebooks' && 
                                    <div style={{padding: '0',margin: '0'}}>
                                        <h4 className="list1" onClick={(e) => setCurrent("addbook")}>Add Book</h4>
                                        <h4 className="list1" onClick={(e) => setCurrent("updatebook")}>Update Book</h4>
                                        <h4 className="list1" onClick={(e) => {setCurrent("");setCurrent("deletebook");}}>Delete Book</h4>
                                    </div>
                                }
                                    <div align="center"><h2 onClick={(e) => {setDrop(drop==="viewreports"?"":"viewreports");setCurrent("");}} style={{cursor:'pointer'}}>View Reports</h2></div>
                                    {
                                        drop==='viewreports' && 
                                        <div style={{padding: '0',margin: '0'}}>
                                            <h4 className="list1" onClick={(e) => setCurrent("publisherreport")}>No of books published by Publishers</h4>
                                            <h4 className="list1" onClick={(e) => setCurrent("booksheld")}>No of Books held by Readers</h4>
                                            <h4 className="list1" onClick={(e) => setCurrent("readerdues")}>Reader Dues</h4>
                                            <h4 className="list1" onClick={(e) => setCurrent("bookissues")}>Books with Issues</h4>
                                        </div>
                                    }
                                    <div align="center"><h2 onClick={(e) => {setDrop("");setCurrent("deletepublisher")}} style={{cursor:'pointer'}}>Delete Publisher</h2></div>
                                <div align="center"><h2 onClick={(e) => {setDrop("");setCurrent("banreaders")}} style={{cursor:'pointer'}}>Ban Reader</h2></div>
                                <div align="center"><h2 onClick={(e) => {setDrop("");setCurrent("bannedReaders")}} style={{cursor:'pointer'}}>Banned Readers</h2></div>
                            </div>
                        }
                        <div style={{width:'100%',alignItems:'center'}} className="mainContent">
                            {current==="" && <h1 align="center" style={{color: '#810f96'}}>Hello Staff</h1>}
                            {current==="addbook" && <AddBooks />}
                            {current==="updatebook" && <UpdateBook />}
                            {current==="deletebook" && <DeleteBook /> }
                            {current==="publisherreport" && <PublisherReport />}
                            {current==="booksheld" && <BooksHeld />}
                            {current==="readerdues" && <DueAmount /> }
                            {current==="bookissues" && <BookWithIssues /> }
                            {current==="deletepublisher" && <DeletePublisher /> }
                            {current==="banreaders" && <BanReader /> }
                            {current==="bannedReaders" && <BannedReaders /> }
                        </div>
                    </div>
                </div>
                // <div style={{display:'flex'}}>
                //     <div style={{backgroundColor:'green',width:'25%',height:'100vh',color:'white',display:'flex',flexDirection:'column'}}>
                //         <div align="center"><h1>Library Management System</h1></div>
                //         <div align="center"><h4>Welcome {username}</h4></div>
                //         <div align="left"><u onClick={logout} style={{cursor:'pointer',marginBottom:'0%'}}><h4>Logout</h4></u></div>
                //         <div align="center"><h2 onClick={(e) => {setDrop(drop==="managebooks"?"":"managebooks");setCurrent("");}} style={{cursor:'pointer'}}>Manage Books</h2></div>
                //         {
                //             drop==='managebooks' && 
                //             <div style={{backgroundColor:'#026c02'}}>
                //                 <h4 className="list1" onClick={(e) => setCurrent("addbook")}>Add Book</h4>
                //                 <h4 className="list1" onClick={(e) => setCurrent("updatebook")}>Update Book</h4>
                //                 <h4 className="list1" onClick={(e) => {setCurrent("");setCurrent("deletebook");}}>Delete Book</h4>
                //             </div>
                //         }
                //         <div align="center"><h2 onClick={(e) => {setDrop(drop==="viewreports"?"":"viewreports");setCurrent("");}} style={{cursor:'pointer'}}>View Reports</h2></div>
                //         {
                //             drop==='viewreports' && 
                //             <div style={{backgroundColor:'#026c02'}}>
                //                 <h4 className="list1" onClick={(e) => setCurrent("publisherreport")}>No of books published by Publishers</h4>
                //                 <h4 className="list1" onClick={(e) => setCurrent("booksheld")}>No of Books held by Readers</h4>
                //                 <h4 className="list1" onClick={(e) => setCurrent("readerdues")}>Reader Dues</h4>
                //                 <h4 className="list1" onClick={(e) => setCurrent("bookissues")}>Books with Issues</h4>
                //             </div>
                //         }
                //         <div align="center"><h2 onClick={(e) => {setDrop("");setCurrent("deletepublisher")}} style={{cursor:'pointer'}}>Delete Publisher</h2></div>
                //         <div align="center"><h2 onClick={(e) => {setDrop("");setCurrent("banreaders")}} style={{cursor:'pointer'}}>Ban Reader</h2></div>
                //         <div align="center"><h2 onClick={(e) => {setDrop("");setCurrent("bannedReaders")}} style={{cursor:'pointer'}}>Banned Readers</h2></div>
                //     </div>
                //     <div style={{width:'75%',height:'100vh'}}>
                //         {current==="" && <div align="center"><h1>Hello Staff</h1></div>}
                //         {current==="addbook" && <AddBooks />}
                //         {current==="updatebook" && <UpdateBook />}
                //         {current==="deletebook" && <DeleteBook /> }
                //         {current==="publisherreport" && <PublisherReport />}
                //         {current==="booksheld" && <BooksHeld />}
                //         {current==="readerdues" && <DueAmount /> }
                //         {current==="bookissues" && <BookWithIssues /> }
                //         {current==="deletepublisher" && <DeletePublisher /> }
                //         {current==="banreaders" && <BanReader /> }
                //         {current==="bannedReaders" && <BannedReaders /> }
                //     </div>
                // </div>
            }
        </>
    );
}
export default Staff;