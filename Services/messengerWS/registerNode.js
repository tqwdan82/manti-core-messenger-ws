var os = require('os');

const operation = {
    loadOperation: function(serviceManager, inputs, callback, mcHeader){
        
        let processCallback = function(data){

            let returnData = {};
            returnData["status"] = "Ok";
            returnData["details"] = "Account creation completed.";
            returnData["data"] = data;

            callback(returnData);

        };

        var ifaces = os.networkInterfaces();
        Object.keys(ifaces).forEach(function (ifname) {
            var alias = 0;
          
            ifaces[ifname].forEach(function (iface) {
              if ('IPv4' !== iface.family || iface.internal !== false) {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return;
              }
          
              if (alias >= 1) {
                // this single interface has multiple ipv4 addresses
                console.log(ifname + ':' + alias, iface.address);
              } else {
                // this interface has only one ipv4 adress
                console.log(ifname, iface.address);
              }
              ++alias;
            });
          });

        //serviceManager.callDBOperation.create("MsgWS_Peers", inputs, processCallback);
        
    }
};

module.exports = operation;