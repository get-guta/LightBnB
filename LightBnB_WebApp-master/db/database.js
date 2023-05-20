const properties = require("./json/properties.json");
const users = require("./json/users.json");

const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

// the following assumes that you named your connection variable `pool`
// pool.query(`SELECT title FROM properties LIMIT 10;`).then(response => { console.log(response) })


/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {
  return new Promise((resolve, reject) => {
    pool
      .query(`SELECT * FROM users WHERE email=$1`, [email])
      .then((result) => {
        if (result.rows.length > 0) {
          resolve(result.rows[0]); // Resolve with the first user object
        } else {
          resolve(null); // Resolve with null if user does not exist
        }
      })
      .catch((err) => {
        reject(err); // Reject with the error message
      });
  });
};

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {
  return new Promise((resolve, reject) => {
    pool
      .query(`SELECT * FROM users WHERE id=$1`, [id])
      .then((result) => {
        if (result.rows.length > 0) {
          resolve(result.rows[0]); // Resolve with the first user object
        } else {
          resolve(null); // Resolve with null if user does not exist
        }
      })
      .catch((err) => {
        reject(err); // Reject with the error message
      });
  });
};

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {
  return new Promise((resolve, reject) => {
    const { name, email, password } = user;

    pool
      .query(
        `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *`,
        [name, email, password]
      )
      .then((result) => {
        resolve(result.rows[0]); // Resolve with the newly inserted user object
      })
      .catch((err) => {
        reject(err); // Reject with the error message
      });
  });
};


/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = (guest_id, limit) => {
  return new Promise((resolve, reject) => {
    const query = {
      text: `
        SELECT * FROM properties
        JOIN reservations ON properties.id = reservations.property_id
        WHERE reservations.guest_id = $1
        LIMIT $2
      `,
      values: [guest_id, limit],
    };

    pool
      .query(query)
      .then((results) => {
        resolve(results.rows);
      })
      .catch((error) => {
        reject(error);
      });
  });
};


/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */

const getAllProperties = (options, limit = 10) => {
  return pool
    .query(`SELECT * FROM properties LIMIT $1`, [limit])
    .then((result) => {
      return Promise.resolve(result.rows)
    })
    .catch((err) => {
      console.log(err.message);
    });
};

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
