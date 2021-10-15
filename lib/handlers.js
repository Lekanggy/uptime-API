
//Dependencies
const _data = require('./data');
const helper = require('./helpers');

//handlers
let handlers = {}

// //sample handler
// handlers.sample = (data, callback)=>{
//     //callback http status code and payload object
//     callback(406, {'name': 'sample'})

// }

//Ping handler
handlers.ping = (data, callback)=>{
    callback(200)
}

//User route
handlers.users = (data, callback)=>{
    let acceptableMethod = ['post', 'get', 'put', 'delete']
    if (acceptableMethod.indexOf(data.method) > -1){
        handlers._user[data.method](data, callback);
    } else {
        callback(405)
    }
}

//Container for the user sub route
handlers._user = {}

//User get
//Only let the authenticated user access ther object
handlers._user.get = (data, callback) => {
    let phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length === 10 ? data.queryStringObject.phone.trim() : false;
    if (phone) {
        let token = typeof(data.headers.token) === 'string' ? data.headers.token : false;
        handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
            if (tokenIsValid) {
                _data.read('users', phone, (err, result) => {
                    if (result) {
                        //Remove the hash password
                        delete result.password
                        callback(200, result)
                    } else {
                        
                        callback(500, { "Error": "Server error" })
                    }
                });
            } else {
                callback(403, {"Error": "Missing token header or token is invalid"})
            }
        })
        
    } else {
        callback(400, { "Error": "Users does exit" })
    }
    
}

//User post
handlers._user.post = (data, callback)=>{
   //Check the payload coming 
    let firstname = typeof (data.payload.firstname) === 'string' && data.payload.firstname.trim().length > 0 ? data.payload.firstname : false;
    let lastname = typeof (data.payload.lastname) === 'string' && data.payload.lastname.trim().length > 0 ? data.payload.lastname : false;
    let phone = typeof (data.payload.phone) === 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone : false;
    let password = typeof (data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password : false;
    let tosAgreement = typeof (data.payload.tosAgreement) === 'string' && data.payload.tosAgreement.trim() === 'true' ? true : false;

    console.log(`${firstname}, ${lastname}, ${phone}, ${password}, ${tosAgreement}`)

    if (firstname && lastname && phone && password && tosAgreement) {
        console.log("good")
        _data.read('users',phone, (err, data) => {
            if (err) {
                let hashPassword = helper.hash(password)

                if (hashPassword) {

                    //create user objet
                    let userObject = {
                        'firstname': firstname,
                        'lastname': lastname,
                        'phone': phone,
                        'password': hashPassword,
                        'tosAgreement': tosAgreement
                    }

                    //Create the user
                    _data.create('users', phone, userObject, (err) => {
                        if (!err) {
                            callback(200)
                        } else {
                            console.log(err)
                            callback(500, {'Error': 'User cannot be created'})
                        }
                    })
                    
                }
                
                
            } else {
                callback(500, {'Error': 'User already exit with the account'})
             }
        })
    } else {
        callback(500, {"Error": "Payload data cannot be read due to missing reqired field"})
    }
 
}

//User put
handlers._user.put = (data, callback) => {
    //Check if phone  exist
    let phone = typeof (data.payload.phone) === 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone : false;

    //Collect other data format
    let firstname = typeof (data.payload.firstname) === 'string' && data.payload.firstname.trim().length > 0 ? data.payload.firstname : false;
    let lastname = typeof (data.payload.lastname) === 'string' && data.payload.lastname.trim().length > 0 ? data.payload.lastname : false;
    let password = typeof (data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password : false;

    //If phone number is valid
    if (phone) {
        if (firstname || lastname || password) {
            //Veriy the token user
            let token = typeof(data.headers.token) === 'string' ? data.headers.token : false;
            handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
                if (tokenIsValid) {
                    _data.read('users', phone, (err, userData) => {
                        if (userData) {
                            console.log(userData)
                            if (firstname) {
                                userData.firstname = firstname;
                            }
                            if (lastname) {
                                userData.lastname = lastname;
                            }
                            if (password) {
                                userData.password = helper.hash(password);
                            }
                            //Store the new update
                            _data.update('users', phone, userData, (err) => {
                                if (!err) {
                                    callback(200)
                                } else {
                                    console.log(err)
                                    callback(500, { "Error": "Couldnot update users info" })
                                }
                            })
                        } else {
                            callback(400, { "Error": "Phone number does not exist" })
                        }
                    });
                    
                } else {
                    callback(403, { "Error": "Missing token header or token is invalid" });
                }
            });
               
        } else {
            callback(400, {"Error": "missing field required"})
        }
        
    } else {
        callback(400, {"Erorr": "Phone number does not match"})
    }
    
    
}

