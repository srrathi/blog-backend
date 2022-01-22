## My Blog App Backend
To run Backend on you local machine follow the below steps :
- Fork this repo and then `git clone` that fork on your local machine
- After it go in the project root directory by writing `cd blog-backend`
- After it install all the node modules by running command `npm install`
- Create a Database on MongoDb atlas and get its connection string from it.
- Make a file with name `.env` in project root directory and paste inside the contents of `.env.example`
- In the place of `[YOUR_MONGODB_ATLAS_URL]` paste your MongoDb connection string
- In the place of `[SECRET_WORD_OF_YOUR_CHOICE]` paste any secret word of your choice and save the file
- Now open terminal in the root directory of the project and run command `npm run dev`
- It will start the Backend sever on your machine and you'll see the below output in the terminal if everything worked fine.

> Server running on port 9002 <br>
> MongoDb connected successfully
