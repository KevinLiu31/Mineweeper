const { Client } = require('pg');
const bcrypt = require('bcrypt');

const client = new Client({
    user: 'your_database_user',
    host: 'your_database_host',
    database: 'your_database_name',
    password: 'your_database_password',
    port: 5432,
});
async function queryDB(query, params) {
    const client = await client.connect();
    try {
        const res = await client.query(query, params);
        return res.rows;
    } catch (err) {
        console.error('Database query error:', err);
        throw err;
    } finally {
        client.release();
    }
}

// Function to select data from the database
async function selectFrom(table, dataWant, datagive, datatypeGive) {
    const query = `SELECT ${dataWant} FROM ${table} WHERE ${datatypeGive} = $1`;
    const params = [datagive];
    const result = await queryDB(query, params);
    if (result.length > 0) {
        return result[0][dataWant];
    } else {
        return 0;
    }
}

// Function to check if username exists in the system
async function usernameInSystem(username) {
    const query = 'SELECT username FROM users WHERE username = $1';
    const params = [username];
    const result = await queryDB(query, params);
    return result.length > 0;
}

// Function to sign up a new user
async function signup(username, hashedPassword, email) {
    if (await usernameInSystem(username)) {
        return false;
    } else {
        const query = 'INSERT INTO users (username, password_hash, email, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)';
        const params = [username, hashedPassword, email];
        await queryDB(query, params);
        return true;
    }
}

// Function to verify login credentials
async function login(username, password) {
    if (await usernameInSystem(username)) {
        const storedHash = await selectFrom('users', 'password_hash', username, 'username');
        if (await bcrypt.compare(password, storedHash)) {
            return true;
        }
    }
    return false;
}

// Function to edit username
async function editUsername(oldUsername, newUsername) {
    const query = 'UPDATE users SET username = $1 WHERE username = $2';
    const params = [newUsername, oldUsername];
    await queryDB(query, params);
}

module.exports = {
    selectFrom,
    usernameInSystem,
    signup,
    login,
    editUsername,
};