const fs = require('fs');
const path = require('path');

const USERS_PATH = path.join(__dirname, '..', '..', 'data', 'users.json');

function readUsers() {
  try {
    const raw = fs.readFileSync(USERS_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return [];
    }
    throw err;
  }
}

function writeUsers(users) {
  const tmpPath = USERS_PATH + '.tmp';
  fs.writeFileSync(tmpPath, JSON.stringify(users, null, 2), 'utf8');
  fs.renameSync(tmpPath, USERS_PATH);
}

module.exports = {
  getAll: () => readUsers(),
  saveAll: (users) => writeUsers(users)
};
