
# chatapp

## Installation

 1. Use the package manager [npm](https://www.npmjs.com) to install the
        needed libraries to run chatapp.
    
        ```bash
         npm i socket.io
        ```
    
        ```bash
         npm i --save-dev live-server nodemon
        ```

 2. Run the following command to run the backend

    ```bash
     npm run back-dev
    ```

 3. Run the following commmand to run the frontend

    ```bash
     npm run front-dev
    ```
    
## Features

 - Saves your chat history in the site cookies
 - The app will remember you so you do have to enter a new username
 - You can exit chatapp whenever you will like and enter with a new user
 - Message Formatter supporting the following syntax:
	 - Bold (*)
	 - Italic (_)
	 - Strikethrough (~)
	 - Underline (--)
