# Backend
The backend of the Text Saver extension is a Flask API that provides endpoints for managing user data, saving and retrieving text, and handling user authentication. It uses Flask-Login for user session management and JWT for token-based authentication.

## API Endpoints
### /check-authorization (GET)
* Description: Checks if the user is authorized by validating the JWT token.
* Authorization: Bearer token in the request headers.
* Response: JSON response indicating whether the user is authorized or not.
### /save-text (POST)
* Description: Saves text content provided by the user.
* Authorization: Bearer token in the request headers.
* Request Body: JSON object with the text property containing the text content to be saved.
* Response: JSON response indicating the success of the operation.
### /get-texts (GET)
* Description: Retrieves all saved texts associated with the user.
* Authorization: Bearer token in the request headers.
* Response: JSON response containing an array of saved texts.
### /delete-text/<text_id> (DELETE)
* Description: Deletes a specific text entry by its ID.
* Authorization: Bearer token in the request headers.
* Response: JSON response indicating the success of the operation.
### /login (POST)
* Description: Handles user login and returns a JWT token upon successful login.
* Request Body: JSON object with the login, email, and password properties.
* Response: JSON response containing the JWT token and user tags upon successful login.
### /logout (POST)
* Description: Handles user logout.
* Response: JSON response indicating the success of the logout operation.
* /register (POST)
* Description: Handles user registration and creates a new user account.
* Request Body: JSON object with the login, email, and password properties.
* Response: JSON response indicating the success of the registration and containing the JWT token.

(Note: You can include other endpoints as well if there are additional functionalities in your backend API.)
