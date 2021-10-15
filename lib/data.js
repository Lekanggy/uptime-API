//Create the data to be written to file

//Dependencies
let fs = require('fs');
let path = require('path');
let helpers = require('./helpers')

//Create a container to hold the data we are creating
let lib = {};

//Based dir of the data folder
lib.baseDir = path.join(__dirname, '/../.data/');

//Write data to file based on the category/dir
lib.create = function(dir, file, data, callback){
    //Write data to file
    fs.open(lib.baseDir+dir+'/'+file+'.json','wx', (err, fileName)=>{
        if(!err && fileName){
            //convert data to json string for reading in file
            let stringData = JSON.stringify(data)

            //write data to file
            fs.writeFile(fileName, stringData, (err)=>{
                if(!err){
                    fs.close(fileName, (err)=>{
                        if(!err){
                            callback(false);
                        }else{
                            callback("Error closing the file");
                        }
                    })
                }else{
                    callback("Error writing to new file");
                }
            })
        }else{
            callback("Could not create new file, the data may have already exist");
        }
    });
};

//Read file from directory
lib.read = function(dir, file, callback){
    fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf-8', (err, data) => {
        if (!err) {
            let parseData = helpers.parseToJSON(data)
            callback(200, parseData)
            
        } else {
            callback(404, err)
        }
        
    });
}

//Update file
lib.update = function(dir, file, data, callback){
    
    //Open the file before updating
    fs.open(lib.baseDir+dir+'/'+file+'.json','r+', (err, fileData)=>{
        let stringData = JSON.stringify(data);
        if(!err && fileData){

            //Truncate the data(Check the file if exit and write to it)
            fs.ftruncate(fileData, (err)=>{
                if(!err){
                    fs.writeFile(fileData,stringData, (err)=>{
                        if(!err){
                            fs.close(fileData, (err)=>{
                                if(!err){
                                    callback(false)
                                }else {
                                    callback("Error closing the file")
                                }
                            })
                        }else {
                            callback("Error wrtitng to the file")
                        }
                    });
                }else{
                    callback('Could not complete the operation')
                }
            });
        } else {
            callback("File does not exit for updating")
        }
    })
}

//Delete file
lib.delete = function(dir, file, callback){
    fs.unlink(lib.baseDir+dir+'/'+file+'.json', (err)=>{
        if(!err){
            callback(false)
        } else {
            callback("Error deleting the file")
        }
    })
}


module.exports = lib