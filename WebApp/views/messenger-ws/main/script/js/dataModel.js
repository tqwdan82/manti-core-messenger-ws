var formattedKeyString = {
    columnName: "Attribute Name",
    columnDataType: "Data Type",
    columnDataSize: "Data Size",
    isPrimaryKey: "Primary Key",
    timestamps: "Add. Created & Updated Date column",
    paranoid: "Logical Removal"
};

var formattedAttrKeyString = {
    "attrType": "Attribute Type",
    "attrSize": "Attribute Size",
    "attrPk": "Primary Key"
};

//------------------- Data Model New Controller -------------------//
var appNew = angular.module('dataModelNewApp', []);
appNew.controller('dataModelNewCtrl', function($scope) {
    
    $scope.modelName = "";
    $scope.enableTimeStamp = "false";
    $scope.enableLogDel = "false";
    $scope.genApi = "false";
    $scope.genDao = "false";

    $scope.modelDetails = {};
    $scope.modelDetail = {};
    $scope.errors = [];
    $scope.submitErrors = [];
         
    $scope.$watch('genDao', function(value) {
        if($scope.genDao === "false"
            && $scope.genApi !== "false")
        {
            $scope.genApi = "false";
            $('#apiDaoModal').modal('show');
        }
    });

    $scope.$watch('genApi', function(value) {
        if($scope.genApi === "true"
            && $scope.genDao !== "true")
        {
            $scope.genDao = "true";
            $('#apiDaoModal').modal('show');
        }
    });

    $scope.add = function(){

        $scope.errors = []

        //validation
        if(typeof $scope.modelDetail.attrName === 'undefined'
            || $scope.modelDetail.attrName.length < 3)
        {
            $scope.errors.push("Invalid Attribute Name");
        }

        if(typeof $scope.modelDetail.attrType === 'undefined'
            || $scope.modelDetail.attrType.length < 3)
        {
            $scope.errors.push("Invalid Attribute Type");
        }

        if(typeof $scope.modelDetail.attrPk === 'undefined')
        {
            $scope.errors.push("Invalid Primary Key Indication");
        }

        if(typeof $scope.modelDetail.attrSize !== 'undefined')
        {
            if( !(/^[0-9]*$/.test($scope.modelDetail.attrSize) )){
                $scope.errors.push("Invalid Attribute Size");
            }
            
        }
        
        if($scope.errors.length > 0)
        {
            $('#newModelModal').modal('hide');
            $('#invalidAttrModal').modal('show');
            return;
        }


        let attrName = $scope.modelDetail.attrName;
        delete $scope.modelDetail.attrName;
        $scope.modelDetails[attrName] = $scope.modelDetail;
        $scope.modelDetail = {};
        $('#newModelModal').modal('hide');
    };

    $scope.remove = function(attrName){
        delete $scope.modelDetails[attrName];
    };

    $scope.submit = function(){
        //validation
        $scope.submitErrors = []
        if(typeof $scope.modelName === 'undefined'
            || $scope.modelName < 3)
        {
            $scope.submitErrors.push("Invalid Model Name");
        }

        if(typeof $scope.enableTimeStamp === 'undefined'
            || $scope.enableTimeStamp.length < 1)
        {
            $scope.submitErrors.push("Invalid Timestamp Indication");
        }

        if(typeof $scope.enableLogDel === 'undefined'
            || $scope.enableLogDel.length < 1)
        {
            $scope.submitErrors.push("Invalid Logical Delete Indication");
        }

        if(Object.keys($scope.modelDetails).length < 1)
        {
            $scope.submitErrors.push("There must be at least 1 attribute for the model");
        }

        if($scope.submitErrors.length > 0)
        {
            $('#invalidModelModal').modal('show');
            return;
        }
        
        let submitData = {
            modelDetails : {
                modelName: $scope.modelName,
                enableTimeStamp: $scope.enableTimeStamp === 'true'?true:false,
                enableLogDel: $scope.enableLogDel === 'true'?true:false,
            },
            attributes : $scope.modelDetails,
            generateApi : $scope.genApi === 'true'?true:false,
            generateDao : $scope.genDao === 'true'?true:false
        };

        let httpCallback = function(response){
            //reset
            $scope.modelDetails = {};
            $scope.modelDetail = {};
            $scope.errors = [];
            $scope.modelName = "";
            $scope.enableTimeStamp = "";
            $scope.enableLogDel = "";
            $scope.genApi = "";
            $scope.genDao = "";
            // $scope.$apply(function(){
            //     //reset
            //     $scope.modelDetails = {};
            //     $scope.modelDetail = {};
            //     $scope.errors = [];
            //     $scope.modelName = "";
            //     $scope.enableTimeStamp = "";
            //     $scope.enableLogDel = "";
            // });
        };
        httpPostAsync("../../web/maestro/api/createDataModel", JSON.stringify(submitData), httpCallback);
        
    };

    $scope.formatKey = function(keyString)
    {
        if(typeof formattedAttrKeyString[keyString] === 'undefined')
        {
            return keyString;
        }

        return formattedAttrKeyString[keyString];
    };

    $scope.formatValue = function(valueString)
    {
        if( valueString === 'true' || valueString === 'false')
        {
            return valueString === 'true' ? 'Yes':'No';
        }

        return valueString;
    };

});

//------------------- Data Model View Controller -------------------//
var app = angular.module('dataModelViewApp', []);
app.controller('dataModelViewCtrl', function($scope) {

    $scope.models = {};

    $scope.init = function(){
        let httpCallback = function(response){
            $scope.$apply(function(){
                $scope.models = formatData(response);
            });
        };
        httpGetAsync("../../web/maestro/api/getDataModel", {}, httpCallback);
    };

    $scope.delete = function(key)
    {
        let httpCallback = function(response){
            $scope.$apply(function(){
                delete $scope.models.key; 
            });
            
        };
        httpPostAsync("../../web/maestro/api/delDataModel", JSON.stringify({"model":key}), httpCallback);

    };

    let formatData = function(inData){
        let formattedData = {};
        if(inData.trim().length > 0){
            let data = JSON.parse(inData);
            Object.keys(data).forEach(function(modelName){

                let modelData = data[modelName];
                let formattedConfig = {};
                let formattedAttrs = [];
                Object.keys(modelData).forEach(function(modelDataKey){
                    if(modelDataKey === 'columns')
                    {

                        let allColumnData = modelData[modelDataKey];
                        allColumnData.forEach(function (columnData){
  
                            let attrToAdd = {};
                            Object.keys(columnData).forEach( function(columnKey){
                                attrToAdd[formattedKeyString[columnKey]] = formatKeyData(columnData[columnKey]);
                            });

                            formattedAttrs.push(attrToAdd);
                        });

                    }
                    else
                    {
                        let formattedKey = formattedKeyString[modelDataKey];
                        formattedConfig[formattedKey] = formatKeyData(modelData[modelDataKey]);
                    }
                });
                formattedData[modelName] = {
                    "attributes":formattedAttrs,
                    "configurations":formattedConfig
                };

            });
        }

        return formattedData;
    }

    let formatKeyData = function(data)
    {
        if(typeof data === "boolean"){
            return data ? "Yes": "No";
        }

        return data;
    }

    
    $scope.init();
    
});