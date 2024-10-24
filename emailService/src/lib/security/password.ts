import * as bcrypt from 'bcryptjs'
const saltRounds = 10;

export function passwordHash(input: string): Promise<string> {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(saltRounds, function(err, salt) {
            bcrypt.hash(input, salt, function(err, hash) {
                // Store hash in your password DB.
                if (err) {
                    reject(err);
                } else {
                    resolve(hash)
                }
            });
        });
    })
}

export function passwordVerify(password, hash) {
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, hash, function(err, result) {
            if (err) {
                return reject(err);
            }

            resolve(result)

        });
    })
}

