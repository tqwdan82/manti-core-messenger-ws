/** 
 * 
 **/
//server libraries
const utils = require('../../../../../server/util/utils.js');
const logger = utils.logger() // logger object

var formattedAttrKeyString = {
    "attrType": "columnDataType",
    "attrSize": "columnDataSize",
    "attrPk": "isPrimaryKey"
};

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
        let inputRawData = httpObj.request.body;
        let inputAttr = [];
        let genApiInd = false;
        let genDaoInd = false;
        Object.keys(inputRawData.attributes).forEach(function(key)
        {
            let inAttr = {};
            inAttr.columnName = key;
            let inAttrDetails = inputRawData.attributes[key];
            genApiInd = inputRawData.generateApi;
            genDaoInd = inputRawData.generateDao;
            Object.keys(inAttrDetails).forEach(function(detKey)
            {
                
                if(formattedAttrKeyString[detKey] === 'isPrimaryKey')
                {

                    inAttr[formattedAttrKeyString[detKey]] = inAttrDetails[detKey] === 'true' ? true:false;

                }
                else
                {
                    inAttr[formattedAttrKeyString[detKey]] = inAttrDetails[detKey];                }
            });
            inputAttr.push(inAttr);
        });
        let inputData = {
            modelName: inputRawData.modelDetails.modelName,
            timestamps: inputRawData.modelDetails.enableTimeStamp,
            paranoid: inputRawData.modelDetails.enableLogDel,
            columns: inputAttr
        };
        let handler = function(){

            if(genApiInd || genDaoInd)
            {
                let genApiDaoIndHandler = function()
                {
                    httpObj.responseData = {
                        status: "Ok",
                        message: "Operation completed."
                    }
                    httpObj.completeHttpResponse(httpObj);
                }

                let genSvcInput = 
                {
                    genApiInd: genApiInd,
                    genDaoInd: genDaoInd,
                    model: inputRawData.modelDetails.modelName
                };

                serviceManager.callOperation("maestro", "api", "generateNewSvcOperation", genSvcInput, genApiDaoIndHandler, httpObj.request.mcHeader);
                return;
            }

            httpObj.responseData = {
                status: "Ok",
                message: "Operation completed."
            }
            httpObj.completeHttpResponse(httpObj); // respond to the http call   
        }
        serviceManager.callOperation("maestro", "dataModel", "createDataModelOperation", inputData, handler, httpObj.request.mcHeader);
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
