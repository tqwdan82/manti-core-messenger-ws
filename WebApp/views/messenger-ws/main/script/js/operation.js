//------------------- Service API New Controller -------------------//
var opNew = angular.module('opNewApp', []);
opNew.controller('opNewCtrl', function($scope) {

    $scope.init = function(){
        // let httpCallback = function(response){
        //     let res = JSON.parse(response);
        //     $scope.$apply(function(){
        //         Object.keys(res).forEach(function(key)
        //         {
        //             let obj = res[key];
        //             obj.model = key;
        //             $scope.allModels.push(obj);
        //         });
        //     });
        // };
        // httpGetAsync("../../web/maestro/api/getAllDataModel", {}, httpCallback);
    };


    $scope.init();
});

//------------------- Service View Controller -------------------//
var opViewApp = angular.module('opViewApp', []);
opViewApp.controller('opViewCtrl', function($scope) {
    $scope.init = function(){
        // let httpCallback = function(response){
        //     let res = JSON.parse(response);
        //     $scope.$apply(function(){
                
        //         $scope.resourceApis = res.resource;
        //         $scope.hasResourceApis = res.resource.length > 0 ? true:false;
        //         $scope.customizedApis = res.customized;
        //         $scope.hasCustomeizedApis = res.customized.length > 0 ? true:false;
        //     });
        // };
        // httpGetAsync("../../web/maestro/api/getApis", {}, httpCallback);
    };

    
    $scope.init();
    
});