//User delete
handlers._user.delete = (data, callback) => {
    //Check phone
    let phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length === 10 ? data.queryStringObject.phone.trim() : false;
    if (phone) {

        let token = typeof(data.headers.token) === 'string' ? data.headers.token : false;
        handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
            if (tokenIsValid) {
                _data.read('users',phone,(err, result) => {
                    if (result) {
                        //delete user
                        _data.delete('users', phone, (err) => {
                            if (!err) {
                                callback(200, { "Msg": "User deleted successfully" })
                            } else {
                                callback(500, {"Error": "Could not delete the specfic user"})
                            }
                         })
                    } else {
                        
                        callback(500, {"Error": "Could read the user data"})
                    }
                })
                
            } else {
                callback(403, { "Error": "Missing token header or token is invalid" });
            }
        })
        
    } else {
        callback(400, { "Error": "Users does exit" })
    }
    
}
/*********************** TOKEN SECTION ********************************/
//Handlers Token
handlers.tokens = (data, callback)=>{
    let acceptableMethod = ['post', 'get', 'put', 'delete']
    if (acceptableMethod.indexOf(data.method) > -1){
        handlers._tokens[data.method](data, callback);
    } else {
        callback(405)
    }
}

//Container Tokens
handlers._tokens = {}

//Token - Post
//Reqiured phone and password
handlers._tokens.post = (data, callback) => {
    //Get the phone number and password
    let phone = typeof (data.payload.phone) === 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone : false;
    let password = typeof (data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password : false;

    if (phone && password) {
        //Read the date
        _data.read('users', phone, (err, userData) => {
            if (userData) {
                let hashPassword = helper.hash(password)
                if (hashPassword === userData.password) {
                    let tokenId = helper.createRandomString(20);
                    let expires = Date.now() + 1000 * 60 * 60;
                    let userObject = {
                        "id": tokenId,
                        "phone": phone,
                        "expires": expires
                    };
                    //Store the user object
                    _data.create("tokens", tokenId, userObject, (err, tokenObject) => {
                        if(!err) {
                            callback(200,tokenObject)
                        } else {
                            callback(500, {"Error": "Unable to create token"})
                        }
                    })
                } else {
                    callback(400, {"Eror": "Incorrect pasword"})
                }
                
            } else {
                callback(400, {"Error": "Could not locate the user"})
            }
        })
        
    } else {
        callback(400, {"Error": "Missing required field(s)"})
    }
    
}

//Token - Get
handlers._tokens.get = (data, callback) => {
    let id = typeof(data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim().length === 20 ? data.queryStringObject.id.trim() : false;
    if (id) {
        _data.read("tokens", id, (err, result) => {
            if (result) {
                callback(200, result)
            } else {
                
                callback(500, {"Error": "Server error"})
            }
        })
    } else {
        callback(400, { "Error": "Users does exit" })
    }
    
}

//Token - Put
//Required data: id, extend
// Optio: none
handlers._tokens.put = (data, callback) => {
    let id = typeof (data.payload.id) === 'string' && data.payload.id.trim().length === 20 ? data.payload.id.trim() : false;
    let extend = typeof (data.payload.extend) === 'string' && data.payload.extend === 'true' ? true : false;

    //Check if id and extend
    if (id && extend) {
        //Read the data
        _data.read("tokens", id, (err, tokenData) => {
            if (tokenData) {
                //Check if token is not expire
                if (tokenData.expires > Date.now()) {
                    //Set the expiration date
                    tokenData.expires = Date.now() + 1000 * 60 * 60;
                    _data.update("tokens", id, tokenData, (err) => {
                        if (!err) {
                            callback(200, {"msg": "Expiration extended successfully" })
                        } else {
                            callback(500, {"Error": "Token can not be updated"})
                        }
                    })
                    
                } else {

                    callback(400, { "Error": "You can not update an expire token" })
                }
            } else {
                callback(400, {"Error": "Token does not exist"})
            }
        })
    } else {
        callback(400, {"Error": "Missing required fields"})
    }
    
}

//Token -Delete
handlers._tokens.delete = (data, callback) => {
    //Look up the data by id
    let id = typeof(data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim().length === 20 ? data.queryStringObject.id.trim() : false;
    
    if (id) {
        _data.read("tokens", id, (err, tokenData) => {
            if (tokenData) {
                _data.delete("tokens", id, (err) => {
                    if (!err) {
                        callback(200, { "Msg": "Data deleted successfully" })
                    } else {
                        callback(500, {"Error": "Data cannot be deleted"})
                    }
                })
            } else {
                callback(400, {"Error": "User does not exit"})
            }
        })
    } else {
        callback(400, {"Error": "User missing requierd field"})
    }
}

//Verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = (id, phone, callback) => {
    //Look up the tokekn
    _data.read("tokens", id, (err, tokenData) => {
        if (tokenData) {
            //check that the token is not expire and the phone number is correct
            if (tokenData.phone === phone && tokenData.expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
}



//default 404
handlers.notFound = (data, callback)=>{
    callback(404)
}

module.exports = handlers