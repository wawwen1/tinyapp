//Finds if user exists in the database
const getUserByEmail = (email, database) => {
  for (let user in database) {
    if (database[user].email === email) {
      return user;
    }
  }
};

//Checks if email is being used already
const emailCheck = (email, users) => {
  for (let user in users) {
    if (users[user].email === email) {
      return true;
    }
  }
  return false;
};

//Creates a random 6 character string
const generateRandomString = () => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';

  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * (chars.length)));
  }
  return result;
}

//Filters URLs from the database associated with the user
const urlsForUser = (id, database) => {
  let filtered = {};
  if (!id) {
    return false;
  }
  for (let url in database) {
    if (database[url].userID === id) {
      filtered[url] = database[url];
    }
  }
  return filtered;
};



module.exports = { getUserByEmail, emailCheck, generateRandomString, urlsForUser };