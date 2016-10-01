# webserver-example
Example node.js web application to access the [circuit REST API](https://circuitsandbox.net/rest/v2/swagger). 
The example shows how to authenticate using OAuth2 without any library and then perform REST calls.

## Beta
The circuit REST API and related examples are in Beta. While we are in Beta, we may still make incompatible changes. 

## Getting Started

### Register an application
Until the developer portal is ready to self-register an application, contact [Roger Urscheler](mailto:roger.urscheler@unify.com). 

### Run the example
Edit index.js
* Add client_id (aka application id, consumer key or app key)
* Add secret (aka as consumer secret)
* Optionally change the app domain and listening port

```bash
    git clone https://github.com/yourcircuit/webserver-example.git
    cd webserver-example
    npm install
    node index.js
``` 


 
