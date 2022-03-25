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

const urlsForUser = (id) => {
  let filtered = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      filtered[url] = urlDatabase[url];
    }
  }
  return filtered;
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
  'b2xTn2': { longURL: "http://www.lighthouselabs.ca", userID: "hahahey" },
  '9sm5xK': { longURL: "http://www.google.com", userID: "lolnice" }
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
    urls: urlsForUser(req.cookies.user_id),
    user: users[req.cookies.user_id]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies.user_id) {
    return res.redirect(401, "/login")
  }
  const templateVars = { user: users[req.cookies.user_id] }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.cookies.user_id],
    urls: urlsForUser(req.cookies.user_id)
   };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  if (!req.cookies.user_id) {
    return res.redirect(401, "/login");
  }
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

//post

//CREATE NEW URL 
app.post("/urls", (req, res) => {
  if (!req.cookies.user_id) {
    return res.redirect(401, "/login")
  }
  const shortURL = generateRandomString();
  let longURL = req.body.longURL

  if (!longURL.startsWith("http")) {
    longURL = `http://${longURL}`;
  }

  urlDatabase[shortURL] = { 
    longURL,
    userID: req.cookies.user_id 
  };
  res.redirect(`/urls/${shortURL}`);
});

//DELETE EXISTING URL
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.cookies.user_id !== urlDatabase[req.params.shortURL].userID) {
    return res.send("You do not have permission to delete this URL");
  }

  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//EDIT EXISTING URL
app.post("/urls/:shortURL", (req, res) => {
  if (!req.cookies.user_id) {
    return res.redirect(401, "/login")
  }

  if (req.cookies.user_id !== urlDatabase[req.params.shortURL].userID) {
    return res.send("You do not have permission to edit this URL");
  }
  const shortURL = req.params.shortURL
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:shortURL/edit", (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});

//LOGIN
app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  let userInfo = emailCheck(email);

  if (userInfo && users[userInfo].password === password) {
    res.cookie("user_id", users[userInfo].id)
    res.redirect("/urls");
  } else {
    res.status(403).send("Email or password is incorrect");
  }
});

//LOGOUT
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//REGISTER
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const newID = generateRandomString();
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Invalid input");
  }

  if (emailCheck(email)) {
    return res.status(400).send("Email is already registered");
  }
  users[newID] = {
    id: newID,
    email: req.body.email,
    password: req.body.password
  };
  console.log(users);
  res.cookie("user_id", newID);
  res.redirect("/urls");
});

const emailCheck = (email) => {
  for (let user in users) {
    if (users[user].email === email) {
      return user;
    }
  }
  return false;
}