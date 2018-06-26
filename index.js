'use strict';
var http = require('http');
var express = require('express');
var Session = require('express-session');
var request = require('request');
var config = require('./config.json');
var randomstring = require('randomstring');

// Circuit REST API is in beta and only available on the sandbox at this time
const CircuitDomain = 'https://' + config.circuit.domain;

// Domain and port this app is running at
const AppDomain = config.app.host;
const AppPort = config.app.port;

// OAuth2 configuration
const ClientId = config.circuit.client_id;
const ClientSecret = config.circuit.client_secret;
const RedirectUri = `${AppDomain}:${AppPort}/oauthCallback`;
const Scopes = 'READ_USER_PROFILE,READ_CONVERSATIONS';

var app = express();
app.use(Session({
    secret: 'secret-6525474832',
    resave: true,
    saveUninitialized: true
}));

function auth(req, res, next) {
  req.session.isAuthenticated ? next() : res.redirect('/');
}

app.get('/profile', auth, (req, res) => {
    request.get(`${CircuitDomain}/rest/v2/users/profile`, {
        'auth': { 'bearer': req.session.access_token }
    }, (err, httpResponse, body) => res.send(body));
});

app.get('/conversations', auth, (req, res) => {
    request.get(`${CircuitDomain}/rest/v2/conversations`, {
        'auth': { 'bearer': req.session.access_token }
    }, (err, httpResponse, body) => res.send(body));
});

app.get('/logout', (req, res) => {
    req.session.isAuthenticated = false;
    req.session.access_token = null;
    res.redirect('/');
});

app.use('/oauthCallback', (req, res) => {
    if (req.query.code && req.session.oauthState === req.query.state) {
        request.post({
            url: `${CircuitDomain}/oauth/token`,
            form: {
                client_id: ClientId,
                client_secret: ClientSecret,
                redirect_uri: RedirectUri,
                grant_type: 'authorization_code',
                code: req.query.code
            }
        }, (err, httpResponse, body) => {
            if (!err && body) {
                req.session.access_token = JSON.parse(body).access_token;
                req.session.isAuthenticated = true;
                res.redirect('/');
            } else {
                res.send(401);
            }
        });
    } else {
        // Access denied
        res.redirect('/');
    }
});

app.get('/', (req, res) => {
    if (req.session.isAuthenticated) {
        res.send(`
            <a href='/profile'>Get my profile</a>
            <br><a href='/conversations'>Get my conversations</a>
            <br><a href='/logout'>Logout</a>
        `);   
    } else {
        let redirectUri = encodeURIComponent(RedirectUri);
        let state = randomstring.generate(12);
        let url = `${CircuitDomain}/oauth/authorize?scope=${Scopes}&state=${state}&redirect_uri=${redirectUri}&response_type=code&client_id=${ClientId}`;
        // Save state in session and check later to prevent CSRF attacks
        req.session.oauthState = state;
        res.send(`<a href=${url}>Login to Circuit</a>`);
    }
});

var server = http.createServer(app);
server.listen(AppPort);
server.on('listening', () => console.log(`listening on ${AppPort}`));
