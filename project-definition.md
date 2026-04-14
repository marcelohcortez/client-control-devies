**Client control system**

* Implement TypeScript  
* Implement ESLint  
* Implement Playwright  
  * Create Playwright tests  
  * Run tests whenever a feature is added/edited and make sure nothing breaks  
  * Don’t change a playwright test just to make a feature pass  
* Project will run React for frontend  
* Project will run Node in the backend  
* Project will be deployed to Vercel  
* Project will use Turso for the DB  
  * DB URL: libsql://[client-control-system-devies.aws-eu-west-1.turso.io](http://client-control-system-devies.aws-eu-west-1.turso.io)  
  * DB token: eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzYxNTQxMTgsImlkIjoiMDE5ZDhiMDgtYTYwMS03ZDhkLTk2MzctY2IyNmMxMWI0ZmE0IiwicmlkIjoiMTJiMzNiNmEtYjBmMS00MmUyLWE0NWYtNWRhNTVhYjcwZTdkIn0.u7CUmi8QPwpBwjdzo\_9YmKbFEvU0Locf\_JAIUTFGTynSTt0NJvMq6vz2fAC8wWWWaH4y\_u3zkeCSJa7k7SZIAg  
* Create ‘env.local’, env.prod’, and ‘env.example’  
* Use JWT  
* Client \= company  
* System behind login  
  * You can only see the system, the company’s info, delete a company, and etc, if you are logged in  
* First page:  
  * Login page requesting username and password  
* Second page:  
  * If logged:  
    * ‘add client’ button  
    * filter bar  
      * Ability to filter the clients’ list using:  
        * company name  
        * contact name  
        * email  
        * phone  
        * type of business  
        * user who added the company  
    * list companies registered with pagination, 10 per page  
      * Each line should display:  
        * Company name  
        * Contact name  
      * When clicked, it should open a client page with all the client’s info  
* Client page:  
  * Display all the client info  
  * Button to delete a client  
    * Only logged users can delete a company  
      * Delete button  
        * When you click on a button, you need to confirm the deletion by typing ‘delete’ in a text input field  
  * Button to edit a client  
    * Only logged users can edit a company  
      * Edit any info about the client  
      * Last edited by: automatically update the field, grab the logged user ‘username’  
* Add a client  
  * Company name, contact name, role, phone, email, linkedin, website URL, type of business, status, added by, last edited by  
    * Company name: text input field  
    * Contact name: text input field  
    * Role: text input field  
    * Phone: text input field  
    * Email: email input field  
    * Website URL: text input field  
    * Type of business: text input field  
    * Status: textarea input field  
    * Added by: automatically grab the logged user ‘username’  
    * Last edited by: automatically grab the logged user ‘username’  
  * Only the company name is mandatory to add a company  
* Add security measures to avoid any exploit of the project. List the most recommended security measures and plan their implementation


