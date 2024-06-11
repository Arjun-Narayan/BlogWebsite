import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";

const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(morgan("short"));

var firstName;
var lastName;
var userName;
var listOfUsers = [];
var userCount = 0;
var blogUser;
var activeBlog;

class User{
    constructor(fname, lname, username, password){
        this.fname = fname;
        this.lname = lname;
        this.username = username;
        this.password = password;
        this.blogs = [];
        this.numberOfBlogs = 0;
        userCount++;
    }
    addBlog(blogTitle, blogContent){
        let condensedBlogContent = (blogContent.length>100)?(blogContent.slice(0,97) + "..."):(blogContent);
        this.blogs[this.numberOfBlogs] = [blogTitle, blogContent, condensedBlogContent];
        this.numberOfBlogs++;
    }
}

app.listen(port, () => {
    console.log("Server running on port " + port);
})

app.get("/", (req, res) =>{
    res.render("index.ejs", {
        userLoggedIn: 0,
        cssFiles: ["styling/index.css"],
    });
})

app.get("/signUp", (req, res) =>{
    res.render("signup.ejs", {
        userLoggedIn: 0,
        cssFiles: ["styling/signup.css"],
        error: 0,
    })
})

app.get("/signIn", (req, res) =>{
    res.render("signin.ejs", {
        userLoggedIn: 0,
        cssFiles: ["styling/signin.css"],
        error: 0,
    })
})

app.get("/homePage", (req, res) =>{
    res.render("homepage.ejs", {
        userLoggedIn: 1,
        cssFiles: ["styling/leftnav.css", "styling/homepage.css"],
        username: userName,
        numberOfBlogs: blogUser.numberOfBlogs,
        allBlogs: blogUser.blogs,
    })
})

app.get("/writeBlog", (req, res) =>{
    activeBlog = -1;
    res.render("writeblog.ejs", {
        userLoggedIn: 1,
        cssFiles: ["styling/leftnav.css", "styling/writeblog.css"],
        username: userName,
    })
})

app.get("/profile", (req, res) =>{
    res.render("profile.ejs", {
        userLoggedIn: 1,
        cssFiles: ["styling/leftnav.css", "styling/profile.css"],
        fname: blogUser.fname,
        lname: blogUser.lname,
        username: blogUser.username,
        password: blogUser.password,
        error: 0,
    })
})

app.get("/search", (req, res) =>{
    res.render("search.ejs", {
        userLoggedIn: 1,
        cssFiles: ["styling/leftnav.css", "styling/search.css"],
        username: userName,
    })
})

app.get("/coursesPricing", (req, res) =>{
    res.render("coursespricing.ejs", {
        userLoggedIn: 0,
        cssFiles: ["styling/pricing.css"],
    });
})

app.get("/contactUs", (req, res) =>{
    res.render("contactus.ejs", {
        userLoggedIn: 0,
        cssFiles: ["styling/contactus.css"],
    });
})

app.post("/addUser", (req, res) =>{
    var error = 0;
    for (let i=0; i<userCount; i++){
        if (req.body["uname"] === listOfUsers[i].username){
            error = 1;
        }
    }
    if (error){
        res.render("signup.ejs", {
            userLoggedIn: 0,
            cssFiles: ["styling/signup.css"],
            error: 1,
            errorMessage: "This username is already taken",
        })
    } else if(req.body["pwd"] != req.body["cnfpwd"]){
        res.render("signup.ejs", {
            userLoggedIn: 0,
            cssFiles: ["styling/signup.css"],
            error: 1,
            errorMessage: "Passwords donot match",
        })
    } else{
        blogUser = new User(req.body["fname"], req.body["lname"], req.body["uname"], req.body["pwd"]);
        listOfUsers[userCount-1] = blogUser;
        firstName = blogUser.fname;
        lastName = blogUser.lname;
        userName = firstName + " " + lastName;
        res.redirect("/signIn");
    }
    console.log(listOfUsers);
})

app.post("/loginUser", (req, res) =>{
    var username = req.body["uname"];
    var userPassword = req.body["pwd"];
    var error = 1;
    var activeUser;
    for (activeUser = 0; activeUser < userCount; activeUser++){
        if (username === listOfUsers[activeUser].username){
            if (userPassword === listOfUsers[activeUser].password){
                error = 0;
                break;
            }
            break;
        }
    }
    if (error){
        res.render("signin.ejs", {
            userLoggedIn: 0,
            cssFiles: ["styling/signin.css"],
            error: 1,
            errorMessage: "Username or password error",
        })
    } else{
        blogUser = listOfUsers[activeUser];
        res.redirect("/homePage");
    }
})

app.post("/accessBlog", (req, res) =>{
    activeBlog = parseInt(req.body["active"]);
    res.render("writeblog.ejs", {
        userLoggedIn: 1,
        cssFiles: ["styling/leftnav.css", "styling/writeblog.css"],
        username: userName,
        titleblog: blogUser.blogs[activeBlog][0],
        contentblog: blogUser.blogs[activeBlog][1],
    })
})

