drop database lms;

create database lms;

use lms;

create table Users(userId int not null auto_increment,
                   createdTime timestamp default current_timestamp,
                   updatedTime timestamp default current_timestamp on update current_timestamp,
                   email varchar(50) not null,
                   firstname varchar(30) not null,
                   lastname varchar(30) not null,
                   password varchar(60) not null,
                   role varchar(30) not null,
                   status varchar(30),
                   primary key(userId),
                   unique(email),
                   check (role='Staff' or role='Reader' or role='Password')
);

create table Addresses(userId int not null,
                       createdTime timestamp default current_timestamp,
                       updatedTime timestamp default current_timestamp on update current_timestamp,
                       address varchar(60),
                       foreign key(userId) references Users(userId),
                       primary key(userId,address)
);

create table PhoneNumbers(createdTime timestamp default current_timestamp,
                          updatedTime timestamp default current_timestamp on update current_timestamp,
                          userId int not null,
                          phone bigint not null,
                          unique(phone),
                          foreign key(userId) references Users(userId),
                          primary key(userId,phone)
);

create table Publications(createdTime timestamp default current_timestamp,
                          updatedTime timestamp default current_timestamp on update current_timestamp,
                          userId int not null,
                          isbn int not null,
                          bookname varchar(50) not null,
                          year int not null,
                          primary key(isbn),
                          unique(bookname),
                          foreign key(userId) references Users(userId)
);

create table Books(createdTime timestamp default current_timestamp,
                   updatedTime timestamp default current_timestamp on update current_timestamp,
                   isbn int not null,
                   price int not null,
                   category varchar(15) not null,
                   edition varchar(10) not null,
                   authorname varchar(30) not null,
                   count int not null,
                   status varchar(10) default 'available',
                   primary key(isbn),
                   foreign key(isbn) references Publications(isbn),
                   check (category='General' OR category='Novel' or category='Story')
);

create table Reports(reportId int not null auto_increment,
                     createdTime timestamp default current_timestamp,
                     updatedTime timestamp default current_timestamp on update current_timestamp,
                     userId int not null,
                     bookno int not null,
                     issue varchar(50),
                     foreign key(userId) references Users(userId),
                     foreign key(bookno) references Books(isbn),
                     primary key(reportId)
);

create table Borrowings(borrowId int not null auto_increment,
                        userId int not null,
                        bookno int not null,
                        issuedate date not null,
                        returndate date,
                        createdTime timestamp default current_timestamp,
                        updatedTime timestamp default current_timestamp on update current_timestamp,
                        foreign key(userId) references Users(userId),
                        foreign key(bookno) references Books(isbn),
                        primary key(borrowId)
);

create table Reservations(reservationId int not null auto_increment,
                          createdTime timestamp default current_timestamp,
                          updatedTime timestamp default current_timestamp on update current_timestamp,
                          userId int not null,
                          bookno int not null,
                          issued varchar(20) default 'false',
                          foreign key(userId) references Users(userId),
                          foreign key(bookno) references Books(isbn),
                          primary key(reservationId),
                          unique(userId,bookno,issued)
);