/**
 * Displays a specified user's GitHub stats, and includes functionalities
 * for the user to enter or reset their username
 */
function ChromeHub() {
  
  var username,                             // GitHub username entered by user
      refreshRate,                          // Seconds required between refreshes
      token = '',                           // GitHub API token
      baseURL = 'https://api.github.com/',  // Base URL of all requests
      userData,                             // JSON object of user data
      followers = 0,                        // Number of people following user
      following = 0,                        // Number of people user is following
      contributionsToday = 0,               // Number of contributions made by user today
      streak = 0,                           // Days in a row user has made contributions
      repoLinks = [],                       // Links for user's pinned repositories
      stars = 0,                            // Number of stars for user's pinned repositories
      forks = 0;                            // Number of forks for user's pinned repositories
  
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
    
    storage.load('followers', function(result) {
      if (result.followers) {
        followers = result.followers;
      }
      else {
        followers = 0;
      }
    });
    
    storage.load('following', function(result) {
      if (result.following) {
        following = result.following;
      }
      else {
        following = 0;
      }
    });
    
    storage.load('contributionsToday', function(result) {
      if (result.contributionsToday) {
        contributionsToday = result.contributionsToday;
      }
      else {
        contributionsToday = 0;
      }
    });
    
    storage.load('streak', function(result) {
      if (result.streak) {
        streak = result.streak;
      }
      else {
        streak = 0;
      }
    });
    
    storage.load('stars', function(result) {
      if (result.stars) {
        stars = result.stars;
      }
      else {
        stars = 0;
      }
    });
    
    storage.load('forks', function(result) {
      if (result.forks) {
        forks = result.forks;
      }
      else {
        forks = 0;
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
   * Makes an HTTP request to a specified URL, and runs the callback function
   */
  function makeRequest(url, callback) {
    var xhttp = new XMLHttpRequest();
    
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        var response = this;
        callback(response);
      }
    };
    
    xhttp.open('GET', url, true);
    if (token) {
      var tokenValue = 'token ' + token;
      xhttp.setRequestHeader('Authorization', tokenValue);
    }
    if (url.includes('stargazers')) {
      xhttp.setRequestHeader('Accept', 'application/vnd.github.v3.star+json');
    }
    xhttp.send(null);
  }
  
  /**
   * Fetches the data for the username provided
   */
  function fetchData() {
    // Fetch userData (followers/following)
    var userDataURL = baseURL + 'users/' + username;
    makeRequest(userDataURL, function(response) {
      var responseText = response.responseText;
      var jsonResponse = JSON.parse(responseText);
      userData = jsonResponse;
      followers = userData.followers;
      following = userData.following;
      storage.save('userData', JSON.stringify(userData));
      storage.save('followers', followers);
      storage.save('following', following);
      displayData();
    });
    
    // Fetch number of contributions made today
    var contributionsURL = 'https://github.com/users/' + username + '/contributions';
    makeRequest(contributionsURL, function(response) {
      // Convert html string to DOM element
      var parser = new DOMParser();
      var domElement = parser.parseFromString(response.responseText, 'text/html');

      // Collection of every week for the past 365 days
      var year = domElement.getElementsByTagName('g');

      // Collection of days for this week
      var week = year.item(year.length - 1);
      var days = week.children;

      // Data for today
      var today = days.item(days.length - 1);

      // Number of contributions made today
      var contributions = today.getAttribute('data-count');

      contributionsToday = contributions;
      storage.save('contributionsToday', contributions);
            
      // Calculate current contributions streak (number of days in a row)
      var contributionsCount = 0;
      forEachWeek:
        for (var i = year.length - 1; i >= 0; i--) {
          week = year.item(i);
          days = week.children;
          
          forEachDay:
            for (var j = days.length - 1; j >= 0; j--) {
              today = days.item(j);
              contributions = today.getAttribute('data-count');
              if (contributions >= 1) {
                  contributionsCount++;
              }
              else if (i == year.length - 1 && j == days.length - 1) {
                continue;
              }
              else {
                break forEachWeek;
              }
            }
        }
      
      streak = contributionsCount;
      storage.save('streak', streak);
      
      displayData();
    });
    
    // Fetch pinned repositories (for stars/forks)
    var profileURL = 'https://github.com/' + username;
    makeRequest(profileURL, function(response) {
      // Convert html string to DOM element
      var parser = new DOMParser();
      var domElement = parser.parseFromString(response.responseText, 'text/html');
            
      // Container for all pinned repositories
      var pinnedClass = domElement.getElementsByClassName('js-pinned-repos-reorder-container');
      var board = pinnedClass.item(0);
            
      // List of all pinned repositories on board 
      var listClass = board.getElementsByClassName('pinned-repos-list');
      if (listClass.length != 0) {
        var list = listClass.item(0);

        // Collection of all repos (actual access to the list items)
        var itemClass = list.getElementsByClassName('pinned-repo-item');
        for (var i = 0; i < itemClass.length; i++) {
          var item = itemClass.item(i);

          var contentClass = item.getElementsByClassName('pinned-repo-item-content');
          var content = contentClass.item(0);

          var nameSpanClass = content.getElementsByClassName('d-block');
          var nameSpan = nameSpanClass.item(0);

          var repoNameClass = nameSpan.getElementsByTagName('a');
          var repoName = repoNameClass.item(0);
          var repoLink = repoName.getAttribute('href');

          repoLinks[i] = repoLink;
        }
      }
      
      // Expression to request repository forks and count ones made today
      forks = 0;
      var parseForks = function(forksURL, page = 1) {
        var forksURLPage = forksURL + page;
        makeRequest(forksURLPage, function(response) {
          var responseText = response.responseText;
          // Array of JSON objects
          var jsonResponse = JSON.parse(responseText);
          
          // For each fork
          for (var i = 0; i < jsonResponse.length; i++) {
            // Time in seconds of fork
            var createdString = jsonResponse[i].created_at;
            var createdTime = Date.parse(createdString) / 1000;
            
            // Current time in seconds
            var currentTime = new Date().getTime() / 1000;
            
            var forkedToday = (currentTime - createdTime <= 86400);
            
            if (forkedToday) {
              forks++;
            }
            else {
              storage.save('forks', forks);
              displayData();
              break;
            }
            
            // If the last fork on page was made today, request next page
            if (i == jsonResponse.length - 1) {
              parseForks(forksURL, page + 1);
            }
          }
        });
      };
      
      // Expression to request repository stars and count ones made today
      // Note: Stars are listed from oldest to newest, so we must iterate backwards
      stars = 0;
      var parseStars = function(starsURL, page = 1, firstCheck = true) {
        var starsURLPage = starsURL + page;
        makeRequest(starsURLPage, function(response) {
          // FIRST CHECK
          // Check if there are any pages after 1
          // If so, go to last page and begin
          
          // BEGIN
          // Iterate backwards through page (99 to 0)
          // If date before today is met, exit
          // If zero-th item (first item/last checked) is today and page != 1, go back a page and begin
          // else, exit
          
          if (firstCheck) {
            var pageInfo = response.getResponseHeader('link');
            if (pageInfo) {
              var lastPage = pageInfo.split(';')[1].split('&page=')[1].split('>')[0];
              parseStars(starsURL, lastPage, false);
              //console.log(lastPage);
            }
          }
          
          var responseText = response.responseText;
          // Array of JSON objects
          var jsonResponse = JSON.parse(responseText);
          
          
          // For each stargazer
          for (var i = jsonResponse.length - 1; i >= 0; i--) {
            // Time in seconds of fork
            var createdString = jsonResponse[i].starred_at;
            var createdTime = Date.parse(createdString) / 1000;
            
            // Current time in seconds
            var currentTime = new Date().getTime() / 1000;
            
            var starredToday = (currentTime - createdTime <= 86400);
            
            if (starredToday) {
              stars++;
            }
            else {
              storage.save('stars', stars);
              displayData();
              break;
            }
            
            // If the last star checked on page was made today and page number is not 1,
            // check stars on previous page
            if (i == 0 && page != 1) {
              parseForks(forksURL, page - 1, false);
            }
          }
        });
      };
      
      // Count forks and stars for each pinned repository
      var URLParams = '?per_page=100&page=';
      for (var i = 0; i < repoLinks.length; i++) {
        var repoURL = baseURL + 'repos' + repoLinks[i];
        var forksURL = repoURL + '/forks' + URLParams;
        var starsURL = repoURL + '/stargazers' + URLParams;
        
        parseForks(forksURL);
        parseStars(starsURL);
      }
    });
  }
  
  /**
   * Displays the data on the page
   */
  function displayData() {
    // Display number of followers
    document.getElementById('follower-count').innerHTML = ('<p>Followers: ' + followers +
                                                          '</p>');
    document.getElementById('following-count').innerHTML = ('<p>Following: ' + following +
                                                           '</p>');
    document.getElementById('contributions-today').innerHTML = ('<p>Contributions made today: '+
                                                               contributionsToday + '</p>');
    document.getElementById('contributions-streak').innerHTML = ('<p>Current streak: ' + streak +
                                                                ' days</p>');
    document.getElementById('pinned-repos-stars').innerHTML = ('<p>Stars for pinned repositories: ' +
                                                             stars + '</p>');
    document.getElementById('pinned-repos-forks').innerHTML = ('<p>Forks for pinned repositories: ' +
                                                              forks + '</p>');
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
      storage.remove('following');
      storage.remove('followers');
      storage.remove('contributionsToday');
      storage.remove('streak');
      storage.remove('forks');
      storage.remove('stars');
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