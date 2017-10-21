function hide(ele) {
  ele.style.display = 'none';
}


function show(ele) {
  ele.style.display = 'block';
}


function displayInitialLanding() {
  hide(document.getElementById('user-landing'));
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


var reset = document.getElementById('reset');
reset.addEventListener('click', function(event) {
  chrome.storage.local.remove('username', function() {
    displayInitialLanding();
  });
});


load();