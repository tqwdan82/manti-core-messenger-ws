require('dotenv').config();
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
    headerConfig : {},
    /** 
     * 
     * Input data validation
     * modify this based on the requirements
     * 
     * 
    */
    inputValidation : function(data)
    {
        var check = true;
        return check;
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
        let dataFormatter = function(inData)
        {
            let returnData = {
                resource:[],
                customized:[]
            };

            let allResActionObj = {};
            let allCustomisedActionObj = {};
            //action type loop
            Object.keys(inData).forEach(function(actionType)
            {
                //get the list of APIs by the action type
                let apis = inData[actionType];
                // console.log("------------------------apis: "+ actionType)
                // console.log(apis);
                
                //iterate all the apis
                apis.forEach(function(api)
                {
                    
                    let apiName = "";
                    let apiType = "";
                    let apiDescription = "";
                    //api details loop
                    Object.keys(api).forEach(function(apiDescriptor)
                    {
                        if(apiDescriptor === 'apiName')
                        {
                            apiName = api[apiDescriptor];
                        }

                        if(apiDescriptor === 'apiType')
                        {
                            apiType = api[apiDescriptor];
                        }

                        if(apiDescriptor === 'description')
                        {
                            apiDescription = api[apiDescriptor];
                        }
                    });
                    
                    if(apiType === 'resource')
                    { // if the API type is a resource

                        if(typeof allResActionObj[apiName] !== 'undefined'){
                            //modify
                            //allResActionObj[apiName]
                            if(typeof allResActionObj[apiName].actions !== 'undefined'
                                && Array.isArray(allResActionObj[apiName].actions)){

                                // allResActionObj[apiName][actionType.toLowerCase()].push("/"+process.env.NODE_SVR_CONTEXTPATH+"/services/resource/"+apiName);
                            
                                allResActionObj[apiName].actions.push({
                                    path:"/"+process.env.NODE_SVR_CONTEXTPATH+"/services/resource/"+apiName,
                                    type:actionType.toLowerCase()
                                });

                            }else{

                                allResActionObj[apiName].actions = [
                                    {
                                        path:"/"+process.env.NODE_SVR_CONTEXTPATH+"/services/resource/"+apiName,
                                        type:actionType.toLowerCase()
                                    }
                                ]
                                // allResActionObj[apiName][actionType.toLowerCase()]=["/"+process.env.NODE_SVR_CONTEXTPATH+"/services/resource/"+apiName]
                            
                            }
                        }else{

                            allResActionObj[apiName] = {
                                name:apiName,
                                description: apiDescription,
                            };
                            allResActionObj[apiName].actions = [
                                {
                                    path:"/"+process.env.NODE_SVR_CONTEXTPATH+"/services/resource/"+apiName,
                                    type:actionType.toLowerCase()
                                }
                            ]
                            // allResActionObj[apiName][actionType.toLowerCase()]=["/"+process.env.NODE_SVR_CONTEXTPATH+"/services/resource/"+apiName]
                        }
                        
                    }
                    else
                    {

                    }
                    //returnData[apiName].get
                    // if(returnData[a])
                });
            });

            Object.keys(allResActionObj).forEach(function(allResKey){
                returnData.resource.push(allResActionObj[allResKey]);
            });

            console.log("---------------------------------returnData");
            console.log(returnData);

            return returnData;
        };
        
        var handler = function(data){
            httpObj.responseData = {"data":dataFormatter(data)}; //set the response data
            httpObj.completeHttpResponse(httpObj); // respond to the http call   
        }
        serviceManager.callOperation("maestro", "api", "getApiOperation", {}, handler, httpObj.request.mcHeader);
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
