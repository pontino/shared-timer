# Shared timer online

Shared timer online is a timer, shared and online. Np.

## Commands

Install dependencies:

`npm install`

Build: 

`npm run build`

Start the built project: 

`npm start`

Develop:

`npm run start:dev`


# Docker

## Build

Build can be easily done by running:

`sh build.sh`

### Build args

`AUTO_DETECT_BASE_URL (default: *false*)`

Leave to *false* if if the timer is running on a FQDN directly, without a subpage (e.g. https://www.example.com)

Set to true if you need to run the timer in an URL like *https://www.example.com/myamazingsharedtimer*

`API_URL (default: not set because autodetected)`

Define the URL where the shared-timer is used, when `AUTO_DETECT_BASE_URL` is set to *true*.
e.g.: *https://www.example.com/myamazingsharedtimer*

These two variables can be passed during the build phase:

`sh build.sh <true|false> <https://www.example.com/myamazingsharedtimer>`

