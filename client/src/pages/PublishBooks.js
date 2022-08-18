import {useState,useEffect} from 'react';
import accessdenied from './Assets/Access-Denied-PNG.png';
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function PublishBooks() {
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

    const [bookname,setBookName]=useState("");
    const [year,setYear]=useState();
    const [isbn,setISBN]=useState();

    async function publish(event) {
        event.preventDefault();
        if(isNaN(isbn) || isbn<0) {
            alert("Enter valid ISBN");
            return;
        }
        if(year>new Date().getFullYear() || year<0) {
            alert("Enter a valid year");
            return;
        }
        if(!bookname.match(/^[A-Z][a-zA-Z0-9 ]*$/)) {
            alert("Enter a proper title");
            return;
        }
        const response=await fetch('http://localhost:9000/publisher/publish',{
            method: 'POST',
            credentials: 'include',
            headers: {
                'content-Type': 'application/json'
            },
            body: JSON.stringify({
                isbn,
                bookname,
                year
            })
        });
        const data=await response.json();
        //console.log(data.status);
        if(data.status==='Login Expired') {
            alert("Login Expired");
            window.location.href='/';
        } else if(data.status==='Login Expired') {
            alert("Login Expired");
            window.location.href='/';
        } if(data.status==='error') {
            toast.warning('ISBN or Book Name Already Exists',{position: toast.POSITION.TOP_CENTER});
        } else if(data.status==='okay') {
            toast.warning('Publication Added',{position: toast.POSITION.TOP_CENTER});
        } else {
            alert(data.status);
        }
        setISBN();
        setBookName("");
        setYear();
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
                    <h1 style={{color:'#810f96'}}>Add Publication</h1>
                    <form onSubmit={publish} className='formstyle2'>
                        ISBN<br />
                        <input type="number" value={isbn} className='inputstyle2' onChange={(e)=> setISBN(e.target.value)} placeholder="ISBN" required/><br />
                        Book Name<br />
                        <input type="text" placeholder='Book name' className='inputstyle2' onChange={(e) => setBookName(e.target.value)} value={bookname} required/><br />
                        Published Year<br />
                        <input type="number" value={year} className='inputstyle2' onChange={(e)=> setYear(e.target.value)} placeholder="Year" required/><br />
                        <input type="submit" value="Add" className='updatebutton' />
                    </form>
                </div>
            }
        </>
    )
}

export default PublishBooks;