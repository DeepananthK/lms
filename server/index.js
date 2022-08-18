require('dotenv').config();
const express=require('express');
const cors=require('cors');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const cookieParser=require('cookie-parser');
const app=express();

app.use(express.json());
app.use(cors({credentials: true, origin: 'http://localhost:3000'}));
app.use(cookieParser());

const mysql=require('mysql');

const con1=mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "deepananth",
    database: "lms"
});

con1.query("set autocommit=0;",(err,result) => {
    if (err) console.log(err);
    else {console.log("Autocommit Off ");}
    return;
});

app.listen(9000,() => {
    console.log("Server started at http://localhost:9000");
});

app.post('/register',validate,async (req, res) => {
    try {
        const hashedPassword= await bcrypt.hash(req.body.password,10);
        var sql="Insert into Users(email,firstname,lastname,password,role,status) value(?,?,?,?,?,?)";
        con1.query(sql,[req.body.email,req.body.firstname,req.body.lastname,hashedPassword,req.body.role,req.body.role],(err,result) => {
            if (err) res.json({status: 'error'});
            else {
                var sql1="select userId from users where email=?";
                con1.query(sql1,[req.body.email], (err1,result1) =>{
                    if (err) {con1.rollback();res.json({status:'error'});}
                    else if(result1.length>0) {
                        const userId=result1[0].userId;
                        if(req.body.role==='Reader') {
                            var sql2="Insert into Addresses(userId,address) value(?,?)";
                            con1.query(sql2,[userId,req.body.address],async (err2,result2) => {
                                if (err2) {con1.rollback();res.json({status:'error'});return;}
                                else {
                                    insertPhn(req.body.phone,userId)
                                    .then((value) => {
                                        //console.log("-->"+value);
                                        con1.commit();
                                        const user={userId: userId};
                                        const token=jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn: '900s'});
                                        //console.log(token);
                                        res.cookie('token',token,{
                                            httpOnly: true,
                                            sameSite: 'strict'
                                        }).json({status:'okay',role:"Reader"});
                                        return;
                                    })
                                    .catch((err3) => {
                                        con1.rollback((err4) => {if (err4) console.log(err4); else console.log("Rolled back");});
                                        //con.query('rollback',(err4,result4) => {if (err4) console.log(err4); else console.log("Rolled back");});
                                        res.json({status:'Duplicate Phone number'});
                                        console.log("--->"+err3);
                                    })
                                }
                            });
                        } else {
                            const user={userId: userId};
                            const token=jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn: '900s'});
                            //console.log(token);
                            con.commit();
                            res.cookie('token',token,{
                                httpOnly: true,
                                sameSite: 'strict'
                            }).json({status:'okay',role:req.body.role});
                            //console.log(res);
                            return;
                        }
                    }
                })
            }
        })
    } catch {
        res.json({status:'error'});
    }
});

function insertPhn(phone,userId) {
    return Promise.all(phone.map(num => {
        return new Promise((resolve,reject) => {
            var sql3="insert into PhoneNumbers(userId,phone) value(?,?)";
            con1.query(sql3,[userId,num],(err3,result3) => {
                if (err3) {console.log(err3);return reject(new Error("Rejected due to Duplicate Phone"));}
                else {
                    //console.log("okay");
                    resolve("Resolved Ok");
                }
            });
        })
    }));
}

app.post("/login",validate1,async (req,res) => {
    const con=mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "deepananth",
        database: "lms"
    });
    try {
        var sql="select * from Users where email=? and status!='deleted';";
        //console.log(sql);
        //console.log(req.body.email);
        con.query(sql,[req.body.email],async (err,result) => {
            //console.log(result);
            if (err) {console.log(err);res.json({status: 'error'});}
            else if(result.length==1 && result[0].email===req.body.email) {
                const valid=await bcrypt.compare(req.body.password,result[0].password);
                if (valid){
                    const user={userId: result[0].userId};
                    const token=jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn: '900s'});
                    res.cookie('token',token,{
                        httpOnly: true,
                        sameSite: 'strict'
                    }).json({status:'okay',role:result[0].role});
                    return;
                }
                else {res.json({status:'invalid'});return;};
            } else {
                res.json({status:'invalid'});
            }
        })
    } catch {
        res.json({status:'error'});
    }
});

app.post("/logout",(req,res) => {
    res.cookie('token',req.cookies.token,{
        maxAge: 0
    }).send();
});

