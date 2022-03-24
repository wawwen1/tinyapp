const express = require("express");
const app = express();

const PORT = 3000; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

//-------------------------------------------------

const generateRandomString = () => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';

  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * (chars.length)));
  }
  return result;
}

const users = {
  "hahahey": {
    id: "hahahey",
    email: "user@example.com",
    password: "tinychungus"
  },
  "lolnice": {
    id: "lolnice",
    email: "user2@example.com",
    password: "smellyfeet"
  }
}

const urlDatabase = {
  'b2xTn2': { longURL: "http://www.lighthouselabs.ca" },
  '9sm5xK': { longURL: "http://www.google.com" }
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies.user_id]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] }
  res.render("urls_new", templateVars);
})


app.get("/urls/:shortURL/edit", (req, res) => {
  console.log('here');
  res.redirect(`/urls/${req.params.shortURL}`)
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.cookies.user_id]
   };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//post

//create new URL and redirect to /urls/:shortID
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL
  urlDatabase[shortURL] = { longURL };
  res.redirect(`/urls/${shortURL}`);
});

//DELETE EXISTING URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//EDIT EXISTING URL


app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
  //res.send(req.body.longURL);
});




//LOGIN
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  return res.redirect("/urls");
});

//LOGOUT
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

//register
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const newID = generateRandomString();
  users[newID] = {
    id: newID,
    email: req.body.emailnewEmail,
    password: req.body.password
  };
  console.log(users);
  res.cookie("user_id", newID);
  res.redirect("/urls");
});