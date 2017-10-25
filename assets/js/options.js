var storage = new ChromeHubStorage();

// Display screen where API token is entered
function displayTokenEntry() {
  document.getElementById('token-reset').style.display = 'none';
  document.getElementById('token-entry').style.display = 'block';
}


// Display screen where API token can be reset
function displayTokenReset() {
  document.getElementById('token-entry').style.display = 'none';
  document.getElementById('token-reset').style.display = 'block';
}


// Displays token entry or reset screen depending on presence of token
function display(result) {
  if (typeof result.token === 'undefined') {
    displayTokenEntry();
  }
  else {
    displayTokenReset();
  }
}


// Loads the value at key 'token' in Chrome storage
function init() {
  // Call load() from storage.js and pass in the key and callback function
  storage.load('token', function(result) {
    // Pass the resulting data to the callback function
    display(result);
  });
}


// Saves the entered token to Chrome storage and displays a message.
function saveToken(value) {
  storage.save('token', value, function() {
    document.getElementById('token-entry').innerHTML = 'Token saved successfully.';
  });
}


// Listen for Enter press for token submission
var tokenInput = document.getElementById('token-input');
tokenInput.addEventListener('keydown', function(event) {
  if (event.keyCode === 13 && tokenInput.value != '') {
    saveToken(tokenInput.value);
  }
});


// Listen for Save button click for token submission
var tokenSaveButton = document.getElementById('token-save-button');
tokenSaveButton.addEventListener('click', function(event) {
  var value = document.getElementById('token-input').value;
  if (value != '') {
    saveToken(value);
  }
});


// Listen for token reset on token reset page
var tokenResetButton = document.getElementById('token-reset-button');
tokenResetButton.addEventListener('click', function(event) {
  chrome.storage.sync.remove('token', function() {
    displayTokenEntry();
  });
});


init();
