const express =  require('express');

const router = express.Router();

const jwt=require('jsonwebtoken');

require('dotenv').config();

const mysql=require('mysql');

const con=mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "deepananth",
    database: "lms"
});

router.post('/',authenticate,(req,res) => {
    res.json({status:'okay',username:res.username});
});

router.post('/books',authenticate,(req,res) => {
    var sql="select a.isbn,b.bookname as title,price,category,edition,authorname,count-(select count(*) from borrowings where bookno=a.isbn and returndate is null) as count from books a LEFT JOIN publications b on a.isbn=b.isbn where a.isbn not in(select bookno from borrowings where userId="+req.userId+" and returndate is null) and a.isbn not in(select bookno from Reservations where userId="+req.userId+" and issued='false') and status='available' and a."+req.body.searchParams+" like '"+req.body.searchTerm+"%';";
    if(req.body.searchParams==='category') {
        sql="select a.isbn,b.bookname as title,price,category,edition,authorname,count-(select count(*) from borrowings where bookno=a.isbn and returndate is null) as count from books a LEFT JOIN publications b on a.isbn=b.isbn where a.isbn not in(select bookno from borrowings where userId="+req.userId+" and returndate is null) and a.isbn not in(select bookno from Reservations where userId="+req.userId+" and issued='false') and status='available' and a."+req.body.searchParams+"='"+req.body.searchTerm+"';";
    } else if(req.body.searchParams==='title') {
        sql="select a.isbn,b.bookname as title,price,category,edition,authorname,count-(select count(*) from borrowings where bookno=a.isbn and returndate is null) as count from books a LEFT JOIN publications b on a.isbn=b.isbn where a.isbn not in(select bookno from borrowings where userId="+req.userId+" and returndate is null) and a.isbn not in(select bookno from Reservations where userId="+req.userId+" and issued='false') and status='available' and b.bookname like '"+req.body.searchTerm+"%';";
    }
    con.query(sql,(err,result)=>{
        if (err) res.json({status:'error'});
        else res.send(result);
    })
});

function authenticate(req,res,next) {
    const token=req.cookies.token;
    if(token == null) {res.sendStatus(401)}
    else {
        jwt.verify(token,process.env.ACCESS_TOKEN_SECRET, (err,user) => {
            if (err) {
                if(err.name==="TokenExpiredError") {
                    return res.json({status: 'Login Expired'});
                } else {
                    res.sendStatus(403);
                }
            }
            else {
                var sql="select firstname,lastname,role,status from Users where userId=?";
                con.query(sql,[user.userId],(err,result) => {
                    if (err) {console.log(err);res.json({status:'error'});}
                    if(result[0].role==='Reader' && result[0].status!=='deleted') {
                        req.userId=user.userId;
                        res.username=result[0].firstname+' '+result[0].lastname;
                        next();
                    } else {
                        res.sendStatus(403);
                    }
                })
            }
        });
    }
}

module.exports = router;