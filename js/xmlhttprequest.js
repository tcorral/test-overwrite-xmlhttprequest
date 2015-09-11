(function() {
  // create XMLHttpRequest proxy object
  var oldXMLHttpRequest = XMLHttpRequest;

  // define constructor for my proxy object
  XMLHttpRequest = function() {
    var actual = new oldXMLHttpRequest();
    var self = this;

    this.onreadystatechange = null;

    // this is the actual handler on the real XMLHttpRequest object
    actual.onreadystatechange = function() {
      if (this.responseText) {
        console.log("actual ajax response (readyState = " + this.readyState + "): " + this.responseText);
        self.responseText = '{"msg": "Hello"}';
      }
      if (this.readyState == 4) {
        // actual.responseText is the ajax result

        // add your own code here to read the real ajax result
        // from actual.responseText and then put whatever result you want
        // the caller to see in self.responseText
        // this next line of code is a dummy line to be replaced
        self.responseText = '{"msg": "Hello"}';
      }
      if (self.onreadystatechange) {
        return self.onreadystatechange();
      }
    };

    // add all proxy getters
    ["status", "statusText", "responseType", "response",
      "readyState", "responseXML", "upload"].forEach(function(item) {
        Object.defineProperty(self, item, {
          get: function() {return actual[item];}
        });
      });

    // add all proxy getters/setters
    ["ontimeout, timeout", "withCredentials", "onload", "onerror", "onprogress"].forEach(function(item) {
      Object.defineProperty(self, item, {
        get: function() {return actual[item];},
        set: function(val) {actual[item] = val;}
      });
    });

    // add all pure proxy pass-through methods
    ["addEventListener", "send", "open", "abort", "getAllResponseHeaders",
      "getResponseHeader", "overrideMimeType", "setRequestHeader"].forEach(function(item) {
        Object.defineProperty(self, item, {
          value: function() {return actual[item].apply(actual, arguments);}
        });
      });
  }
})();

// my own little plain javascript ajax function
function ajax(url, data, fn) {
  var request = new XMLHttpRequest();
  request.onreadystatechange = function() {
    if (this.readyState == 4) {
      fn(this);
    }
  }
  request.open("POST", url, true);
  request.send(data);
}

var x = {myData: 1};

ajax("/echo/json/", "json=" + encodeURIComponent(JSON.stringify(x)) + "&delay=1", function(req) {
  log("modified ajax response" + req.responseText);
});