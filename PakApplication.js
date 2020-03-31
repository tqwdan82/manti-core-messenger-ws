const fs = require('fs')
const path = require('path')
var os = require('os');

require('dotenv').config();
var express = require('express');
const crypto = require('crypto');
const WebSocket = require('ws');
const AppMessage = require('../../server/util/AppMessage.js');

const authenticatedConn = {};
const unvalidatedConn = {};
const extReconnInt = {};
var wss, recieve;

const pakDetails = {
    "AI_Enabled": false,
    "VI_Enabled": false,
    "WI_Enabled": false,
    "DBI_Enabled": false,
    "pakCode":"MCP_MWS_0_0_1",
    "Name":"Manti-core Messenger(Web Socket) Package",
    "Description": "This is a module used for distributed Manti-core messaging setup.",
    "WebContext": "messenger-ws",
    "AppName": "messenger-ws"
}

//function to verify the platform key passed from incomming connection
// const verifyInKey = function(inKey){

//     let mykey = crypto.createDecipher('aes-128-cbc', process.env.DATA_ENCRYPT_SECRET);
//     let platformKeyDecrypted = mykey.update(inKey, 'hex', 'utf8')
//     platformKeyDecrypted += mykey.final('utf8');
//     if(platformKeyDecrypted === platformKey){
//         return true;
//     }else{
//         return false;
//     }

// };

// //function generate encrypted platform key
// const genOutKey = function(){
//     let mykey = crypto.createCipher('aes-128-cbc', process.env.DATA_ENCRYPT_SECRET);
//     let platformKeyEncrypted = mykey.update(platformKey, 'utf8', 'hex');
//     platformKeyEncrypted += mykey.final('hex');

//     return platformKeyEncrypted;
// };

//function to encrypt content
const encryptContent = function(content){
    let mykey = crypto.createCipher('aes-128-cbc', process.env.DATA_ENCRYPT_SECRET);
    let contentEncrypted = mykey.update(content, 'utf8', 'hex');
    contentEncrypted += mykey.final('hex');

    return contentEncrypted;
};

const decryptContent = function(content){

    let mykey = crypto.createDecipher('aes-128-cbc', process.env.DATA_ENCRYPT_SECRET);
    let contentDecrypted = mykey.update(content, 'hex', 'utf8')
    contentDecrypted += mykey.final('utf8');

    return contentDecrypted;
};

//testing
// setInterval(function(){
//     console.log("test broadcasting to all socks..." + Object.keys(authenticatedConn));
//     // console.log(authenticatedConn)
//     // Object.keys(authenticatedConn).forEach(function(socketKey){
//     //     let socket = authenticatedConn[socketKey];
//     //     // let appMsg = new AppMessage("testTopic",{"msg":"Hi "+socketKey+"..."});
//     //     let appMsg = new AppMessage("web",{ 
//     //             "subject":"testTopic",
//     //             "content":"Hi "+socketKey+"..."
//     //         },

//     //     );
//     //     socket.send( JSON.stringify(appMsg.getMessage()) );
//     // });

//     let appMsg = new AppMessage("web",{ 
//             "subject":"testTopic",
//             "content":"Hi from " + getIp()+"-"+selfPort
//         },
//         getIp()+"-"+selfPort
//     );
//     send(appMsg);

// },5000);

//Manual create websocket connection
const createConnection = function(ip, port){
    let listenSocket = new WebSocket("ws://"+ip+":"+port);
    
    listenSocket.on('open', function open() {
        let messageObj = {
            type:"conn",
            port:selfPort,
            key:process.env.KEY
        };

        listenSocket.send(encryptContent(JSON.stringify(messageObj)))
        // authenticatedConn[ip +"-"+ port] = listenSocket;
        unvalidatedConn[ip +"-"+ port] = listenSocket;

        //handle normal recieve message
        listenSocket.on('message', function incoming(data) {
            try{
                if(typeof authenticatedConn[ip+"-"+port] !== 'undefined'){
                    let decryptedMessage = decryptContent(data);
                    recieve(decryptedMessage);
                } else {
                    let decryptedMessage = decryptContent(data);
                    let dataObj = JSON.parse(decryptedMessage)
                    if(dataObj.type === 'validated'){
                        authenticatedConn[ip+"-"+port] = unvalidatedConn[ip+"-"+port]
                        delete unvalidatedConn[ip+"-"+port];
                    }
                }
            }catch(err){
                console.log(err);
            }
        });

        //handle close connection
        listenSocket.on('close', function close() {
            console.log(ip+":"+port+' disconnected 2');
            delete authenticatedConn[ip +"-"+ port];
        });
       
    });

    

     //handle connection error
     listenSocket.on('error', (err) => {
        console.log("[Initial] Error connecting to " +ip + ":" + port);
        extReconnInt[ip+":"+port] = setInterval(function(){
            if(typeof authenticatedConn[ip+"-"+port] === 'undefined'){

                listenSocket = new WebSocket("ws://"+ip+":"+port);
                listenSocket.on('open', function open() {
                    let messageObj = {
                        type:"conn",
                        port:selfPort,
                        key:process.env.KEY
                    };
        
                    listenSocket.send(encryptContent(JSON.stringify(messageObj)))
                    // authenticatedConn[ip +"-"+ port] = listenSocket;
                    unvalidatedConn[ip +"-"+ port] = listenSocket;
                    clearInterval(extReconnInt[ip+":"+port]);

                    listenSocket.on('message', function incoming(data) {
                        if(typeof authenticatedConn[ip+"-"+port] !== 'undefined'){
                            
                            let decryptedMessage = decryptContent(data);
                            recieve(decryptedMessage);
                        } else {
                            let decryptedMessage = decryptContent(data);
                            let dataObj = JSON.parse(decryptedMessage)
                            if(dataObj.type === 'validated'){
                                authenticatedConn[ip+"-"+port] = unvalidatedConn[ip+"-"+port]
                                delete unvalidatedConn[ip+"-"+port];
                            }
                        }
                    });
                });

                listenSocket.on('error', (err) => console.log("Error connecting to " +ip + ":" + port));
            
                //handle close connection
                listenSocket.on('close', function close() {
                    console.log(ip+'-'+ port+' disconnected 3');
                    delete authenticatedConn[ip +"-"+ port];
                });
            }
        },5000);
    });
    
}