app.post("/postBlog", (req, res) =>{
    let blogtitle = req.body["blogtitle"];
    let blogcontent = req.body["blogcontent"];
    let condensedblogcontent = (blogcontent.length > 40)?(blogcontent.slice(0,37) + "..."):(blogcontent);
    if (activeBlog === -1){
        blogUser.blogs[blogUser.numberOfBlogs] = [blogtitle, blogcontent, condensedblogcontent];
        blogUser.numberOfBlogs++;
    }else {
        blogUser.blogs[activeBlog] = [blogtitle, blogcontent, condensedblogcontent];
    }
    res.redirect("/homePage");
    console.log(listOfUsers);
})

app.post("/deleteBlog", (req, res) =>{
    for (let i=activeBlog; i < blogUser.numberOfBlogs - activeBlog - 1; i++){
        blogUser.blogs[i] = blogUser.blogs[i+1];
    }
    blogUser.numberOfBlogs--;
    res.redirect("/homePage");
})

app.post("/updateUser", (req, res) =>{
    var error = 0;
    for (let i=0; i<userCount; i++){
        if (req.body["uname"] === listOfUsers[i].username && listOfUsers[i] != blogUser){
            error = 1;
        }
    }
    if (error){
        res.render("profile.ejs", {
            userLoggedIn: 1,
            cssFiles: ["styling/leftnav.css", "styling/profile.css"],
            fname: blogUser.fname,
            lname: blogUser.lname,
            username: blogUser.username,
            password: blogUser.password,
            error: 1,
        })
    } else{
        blogUser.fname = req.body["fname"];
        blogUser.lname = req.body["lname"];
        blogUser.username = req.body["uname"];
        blogUser.password = req.body["pwd"];
        res.render("profile.ejs", {
            userLoggedIn: 1,
            cssFiles: ["styling/leftnav.css", "styling/profile.css"],
            fname: blogUser.fname,
            lname: blogUser.lname,
            username: blogUser.username,
            password: blogUser.password,
            error: 0,
        })
    }
    console.log(listOfUsers);
})

app.post("/deleteUser", (req, res) =>{
    for(let i=0; i<userCount-listOfUsers.indexOf(blogUser)-1; i++){
        listOfUsers[i] = listOfUsers[i+1];
    }
    userCount--;
    res.redirect("/signIn");
    console.log(listOfUsers);
})

var matchingProfiles;
var matchingBlogs;
app.post("/search", (req, res) =>{
    let query = req.body["searchquery"];
    let numberOfMatchingProfiles = 0;
    let numberOfMatchingBlogs = 0;
    matchingProfiles = [];
    matchingBlogs = [];
    let matchingUsernames = [];
    for (let i=0; i<userCount; i++){
        if (listOfUsers[i] === blogUser){
            continue;
        }
        if (listOfUsers[i].username.includes(query)){
            matchingProfiles[numberOfMatchingProfiles] = listOfUsers[i];
            matchingUsernames[numberOfMatchingProfiles] = listOfUsers[i].username;
            numberOfMatchingProfiles++;
        }
        let allUserBlogs = listOfUsers[i].blogs;
        for (let j = 0; j < allUserBlogs.length; j++) {
            let blogTitleToCompare = listOfUsers[i].blogs[j][0];
            let blogContentToCompare = listOfUsers[i].blogs[j][1];
            if (blogTitleToCompare.includes(query) || blogContentToCompare.includes(query)){
                matchingBlogs[numberOfMatchingBlogs] = allUserBlogs[j];
                numberOfMatchingBlogs++;
            }
        }
    }
    res.render("search.ejs", {
        userLoggedIn: 1,
        cssFiles: ["styling/leftnav.css", "styling/search.css"],
        username: userName,
        matchingprofiles: matchingUsernames,
        matchingblogs: matchingBlogs,
    })
})

app.post("/viewBlog", (req, res) =>{
    let clickedBlogNumber = req.body["active"];
    if (clickedBlogNumber > 0){
        clickedBlogNumber--;
        let clickedBlog = matchingBlogs[clickedBlogNumber];
        res.render("viewblog.ejs", {
            userLoggedIn: 1,
            cssFiles: ["styling/leftnav.css", "styling/viewblog.css"],
            username: userName,
            blogToDisplay: clickedBlog,
        });
    } else{
        clickedBlogNumber = clickedBlogNumber*(-1);
        let clickedProfile = parseInt(req.body["profile-number"]);
        let clickedBlog = matchingProfiles[clickedProfile].blogs[clickedBlogNumber];
        res.render("viewblog.ejs", {
            userLoggedIn: 1,
            cssFiles: ["styling/leftnav.css", "styling/viewblog.css"],
            username: userName,
            blogToDisplay: clickedBlog,
        });
    }
})

app.post("/viewProfile", (req, res) =>{
    let clickedProfileNumber = req.body["active"];
    let clickedProfile = matchingProfiles[clickedProfileNumber];
    res.render("viewprofile.ejs", {
        userLoggedIn: 1,
        cssFiles: ["styling/leftnav.css", "styling/viewprofile.css"],
        username: userName,
        usersUsername: clickedProfile.username,
        allBlogs: clickedProfile.blogs,
        clickedprofilenumber: clickedProfileNumber,
    })
})

app.post("/contactUs", (req, res) =>{
    var contactRequest = {
        fname: req.body["fname"],
        lname: req.body["lname"],
        uname: req.body["uname"],
        topic: req.body["topic"],
        message: req.body["message"]
    }
    console.log(contactRequest);
    res.redirect("/contactUs");
})