/** * This SQL script initializes the PostgreSQL database for the smart card project.
 * It creates two databases: 'smartcard' for the main application and 'users_db' for user management.
 to include it put the file on the same directory as the docker-compose.yml and it will be executed when the PostgreSQL container starts.
 */

CREATE DATABASE smartcard;
CREATE DATABASE users_db;