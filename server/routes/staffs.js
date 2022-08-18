const express =  require('express');

const router = express.Router();

require('dotenv').config();

const jwt=require('jsonwebtoken');

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

router.get('/bookstoadd',authenticate,(req,res) => {
    var sql="select * from Publications where isbn not in (select isbn from Books);"
    con.query(sql,(err,result) => {
        if (err) res.json({status:'error'});
        else res.send(result);
    });
})

router.post('/books',authenticate, async (req,res) => {
    //console.log(req.body);
    var sql="Select a.*,b.bookname as title from Books a LEFT JOIN Publications b on a.isbn=b.isbn where status='available' and a."+req.body.searchParams+" like '"+req.body.searchTerm+"%';";
    if(req.body.searchParams==='category') {
        sql="Select a.*,b.bookname as title from Books a LEFT JOIN Publications b on a.isbn=b.isbn where status='available' and a."+req.body.searchParams+"='"+req.body.searchTerm+"';";
    } else if(req.body.searchParams==='title') {
        sql="Select a.*,b.bookname as title from Books a LEFT JOIN Publications b on a.isbn=b.isbn where status='available' and b.bookname like '"+req.body.searchTerm+"%';";
    }
    con.query(sql,(err,result) => {
        if (err) {console.log(err);res.json({status:'error'});}
        else res.send(result);
    });
});

router.post('/book', authenticate, validate, async (req,res) => {
    var sql="select * from Publications where isbn=? and bookname=?;";
    con.query(sql,[req.body.isbn,req.body.title],(err,result) => {
        if (err) res.json({status:'error'});
        else if(result.length>0) {
            var sql1="insert into books(isbn,price,category,edition,authorname,count) value(?,?,?,?,?,?)";
            con.query(sql1,[req.body.isbn,req.body.price,req.body.category,req.body.edition,req.body.authorname,req.body.count],(err1,result1) => {
                if (err1) {console.log(err1);res.json({status:'error'});}
                else {con.commit();res.json({status:'okay'})};
            })
        } else {
            res.json({status:"no such book published"});
        }
    });
});

router
.route('/book/:isbn')
.get(authenticate,async (req,res) => {
    var sql="Select * from Books where isbn=?;";
    con.query(sql,[req.params.isbn],(err,result) => {
        if (err) res.json({status:'error'});
        else res.send(result);
    });
})
.put(authenticate,validate1,async (req,res) => {
    var sql="Update Books set price=?,category=?,edition=?,authorname=?,count=? where isbn=?;";
    con.query(sql,[req.body.price,req.body.category,req.body.edition,req.body.authorname,req.body.count,req.params.isbn],(err,result) => {
        if (err) {console.log(err);res.json({status:'error'});}
        else {
            con.commit();
            var sql1="select count-(select count(*) from borrowings where bookno=? and returndate is null) as count from books where isbn=? and status!='deleted';";
            con.query(sql1,[req.params.isbn,req.params.isbn],(err1,result1) => {
                //console.log(req.userId+":"+result[0].count);
                if (err1) res.json({status:'okay'});
                else if(result1.length>0 && result1[0].count>0) {
                    var date=new Date();
                    var date1=date.getDate();
                    var month=date.getMonth()+1;
                    var year=date.getFullYear();
                    date=year+"-"+month+"-"+date1;
                    var sql2="select * from Reservations where bookno=? and issued='false' order by reservationId;";
                    con.query(sql2,[req.params.isbn],(err2,result2) => {
                        if (err2) {console.log(err2);res.json({status:'error'});}
                        else if(result2.length>0) {
                            var sql3="insert into borrowings(userId,bookno,issuedate) value(?,?,?)";
                            con.query(sql3,[result2[0].userId,req.params.isbn,date],(err3,result3) => {
                                if (err3) {con.rollback();console.log(err3);res.json({status:'okay'});}
                                else {
                                    var sql4="update Reservations set issued='true' where reservationId=?";
                                    con.query(sql4,[result2[0].reservationId],(err4,result1) => {
                                        if(err4) {con.rollback();res.json({status:'okay'});}
                                        else {con.commit();res.json({status:'okay'});}
                                    });
                                }
                            });
                        } else {
                            con.commit();res.json({status:'okay'});
                        }
                    });
                } else if(result1.length>0) {
                    con.commit();res.json({status:'okay'});
                }
            })
        }
    });
})
.delete(authenticate,async (req,res) => {
    var sql1="update Books set status='deleted' where isbn=?;";
    con.query(sql1,[req.params.isbn],(err,result) => {
        if (err) res.json({status:'error'});
        else {con.commit();res.json({status:'okay'});}
    });
});

