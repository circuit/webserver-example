'use strict';
var http = require('http');
var express = require('express');
var Session = require('express-session');
var request = require('request');
var randomstring = require('randomstring');

const Domain = 'https://circuitsandbox.net'

// OAuth configuration
const ClientId = '<client_id>';
const ClientSecret = '<secret>';
const RedirectUri = 'http://localhost:7100/oauthCallback';
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
    request.get(`${Domain}/rest/v2/users/profile`, {
        'auth': { 'bearer': req.session.access_token }
    }, (err, httpResponse, body) => res.send(body));
});

app.get('/conversations', auth, (req, res) => {
    request.get(`${Domain}/rest/v2/conversations`, {
        'auth': { 'bearer': req.session.access_token }
    }, (err, httpResponse, body) => res.send(body));
});

app.get('/logout', (req, res) => {
    req.session.isAuthenticated = false;
    req.session.access_token = null;
    res.redirect('/');
});

app.use('/oauthCallback', (req, res) => {
console.log(req.sessionID)
    if (req.query.code && req.session.oauthState === req.query.state) {
        request.post({
            url: `${Domain}/oauth/token`,
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
        let url = `${Domain}/oauth/authorize?scope=${Scopes}&state=${state}&redirect_uri=${redirectUri}&,response_type=code&client_id=${ClientId}`;
        // Save state in session and check later to prevent CSRF attacks
        req.session.oauthState = state;
        res.send(`<a href=${url}>Login to Circuit</a>`);
    }
});

var port = 7100;
var server = http.createServer(app);
server.listen(port);
server.on('listening', () => console.log(`listening on ${port}`));