//------------------- Resource API New Controller -------------------//
var apiResNew = angular.module('apiResNewApp', []);
apiResNew.controller('apiResNewCtrl', function($scope) {

    $scope.allModels = [];

    $scope.init = function(){
        let httpCallback = function(response){
            let res = JSON.parse(response);
            $scope.$apply(function(){
                Object.keys(res).forEach(function(key)
                {
                    let obj = res[key];
                    obj.model = key;
                    $scope.allModels.push(obj);
                });
            });
        };
        httpGetAsync("../../web/maestro/api/getAllDataModel", {}, httpCallback);
    };

    $scope.generate = function(key){
        console.log("generate key: " +key);
        let httpCallback = function(response){
            console.log(response);
        };
        httpPostAsync("../../web/maestro/api/genResApi", JSON.stringify({model:key}), httpCallback);

    };
    
    $scope.delete = function(key){
        console.log("delete key: " +key);
        let httpCallback = function(response){
            console.log(response);
        };
        httpPostAsync("../../web/maestro/api/delResApi", JSON.stringify({model:key}), httpCallback);

    };

    $scope.init();
});

//------------------- API View Controller -------------------//
var apiViewApp = angular.module('apiViewApp', []);
apiViewApp.controller('apiViewCtrl', function($scope) {

    $scope.resourceApis = [];
    $scope.hasResourceApis = false;
    $scope.customizedApis = [];
    $scope.hasCustomeizedApis = false;
    $scope.dindex = 0;
    $scope.selOrder = {};
    $scope.inputOrder = {};
    $scope.inputAttr = {};

    $scope.orderBys = {};
    $scope.attributes = {};

    $scope.init = function(){

        let httpCallback = function(response){
            let res = JSON.parse(response);

            $scope.$apply(function(){

                let resources = res.resource;
                resources.forEach(function(resource){
                    resource.actions.forEach(function(action){
                        $scope.selOrder[resource.name+"-"+action.type] = "ASC";
                        $scope.inputOrder[resource.name+"-"+action.type] = "";
                        $scope.orderBys[resource.name+"-"+action.type] = [];
                        $scope.attributes[resource.name+"-"+action.type] = [];
    
                        action['reqBody'] = "";
                        action['reqLimit'] = "";
                        action['reqOffset'] = "";
                        action['orderBys'] = [];
                        action['attributes'] = [];
                        action['request'] = "-";
                        action['response'] = "";
                        action['sendRequestBody'] = "";
                        action['responseTime'] = "";
                    });
                });
                
                $scope.resourceApis = resources;
                $scope.hasResourceApis = resources.length > 0 ? true:false;
                $scope.customizedApis = res.customized;
                $scope.hasCustomeizedApis = res.customized.length > 0 ? true:false;
            });
        };
        httpGetAsync("../../web/maestro/api/getApis", {}, httpCallback);
    };

    $scope.addOrderby = function(resourceApiName){

        if($scope.inputOrder[resourceApiName] !== ''){
            $scope.resourceApis.forEach(function(resourceApi){

                resourceApi.actions.forEach(function(action){
                    if(resourceApi.name+'-'+action.type === resourceApiName){
                        
                        let found = false;
                        action.orderBys.forEach(function(orderBy){
                            if(orderBy.col === $scope.inputOrder[resourceApiName]
                                && orderBy.order == $scope.selOrder[resourceApiName]){
                                found = true;
                            }
                        });

                        if(!found){
                            action.orderBys.push({
                                "col":$scope.inputOrder[resourceApiName],
                                "order":$scope.selOrder[resourceApiName]
                            });
                        }
                    }
                })
                
            });

            $scope.inputOrder[resourceApiName] = '';
            $scope.selOrder[resourceApiName] = 'ASC';
        }
    };
    $scope.removeOrderby = function(input){

        $scope.resourceApis.forEach(function(resourceApi){

            resourceApi.actions.forEach(function(action){
                if(resourceApi.name+'-'+action.type === input.apiName){
                    let newOrderBys = [];
                    action.orderBys.forEach(function(orderBy){
                        if(orderBy.col === input.col
                            && orderBy.order == input.order){
                            //delete orderBy;
                        }else{
                            newOrderBys.push(orderBy);
                        }
                    });
                    action.orderBys = newOrderBys;
                }
            });
        });
    };

    $scope.addAttribute = function(resourceApiName){

        if($scope.inputAttr[resourceApiName] !== ''){
            $scope.resourceApis.forEach(function(resourceApi){

                resourceApi.actions.forEach(function(action){

                    if(resourceApi.name+'-'+action.type === resourceApiName){

                        let found = false;
                        action.attributes.forEach(function(attribute){
                            if(attribute === $scope.inputAttr[resourceApiName]){
                                found = true;
                            }
                        });
    
                        if(!found){
                            action.attributes.push($scope.inputAttr[resourceApiName]);
                        }
                    }

                })
                
            });

            $scope.inputAttr[resourceApiName] = '';
        }
    };
    $scope.removeAttribute = function(input){

        $scope.resourceApis.forEach(function(resourceApi){

            resourceApi.actions.forEach(function(action){
                if(resourceApi.name+'-'+action.type === input.apiName){
                    let newAttributes = [];
                    action.attributes.forEach(function(attribute){
                        if(attribute === input.attr){
                            //delete orderBy;
                        }else{
                            newAttributes.push(attribute);
                        }
                    });
                    action.attributes = newAttributes;
                }
            });
            
        });
    };
    
    $scope.test = function(resourceApiName, api){   
        let apiUrl = api.path;
        $scope.resourceApis.forEach(function(resourceApi){
            if(resourceApi.name === resourceApiName){
                resourceApi.request ="";

                let query = "";

                //form the limit
                if(typeof api.reqLimit !== 'undefined'
                    && api.reqLimit !== ''){
                    if(query === ""){
                        query+="?limit="+api.reqLimit
                    }else{
                        query+="&limit="+api.reqLimit
                    }
                }

                //form the offset
                if(typeof api.reqOffset !== 'undefined'
                    && api.reqOffset !== ''){
                    if(query === ""){
                        query+="?offset="+api.reqOffset
                    }else{
                        query+="&offset="+api.reqOffset
                    }
                }

                //form the attributes
                if(typeof api.attributes !== 'undefined'
                    && (Array.isArray(api.attributes) && api.attributes.length > 0)){
                    let arrayString = "";
                    for(let ai = 0; ai < api.attributes.length; ai++){
                        let attr = api.attributes[ai];
                        if(arrayString === "") arrayString += attr;
                        else arrayString += ","+ attr;
                    }
                    if(arrayString !== ""){
                        arrayString = "attributes=" + arrayString;

                        if(query === ""){
                            query+="?"+arrayString;
                        }else{
                            query+="&"+arrayString;
                        }
                    }
                }

                //request body
                let reqBody = {};
                
                //form the orderby
                if(typeof api.orderBys !== 'undefined'
                    && (Array.isArray(api.orderBys) && api.orderBys.length > 0)){
                    let arrayString = "";
                    for(let oi = 0; oi < api.orderBys.length; oi++){
                        let orderObj = api.orderBys[oi];
                        if(arrayString === "") arrayString += orderObj.col+"-"+orderObj.order;
                        else arrayString += ","+ orderObj.col+"-"+orderObj.order;;
                        // let objArray = [];
                        // objArray.push(orderObj.col);
                        // objArray.push(orderObj.order);
                    }
                    if(arrayString !== ""){
                        arrayString = "order=" + arrayString;

                        if(query === ""){
                            query+="?"+arrayString;
                        }else{
                            query+="&"+arrayString;
                        }
                    }
                    
                }

                // if(typeof resourceApi.reqBody !== 'undefined'
                //     && resourceApi.reqBody !== ''){
                //     reqBody.where = JSON.parse(resourceApi.reqBody);
                // }
                // resourceApi.sendRequestBody = JSON.stringify(reqBody);

                // resourceApi.request = JSON.stringify(resourceApi);
                api.request = apiUrl + query;

                let startTime = new Date();
                let httpCallback = function(response){
                    let endTime = new Date();
                    let durationMs = endTime.getTime() - startTime.getTime();
                    
                    $scope.$apply(function(){
                        api.response = response;
                        api.responseTime = "Response in " + durationMs + "ms";
                    });
                };
                if(api.type === 'get')
                    httpGetAsync("../.."+ api.request, {}, httpCallback);
                else if(api.type === 'post')
                    httpPostAsync("../.."+ api.request, reqBody, httpCallback);
            }
        });

        
    };

    
    $scope.init();
    
});