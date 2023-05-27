const { Pool } = require('pg');

//establishing connection
const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {
  return new Promise((resolve, reject) => {
    // Execute the query using the database connection pool
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
    // Execute the query using the database connection pool
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
    // Execute the query using the database connection pool
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
    //calculates the average ratings for each property. By joining the property_reviews table based on the property_id column, we can retrieve the average rating corresponding to each property.
    const query = {
      text: `
      SELECT properties.*, 
      (SELECT AVG(rating) FROM property_reviews WHERE property_reviews.property_id = properties.id) AS average_rating
FROM properties
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
    // Initialize the base query
    let query = {
      text: `SELECT properties.*, 
                    (SELECT AVG(rating) FROM property_reviews WHERE property_reviews.property_id = properties.id) AS average_rating
             FROM properties
             WHERE 1 = 1`, // 1 = 1 is added to easily add conditions in subsequent steps
      values: [],
    };

    // Add conditions for filtering options

    // Check if owner_id option is provided
    if (options.owner_id) {
      query.text += ` AND properties.owner_id = $${query.values.length + 1}`;
      query.values.push(options.owner_id);
    }

    // Check if minimum_price_per_night option is provided
    if (options.minimum_price_per_night) {
      query.text += ` AND properties.cost_per_night >= $${query.values.length + 1}`;
      query.values.push(options.minimum_price_per_night * 100); // Convert to cents
    }

    // Check if maximum_price_per_night option is provided
    if (options.maximum_price_per_night) {
      query.text += ` AND properties.cost_per_night <= $${query.values.length + 1}`;
      query.values.push(options.maximum_price_per_night * 100); // Convert to cents
    }

    // Check if minimum_rating option is provided
    if (options.minimum_rating) {
      query.text += ` AND (SELECT AVG(rating) FROM property_reviews WHERE property_reviews.property_id = properties.id) >= $${query.values.length + 1}`;
      query.values.push(options.minimum_rating);
    }

    // Append LIMIT clause with limit value to the query
    query.text += ` LIMIT $${query.values.length + 1}`;
    query.values.push(limit);

    // Execute the query using the database connection pool
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
  // expected elements from property object
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
  // The RETURNING * clause at the end of the query will instruct the database to return the saved property after insertion
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
  // Execute the query using the database connection pool
  return pool.query(query)
    .then((result) => {
      return Promise.resolve(result.rows);
    })
    .catch((error) => {
      console.error(error);
      return Promise.reject(error);
    });
};

//export modules
module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
