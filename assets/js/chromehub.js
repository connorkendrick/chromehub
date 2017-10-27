/**
 * Displays a specified user's GitHub stats, and includes functionalities
 * for the user to enter or reset their username
 */
function ChromeHub() {
  
  var refreshRate   // Seconds required between refreshes
  
  var storage = new ChromeHubStorage();
  
  /**
   * Initializes the page
   */
  function init() {
    bindInputs();

    storage.load('username', function(result) {
      var toHide = document.getElementById('user-landing');
      var toShow = document.getElementById('initial-landing');

      // Swaps the elements to be hidden/shown if a username is found,
      // and adds a custom welcome message for the user
      if (result.username) {
        var temp = toHide;
        toHide = toShow;
        toShow = temp;

        document.getElementById('welcome-message').innerHTML = 'Hello, ' + result.username + '.';
      }

      toHide.style.display = 'none';
      toShow.style.display = 'block';
    });
  }
  
  /**
   * Check for changed data if request attempt is successful
   */
  function refresh() {
    // Set refresh rate according to token
    storage.load('token', function(result) {
      if (result.token) {
        refreshRate = 10; // TODO: change to a specific value later
      }
      else {
        refreshRate = 15; // TODO: change to a specific value later
      }
    });
    
    // Allow refresh if enough time has passed
    storage.load('lastRefresh', function(result) {
      var currentTime = new Date().getTime() / 1000;
      
      if (result.lastRefresh && (currentTime - result.lastRefresh < refreshRate)) {
        //alert(refreshRate + ' seconds have not yet passed since last refresh.');
        return;
      }
      
      //alert('Refreshed');
      storage.save('lastRefresh', currentTime);
    });
  }
  
  /**
   * Add event listeners to all user inputs
   */
  function bindInputs() {
    var userNameInput = document.getElementById('username-input');
    var userNameReset = document.getElementById('username-reset');
    
    /**
     * Save username to storage when Enter key is pressed
     */
    userNameInput.addEventListener('keydown', function(event) {
      if (event.keyCode === 13 && userNameInput.value !== '') {
        storage.save('username', userNameInput.value, function() {
          init();
        });
      }
    });
    
    /*
     * Remove username from storage when Reset button is clicked
     */
    userNameReset.addEventListener('click', function() {
      storage.remove('username');
    });
  }
  
  /**
   * Returns object with respective methods
   */
  return {
    init: function() {
      init();
      this.refresh();
    },
    
    refresh: function() {
      refresh();
      setInterval(refresh, 10000);
    }
  };
}

(function() {
  var tab = new ChromeHub();
  tab.init();
})();