import * as bcrypt from 'bcrypt';

const saltRounds = 10;

export function createHash(plainPassword) {
    bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
        if (err) {
          console.error('Error hashing password:', err);
        } else {
          console.log('Hashed Password:', hash);
          return hash;
        }
      });

}

export function compareHash(inputPassword, storedHash) {
    bcrypt.compare(inputPassword, storedHash, (err, result) => {
        if (err) {
          console.error('Error comparing passwords:', err);
        } else {
          if (result) {
            console.log('Password is correct!');
            return true;
          } else {
            console.log('Password is incorrect!');
            return false;
          }
        }
      });
}

