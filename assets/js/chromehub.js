/**
 * Displays a specified user's GitHub stats, and includes functionalities
 * for the user to enter or reset their username
 */
function ChromeHub() {
  
  var username,                             // GitHub username entered by user
      name = ' ',                           // Actual name of user
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
      forks = 0,                            // Number of forks for user's pinned repositories
      currentWeekContributions;             // Listing of number of contributions made each day
  
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
    
    storage.load('name', function(result) {
      if (result.name) {
        name = result.name;
      }
    });
    
    storage.load('followers', function(result) {
      if (result.followers) {
        followers = result.followers;
      }
    });
    
    storage.load('following', function(result) {
      if (result.following) {
        following = result.following;
      }
    });
    
    storage.load('contributionsToday', function(result) {
      if (result.contributionsToday) {
        contributionsToday = result.contributionsToday;
      }
    });
    
    storage.load('streak', function(result) {
      if (result.streak) {
        streak = result.streak;
      }
    });
    
    storage.load('stars', function(result) {
      if (result.stars) {
        stars = result.stars;
      }
    });
    
    storage.load('forks', function(result) {
      if (result.forks) {
        forks = result.forks;
      }
    });
        
    storage.load('currentWeekContributions', function(result) {
      if (result.currentWeekContributions) {
        currentWeekContributions = result.currentWeekContributions;
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
        
        // Create a Chart.js object and fill with currentWeekContributions array
        var ctx = document.getElementById('contributions-graph').getContext('2d');
        contributionsGraph = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            datasets: [{
              label: 'Contributions',
              data: currentWeekContributions,
              borderColor: 'rgba(68, 163, 64, 1)',
              backgroundColor: 'rgba(140, 198, 101, 0.2)',
              borderWidth: 2,
              lineTension: 0,
              pointBackgroundColor: 'rgba(68, 163, 64, 1)'
            }]
          },
          options: {
            scales: {
              yAxes: [{
                ticks: {
                  beginAtZero: true,
                  stepSize: 1
                }
              }]
            },
            responsive: false
          }
        });          
        
        // Display data if user data has already been fetched and stored before
        if (userData) {
          displayData();
        }
        
        refresh();
        // Attempt refresh every minute
        //setInterval(refresh, 60000);
        setInterval(refresh, 1000);
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
      // Wait 2 minutes in between each refresh if token found
      // Reason: Worst case is 127 requests per 1 refresh (5000 allowed in an hour)
      //refreshRate = 120;
      refreshRate = 10;
    }
    else {
      // Wait 20 minutes in between each refresh if no token found
      // Reason: Worst case is 19 requests per 1 refresh (60 allowed in an hour)
      refreshRate = 1200;
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
      name = userData.name;
      storage.save('userData', JSON.stringify(userData));
      storage.save('name', name);
      storage.save('followers', followers);
      storage.save('following', following);
      displayData();
    });
    
    // URL for official contributions graph
    var contributionsURL = 'https://github.com/users/' + username + '/contributions';
    // Request official contributions graph for user
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
      
      var currentWeekContributionsTemp = [];
      // Calculate contributions made this week for line graph
      for (var currentDay = 0; currentDay < days.length; currentDay++) {    
        currentWeekContributionsTemp.push(days.item(currentDay).getAttribute('data-count'));
      }
      
      // If array for contributions this week has been previously saved
      if (currentWeekContributions) {
        var contributionsChanged = false;
        if (currentWeekContributions.length != currentWeekContributionsTemp.length) {
          contributionsChanged = true;
        }
        else {
          // Check every element for equivalence
          for(var i = 0; i < currentWeekContributions.length; i++) {
            if(currentWeekContributions[i] !== currentWeekContributionsTemp[i]) {
              contributionsChanged = true;
              break;
            }
          }
        }
        
        // If the contributions array for this week has changed
        if (contributionsChanged) {
          // Remove current chart data
          while (contributionsGraph.data.datasets[0].data.length > 0) {
            contributionsGraph.data.datasets[0].data.pop();
          }
          // Save current contributions data
          currentWeekContributions = currentWeekContributionsTemp;
          storage.save('currentWeekContributions', currentWeekContributions);
          // Fill chart with current contributions data after chart is emptied
          for (var i = 0; i < currentWeekContributions.length; i++) {
            // Ugly way of handling async. But if I make anymore callbacks tonight I'll cry.
            if (i == 0 && contributionsGraph.data.datasets[0].data.length != 0) {
              i--;
              continue;
            }
            contributionsGraph.data.datasets[0].data.push(currentWeekContributions[i]);
          }
          // Update chart
          contributionsGraph.update();
        }
      }
      else {
        currentWeekContributions = currentWeekContributionsTemp;
        storage.save('currentWeekContributions', currentWeekContributions);
        for (var i = 0; i < currentWeekContributions.length; i++) {
          contributionsGraph.data.datasets[0].data.push(currentWeekContributions[i]);
        }
        contributionsGraph.update();
      }
            
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
      
      // Maximum number of forks/stars fetched if no token is found
      const maxCountNoToken = 100;
      // Maximum number of forks/stars fetched if token is found
      const maxCountWithToken = 1000;
      
      // Number of repositories left to check
      var reposRemainingForForks;
      // Number of forks made today
      var forksToday = 0;
      // Expression to request repository forks and count ones made today
      var parseForks = function(forksURL, page) {
        var forksURLPage = forksURL + page;
        makeRequest(forksURLPage, function(response) {
          var responseText = response.responseText;
          // Array of JSON objects
          var jsonResponse = JSON.parse(responseText);
          
          --reposRemainingForForks;
          
          // If max amount of forks has been reached, exit request
          if ((token && forksToday == (maxCountWithToken + '+')) || 
              (!token && forksToday == (maxCountNoToken + '+'))) {
            return;
          }
          
          // For each fork
          for (var i = 0; i < jsonResponse.length; i++) {
            // Time in milliseconds since epoch of fork creation 
            var createdString = jsonResponse[i].created_at;
            // Corresponding year, month, and day of creation
            var yearMonthDay = createdString.split('T')[0].split('-');
                                    
            // Current time in milliseconds since epoch
            var currentTime = new Date();
            
            // Compare current year, month, and date with fork creation date
            var forkedToday = (currentTime.getFullYear() == yearMonthDay[0] &&
                              currentTime.getMonth() + 1 == yearMonthDay[1] &&
                              currentTime.getDate() == yearMonthDay[2]);
                  
            // If fork was made today and is less than limit, increase total number of forks made today
            if ((forkedToday) && ((token && forksToday < maxCountWithToken) || 
                                  (!token && forksToday < maxCountNoToken))) {
              ++forksToday;
            }
            else {
              // If max limit has been reached for forks
              if ((token && forksToday == maxCountWithToken) || 
                  (!token && forksToday == maxCountNoToken)) {
                forks = forksToday + '+';
                storage.save('forks', forks);
                displayData();
              }
              // If this is the last repository to check
              else if (reposRemainingForForks <= 0) {
                forks = forksToday;
                storage.save('forks', forks);
                displayData();
              }
              break;
            }
            
            // If the last fork on page was made today, request forks for next page
            if (i == jsonResponse.length - 1) {
              parseForks(forksURL, page + 1);
            }
          }
        });
      };
      
      // Number of repositories left to check
      var reposRemainingForStars;
      // Number of stars made today
      var starsToday = 0;
      // Expression to request repository stars and count ones made today
      // Note: Stars are listed from oldest to newest, so this must iterate backwards
      var parseStars = function(starsURL, page, firstCheck) {
        var starsURLPage = starsURL + page;
        makeRequest(starsURLPage, function(response) {
          // If this is the first time the repository is being checked for stars
          if (firstCheck) {
            // Find last page of stargazers from first page header info
            var pageInfo = response.getResponseHeader('link');
            // If there is more than one page of stargazers
            if (pageInfo) {
              // Parse 'link' header info to get last page
              var lastPage = pageInfo.split(';')[1].split('&page=')[1].split('>')[0];
              // Restart repository search from last page
              parseStars(starsURL, lastPage, false);
              return;
            }
          }
          
          var responseText = response.responseText;
          // Array of JSON objects
          var jsonResponse = JSON.parse(responseText);
                    
          --reposRemainingForStars;
          
          // If max amount of stars has been reached, exit request
          if ((token && starsToday == (maxCountWithToken + '+')) || 
              (!token && starsToday == (maxCountNoToken + '+'))) {
            return;
          }
          
          // For each stargazer
          for (var i = jsonResponse.length - 1; i >= 0; i--) {
            // Time in milliseconds since epoch of star creation
            var createdString = jsonResponse[i].starred_at;
            // Corresponding year, month, and day of creation
            var yearMonthDay = createdString.split('T')[0].split('-');
                        
            // Current time in milliseconds since epoch
            var currentTime = new Date();
            
            // Compare current year, month, and date with star creation date
            var starredToday = (currentTime.getFullYear() == yearMonthDay[0] &&
                               currentTime.getMonth() + 1 == yearMonthDay[1] &&
                               currentTime.getDate() == yearMonthDay[2]);
            
           // If star was made today and is less than limit, increase total number of stars made today
            if ((starredToday) && ((token && starsToday < maxCountWithToken) || 
                                  (!token && starsToday < maxCountNoToken))) {
              ++starsToday;
            }
            else {
              
              
              // If max limit has been reached for stars
              if ((token && starsToday == maxCountWithToken) || 
                  (!token && starsToday == maxCountNoToken)) {
                stars = starsToday + '+';
                storage.save('stars', stars);
                displayData();
              }
              // If this is the last repository to check
              else if (reposRemainingForStars <= 0) {
                stars = starsToday;
                storage.save('stars', stars);
                displayData();
              }
              break;
            }
            
            // If the last star checked on page was made today and page number is not 1,
            // request stargazers for previous page
            if (i == 0 && page > 1) {
              parseStars(starsURL, page - 1, false);
            }
          }
        });
      };
      
      reposRemainingForForks = repoLinks.length;
      reposRemainingForStars = repoLinks.length;
      var URLParams = '?per_page=100&page=';
      // Count forks and stars for each pinned repository
      for (var i = 0; i < repoLinks.length; i++) {
        var repoURL = baseURL + 'repos' + repoLinks[i];
        var forksURL = repoURL + '/forks' + URLParams;
        var starsURL = repoURL + '/stargazers' + URLParams;
                
        parseForks(forksURL, 1);
        parseStars(starsURL, 1, true);
      }
    });
  }
  
  /**
   * Displays the data on the page
   */
  function displayData() {
    // Display welcome message to user
    var firstLast = name.split(' ');
    document.getElementById('welcome-message').innerHTML = 'Hello, ' + firstLast[0] + '.';
    // Display number of followers
    document.getElementById('follower-count').innerHTML = ('<p>Followers: ' + followers +
                                                          '</p>');
    // Display number of people following user
    document.getElementById('following-count').innerHTML = ('<p>Following: ' + following +
                                                           '</p>');
    // Display contributions made today
    document.getElementById('contributions-today').innerHTML = ('<p>Contributions made today: '+
                                                               contributionsToday + '</p>');
    // Display number of days in a row contributions have been made
    document.getElementById('contributions-streak').innerHTML = ('<p>Current streak: ' + streak +
                                                                ' days</p>');
    // Display number of stars gained today on pinned/popular repositories
    document.getElementById('pinned-repos-stars').innerHTML = ('<p>Stars for pinned repositories: ' +
                                                             stars + '</p>');
    // Display number of forks made today on pinned/popular repositories
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
      storage.remove('name');
      storage.remove('following');
      storage.remove('followers');
      storage.remove('contributionsToday');
      storage.remove('streak');
      storage.remove('forks');
      storage.remove('stars');
      storage.remove('currentWeekContributions');
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