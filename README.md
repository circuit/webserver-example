# webserver-example
Example node.js web application to access the [circuit REST API](https://circuitsandbox.net/rest/v2/swagger). 
The example shows how to authenticate using OAuth2 without any library and then perform REST calls.

## Getting Started

### Register an application
Until the developer portal is ready to self-register an application, register using the form at https://circuit.github.io/oauth.html.

### Run the example
* Rename config.json.template to config.json and add your `client_id` and `client_secret`.
* Change the host and listening port if the app is not hosted at http://localhost:7007

```bash
    git clone https://github.com/circuit/webserver-example.git
    cd webserver-example
    // Rename config.json.template to config.json and add your `client_id` and `client_secret`
    // Change the host and listening port if the app is not hosted at http://localhost:7007
    npm install
    node index.js
``` 


 
