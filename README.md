# Google Analytics for Google Glass

View your analytics on Google Glass.

##Prerequisites

* Google Glass w/ access to Mirror API
* Node.js and NPM

## Installation

`npm install` or `npm install express googleapis moment`

## Configuration

* Create a new [Google APIs Project](https://code.google.com/apis/console)
* Enable the Google Mirror API
* Enable the Google Analytics API
* Create an OAuth 2.0 client ID for a web application
* Enter your server's hostname and port in [app.js](https://github.com/chadsmith/glass-analytics/blob/master/app.js#L7-L10)
* Enter your Mirror API credentials in [app.js](https://github.com/chadsmith/glass-analytics/blob/master/app.js#L11-L14)
* Change `UA-XXXXX-X` to your site's ID in [app.js](https://github.com/chadsmith/glass-analytics/blob/master/app.js#L180)
* Add more lines of `updateAnalytics('UA-XXXXX-X');` to track additional sites

## Usage

`node app` or `forever start app.js`

* Authorize the app by visiting http://hostname:port/ on your computer
* View analytics in your Glass timeline

## TODO

* Perhaps a settings page to add profiles from the web?