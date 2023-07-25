# Text Saver Backend API
This document describes the API endpoints for the Text Saver backend. The backend is responsible for handling user authentication, saving and retrieving text data, managing tags, and other essential functionalities for the Text Saver extension.

## Authentication
The Text Saver API uses JSON Web Tokens (JWT) for authentication. To access protected endpoints, clients must include a valid JWT in the Authorization header of the HTTP request. The JWT is obtained through the login process, and it must be included in subsequent requests for authorized access.

## Endpoints
### Authorization
These endpoints handle the authorization of the user.

#### Login
* Endpoint: /login
* Method: POST
* Description: Authenticates a user and returns a JWT token for authorized access.
* Request Body: JSON object with login, email, and password.
* Response: JSON object with the JWT token and user tags.

#### Logout
* Endpoint: /logout
* Method: POST
* Description: Logs out the authenticated user.

#### Register
* Endpoint: /register
* Method: POST
* Description: Registers a new user with the provided login, email, and password.
* Request Body: JSON object with login, email, and password.
* Response: JSON object with a success message and the JWT token for the new user.

#### Check Authorization
* Endpoint: /check-authorization
* Method: GET
* Description: Checks if the user is authorized and has a valid JWT.
* Response: JSON object with a success message indicating authorized access.

### Texts
These endpoints handle the saving, retrieval, and deletion of text data for the authenticated user.

#### Save Text
* Endpoint: /save-text
* Method: POST
* Description: Saves a new text for the authenticated user.
* Request Body: JSON object with the text to be saved.
* Response: JSON object with a success message.

#### Get Texts
* Endpoint: /get-texts
* Method: GET
* Description: Retrieves all saved texts for the authenticated user.
* Response: JSON object with an array of saved texts.

#### Delete Text
* Endpoint: /delete-text/<text_id>
* Method: DELETE
* Description: Deletes the specified text from the user's saved texts.
* Response: JSON object with a success message.

### Tags
These endpoints handle the management of user tags for organizing saved texts.

#### Fetch User Tags
* Endpoint: /user-tags
* Method: GET
* Description: Retrieves all user-defined tags for the authenticated user.
* Response: JSON object with an array of user tags.

#### Set User Tags
* Endpoint: /set-tag
* Method: POST
* Description: Creates a new user-defined tag and associates it with the authenticated user.
* Request Body: JSON object with the name of the new tag.
* Response: JSON object with a success message and the new tag information.

#### Fetch Default Tags
* Endpoint: /user-default-tags
* Method: GET
* Description: Retrieves all default tags for the authenticated user.
* Response: JSON object with an array of default tags.

#### Remove Default Tag
* Endpoint: /remove-default-tag
* Method: POST
* Description: Removes a default tag from the authenticated user's default tags.
* Request Body: JSON object with the tagName to be removed.
* Response: JSON object with a success message.

#### Delete User Tag
* Endpoint: /delete-tag/<tag_id>
* Method: DELETE
* Description: Deletes the specified user tag.
* Response: JSON object with a success message.

### Text Tags
* These endpoints handle the association of tags with saved texts.

#### Add User Tag to Text
* Endpoint: /add-tag-to-text
* Method: POST
* Description: Associates a user-defined tag with a specific saved text.
* Request Body: JSON object with text_id and tag_id.
* Response: JSON object with a success message.

#### Remove Tag from Text
* Endpoint: /remove-tag-from-text/<text_id>/<tag_id>
* Method: DELETE
* Description: Removes the association of a tag from a specific saved text.
* Response: JSON object with a success message.

### Policy
#### Privacy Policy
* Endpoint: /policy
* Method: GET
* Description: Retrieves the privacy policy of the Text Saver extension.

### Miscellaneous
#### Index
Endpoint: /
Method: GET
Description: A welcome message indicating successful access to the Text Saver API.

This document serves as a reference guide for the Text Saver backend API. It outlines the available endpoints, their descriptions, and the expected request and response formats. Please refer to this documentation when interacting with the Text Saver backend. If you have any questions or encounter any issues, feel free to reach out to the project maintainers. 
