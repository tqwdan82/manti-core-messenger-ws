const Http = new XMLHttpRequest();

const httpGetAsync = function(url, input, callback){
    Http.onreadystatechange = (e) => {
        if( Http.readyState==4 && Http.status==200){
            callback(Http.responseText);
        }
    }

    Http.open("GET", url, true);
    if(typeof input === 'undefined')
    {
        Http.send();
    } else {
        Http.send(input);
    }

    
};

const httpPostAsync = function(url, input, callback){
    Http.onreadystatechange = (e) => {
        if( Http.readyState==4 && (Http.status==200 || Http.status==204)){
            callback(Http.responseText);
        }
    }

    Http.open("POST", url, true);
    Http.setRequestHeader("Content-Type", "application/json");
    if(typeof input === 'undefined')
    {
        Http.send();
    } else {
        Http.send(input);
    }

    
};