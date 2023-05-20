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
  return new Promise((resolve, reject) => {
    let query = {
      text: `SELECT * FROM properties`,
      values: [],
    };

    let conditions = [];
    let conditionIndex = 1;

    if (options.owner_id) {
      conditions.push(`owner_id = $${conditionIndex}`);
      query.values.push(options.owner_id);
      conditionIndex++;
    }

    if (options.minimum_price_per_night) {
      conditions.push(`cost_per_night >= $${conditionIndex}`);
      query.values.push(options.minimum_price_per_night * 100); // Convert to cents
      conditionIndex++;
    }

    if (options.maximum_price_per_night) {
      conditions.push(`cost_per_night <= $${conditionIndex}`);
      query.values.push(options.maximum_price_per_night * 100); // Convert to cents
      conditionIndex++;
    }

    if (options.minimum_rating) {
      conditions.push(`average_rating >= $${conditionIndex}`);
      query.values.push(options.minimum_rating);
      conditionIndex++;
    }

    if (conditions.length > 0) {
      query.text += ` WHERE ${conditions.join(" AND ")}`;
    }

    query.text += ` LIMIT $${conditionIndex}`;
    query.values.push(limit);

    pool
      .query(query)
      .then((result) => {
        resolve(result.rows);
      })
      .catch((error) => {
        reject(error);
      });
  });
};


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = (property) => {
  const {
    owner_id,
    title,
    description,
    thumbnail_photo_url,
    cover_photo_url,
    cost_per_night,
    street,
    city,
    province,
    post_code,
    country,
    parking_spaces,
    number_of_bathrooms,
    number_of_bedrooms
  } = property;

  const query = {
    text: `INSERT INTO properties (owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, street, city, province, post_code, country, parking_spaces, number_of_bathrooms, number_of_bedrooms) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
           RETURNING *`,
    values: [
      owner_id,
      title,
      description,
      thumbnail_photo_url,
      cover_photo_url,
      cost_per_night,
      street,
      city,
      province,
      post_code,
      country,
      parking_spaces,
      number_of_bathrooms,
      number_of_bedrooms
    ],
  };

  return pool.query(query)
    .then((result) => {
      return Promise.resolve(result.rows);
    })
    .catch((error) => {
      console.error(error);
      return Promise.reject(error);
    });
};


module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