router.get('/books/onhold',authenticate,async (req,res) => {
    var sql="select a.userId,a.firstname,a.lastname,count(*) as count from Users a,Borrowings b where a.userId=b.userId and a.role!='Staff' and b.returndate is null group by a.userId order by a.userId;";
    con.query(sql,(err,result)=>{
        if (err) res.json({status:'error'});
        else res.json(result);
    })
});

router.get('/dues',authenticate,async (req,res) => {
    var sql="select a.userId,a.firstname,a.lastname,coalesce(sum((TIMESTAMPDIFF(day,issuedate,coalesce(returndate,CURDATE()))-10)*100),0) as Due from Users a Left join borrowings b on a.userId=b.userId where (a.status='Read' or a.status='Publisher' or a.status='Reader') and a.role!='Staff' and TIMESTAMPDIFF(day,issuedate,coalesce(returndate,CURDATE()))>10 group by(a.userId) order by a.userId;";
    con.query(sql,(err,result) => {
        if (err) {res.json({status:'error'});}
        else res.send(result);
    });
});

router.get('/highdues',authenticate,async (req,res) => {
    var sql="select a.userId,a.firstname,a.lastname,coalesce(sum((TIMESTAMPDIFF(day,issuedate,coalesce(returndate,CURDATE()))-10)*100),0) as Due from Users a Left join borrowings b on a.userId=b.userId where (a.status='Read' or a.status='Publisher' or a.status='Reader') and a.role!='Staff' and TIMESTAMPDIFF(day,issuedate,coalesce(returndate,CURDATE()))>10 group by(a.userId) having sum((TIMESTAMPDIFF(day,issuedate,coalesce(returndate,CURDATE()))-10)*100)>10000 order by a.userId;";
    con.query(sql,(err,result) => {
        if (err) {res.json({status:'error'});}
        else res.send(result);
    });
})

router.post('/ban',authenticate,async (req,res) => {
    var sql="select role,status from Users where userId=?;";
    con.query(sql,[req.body.userId],(err,result) => {
        var status='deleted';
        if(result[0].role==='Publisher' && result[0].status==='Publisher') {
            status='Publish';
        }
        var sql1="update Users set status=? where userId=?";
        con.query(sql1,[status,req.body.userId],(err1,result1) => {
            if (err1) {res.json({status:'error'});}
            else {con.commit();res.json({status:'okay'});}
        });
    })
});

router.get('/ban',authenticate,async (req,res) => {
    var sql="select userId,firstname,lastname from Users where (status='deleted' and role='Reader') or (role='Publisher' and (status='publish' or status='deleted'))";
    con.query(sql,(err,result) => {
        if (err) {res.json({status:'error'});}
        else res.send(result);
    });
});

router.get('/publishers',authenticate,(req,res) => {
    var sql="select a.userId,a.firstname,a.lastname,count(b.isbn) as count from Users a Left Join Publications b on a.userId=b.userId where (a.status='Publisher' or a.status='Publish') and a.role='Publisher' group by a.userId order by userId;";
    con.query(sql,(err,result) => {
        if (err) {res.json({status:'error'});}
        else res.json(result);
    });
});

router.get('/bookswithissues',authenticate,(req,res) => {
    var sql="select a.reportId,a.userId,a.bookno,c.bookname as title,a.issue from reports a Left Join books b on a.bookno=b.isbn LEFT JOIN Publications c on a.bookno=c.isbn where b.status='available';";
    con.query(sql,(err,result) => {
        if (err) {res.json({status:'error'});}
        else res.json(result);
    });
});

