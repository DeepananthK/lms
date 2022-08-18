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

router.post('/canpublish',authenticate1,(req,res) => {
    res.json({status:'okay'});
});

router.post('/canread',authenticate2,(req,res) => {
    res.json({status:'okay'});
});

router.post('/publish',authenticate1,validate,(req,res) => {
    var sql="insert into Publications(userId,isbn,bookname,year) value(?,?,?,?)";
    con.query(sql,[req.userId,req.body.isbn,req.body.bookname,req.body.year],(err,result) => {
        if (err) {res.json({status: 'error'});}
        else {con.commit();res.json({status:'okay'});}
    })
});

router.get('/mypublications',authenticate1, (req,res) => {
    var sql="select * from Publications a where a.userId=? and a.isbn in(select isbn from books b where b.isbn=a.isbn);";
    con.query(sql,[req.userId],(err,result) => {
        if (err) res.json({status:error});
        else res.send(result);
    })
});

router.get('/readers',authenticate1, (req, res) => {
    var sql="select userId,firstname,lastname from Users where userId in(select userId from borrowings where bookno in (select isbn from Books where isbn in (select isbn from Publications where userId=?)));";
    con.query(sql,[req.userId],(err,result)=>{
        if (err) res.json({status:'error'});
        else{
            res.send(result);
        };
    });
});

router.post('/books',authenticate2, (req, res) => {
    var sql="select a.isbn,b.bookname as title,price,category,edition,authorname,count-(select count(*) from borrowings where bookno=a.isbn and returndate is null) as count from books a LEFT JOIN publications b on a.isbn=b.isbn where a.isbn not in(select isbn from Publications where userId="+req.userId+") and a.isbn not in(select bookno from borrowings where userId="+req.userId+" and returndate is null) and a.isbn not in(select bookno from Reservations where userId="+req.userId+" and issued='false') and status='available' and a."+req.body.searchParams+" like '"+req.body.searchTerm+"%';";
    if(req.body.searchParams==='category') {
        sql="select a.isbn,b.bookname as title,price,category,edition,authorname,count-(select count(*) from borrowings where bookno=a.isbn and returndate is null) as count from books a LEFT JOIN publications b on a.isbn=b.isbn where a.isbn not in(select isbn from Publications where userId="+req.userId+") and a.isbn not in(select bookno from borrowings where userId="+req.userId+" and returndate is null) and a.isbn not in(select bookno from Reservations where userId="+req.userId+" and issued='false') and status='available' and a.isbn=b.isbn and a."+req.body.searchParams+"='"+req.body.searchTerm+"';";
    } else if(req.body.searchParams==='title') {
        sql="select a.isbn,b.bookname as title,price,category,edition,authorname,count-(select count(*) from borrowings where bookno=a.isbn and returndate is null) as count from books a LEFT JOIN publications b on a.isbn=b.isbn where a.isbn not in(select isbn from Publications where userId="+req.userId+") and a.isbn not in(select bookno from borrowings where userId="+req.userId+" and returndate is null) and a.isbn not in(select bookno from Reservations where userId="+req.userId+" and issued='false') and status='available' and b.bookname like '"+req.body.searchTerm+"%';";
    }
    con.query(sql,(err,result)=>{
        if (err) {console.log(err);res.json({status:'error'});}
        else res.send(result);
    });
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
                    if(result.length>0) {
                        if(result[0].role==='Publisher') {
                            res.username=result[0].firstname+' '+result[0].lastname;
                            next();
                        } else {
                            res.sendStatus(403);
                        }
                    } else {
                        res.sendStatus(403);
                    }
                })
            }
        });
    }
}

function authenticate1(req,res,next) {
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
                var sql="select role,status from Users where userId=?";
                con.query(sql,[user.userId],(err,result) => {
                    if (err) {console.log(err);res.json({status:'error'});}
                    if(result.length>0) {
                        if(result[0].role==='Publisher' && (result[0].status==='Publisher' || result[0].status==='Publish')) {
                            req.userId=user.userId;
                            next();
                        } else {
                            res.sendStatus(403);
                        }
                    } else {
                        res.sendStatus(403);
                    }
                })
            }
        });
    }
}

function authenticate2(req,res,next) {
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
                var sql="select role,status from Users where userId=?";
                con.query(sql,[user.userId],(err,result) => {
                    if (err) {console.log(err);res.json({status:'error'});}
                    if(result.length>0) {
                        if(result[0].role==='Publisher' && (result[0].status==='Publisher' || result[0].status==='Read')) {
                            req.userId=user.userId;
                            next();
                        } else {
                            res.sendStatus(403);
                        }
                    } else {
                        res.sendStatus(403);
                    }
                })
            }
        });
    }
}

function validate(req,res,next) {
    if(isNaN(req.body.isbn) || req.body.isbn<0) {
        res.json({status:"Enter valid ISBN"});
        return;
    }
    if(req.body.year>new Date().getFullYear() || req.body.year<0) {
        res.json({status:"Enter a valid year"});
        return;
    }
    if(!req.body.bookname.match(/^[A-Z][a-zA-Z0-9 ]*$/)) {
        res.json({status:"Enter a proper title"});
        return;
    }
    next();
}

module.exports = router;