// get current host's interface IP
const getIp = function(){
    var ifaces = os.networkInterfaces();
    let returnIpAddress = '';
    Object.keys(ifaces).forEach(function (ifname) {
        var alias = 0;
        
        ifaces[ifname].forEach(function (iface) {
            if ('IPv4' !== iface.family || iface.internal !== false) {
            // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
            return;
            }
            if(ifname === process.env.NODE_INTF_NAME){
                if (alias >= 1) {
                // this single interface has multiple ipv4 addresses
                returnIpAddress = iface.address;
                // console.log(ifname + ':' + alias, iface.address);
                } else {
                // this interface has only one ipv4 adress
                returnIpAddress = iface.address;
                // console.log(ifname, iface.address);
                }
            }
            ++alias;
        });
    });

    return returnIpAddress
}

var selfIP = getIp();
var selfPort = process.env.NODE_MSG_WS_PORT;
const platformKey = process.env.KEY

//send function for platform Messenger to call send
const send = function(appMessage){
    if(!(appMessage instanceof AppMessage)){
        throw "Input is not of type AppMessage";
    }

    Object.keys(authenticatedConn).forEach(function(socketKey){
        let socket = authenticatedConn[socketKey];
        socket.send( encryptContent(JSON.stringify(appMessage.getMessage())) );
    });
} ;

//construct sender object to register with platform Messenger
const sender = {
    send: send,
    source: getIp()+"-"+selfPort
};

