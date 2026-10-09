# Final Project
*Due October 9th by 1:59 PM*

https://finalproject-find-gamers-1.onrender.com/

### Project Description

We created a web application that helps gamers find other people to play their favorite games with. Users will log into the application with their username and password. From there, they can go to the profile page and edit their profile. User profiles consist of their username, a bio, the region they play in, the platforms they play on, and the games they play. For each game they play, they can list the name, their rank, their role, their playstyle, and whether they are looking for teammates.

To find gamers, users navigate to the explore page. On the explore page they will see profiles of other gamers. They can filter by game, region, and platform. Once they find a good match, they can hit the add friend button to send a friend request. To manage their friend requests, users must navigate to the connections page. On the connection page users can see pending incoming requests, their current connections, friend requests they’ve sent, and suggested teammates. Once a connection is made, both users will be able to see the gamertags and/or discord of the other user so that they can move the connection onto the game.

### Log In Instructions
Dummy Accounts Usernames:
- ValorantQueen
- ChillGamer22
- RocketPro
- MinecraftMatt
- OverwatchAmy

(password for all of them is “dummy”)


If you would like to make your own account, simply enter a username and password and an account will be registered.

### Technologies Used

- **React**: Used to build the frontend user interface. We created components such as user cards, filters, and buttons, and used React state to manage filtering and user data.
- **JavaScript**: Used for the application logic, including filtering gamers, handling button clicks, fetching data from the backend, and managing user interactions.
- **Node.js**: Used to run the backend server and handle server-side functionality. Additionally used express-session to to store the logged-in user’s id in the session.
- **Express.js**: Used to create the backend API and routes for users and friend connections. For example, our connections API handles sending, accepting, and removing friend requests.
- **MongoDB**: Used as our database to store user profiles and connections/friend requests.
- **Mongoose**: Used to connect the Express backend to MongoDB and work with our database models, such as User and Connection.
- **HTML/CSS**: Used to structure and style the application. CSS was used for the responsive gamer card grid, filters, badges, buttons, and overall visual design.
- **Lucide React**: Used for icons throughout the interface, such as the game controller, location, platform, teammate, and friend-request icons.
- **Vite**: Used as the frontend development/build tool for our React application.
- **Bycrypt.js**: Used to hash passwords before they are stored, that way the database never holds plaintext passwords.

### Challenges Faced

One challenge faced was keeping connections consistent. A friend request has to behave correctly from both users' points of view. The server blocks requests to yourself, duplicates requests in either direction, and accepts a request that wasn't sent to you. Two clicks at the same moment could still slip past those checks, so we added a unique database index on each sender/receiver pair. That guarantees a duplicate can never be saved.

Another challenge was the css styling of the user profile cards on the explore page. It was difficult to get the layout to behave how we wanted it too, and even more difficult to preserve the appearance as screen size shrinks.


### Group Member Contributions

**Norah Anderson**:
- Set up the project, organized the basic file structure, and converted it to React.
- Created the skeleton of the project including the navigation bar and basic page navigation.
- Designed the User model.
- Seeded the database with dummy users.
- Implemented the explore page:
  - Designed and implemented user profile cards.
  - Styled the cards into a grid that responds well to smaller screens.
  - Implemented accessibility with aria labels to achieve a lighthouse score of 100.
  - Implemented filtering capability.

**Ryan Ginn**:
- Designed and built the connections system on the backend: the Connection model and the API for sending, accepting, declining, cancelling, and removing friend requests, with checks to prevent invalid or duplicate requests.
- Implemented gamertag privacy: gamertags are only revealed to a user's accepted connections
- Built the Connections page:
  - pending requests, current connections, sent requests, and suggested teammates
  - a summary row
  - a "You both play" section showing shared games with rank and role
  - one-click copy buttons for gamertags
  - Suggested teammates feature
  - Pending request notification
- Updated login system to hash passwords before storing in database

**Rashi Roselin**:
- Designed and built the login page
- Recorded the overview video

**Jennifer Yuan**:
- Developed the Profile page to allow users to view and manage their gaming profiles.
- Added features for users to edit their personal information, gaming preferences, and favorite games.
- Designed a profile layout that displays user information, gaming interests, and connections.
- Updated CSS styling, page layouts, and color schemes to create a consistent design.
- Focused on making the website clean, visually appealing, and user-friendly.
- Collaborated with team members to improve the overall website experience.

### Project Video

https://youtu.be/4N30GHcldXc

  
### AI Use Note: 
- The dummy users were AI generated to save time.
- AI was used for help rendering - we have a separate client and server folder which required two deployments
- AI was used for minor styling assistance on the explore page's user cards (mostly when alignment was not working)


