![image](https://github.com/user-attachments/assets/e0f81cf9-05c3-43e9-9b65-8fe221816575)[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/-9a38Lm0)
# TIC3001 Project

## User Service

### Quick Start

1. In the `user-service` directory, create a copy of the `.env.sample` file and name it `.env`.
2. Create a MongoDB Atlas Cluster and obtain the connection string.
3. Add the connection string to the `.env` file under the variable `DB_CLOUD_URI`.
4. Ensure you are in the `user-service` directory, then install project dependencies with `npm install`.
5. Start the User Service with `npm start` or `npm run dev`.
6. If the server starts successfully, you will see a "User service server listening on ..." message.

### Complete User Service Guide: [User Service Guide](./user-service/README.md)

## Commands used to spin up the container(s)

1.	Copy the .env.sample File: 
Navigate to the root directory of your project where the .env.sample file is located. You can use the following command in your terminal:   
copy .env.sample .env
This command creates a copy of the .env.sample file and names it .env.
2.	Open the .env File:
Use a text editor of your choice to open the newly created .env file. You can use editors like Visual Studio Code, Notepad++, or even Notepad.
3.	Update the Connection String:
Locate the line in the .env file that contains the MONGODB_URI. It should look something like this:
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<dbname>?retryWrites=true&w=majority
Replace <username>, <password>, <cluster-url>, and <dbname> with your actual MongoDB connection details. For example:
4.	Update the Database Name:
Find the line that specifies the database name for the user service and question service:
USER_DB_NAME=<your_database_name>
QUESTION_DB_NAME=<MongoDB Database Name>
The database name can be found by going to your Mongodb Atlas Cluster under Collections. Refer to below image. 
![image](https://github.com/user-attachments/assets/cc566b97-d05e-4dfa-94f7-3d92a3475297)
5.	Navigate to the Project Directory:
Make sure you are in the root directory of your project where the docker-compose.yaml file is located.
6.	Stop Any Running Containers:
This command will stop and remove any currently running containers defined in your docker-compose.yaml: 
docker-compose up --build
7.	Build and Start the Containers:
This command will build the images and start the containers as defined in your docker-compose.yaml: 
docker-compose up --build
8.	Access the Services:
After the containers are up, you can access the services at the following URLs:
- Admin Frontend: http://localhost:3000
- User Frontend: http://localhost:2999
- User Service: http://localhost:3001
- Question Service: http://localhost:3002
