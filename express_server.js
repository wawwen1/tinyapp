const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const PORT = 3000;
const { getUserByEmail } = require("./helpers");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: "session",
  keys: ["key1", "key2"]
}));
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
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlsForUser(req.session.user_id),
    user: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect(401, "/login")
  }
  const templateVars = { user: users[req.session.user_id] }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.user_id],
    urls: urlsForUser(req.session.user_id)
   };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect(401, "/login");
  }
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

//post

//CREATE NEW URL 
app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect(401, "/login")
  }
  const shortURL = generateRandomString();
  let longURL = req.body.longURL

  if (!longURL.startsWith("http")) {
    longURL = `http://${longURL}`;
  }

  urlDatabase[shortURL] = { 
    longURL,
    userID: req.session.user_id 
  };
  res.redirect(`/urls/${shortURL}`);
});

//DELETE EXISTING URL
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id !== urlDatabase[req.params.shortURL].userID) {
    return res.send("You do not have permission to delete this URL");
  }

  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//EDIT EXISTING URL
app.post("/urls/:shortURL", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect(401, "/login")
  }

  if (req.session.user_id !== urlDatabase[req.params.shortURL].userID) {
    return res.send("You do not have permission to edit this URL");
  }

  let longURL = req.body.longURL;
  if (!longURL.startsWith("http")) {
    longURL = `http://${longURL}`;
  }

  const shortURL = req.params.shortURL
  urlDatabase[shortURL].longURL = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:shortURL/edit", (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});

//LOGIN
app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  let userInfo = getUserByEmail(email, users);

  if (userInfo && bcrypt.compareSync(password, users[userInfo].password)) {
    req.session["user_id"] = users[userInfo].id;
    res.redirect("/urls");
  } else {
    res.status(403).send("Email or password is incorrect");
  }
});

//LOGOUT
app.post("/logout", (req, res) => {
  req.session["user_id"] = null;
  res.redirect("/urls");
});

//REGISTER
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
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

  const hashedPassword = bcrypt.hashSync(password, 10);
  users[newID] = {
    id: newID,
    email,
    password: hashedPassword
  };
  req.session["user_id"] = newID;
  res.redirect("/urls");
});

const emailCheck = (email) => {
  for (let user in users) {
    if (users[user].email === email) {
      return true;
    }
  }
  return false;
}