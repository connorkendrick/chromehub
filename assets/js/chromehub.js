/**
 * Displays a specified user's GitHub stats, and includes functionalities
 * for the user to enter or reset their username
 */
function ChromeHub() {
  
  var username,                             // GitHub username entered by user
      refreshRate,                          // Seconds required between refreshes
      token = '',                           // GitHub API token
      baseURL = 'https://api.github.com/',  // Base URL of all requests
      userData;                             // JSON object of user data
  
  var storage = new ChromeHubStorage();
  
  /**
   * Initializes the page
   */
  function init() {
    bindInputs();
        
    storage.load('token', function(result) {
      if (result.token) {
        token = result.token;
      }
    });
    
    storage.load('userData', function(result) {
      if (result.userData) {
        userData = JSON.parse(result.userData);
      }
    });

    storage.load('username', function(result) {
      var toHide = document.getElementById('user-landing');
      var toShow = document.getElementById('initial-landing');
      
      username = result.username;

      // Swaps the elements to be hidden/shown if a username is found,
      // and adds a custom welcome message for the user
      if (username) {
        var temp = toHide;
        toHide = toShow;
        toShow = temp;

        document.getElementById('welcome-message').innerHTML = 'Hello, ' + username + '.';
        
        // Display data if user data has already been fetched and stored before
        if (userData) {
          displayData();
        }
        
        refresh();
        setInterval(refresh, 10000);
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
    if (token) {
      refreshRate = 10; // TODO: change to a specific value later
    }
    else {
      refreshRate = 15; // TODO: change to a specific value later
    }
    
    // Allow refresh if enough time has passed
    storage.load('lastRefresh', function(result) {
      var currentTime = new Date().getTime() / 1000;
      
      if (result.lastRefresh && (currentTime - result.lastRefresh < refreshRate)) {
        return;
      }
      
      fetchData();
      storage.save('lastRefresh', currentTime);
    });
  }
  
  /**
   * Fetches the data for the username provided
   */
  function fetchData() {    
    var xhttp = new XMLHttpRequest();
    
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        var response = this.responseText;
        var jsonResponse = JSON.parse(response);
        userData = jsonResponse;
        storage.save('userData', JSON.stringify(userData));
        displayData();
      }
    };

    xhttp.open('GET', baseURL + 'users/' + username, true);
    xhttp.send();
  }
  
  /**
   * Displays the data on the page
   */
  function displayData() {
    // Display number of followers
    document.getElementById('follower-count').innerHTML = ('<p>Followers: ' + userData.followers +
                                                          '</p>');
    document.getElementById('following-count').innerHTML = ('<p>Following: ' + userData.following +
                                                           '</p>');
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
    init: init
  };
}

(function() {
  var tab = new ChromeHub();
  tab.init();
})();