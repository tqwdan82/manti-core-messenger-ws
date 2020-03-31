/** 
 * 
 **/
//server libraries
const utils = require('../../../../../server/util/utils.js');
const logger = utils.logger() // logger object

//operation object
const operation = {
    /** 
     * 
     * Header configuration requirement
     * modify this based on the requirements
     * 
     * 
    */
    headerConfig : {
        'Content-Type': 'application/json'
    },
    /** 
     * 
     * Input data validation
     * modify this based on the requirements
     * 
     * 
    */
    inputValidation : function(data)
    {
        // if( !(typeof data.model === 'string')) // if model is not string
        // {  
        //     logger.info("Input model name is not string");
        //     return false;
        // }

        return true;
    },
    //operation object
    loadWebOperation: function(serviceManager, httpObj)
    {
        //operation implementation
        
        /** 
         * 
         * OPERATION IMPLEMENTATION STARTS HERE
         * 
         * 
        */
        var inputData = httpObj.request.body;
        var handler = function(){
            //httpObj.responseData = {"data":data}; //set the response data
            httpObj.responseData = {
                status: "Ok",
                message: "Operation completed."
            }
            httpObj.completeHttpResponse(httpObj); // respond to the http call   
        }
        serviceManager.callOperation("maestro", "serviceops", "delServiceOperation", inputData, handler, httpObj.request.mcHeader);
        /** 
         * 
         * OPERATION IMPLEMENTATION ENDS HERE
         * 
         * 
        */
    }
    
}

module.exports = {
    operation:operation
};
