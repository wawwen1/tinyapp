//Finds if user exists in the database
const getUserByEmail = (email, database) => {
  for (let user in database) {
    if (database[user].email === email) {
      return user;
    }
  }
};

module.exports = { getUserByEmail };