
const bcrypt = require('bcrypt');

exports.comparsePasswords = (password) =>{
  return bcrypt.compareSync(password,bcrypt.hashSync("password", 10));
}
