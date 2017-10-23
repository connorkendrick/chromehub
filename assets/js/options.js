function hide(ele) {
  ele.style.display = 'none';
}


function show(ele) {
  ele.style.display = 'block';
}


function displayTokenEntry() {
  hide(document.getElementById('token-reset'));
  show(document.getElementById('token-entry'));
}


function displayTokenReset() {
  hide(document.getElementById('token-entry'));
  show(document.getElementById('token-reset'));
}


function display(result) {
  if (typeof result.token === 'undefined') {
    displayTokenEntry();
  }
  else {
    displayTokenReset();
  }
}


function init() {
  load('token', function(result) {
    display(result);
  });
}


var tokenInput = document.getElementById('token-input');
tokenInput.addEventListener('keydown', function(event) {
  if (event.keyCode === 13 && tokenInput.value != '') {
    save('token', tokenInput.value, function(event) {
      document.getElementById('token-entry').innerHTML = 'Token saved successfully.';
    });
  }
});


var tokenSaveButton = document.getElementById('token-save-button');
tokenSaveButton.addEventListener('click', function(event) {
  var value = document.getElementById('token-input').value;
  if (value != '') {
    save('token', value, function(event) {
      document.getElementById('token-entry').innerHTML = 'Token saved successfully.';
    });
  }
});


var tokenResetButton = document.getElementById('token-reset-button');
tokenResetButton.addEventListener('click', function(event) {
  chrome.storage.sync.remove('token', function() {
    displayTokenEntry();
  });
});


init();
