import {useState,useEffect} from 'react';
import accessdenied from './Assets/Access-Denied-PNG.png';
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AddBooks() {
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

    const [isbn,setISBN]=useState("");
    const [title,setTitle]=useState("");
    const [price,setPrice]=useState(0);
    const [category,setCategory]=useState("");
    const [edition,setEdition]=useState("");
    const [authorname,setAuthorname]=useState("");
    const [count,setCount]=useState("");
    const [books,setBooks]=useState([]);
    const [book,setBook]=useState();

    useEffect(() => {
        getBooks();
    },[]);

    async function getBooks() {
        //console.log(searchParams+":"+searchTerm);
        const response=await fetch('http://localhost:9000/staff/bookstoadd',{
            method: 'GET',
            credentials: 'include',
            headers: {
                'content-Type':'application/json'
            }
        });
        const data=await response.json();
        if(data.status==='Login Expired') {
            alert("Login Expired");
            window.location.href='/';
        } else {
            setBooks(data);
        }
        //console.log(data);
    }

    async function addBook(event) {
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
        if(isNaN(price)) {
            toast.warning("Invalid Price",{position: toast.POSITION.TOP_CENTER});
            return;
        }
        if(!authorname.match(/^[A-Z][a-zA-Z ]*$/)){
            toast.warning("Enter a valid author name",{position: toast.POSITION.TOP_CENTER});
        }
        const response=await fetch('http://localhost:9000/staff/book',{
            method: 'POST',
            credentials: 'include',
            headers: {
                'content-Type': 'application/json'
            },
            body: JSON.stringify({
                isbn,
                title,
                price,
                category,
                edition,
                authorname,
                count
            }),
        });
        const data=await response.json();
        if(data.status==='Login Expired') {
            alert("Login Expired");
            window.location.href='/';
        } else if(data.status==='error') {
            toast.warning('Duplicate Entry',{position: toast.POSITION.TOP_CENTER});
            setBook();
        } else if(data.status==='no such book published') {
            toast.warning('No Such Book Published',{position: toast.POSITION.TOP_CENTER});
            setBook();
        } else if(data.status==='okay') {
            toast.success('Added!!',{position: toast.POSITION.TOP_CENTER});
            setBook();
        } else {
            toast.warning(data.status,{position: toast.POSITION.TOP_CENTER});
            setBook();
        }
        getBooks();
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
                    <h1 style={{color:'#810f96'}}>Add Book</h1>
                    {
                        books.length>0 &&
                        <div>
                            <table align="center">
                                <tbody>
                                    <tr>
                                        <th>ISBN</th>
                                        <th>Title</th>
                                        <th>Add</th>
                                    </tr>
                                    {
                                        books.map((value,index) => {
                                            return (
                                                <tr key={index}>
                                                    <td>{value.isbn}</td>
                                                    <td>{value.bookname}</td>
                                                    <td><button className='updatebutton' onClick={()=>{setBook(value.bookname);setTitle(value.bookname);setISBN(value.isbn)}}>Add</button></td>
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </table>
                            {
                                book && 
                                <form className='formstyle2' onSubmit={addBook} >
                                    ISBN<br />
                                    <input type="number" className='inputstyle1' value={isbn} readOnly required/><br />
                                    Book Title<br />
                                    <input type="text" className='inputstyle1' value={book} readOnly required/><br />
                                    Price<br />
                                    <input type="number" className='inputstyle1' onChange={(e)=>setPrice(e.target.value)} required/><br />
                                    Category<br />
                                    <select className='inputstyle1' onChange={(e) => setCategory(e.target.value)} defaultValue={'Select a Category'} required>
                                        <option value='Select a Category' hidden>Select a Category</option>
                                        <option value="Novel">Novel</option>
                                        <option value="General">General</option>
                                        <option value="Story">Story</option>
                                    </select><br />
                                    Edition<br />
                                    <input type="text" className='inputstyle1' onChange={(e) => setEdition(e.target.value)} pattern="[1-9][0-9]*\.[0-9]*" required/><br />
                                    Author Name<br />
                                    <input type="text" className='inputstyle1' onChange={(e) => setAuthorname(e.target.value)} pattern="[A-Z a-z]*" required/><br />
                                    Count<br />
                                    <input type="number" className='inputstyle1' onChange={(e)=>setCount(e.target.value)} required/><br /><br />
                                    <input type="submit" className='submit' value="Add Book" />
                                </form>
                            }
                        </div>
                    }
                    {
                        books.length>0 || <h1 style={{color:'#810f96'}}>No books to add!</h1>
                    }
                </div>
            }
        </>
    );
}

export default AddBooks;