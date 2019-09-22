var bookmarks = (function() {

  var mod = {};

  mod.all = [{
    name: "Alpha",
    items: [{
      display: "letter",
      letter: "GIT",
      icon: {
        name: "github",
        prefix: "fab",
        label: "GitHub"
      },
      name: "Github",
      url: "https://github.com/",
      accent: {
        override: false,
        color: {
          r: null,
          g: null,
          b: null
        }
      },
      timeStamp: 1546453108926
    }, {
      display: "letter",
      letter: "GM",
      icon: {
        name: "envelope",
        prefix: "fas",
        label: "Envelope"
      },
      name: "Gmail",
      url: "https://mail.google.com/",
      accent: {
        override: false,
        color: {
          r: null,
          g: null,
          b: null
        }
      },
      timeStamp: 1546453110265
    }]
  }, {
    name: "Beta",
    items: [{
      display: "icon",
      letter: "R",
      icon: {
        name: "reddit-alien",
        prefix: "fab",
        label: "reddit Alien"
      },
      name: "Reddit",
      url: "https://www.reddit.com/",
      accent: {
        override: false,
        color: {
          r: null,
          g: null,
          b: null
        }
      },
      timeStamp: 1546453111491
    }, {
      display: "letter",
      letter: "DR",
      icon: {
        name: null,
        prefix: null,
        label: null
      },
      name: "Drive",
      url: "https://drive.google.com/drive/",
      accent: {
        override: false,
        color: {
          r: null,
          g: null,
          b: null
        }
      },
      timeStamp: 1546453111953
    }]
  }];

  mod.get = function(data) {
    var _singleBookmark = function() {
      var found = false;
      if (mod.all.length > 0) {
        mod.all.forEach(function(arrayItem, index) {
          arrayItem.forEach(function(arrayItem, index) {
            if (arrayItem[index].timeStamp === data.timeStamp) {
              found = arrayItem[index];
            };
          });
        });
      };
      return found;
    };
    if (data && typeof data.timeStamp == "number") {
      return _singleBookmark();
    } else {
      return mod.all;
    };
  };

  mod.restore = function(data) {
    if ("bookmarks" in data) {
      mod.all = data.bookmarks;
    };
  };

  mod.add = {
    link: function(data) {
      if (data.group.new.active) {
        mod.add.group(data);
      };
      mod.all[data.group.index].items.push(data);
    },
    group: function(data) {
      var count = data.group.index + 1;
      mod.all.push({
        name: data.group.new.name || "Group " + count,
        items: []
      });
    }
  };

  mod.edit = function(data) {
    console.log(data);
    for (var i = 0; i < mod.all.length; i++) {
      if (mod.all[i].timeStamp === data.timeStamp) {
        mod.all[i] = data;
      };
    };
  };

  mod.remove = function(data) {
    for (var i = 0; i < mod.all.length; i++) {
      if (mod.all[i].timeStamp === data.timeStamp) {
        mod.all.splice(mod.all.indexOf(mod.all[i]), 1);
      };
    };
  };

  mod.sort = function(by) {
    var action = {
      name: function(array) {
        return helper.sortObject(array, "name");
      },
      letter: function(array) {
        return helper.sortObject(array, "letter");
      },
      icon: function(array) {
        return helper.sortObject(array, "icon.name");
      }
    };
    mod.all = action[by](mod.all);
  };

  mod.move = function(origin, destination) {
    mod.all = helper.moveArrayItem(mod.all, origin, destination);
  };

  var get = function(data) {
    return mod.get(data);
  };

  var edit = function(data) {
    mod.edit(data);
  };

  var sort = function(by) {
    mod.sort(by);
  };

  var move = function(origin, destination) {
    mod.move(origin, destination);
  };

  var remove = function(data) {
    mod.remove(data);
  };

  var init = function() {
    if (data.load()) {
      mod.restore(data.load());
    };
  };

  // exposed methods
  return {
    init: init,
    mod: mod,
    get: get,
    edit: edit,
    sort: sort,
    move: move,
    remove: remove
  };

})();
