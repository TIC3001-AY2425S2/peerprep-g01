# Setting up MongoDB Instance for User Service

1. Visit the MongoDB Atlas Site [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas) and click on "Try Free"

2. Sign Up/Sign In with your preferred method.

3. You will be greeted with welcome screens. Feel free to skip them till you reach the Dashboard page.

4. Create a cluster by clicking on the `+ Create` or `Build a Cluster` button.

5. Select the M0 option, M0 clusters are free.

> Ensure you select M0 Sandbox, else you may be prompted to enter card details and may be charged!

6. Select `aws` as provider.
7. Select  `Singapore` as region.
8. Specify a name for your cluster. You cannot change the name of the cluster after Atlas deploys it.
9. Click on `Create` to deploy the cluster. A security quickstart wizard will appear. \
10. You will be prompted to set up Security for the database by providing `Username and Password`. Select that option and enter `Username` and `Password`. Please keep this safe as it will be used in User Service later on.

![alt text](./GuideAssets/Security.png)

11. Next, click on `Add my Current IP Address`. This will whitelist your IP address and allow you to connect to the MongoDB Database.

12. Click `Finish and Close` and the MongoDB Instance should be up and running. (It may take up to 10 minutes for the cluster to provision and start) 

## Whitelisting All IP's

1. Select `Network Access` from the left side pane on Dashboard.

2. Click on the `Add IP Address` Button

3. Select the `ALLOW ACCESS FROM ANYWHERE` Button and Click `Confirm`

![alt text](./GuideAssets/IPWhitelisting.png)

Now, any IP Address can access this Database.
