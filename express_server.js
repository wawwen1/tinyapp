const express = require("express");
const app = express();
const PORT = 3000; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

const generateRandomString = () => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';

  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * (chars.length)));
  }
  return result;
}

const urlDatabase = {
  "b2xTn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let urls = urlDatabase
  const templateVars = { urls };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
})

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const baseURL = urlDatabase[shortURL];
  const longURL = baseURL.longURL

  const templateVars = { shortURL, longURL };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const baseURL = urlDatabase[req.params.shortURL];
  res.redirect(baseURL.longURL);
});

// -------------- POST

//new URL and redirect to /urls
app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  
  if (!longURL.startsWith('http')) {
    longURL = `http://${longURL}`;
  }
  
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL };
  res.redirect(`/urls/${shortURL}`);
});