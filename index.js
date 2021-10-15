/*SEction that run the api*/

//Depencencies(Node built in modules)
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./lib/config');
const fs = require('fs');
const _data = require('./lib/data')
const handlers = require('./lib/handlers')
const helpers = require('./lib/helpers')

//@TODO
// _data.delete('test', 'newFile', (err)=>{
//     console.log("This is was the error ", err);
// })


//Instantiate Http Server
const httpServer = http.createServer((req, res)=>{
    unifiedServer(req, res);
    
});

//Tell server to listen on port
httpServer.listen(config.httpPort, ()=>{
    console.log("The server is listing on port "+config.httpPort+ " in " +config.envName+" mode")
})

//Create the Https server Option
let httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
}

//Instantiate Https Server
const httpsServer = https.createServer(httpsServerOptions, (req, res)=>{
    unifiedServer(req, res);
});

//Tell server to listen on port
httpsServer.listen(config.httpsPort, (req, res)=>{
    console.log("The server is listing on port "+config.httpsPort+ " in " +config.envName+" mode")
})


//All the servers logic for both http and https Server
const unifiedServer = (req, res)=>{

    //Get the url and parse
    let parseUrl = url.parse(req.url, true)

    //Get the path
    let path = parseUrl.pathname;
    let trimPath = path.replace(/^\/+|\/+$/g,'');

    //Get the query string object
    let queryStringObject = parseUrl.query;

    //Get Http method
    let method = req.method.toLowerCase();

    //Get the header as an object
    let headers = req.headers

    //Set the payload
    let decoder = new StringDecoder('utf-8');
    let buffer = ''
    req.on('data', (data)=>{
        buffer += decoder.write(data);
    });
    req.on('end', ()=>{
        buffer += decoder.end();
        
        //chose the handler to route base on the request supply
        let chooseHandler = typeof(router[trimPath]) !== 'undefined' ? router[trimPath] : handlers.notFound;

        //Construct the data to send to the choosen handler
        let data = {
            'trimPath': trimPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': helpers.parseToJSON(buffer)
        }

        //Route the request to the handler specify by the router
        chooseHandler(data, (statusCode, payload)=>{
            //Use the stauts callback by the handler or default to 200
            statusCode = typeof(statusCode) === 'number' ? statusCode : 200;

            //Use the status calleback by the payload or default to empty object
            payload = typeof(payload) === 'object' ? payload : {};

            //Convert the payload to a string
            let payloadString = JSON.stringify(payload);

            //Return the response with json formatt
            res.setHeader('Content-Type','application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
            //Log the request
            console.log("Returning with: ",statusCode,payloadString);
        })

    });

}


/***********************************OUTSIDE OF THE SERVER THE ROUTES ARE DEVELOP*****************************************/


//get the requeste route
let router = {
    'ping': handlers.ping,
    'users': handlers.users,
    'tokens': handlers.tokens,
    'sample': handlers.sample
}