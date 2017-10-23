function save(key, value, callback) {
  // Create dict object using key and value passed in
  var obj = {};
  obj[key] = value;
  
  chrome.storage.sync.set(obj);

  callback();
}


function load(key, callback) {
  chrome.storage.sync.get(key, function(result) {
    // Pass data retrieved from Chrome storage to callback
    callback(result);
  });
}
