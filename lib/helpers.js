/****
* 
* Helper library for various task
*
*
*/

//Dependencies
let crypto = require('crypto')
let config = require('./config')

//Container for all helpers
let helpers = {}

//Hash password
helpers.hash = (str) => {
    if (typeof (str) === 'string' && str.length > 0) {
        let hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
        return hash;
    } else {
        return false;
    }
}

//Pare to string

helpers.parseToJSON = (str)=>{
    try {
        let parserObject = JSON.parse(str)
        return parserObject;
    } catch (e) {
        return {};
    }
}

//Create a romdom string character of lenth given
helpers.createRandomString = (strlength) => {
    let stringLength = typeof (strlength) === 'number' && strlength > 0 ? strlength : false;
    if (stringLength) {
        let possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789$%&';
        let str = '';
        //get the random string from possible string
        for (let i = 1; i <= stringLength; i++) {
            let randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            str += randomCharacter;
        }
        return str;
    } else {
        return false;
    }
    
}

module.exports = helpers