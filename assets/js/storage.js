/**
 * Storage functionalities to manipulate and retrieve
 * data from Chrome storage
 */
function ChromeHubStorage() {
  
  /**
   * Passes the item from storage with the specified key
   * to a specified callback function
   */
  function load(key, callback) {
    chrome.storage.sync.get(key, function(result) {
      if (callback) {
        callback(result);
      }
    });
  }
  
  /**
   * Saves an item to storage with specified key and value,
   * then calls the specified callback function if available
   */
  function save(key, value, callback) {
    var obj = {};
    obj[key] = value;
    
    chrome.storage.sync.set(obj);
    
    if (callback) {
      callback();
    }
  }
  
  /**
   * Removes an item from storage with a specified key,
   * then calls the specified callback function if available
   */
  function remove(key, callback) {
    chrome.storage.sync.remove(key);
    
    if (callback) {
      callback();
    }
  }
  
  /**
   * Returns object with respective methods
   */
  return {
    load: function(key, callback) {
      return load(key, callback);
    },
    
    save: function(key, value, callback) {
      return save(key, value, callback);
    },
    
    remove: function(key, callback) {
      return remove(key, callback);
    }
  };
  
}