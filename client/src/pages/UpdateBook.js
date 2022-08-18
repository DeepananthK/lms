import {useEffect, useState} from 'react';
import accessdenied from './Assets/Access-Denied-PNG.png';
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function UpdateBook() {
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
        const data=await response.json();
        console.log(data.status);
        if(response.status===403 || response.status===401) {
            setAccess("Denied");
        } else {
            setAccess("Accepted");
        }
    }

    const [books,setBooks]=useState([]);
    const [book,setBook]=useState();
    const [isbn,setISBN]=useState("");
    const [title,setTitle]=useState("");
    const [price,setPrice]=useState(0);
    const [category,setCategory]=useState("");
    const [edition,setEdition]=useState("");
    const [authorname,setAuthorname]=useState("");
    const [count,setCount]=useState("");
    const [searchParams,setSearchParams]=useState("isbn");
    const [searchTerm,setSearchTerm]=useState("");

    async function updateBookEntry(event) {
        event.preventDefault();
        if(category==='') {
            toast.warning('Select a category',{position: toast.POSITION.TOP_CENTER});
            return;
        }
        if(category!=='Story' && category!=="General" && category!=="Novel") {
            toast.warning('Select a valid Category',{position: toast.POSITION.TOP_CENTER});
            return;
        }
        if(count<1) {
            toast.warning("Enter a valid count",{position: toast.POSITION.TOP_CENTER});
            return;
        }
        if(isNaN(isbn)) {
            toast.warning("Enter valid ISBN",{position: toast.POSITION.TOP_CENTER});
            return;
        }
        if(!edition.match(/^[1-9][0-9]*\.[0-9]*$/)) {
            toast.warning("Invalid Edition",{position: toast.POSITION.TOP_CENTER});
            return;
        }
        if(isNaN(count)) {
            toast.warning("Invalid Count",{position: toast.POSITION.TOP_CENTER});
            return;
        }
        if(isNaN(price) || price<=0) {
            toast.warning("Invalid Price",{position: toast.POSITION.TOP_CENTER});
            return;
        }
        const response=await fetch(`http://localhost:9000/staff/book/${isbn}`,{
            method: 'PUT',
            credentials: 'include',
            headers: {
                'content-Type':'application/json'
            },
            body: JSON.stringify({
                price,
                category,
                edition,
                authorname,
                count
            })
        });
        const data=await response.json();
        if(response.status===403 || response.status===401) {
            setAccess("Denied");
        } else if(data.status==='Login Expired') {
            alert("Login Expired");
            window.location.href='/';
        } else {
            setAccess("Accepted");
        }
        if(data.status==='error') {
            toast.warning('Cannot Update',{position: toast.POSITION.TOP_CENTER});
            setBook();
        } else if(data.status==='okay') {
            toast.success('Updated!!!',{position: toast.POSITION.TOP_CENTER});
            setBook();
        } else {
            toast.warning("Cannot Update",{position: toast.POSITION.TOP_CENTER})
            setBook();
        }
        getBooks(searchTerm,searchParams);
    }
 
    useEffect(() => {
        getBooks();
    },[]);
 
    async function getBooks(searchTerm="",searchParams="isbn") {
        //console.log(searchParams+":"+searchTerm);
     const response=await fetch('http://localhost:9000/staff/books',{
         method: 'POST',
         credentials: 'include',
         headers: {
             'content-Type':'application/json'
         },
         body: JSON.stringify({
            searchParams,
            searchTerm
        })
    });
    const data=await response.json();
    if(response.status===403 || response.status===401) {
        setAccess("Denied");
    } else if(data.status==='Login Expired') {
        alert("Login Expired");
        window.location.href='/';
    } else {
        setAccess("Accepted");
    }
     setBooks(data);
     //console.log(data);
    }
    
    function setBookEntry(value) {
        setBook(value);
        setISBN(value.isbn);
        setTitle(value.title);
        setPrice(value.price);
        setCategory(value.category);
        setEdition(value.edition);
        setAuthorname(value.authorname);
        setCount(value.count);
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
                <div align="center" style={{paddingBottom: '2%',display: 'flex'}}>
                    <div style={{width:book?'75%':'100%'}}>
                        <h1 style={{color:'#810f96'}}>Update Books</h1>
                        <form className='formstyle2'>
                            Search By:<select className='inputstyle2' onChange={(e) => {setSearchParams(e.target.value);setBooks([]);getBooks("",e.target.value);setSearchTerm("");}} defaultValue={'isbn'}>
                                <option value="isbn">ISBN</option>
                                <option value="title">Title</option>
                                <option value="authorname">Author Name</option>
                                <option value="category">Category</option>
                            </select>
                            <br />
                            {
                                searchParams==="isbn" && 
                                <span>
                                    Search Term:<input type="number" className='inputstyle2' onChange={(e)=> {getBooks(e.target.value,searchParams);setSearchTerm(e.target.value);}} placeholder="Enter ISBN" />
                                </span>
                            }
                            {
                                searchParams==="title" &&
                                <span>
                                    Search Term:<input type="text" className='inputstyle2' onChange={(e)=> {getBooks(e.target.value,searchParams);setSearchTerm(e.target.value);}} placeholder="Enter Title" />
                                </span> 
                            }
                            {
                                searchParams==="authorname" && 
                                <span>
                                    Search Term:<input type="text" className='inputstyle2' onChange={(e)=> {getBooks(e.target.value,searchParams);setSearchTerm(e.target.value);}} placeholder="Enter Author Name" />
                                </span>
                            }
                            {
                                searchParams==="category" &&
                                <span>
                                    Search Category:<select className='inputstyle2' onChange={(e) => {getBooks(e.target.value,searchParams);setSearchTerm(e.target.value);}} defaultValue={'Select a Category'} required>
                                        <option value='Select a Category' hidden>Select a Category</option>
                                        <option value="Novel">Novel</option>
                                        <option value="General">General</option>
                                        <option value="Story">Story</option>
                                    </select>
                                </span>
                            }
                        </form>
                        {
                            books.length>0 && 
                            <table align="center">
                                <tbody>
                                    <tr>
                                        <th>ISBN</th>
                                        <th>Title</th>
                                        <th>Price</th>
                                        <th>Category</th>
                                        <th>Edition</th>
                                        <th>Author Name</th>
                                        <th>Count</th>
                                        <th>Update Book</th>
                                    </tr>
                                    {
                                        books.map((value,index) => {
                                            return (
                                                <tr key={index}>
                                                    <td>{value.isbn}</td>
                                                    <td>{value.title}</td>
                                                    <td>{value.price}</td>
                                                    <td>{value.category}</td>
                                                    <td>{value.edition}</td>
                                                    <td>{value.authorname}</td>
                                                    <td>{value.count}</td>
                                                    <td><button className='updatebutton' onClick={()=>setBookEntry(value)}>Update</button></td>
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </table>
                        }
                    </div>
                    {
                        book && 
                        <div style={{width:'25%',marginLeft:'55%',position:'fixed'}}>
                            <form className='formstyle2' onSubmit={updateBookEntry} style={{color:'#9C27B0',marginTop: '40%'}}>
                                ISBN<br />
                                <input type="number" className='inputstyle' value={isbn} readOnly required/><br />
                                Book Title<br />
                                <input type="text" className='inputstyle' value={title} readOnly pattern="[A-Z][a-zA-Z0-9 ]*" required/><br />
                                Price<br />
                                <input type="number" className='inputstyle' value={price} onChange={(e)=>setPrice(e.target.value)} required/><br />
                                Category<br />
                                <select className='inputstyle' onChange={(e) => setCategory(e.target.value)} defaultValue={category} required>
                                    <option value='Select a Category' hidden>Select a Category</option>
                                    <option value="Novel">Novel</option>
                                    <option value="General">General</option>
                                    <option value="Story">Story</option>
                                </select><br />
                                Edition<br />
                                <input type="text" className='inputstyle' value={edition} onChange={(e) => setEdition(e.target.value)} pattern="[1-9][0-9]*\.[0-9]*" required/><br />
                                Author Name<br />
                                <input type="text" className='inputstyle' value={authorname} onChange={(e) => setAuthorname(e.target.value)} pattern="[A-Z a-z]*" required/><br />
                                Count<br />
                                <input type="number" className='inputstyle' value={count} onChange={(e)=>setCount(e.target.value)} required/><br />
                                <input type="submit" className='updatebutton' value="Update" />
                            </form>
                            <button className='deletebutton' onClick={(e)=>setBook()}>Cancel</button>
                        </div>
                    }
                </div>
            }
        </>
    );
 }
 
 export default UpdateBook;