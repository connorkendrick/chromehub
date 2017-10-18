function hide(ele) {
    ele.style.display = 'none';
}


function show(ele) {
    ele.style.display = 'block';
}


function displayInitialLanding() {
    show(document.getElementById('initial-landing'));
}


function displayUserLanding(username) {
    hide(document.getElementById('initial-landing'));
    
    document.getElementById('welcome-message').innerHTML = "Hello, " + username + ".";
    
    show(document.getElementById('user-landing'));
}


function load() {
    chrome.storage.local.get('username', function(result) {
        show(document.getElementById('cover'));
        
        if (typeof result.username === 'undefined') {
            displayInitialLanding();
        }
        else {
            displayUserLanding(result.username);
        }
    });
}


function save(username, callback) {
    chrome.storage.local.set({'username': username});
    callback();
}


var input = document.getElementById('user-input');
input.addEventListener('keydown', function(event) {
    if (event.keyCode === 13 && input.value != '') {
        save(input.value, function() {
            load();
        });
    }
});


load();
//chrome.storage.local.remove('username');
//chrome.storage.local.set({'username': 'connorkendrick'});
//var obj = chrome.storage.local.get('username', function(result) {
//    if (typeof result.username === 'undefined') {
//        alert("This is undefined");
//    }
//    else {
//        alert("This is defined");
//        alert(result.username);
//    }
//});