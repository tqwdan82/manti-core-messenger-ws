var formattedKeyString = {
    columnName: "Attribute Name",
    columnDataType: "Data Type",
    columnDataSize: "Data Size",
    isPrimaryKey: "Primary Key",
    timestamps: "Add. Created & Updated Date column",
    paranoid: "Logical Removal"
};

var app = angular.module('dataModelViewApp', []);
app.controller('dataModelViewCtrl', function($scope) {

    $scope.models = {};

    $scope.init = function(){
        let httpCallback = function(response){
            $scope.$apply(function(){
                $scope.models = formatData(response);
            });
        };
        httpGetAsync("../../web/management/api/getDataModel", {}, httpCallback);
    };

    $scope.delete = function(key)
    {
        let httpCallback = function(response){
            $scope.$apply(function(){
                delete $scope.models.key; 
            });
            
        };
        httpPostAsync("../../web/management/api/delDataModel", JSON.stringify({"model":key}), httpCallback);

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