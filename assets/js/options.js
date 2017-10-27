/**
 * Functionalities for the user to enter or reset an API token
 */
function ChromeHubOptions() {
  
  var storage = new ChromeHubStorage();
  
  /**
   * Add event listeners to all user inputs
   */
  function bindInputs() {
    var tokenInputField = document.getElementById('token-input-field');
    var tokenSaveButton = document.getElementById('token-save-button');
    var tokenResetButton = document.getElementById('token-reset-button');
    
    /**
     * Save token to storage when Enter key is pressed
     */
    tokenInputField.addEventListener('keydown', function(event) {
      if (event.keyCode === 13 && tokenInputField.value !== '') {
        saveToken(tokenInputField.value);
      }
    });

    /**
     * Save token to storage when Save button is clicked
     */
    tokenSaveButton.addEventListener('click', function() {
      if (tokenInputField.value != '') {
        saveToken(tokenInputField.value);
      }
    });

    /**
     * Remove token from storage when Reset button is clicked
     */
    tokenResetButton.addEventListener('click', function() {
      storage.remove('token');
    });
  }
  
  /**
   * Saves the entered token to storage and displays a message to the user
   */
  function saveToken(value) {
    storage.save('token', value, function() {
      document.getElementById('token-entry').innerHTML = 'Token saved successfully.';
    });
  }
  
  /**
   * Returns object with respective methods
   */
  return {
    init: function() {
      bindInputs();
      
      storage.load('token', function(result) {
        var toHide = document.getElementById('token-reset');
        var toShow = document.getElementById('token-entry');
    
        // Swaps the elements to be hidden/shown if a token is found
        if (result.token) {
          var temp = toHide;
          toHide = toShow;
          toShow = temp;
        }
    
        toHide.style.display = 'none';
        toShow.style.display = 'block';
      });
    }
  };
}

(function() {
  var options = new ChromeHubOptions();
  options.init();
})();