const usersDb = require('../db/users-db');

function findUserByUsername(username) {
  const users = usersDb.getAll();
  return users.find(u => u.username === username) || null;
}

function register({ username, password }) {
  if (!username || !password) {
    const e = new Error('Username and password required');
    e.status = 400;
    throw e;
  }
  const users = usersDb.getAll();
  if (users.find(u => u.username === username)) {
    const e = new Error('Username already exists');
    e.status = 400;
    throw e;
  }
  // NOTE: plaintext password (for demo only)
  const user = { id: 'u_' + Date.now().toString(36), username, password };
  users.push(user);
  usersDb.saveAll(users);
  // return user without password
  const { password: _p, ...safe } = user;
  return safe;
}

function login({ username, password }) {
  if (!username || !password) {
    const e = new Error('Username and password required');
    e.status = 400;
    throw e;
  }
  const user = findUserByUsername(username);
  if (!user || user.password !== password) {
    const e = new Error('Invalid credentials');
    e.status = 401;
    throw e;
  }
  const { password: _p, ...safe } = user;
  return safe;
}

module.exports = { register, login, findUserByUsername };