router.get('/publisherswithnoreaders',authenticate,(req,res) => {
    var sql="select z.userId,z.firstname,z.lastname from Users z where ((select count(*) from publications c LEFT JOIN books a on c.isbn=a.isbn LEFT JOIN borrowings b on a.isbn=b.bookno where a.status!='deleted' and z.userId=c.userId and ((TIMESTAMPDIFF(day,a.createdTime,CURDATE())>30 and TIMESTAMPDIFF(day,b.issuedate,CURDATE())<30) or TIMESTAMPDIFF(day,a.createdTime,CURDATE())<30))=0 and (select count(*) from Reservations d LEFT JOIN books e on d.bookno=e.isbn LEFT JOIN publications f on f.isbn=e.isbn where issued='false' and e.status!='deleted' and f.userId=z.userId)=0) and (status='Publisher' or status='Publish') and (select count(*) from Books g where g.isbn in(select isbn from Publications h where h.userId=z.userId))>0;";
    con.query(sql,(err,result) => {
        if (err) {res.json({status:'error'});}
        else res.json(result);
    });
});

router.post('/deletepublisher',authenticate,async (req,res) => {
    var sql="select role,status from Users where userId=?";
    con.query(sql,[req.body.userId],(err,result) => {
        var status='deleted';
        if(result[0].role==='Publisher' && result[0].status==='Publisher') {
            status='Read';
        }
        var sql1="update Users set status=? where userId=?";
        con.query(sql1,[status,req.body.userId],(err1,result1) => {
            if (err1) {con.rollback();res.json({status:'error'});}
            else {
                var sql2="update Books set status='deleted' where isbn in(select isbn from Publications where userId=?)";
                con.query(sql2,[req.body.userId],(err2,result2) => {
                    if(err) {con.rollback();res.json({status:'error'});}
                    else {con.commit();res.json({status:'okay'});}
                });
            }
        });
    })
});

function authenticate(req,res,next) {
    const token=req.cookies.token;
    if(token == null) {res.sendStatus(401);}
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
                var sql="select firstname,lastname,role from Users where userId=?";
                con.query(sql,[user.userId],(err,result) => {
                    if (err) {console.log(err);res.json({status:'error'});}
                    if(result[0].role==='Staff') {
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

function validate(req,res,next) {
    if(req.body.category==='') {
        res.json({status:'Select a category'});
        return;
    }
    if(req.body.category!=='Story' && req.body.category!=="General" && req.body.category!=="Novel") {
        res.json({status:'Select a valid Category'});
        return;
    }
    if(req.body.count<1) {
        res.json({status:"Enter a valid count"});
        return;
    }
    if(!req.body.title.match(/^[A-Z][a-zA-Z0-9 ]*$/)) {
        res.json({status:"Enter a proper title"});
        return;
    }
    if(!req.body.edition.match(/^[1-9][0-9]*\.[0-9]*$/)) {
        res.json({status:"Invalid Edition"});
        return;
    }
    if(isNaN(req.body.count)) {
        res.json({status:"Invalid Count"});
        return;
    }
    if(isNaN(req.body.price)) {
        res.json({status:"Invalid Price"});
        return;
    }
    if(!req.body.authorname.match(/^[A-Z][a-zA-Z ]*$/)){
        res.json({status:"Enter a valid author name"});
        return;
    }
    next();
}

function validate1(req,res,next) {
    if(req.body.category==='') {
        res.json({status:'Select a category'});
    } else if(req.body.category!=='Story' && req.body.category!=="General" && req.body.category!=="Novel") {
        res.json({status:'Select a valid Category'});
    } else if(req.body.count<1) {
        res.json({status:"Enter a valid count"});
    } else if(!req.body.edition.match(/^[1-9][0-9]*\.[0-9]*$/)) {
        res.json({status:"Invalid Edition"});
    } else if(isNaN(req.body.count)) {
        res.json({status:"Invalid Count"});
    } else if(isNaN(req.body.price)) {
        res.json({status:"Invalid Price"});
    } else if(!req.body.authorname.match(/^[A-Z][a-zA-Z ]*$/)){
        res.json({status:"Enter a valid author name"});
    } else {
        next();
    }
}

module.exports = router;