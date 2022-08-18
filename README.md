# LMS - Library Management System


## Task Scenario
ABC private limited is about to start a new Library and you are asked to design a web app which manages the dataset efficiently.Staff maintains the book catalogue with its ISBN, Book title, price (in INR), category(novel, general, story), edition, author Number and details. A publisher has publisher Id, year when the book was published, and name of the book. Readers are registered with their user_id, email, name (first name, last name), Phone no (multiple entries allowed), communication address. The staff keeps track of readers. Staff also generate reports that have readers_id, registration no of report, book no and return/issue info. 

Conditions to be met,
1. The above mentioned identifiers should be unique and required in order to perform a create operation
2. Staff, publishers and readers should register in the app. If they have already registered, proceed to the login page
3. Staff should be able to add/update/delete entries maintained in the book catalogue.
4. Staff will also be able to view reports such as no of books published by a publisher, no of books held by a reader, amount to be paid by the reader, books with issues etc.
5. The publisher should be able to view the list of readers for his book, and list of books published by him
6. Readers can return/reserve books that stamps with issue date and return date. If not returned within the prescribed time, it may have due amount to be paid.
7. Staff will be able to delete a publisher from the library when none of the books published are held or reserved by any of the readers.
8. Staff will be allowed to ban a reader from library if the due amount exceeds 10000
9. Staff will also have the option to see the list of banned readers
10. Publishers should also be allowed to read or reserve books of other publishers but not their own books

## Credits

Created as a part of the Zoho Summer Intern Program 2022 by Deepananth K, built to demonstrate full stack development skills using `Node.JS`, `React.JS` and `MySQL`