app.post('/borrow',authenticate, (req, res) => {
    const con=mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "deepananth",
        database: "lms"
    });
    var sql="select count-(select count(*) from borrowings where bookno=? and returndate is null) as count from books where isbn=? and status!='deleted';";
    con.query(sql,[req.body.isbn,req.body.isbn],(err,result) => {
        //console.log(req.userId+":"+result[0].count);
        if (err) res.json({status:'error'});
        else if(result.length>0 && result[0].count===0) {
            res.json({status:'Book unavailable, You can Reserve'});
        } else if(result.length>0){
            var date=new Date();
            var date1=date.getDate();
            var month=date.getMonth()+1;
            var year=date.getFullYear();
            date=year+"-"+month+"-"+date1;
            var sql1="insert into borrowings(userId,bookno,issuedate) value(?,?,?)";
            con.query(sql1,[req.userId,req.body.isbn,date],(err1,result1) => {
                if (err1) {console.log(err1);res.json({status:'error'});}
                else {
                    {con.commit();res.json({status:'okay'});}
                }
            });
        } else {
            res.json({status:'error'});
        }
    })
});

app.post('/reserve',authenticate,(req,res) => {
    const con=mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "deepananth",
        database: "lms"
    });
        var sql="select count-(select count(*) from borrowings where bookno=? and returndate is null) as count from books where isbn=? and status!='deleted';";
        con.query(sql,[req.body.isbn,req.body.isbn],(err,result) => {
            if (err) res.json({status:'error'});
            else if(result.length>0 && result[0].count>0) {
                con.commit();
                res.json({status:'Book Available, You can Borrow'});
            } else if(result.length>0) {
                var sql1="insert into Reservations(userId,bookno) value(?,?)";
                con.query(sql1,[req.userId,req.body.isbn],(err1,result1) => {
                    if (err1) res.json({status:'error'});
                    else {con.commit();res.json({status:'okay'});}
                }); 
            } else {
                res.json({status:'error'});
            }
        })
});

app.get('/borrowings',authenticate,(req, res) => {
    const con=mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "deepananth",
        database: "lms"
    });
    var sql="select a.borrowId,a.bookno,c.bookname as title,a.issuedate from borrowings a Left Join books b on a.bookno=b.isbn Left Join Publications c on a.bookno=c.isbn where a.userId=? and returndate is null";
    con.query(sql,[req.userId],(err,result) => {
        if (err) {console.log(err);res.json({status:'error'});}
        else res.send(result);
    })
});

app.put('/return/:id',authenticate,(req, res) => {
    const con=mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "deepananth",
        database: "lms"
    });
    var date=new Date();
    var date1=date.getDate();
    var month=date.getMonth()+1;
    var year=date.getFullYear();
    date=year+"-"+month+"-"+date1;
    var sql="update borrowings set returndate=? where borrowId=?";
    con.query(sql,[date,req.params.id],(err,result) => {
        if (err) {console.log(err);res.json({status:'error'});}
        else {
            if(req.body.issueflag==='yes') {
                var sql1="insert into Reports(userId,bookno,issue) value(?,?,?)";
                con.query(sql1,[req.userId,req.body.bookno,req.body.issue],(err1,result1) => {
                    if (err1) {con.rollback();console.log(err1);res.json({status:'error'});}
                    else {
                        var sql2="select * from Reservations where bookno=? and issued='false' order by reservationId;";
                        con.query(sql2,[req.body.bookno],(err2,result2) => {
                            if (err2) {console.log(err2);res.json({status:'error'});}
                            else if(result2.length>0) {
                                var sql3="insert into borrowings(userId,bookno,issuedate) value(?,?,?)";
                                con.query(sql3,[result2[0].userId,req.body.bookno,date],(err3,result3) => {
                                    if (err3) {con.rollback();console.log(err3);res.json({status:'error'});}
                                    else {
                                        var sql4="update Reservations set issued='true' where reservationId=?";
                                        con.query(sql4,[result2[0].reservationId],(err4,result1) => {
                                            if(err4) {con.rollback();res.json({status:'error'});}
                                            else {con.commit();res.json({status:'okay'});}
                                        });
                                    }
                                });
                            } else {
                                con.commit();res.json({status:'okay'});
                            }
                        });
                    } 
                })
            } else {
                var sql2="select * from Reservations where bookno=? and issued='false' order by reservationId;";
                con.query(sql2,[req.body.bookno],(err2,result2) => {
                    if (err2) {console.log(err2);res.json({status:'error'});}
                    else if(result2.length>0) {
                        var sql3="insert into borrowings(userId,bookno,issuedate) value(?,?,?)";
                        con.query(sql3,[result2[0].userId,req.body.bookno,date],(err3,result3) => {
                            if (err3) {con.rollback();console.log(err3);res.json({status:'error'});}
                            else {
                                var sql4="update Reservations set issued='true' where reservationId=?";
                                con.query(sql4,[result2[0].reservationId],(err4,result1) => {
                                    if(err4) {con.rollback();res.json({status:'error'});}
                                    else {con.commit();res.json({status:'okay'});}
                                });
                            }
                        });
                    } else {
                        con.commit();res.json({status:'okay'});
                    }
                });
            }
        }
    })
});

