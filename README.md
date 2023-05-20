# LightBnB Project

The LightBnB project aims to provide a user-friendly platform for property rentals. It allows property owners to list their properties, while users can search and book accommodations based on their preferences. The project utilizes Postgres SQL relational databases to store and manage property data, user information, and reservations. I also used Express.js to handle the API service & Java Script is used for the front-end service.

## Features

- User Authentication: Users can create accounts, log in, and log out. Authentication is implemented to ensure secure access to user-specific features and data.
- Property Listings: Property owners can list their properties by providing relevant details such as title, description, location, photos, amenities, and pricing.
- Property Search: Users can search for properties based on criteria such as location, price range, number of bedrooms, and amenities. The search feature provides accurate and relevant results.
- Reservation Management: Users can make reservations for available properties, specifying the desired check-in and check-out dates. They can also view and manage their existing reservations.
- User Reviews and Ratings: Users can leave reviews and ratings for properties they have stayed in. This helps other users make informed decisions when choosing accommodations.

## Prerequisites

To run the LightBnB project locally, ensure you have the following prerequisites:

- Node.js: Version 14.x or higher
- PostgreSQL: Version 10.x or higher

## Installation

Follow these steps to install and set up the LightBnB project:

1. Clone the project repository to your local machine.
2. Navigate to the project directory in the terminal.
3. Install project dependencies by running the command: `npm install`.
4. Set up the PostgreSQL database, create db named lightbnb & do seeds by executing the database setup script & migrations.
5. Configure the database connection settings in the project configuration files.

## Configuration

To configure the LightBnB project, update the necessary configuration files:

- `LightBNB_WebApp-master/database.js`: Set the database connection details such as host, port, username, password, and database name.
The bellow is how the connection setting looks like. Update the Pool parameters to your DB setting.
`
const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});`

## Usage

To start the LightBnB project, follow these steps:

1. Ensure the PostgreSQL database server is running & lightbnb db is created.
2. cd to `LightBNB_WebApp-master`
3. Run the command `npm run local` in the project directory.
4. Open a web browser and navigate to the specified URL or `localhost:3000`.

## Screenshot
Look at some of screenshots 
### all listings page
![All Listings](/screenshots/all_listings.png)
### filter properties
![Filter Listings](/screenshots/filter.png)
![Filtered result](/screenshots/filtered_result.png)
### add new property
![Add Property](/screenshots/add_new.png)

