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


// Displays initial landing or user landing depending on presence of username
function display(result) { 
  show(document.getElementById('cover'));
  
  if (typeof result.username === 'undefined') {
    displayInitialLanding();
  }
  else {
    displayUserLanding(result.username);
  }
}


// Loads the value at key 'username' in Chrome storage
function init() {
  // Call load() from storage.js and pass in the key and callback function
  load('username', function(result) {
    // Pass the resulting data to the callback function
    display(result);
  });
}


// Listens for entry of username on initial landing
var input = document.getElementById('user-input');
input.addEventListener('keydown', function(event) {
  if (event.keyCode === 13 && input.value != '') {
    save('username', input.value, function() {
      init();
    });
  }
});


// Listens for username reset on user landing
var reset = document.getElementById('reset');
reset.addEventListener('click', function(event) {
  chrome.storage.sync.remove('username', function() {
    displayInitialLanding();
  });
});


init();
