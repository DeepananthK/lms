import {useEffect, useState} from 'react';
import accessdenied from './Assets/Access-Denied-PNG.png';
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function DeleteBook() {
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
   const [books,setBooks]=useState([]);
   const [searchParams,setSearchParams]=useState("isbn");
   const [searchTerm,setSearchTerm]=useState("");

   useEffect(() => {
       getBooks();
   },[]);

   async function getBooks(searchTerm="",searchParams="isbn") {
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
    if(data.status==='Login Expired') {
        alert("Login Expired");
        window.location.href='/';
    } else {
        setAccess("Accepted");
    }
    setBooks(data);
    //console.log(data);
   }
   async function deleteBookEntry(isbn) {
    const response=await fetch(`http://localhost:9000/staff/book/${isbn}`,{
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'content-Type':'application/json'
        }
    });
    const data=await response.json();
    if(data.status==='Login Expired') {
        alert("Login Expired");
        window.location.href='/';
    } else if(data.status==='Login Expired') {
        alert("Login Expired");
        window.location.href='/';
    } else if(data.status==='error') {
        toast.warning('Cannot Delete',{position: toast.POSITION.TOP_CENTER});
    } else {
        toast.success('Deleted!',{position: toast.POSITION.TOP_CENTER});
    }
    getBooks(searchTerm,searchParams);
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
                    <h1 style={{color:'#810f96'}}>Delete Books</h1>
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
                    {/* <form>
                        <select onChange={(e) => {setSearchParams(e.target.value);setBooks([]);getBooks("",e.target.value);setSearchTerm("");}} defaultValue={'isbn'}>
                            <option value="isbn">ISBN</option>
                            <option value="title">Title</option>
                            <option value="authorname">Author Name</option>
                            <option value="category">Category</option>
                        </select>
                        {
                            searchParams==="isbn" && 
                            <input type="number" onChange={(e)=> {getBooks(e.target.value,searchParams);setSearchTerm(e.target.value);}} />
                        }
                        {
                            searchParams==="title" && 
                            <input type="text" onChange={(e)=> {getBooks(e.target.value,searchParams);setSearchTerm(e.target.value);}}/>
                        }
                        {
                            searchParams==="authorname" && 
                            <input type="text" onChange={(e)=> {getBooks(e.target.value,searchParams);setSearchTerm(e.target.value);}}/>
                        }
                        {
                            searchParams==="category" &&
                            <select onChange={(e) => {getBooks(e.target.value,searchParams);setSearchTerm(e.target.value);}} defaultValue={'Select a Category'} required>
                                <option value='Select a Category' hidden>Select a Category</option>
                                <option value="Novel">Novel</option>
                                <option value="General">General</option>
                                <option value="Story">Story</option>
                            </select>
                        }
                    </form> */}
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
                                    <th>Delete Book</th>
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
                                                <td><button  className='deletebutton' onClick={()=>deleteBookEntry(value.isbn)}>Delete</button></td>
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

export default DeleteBook;