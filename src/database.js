import mysql from 'mysql';

let DB = null;

async function connect() {
  DB = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'rs17',
  });

  return new Promise((res, rej) => {
    DB.connect((err) => {
      if (err) {
        console.log('DB error:', err);
        rej(err);
      } else {
        console.log('DB connection established');
        res(DB);
      }
    });
  });
}

async function query(queryString) {
  return new Promise((res, rej) => {
    // (error, results, fields)
    DB.query(queryString, (err, results) => {
      if (err) {
        console.log('DB query error:', err);
        rej(err);
      } else {
        // console.log('DB query results:', results);
        res(results);
      }
    });
  });
}

function close() {
  DB.end((err) => {
    if (err) console.log(err);
    else console.log('DB connection closed');
  });
}

export { connect, query, close };
