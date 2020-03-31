//------------------- Operation Editor Controller -------------------//
var opEditorApp = angular.module('opEditorApp', []);
opEditorApp.controller('opEditorCtrl', function($scope) {
    $scope.application = "";
    $scope.service = "";
    $scope.operation;
    $scope.opContent = "";
    $scope.editor;

    $scope.init = function(){
        if($scope.operation){
            let input = {
                application: $scope.application,
                service: $scope.service,
                operation: $scope.operation
            };
            let httpCallback = function(response){
                $scope.editor = ace.edit("editor");
                let r = function(f){/in/.test(document.readyState)?setTimeout('r('+f+')',9):f()}
                r(function(){
                    $scope.editor.setTheme("ace/theme/monokai");
                    $scope.editor.session.setMode("ace/mode/javascript");
                    $scope.editor.setReadOnly(false);
                    $scope.editor.setValue(response, -1);
                    $scope.editor.on("input", function() {
                        isCodeAdded = !$scope.editor.session.getUndoManager().isClean();
                    });
                    
                });
            };
            httpPostAsync("../../web/maestro/api/getOperationContent", JSON.stringify(input), httpCallback);
        }else{
            $scope.editor = ace.edit("editor");
            let r = function(f){/in/.test(document.readyState)?setTimeout('r('+f+')',9):f()}
            r(function(){
                $scope.editor.setTheme("ace/theme/monokai");
                $scope.editor.session.setMode("ace/mode/javascript");
                $scope.editor.setReadOnly(false);
                $scope.editor.setValue('', -1);
                $scope.editor.on("input", function() {
                    isCodeAdded = !$scope.editor.session.getUndoManager().isClean();
                });
                
            });
        }
    };

    $scope.saveOperation = function(){
        var code = $scope.editor.getValue();
        let input = {
            application: $scope.application,
            service: $scope.service,
            operation: $scope.operation,
            content: code
        };

        let httpCallback = function(response){
            alert("Code updated!");
        };
        httpPostAsync("../../web/maestro/api/saveOperation", JSON.stringify(input), httpCallback);
    };
});

//------------------- Operations Controller -------------------//
var opApp = angular.module('opApp', []);
opApp.controller('opAppCtrl', function($scope) {
    $scope.appServices = [];
    $scope.hasAppServices = false;
    $scope.selectedApplication = "";
    $scope.services = [];

    $scope.init = function(){
        let httpCallback = function(response){
            
            let res = [];
            let resObj = JSON.parse(response);
            resObj.forEach(function(app){
                if(app.app !== "resource")res.push(app);
            })
            $scope.$apply(function(){
                
                $scope.appServices = res;
                $scope.hasAppServices = Object.keys(res).length > 0;
            });
        };
        httpGetAsync("../../web/maestro/api/getAllServices", {}, httpCallback);
    };
    
    $scope.showService = function(appName){
        $scope.selectedApplication = appName;
        $scope.appServices.forEach(function(app){
            if(app.app === appName){
                $scope.services = app.services;
            }
        });
    };

    $scope.deleteOperation = function(appName, serviceName, opName){
        let input = {
            application: appName,
            service: serviceName,
            operation: opName
        };
        let httpCallback = function(response){
            
            alert("Operation is deleted.");
        };
        httpPostAsync("../../web/maestro/api/delOperation", JSON.stringify(input), httpCallback);
    }

    $scope.init();
});

//------------------- Service API New Controller -------------------//
var svcNew = angular.module('svcNewApp', []);
svcNew.controller('svcNewCtrl', function($scope) {

    $scope.appName = "";
    $scope.createApplication = function(){
        if($scope.appName === ""
            || typeof $scope.appName === 'undefined'
            || (typeof $scope.appName !== 'undefined' && $scope.appName.length < 3)){
            alert("Invalid application name");
            return;
        }

        let httpCallback = function(response){
            alert("Application created!");
        };
        
        let input = {
            "appName" : $scope.appName
        };
        httpPostAsync("../../web/maestro/api/createApplication",JSON.stringify(input), httpCallback);

    }
    // $scope.init = function(){
        
    // };
    // $scope.init();
});

//------------------- Service View Controller -------------------//
var svcViewApp = angular.module('svcViewApp', []);
svcViewApp.controller('svcViewCtrl', function($scope) {
    $scope.appServices = [];
    $scope.hasAppServices = false;
    $scope.newAppName = "";
    $scope.init = function(){
        let httpCallback = function(response){
            let res = JSON.parse(response);
            $scope.$apply(function(){
                
                $scope.appServices = res;
                $scope.hasAppServices = Object.keys(res).length > 0;
            });
        };
        httpGetAsync("../../web/maestro/api/getAllServices", {}, httpCallback);
    };

    $scope.createNewApplication = function(){
        let input = {
            "appName" : $scope.newAppName
        };
        let httpCallback = function(response){
            $('#newAppModal').modal('hide');
        };
        httpPostAsync("../../web/maestro/api/createApplication",JSON.stringify(input), httpCallback);
    };

    $scope.deleteService = function(appName, serviceName){
        // console.log(appName);
        // console.log(serviceName);
        let httpCallback = function(response){
            // let res = JSON.parse(response);
            // $scope.$apply(function(){
                
            //     $scope.appServices = res;
            //     $scope.hasAppServices = Object.keys(res).length > 0;
            // });
        };
        let input = {
            "application":appName,
            "service":serviceName
        };
        httpPostAsync("../../web/maestro/api/delService",JSON.stringify(input), httpCallback);
    };
    $scope.deleteApplication = function(appName){
        console.log(appName);
        let httpCallback = function(response){
            // let res = JSON.parse(response);
            // $scope.$apply(function(){
                
            //     $scope.appServices = res;
            //     $scope.hasAppServices = Object.keys(res).length > 0;
            // });
        };
        let input = {
            "application":appName
        };
        httpPostAsync("../../web/maestro/api/delApplication",JSON.stringify(input), httpCallback);
    };

    $scope.newSvcName = "";
    $scope.newSvcAppName = "";
    $scope.createNewService = function(){
        console.log($scope.newSvcAppName)
        console.log($scope.newSvcName)

        let input = {
            application: $scope.newSvcAppName,
            service: $scope.newSvcName
        };
        let httpCallback = function(response){
            
            $('#newServiceModal').modal('hide');
        };
        httpPostAsync("../../web/maestro/api/createService", JSON.stringify(input), httpCallback);

        
    }
    $scope.setNewServiceApp= function(appName){
        $scope.newSvcAppName = appName;
    }

    $scope.init();
    
});