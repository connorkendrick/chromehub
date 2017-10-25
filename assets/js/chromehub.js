var storage = new ChromeHubStorage();

// Displays screen where username is entered
function displayInitialLanding() {
  document.getElementById('user-landing').style.display = 'none';
  document.getElementById('initial-landing').style.display = 'block';
}


// Displays screen with user-specific stats
function displayUserLanding(username) {
  document.getElementById('initial-landing').style.display = 'none';
  document.getElementById('welcome-message').innerHTML = "Hello, " + username + ".";
  document.getElementById('user-landing').style.display = 'block';
}


// Displays initial landing or user landing depending on presence of username
function display(result) { 
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
  storage.load('username', function(result) {
    // Pass the resulting data to the callback function
    display(result);
  });
}


// Listens for entry of username on initial landing
var input = document.getElementById('user-input');
input.addEventListener('keydown', function(event) {
  if (event.keyCode === 13 && input.value != '') {
    storage.save('username', input.value, function() {
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