const init = function(dbMgr, svcMgr, webMgr, appMessenger){
    PakManager.dbMgr = dbMgr;
    PakManager.svcMgr = svcMgr;
    PakManager.webMgr = webMgr;

    recieve = appMessenger.recieverHandler;

    //start the WS
    wss = new WebSocket.Server({ port: process.env.NODE_MSG_WS_PORT })
    console.log("Messenger(Web Socket) Input opened on port " + process.env.NODE_MSG_WS_PORT);
    wss.on('connection', (socket, req) => {
        console.log("incoming connection....")
        let peerAdd = req.connection.remoteAddress;
        let peerAddArr = peerAdd.split(":");
        let peerId = peerAddArr[peerAddArr.length-1];
        let peerPort = "";
        socket.on('message', message => {

            //handle incoming message
            let messageObj;
            try{
                let decryptedMessage = decryptContent(message);
                messageObj = JSON.parse(decryptedMessage);
                //check if incoming message is to form a new connection
                //or to push a message in            
                if(typeof messageObj !== 'undefined'
                && typeof messageObj.type !== 'undefined'
                && messageObj.type === "conn" //check is a conn request
                && (typeof messageObj.key !== 'undefined' 
                    && messageObj.key === platformKey ))//verify key
                {
                    authenticatedConn[peerId+"-"+messageObj.port] = socket;
                    let returnMsgObj = {};
                    returnMsgObj.type = 'validated';
                    returnMsgObj.port = process.env.NODE_MSG_WS_PORT;
                    returnMsgObj.key = process.env.KEY;
                    peerPort = messageObj.port;
                    socket.send( encryptContent(JSON.stringify(returnMsgObj)) );

                }else if(typeof messageObj !== 'undefined'
                && typeof messageObj.type !== 'undefined'
                && messageObj.type === "validated" //check is a conn request
                && (typeof messageObj.key !== 'undefined' 
                    && messageObj.key === platformKey ))//verify key
                {
                    authenticatedConn[peerId+"-"+messageObj.port] = unvalidatedConn[peerId+"-"+messageObj.port];
                    delete unvalidatedConn[peerId+"-"+messageObj.port];
                    peerPort = messageObj.port;

                }else if(typeof messageObj.source !== 'undefined'
                        && typeof authenticatedConn[messageObj.source] !== 'undefined'){

                    recieve(decryptedMessage);

                }else{
                    socket.close();
                }

            }catch(err){
                socket.close();
                console.log("Data cannot be parsed");
                return;
            }

        });

        //handle close connection
        socket.on('close', function close() {
            console.log(peerId +"-"+ peerPort +' disconnected 1');
            delete authenticatedConn[peerId +"-"+ peerPort];
        });
        
    });

    //look at all the package models and create them
    let allAccessObj = { appresources: [ '*' ], dbresources: ['*'] };
    let modelsPath =  path.join(__dirname, 'Models');
    let allPromises = [];
    if (fs.existsSync(modelsPath)) //if the models directory exists
    {
        //get all models file name
        let modFileNames = fs.readdirSync(modelsPath);
        //iterate all models file name
        modFileNames.forEach(function(modFileName) {
            let modelFilePath = path.join(modelsPath, modFileName)
            allPromises.push(PakManager.dbMgr.addModel(modelFilePath, modFileName));
        });
    }
    Promise.all(allPromises).then(function() {
        let peers = [];
        
        PakManager.svcMgr.ServiceManager.callDBOperation.query(
            "MsgWS_Peers", 
            {},
            function(dbResponse){
                if(!dbResponse.data
                    && Array.isArray(dbResponse.data)
                    && dbResponse.data.length === 0){ //cannot find any entry in DB
                    
                    //create entry in DB
                    PakManager.svcMgr.ServiceManager.callDBOperation.create(
                        "MsgWS_Peers", 
                        {
                            "IP": selfIP,
                            "PORT": selfPort,
                            "DTE_ONLINE": new Date()
                        },
                        function(data){console.log("Registered self");},
                        allAccessObj);
            
                
                }else{ //there are entries in DB
                    //initialize connections
                    
                    //check if is self in the result, if not add to peers array
                    let found = false;
                    for(let idx = 0; idx < dbResponse.data.length; idx++){
                        let dbResData = dbResponse.data[idx];
                        // console.log("=====================================>dbResData");
                        // console.log(dbResData);
                        if(dbResData.IP === selfIP
                            && dbResData.PORT === selfPort){
                            found |= true;
                        }else{
                            // peers[dbResData.IP] = dbResData.PORT;
                            peers.push(dbResData);
                        }
                    }

                    if(!found){
                        //create entry in DB
                        PakManager.svcMgr.ServiceManager.callDBOperation.create(
                            "MsgWS_Peers", 
                            {
                                "IP": selfIP,
                                "PORT": selfPort,
                                "DTE_ONLINE": new Date()
                            },
                            function(data){},
                            allAccessObj);

                    }
                }

                //check if a connection with the peer has been formed
                // console.log("==============================>peers");
                // console.log(peers);
                // let keys = Object.keys(peers);
                // for(let ki = 0; ki < keys.length; ki++){
                    // let key = keys[ki];
                    // let peerPort = peers[key];
                for(let pi = 0; pi < peers.length; pi++){   
                    let peerObj = peers[pi];
                    if(!authenticatedConn[peerObj.IP +"-"+ peerObj.PORT]){
                        // console.log("=============================>> Connecting to " + peerObj.IP +":"+ peerObj.PORT)
                        createConnection(peerObj.IP, peerObj.PORT);
                    }
                    
                }
                // Object.keys(peers).forEach(function(key){
                //     let peerPort = peers[key];
                //     console.log("Connecting to " + key +":"+ peerPort)
                //     createListener(key, peerPort);
                // });
            },
            allAccessObj);

    }, function() {
        // one or more failed
        console.log("Cannot create the peer related data.");
    });


    //look at all web app contexts
    let webAppContextsPath =  path.join(__dirname, 'WebApp', "views");
    //get all other scripts and css directories
    let scriptDirs = [];
    if (fs.existsSync(webAppContextsPath)) //if the web app directory exists
    {
        //get all contexts
        let contexts = fs.readdirSync(webAppContextsPath);
        //iterate all context to add scripts and css directoryu
        contexts.forEach(function(context) {
            scriptDirs.push(path.join(webAppContextsPath, context,"main","script"));
            // scriptDirs.push(path.join(webAppContextsPath, context,"main","css"));
            //scriptDirs.push(path.join(webAppContextsPath, context,"pages"));
        });
    }

    //register sender to appMessenger
    appMessenger.registerSender(sender);

    //register the view with the platform
    PakManager.webMgr.registerView({
        contextPath: pakDetails.WebContext,
        directory: webAppContextsPath,
        miscellaneous: scriptDirs
    });
}

const undeploy = function(dbMgr, svcMgr, webMgr){
    //stop all socket connection
    Object.keys(authenticatedConn).forEach(function(socketKey){
        try{
            let socket = authenticatedConn[socketKey];
            socket.close();
        }catch(err){
            console.log("Socket connection cannot be closed")
        }
    });

    //close websocket server
    wss.close(function(){
        console.log("Messenger(Web Socket) closed.");
        appMessenger.deregisterSender();
    });
}

const PakManager = {
    init:init,
    undeploy: undeploy,
    pakDetails:pakDetails
};

module.exports = PakManager;