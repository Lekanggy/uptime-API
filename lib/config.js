/*
* Create and export configuration enviroment
*
*
*/

// Container for all enviroment
let  enviroments = {}

//Set stagging to default env
enviroments.staging = {
    'httpPort': 3000,
    'httpsPort': 3001,
    'envName': 'staging',
    'hashingSecret': 'thisisAsecret'
}

//Set the production enviroment

enviroments.production = {
    "httpPort": 5000,
    "httpsPort": 5001,
    "envName": "production",
    "hashingSecret": "thisisAlsoAsecret"
}

//Determine which enviorment is passed from the command-line, if not set to empty string
let currentEnviroment = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : '';

//Determine which enviroment to exports, else default to staging
let enviromentToExport = typeof(enviroments[currentEnviroment]) === 'object' ? enviroments[currentEnviroment]: enviroments.staging;

//Export the enviiromet 
 module.exports = enviromentToExport;