function authenticate(req,res,next) {
    const con=mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "deepananth",
        database: "lms"
    });
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
                var sql="select firstname,lastname,role,status from Users where userId=? and status!='deleted'";
                con.query(sql,[user.userId],(err,result) => {
                    if (err) {console.log(err);res.json({status:'error'});}
                    if((result[0].role==='Reader' && result[0].status!=='deleted') || (result[0].role==='Publisher' && (result[0].status==='Publisher' || result[0].status==='Read'))) {
                        req.userId=user.userId;
                        con.end();
                        next();
                    } else {
                        con.end();
                        res.sendStatus(403);
                    }
                })
            }
        });
    }
}

const staffRouter = require('./routes/staffs');
const publisherRouter = require('./routes/publishers');
const readerRouter = require('./routes/readers');

app.use('/staff',staffRouter);
app.use('/publisher',publisherRouter);
app.use('/reader',readerRouter);

function validate(req,res,next){
    if(!req.body.email.match(/^[a-zA-Z][a-zA-Z0-9\.\-]*@[a-z\.]*[a-z]+\.[a-z]*$/)) {
        res.json({status:"Enter a valid Email"});
        return;
    }
    if(req.body.password===""){
        res.json({status:"Password does not meet the requirements"});
        return;
    }
    if((!req.body.password[0].match(/[A-Z]/)) || (!req.body.password.match(/[0-9]+/)) || (!req.body.password.match(/[!@#\$%\^&\*\(\)\[\]\{\}\.\,<>]+/)) || (req.body.password.length<6)) {
        res.json({status:"Password does not meet the requirements"});
        return;
    }
    if(!req.body.firstname.match(/^[a-zA-Z]*$/)) {
        res.json({status:"Enter a valid Firstname"});
        return;
    }
    if(!req.body.lastname.match(/^[a-zA-Z ]*$/)) {
        res.json({status:"Enter a valid Firstname"});
        return;
    }
    if(req.body.role!=='Staff' && req.body.role!=="Reader" && req.body.role!=="Publisher") {
        res.json({status:'Enter a valid Role'});
        return;
    }
    if(req.body.role==='Reader') {
        if(!req.body.address.match(/^[a-zA-Z0-9]+[a-zA-Z0-9 .\-,\n]*$/)) {
            res.json({status:"Enter valid address"});
            return;
        }
        if(req.body.address.length>60) {
            res.json({status:"Address is so lengthy"});
            return;
        }
        for(var x=0;x<req.body.phone.length;x++) {
            for(var y=x+1;y<req.body.phone.length;y++) {
                if(!req.body.phone[x].match(/^[6-9][0-9]{9}$/)){
                    res.json({status:"Invalid Phone no!"});
                    return;
                }
                if(req.body.phone[x]===req.body.phone[y]) {
                    res.json({status:'Duplicate Phone no!!'});
                    return;
                }
            }
        }
    }
    next();
}

function validate1(req,res,next) {
    if(!req.body.email.match(/^[a-zA-Z][a-zA-Z0-9\.\-]*@[a-z\.]*[a-z]+\.[a-z]*$/)) {
        res.json({status:"invalid"});
        return;
    }
    if(req.body.password===""){
        res.json({status:"invalid"});
        return;
    }
    if((!req.body.password[0].match(/[A-Z]/)) || (!req.body.password.match(/[0-9]+/)) || (!req.body.password.match(/[!@#\$%\^&\*\(\)\[\]\{\}\.\,<>]+/)) || (req.body.password.length<6)) {
        res.json({status:"invalid"});
        return;
    }
    next();
}