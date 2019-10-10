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
      display: "icon",
      letter: "GM",
      icon: {
        name: "star",
        prefix: "fas",
        label: "Star"
      },
      name: "Gmail",
      url: "https://mail.google.com/",
      accent: {
        override: true,
        color: {
          r: 255,
          g: 168,
          b: 0
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
      if (data.position.group.new) {
        mod.add.group(data);
      };
      mod.all[data.position.destination.group].items.splice(data.position.destination.item, 0, data.link);
    },
    group: function(data) {
      var name = data.position.group.name;
      if (name != null && typeof name == "string") {
        name = name.trim();
      };
      if (name == "" || name == null || name == undefined) {
        var count = get().length + 1;
        name = "Group " + count;
      };
      mod.all.push({
        name: name,
        items: []
      });
    }
  };

  mod.edit = function(data) {
    if (data.position.group.new) {
      mod.add.group(data);
    };
    var item = JSON.parse(JSON.stringify(data.link));
    mod.all[data.position.origin.group].items.splice(data.position.origin.item, 1);
    mod.all[data.position.destination.group].items.splice(data.position.destination.item, 0, item);
  };

  mod.remove = function(data) {
    mod.all[data.position.destination.group].items.splice(data.position.destination.item, 1);
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

  mod.move = {
    link: function(data) {
      var item = JSON.parse(JSON.stringify(mod.all[data.origin.group].items[data.origin.item]));
      mod.all[data.origin.group].items.splice(data.origin.item, 1);
      mod.all[data.destination.group].items.splice(data.destination.item, 0, item);
    },
    group: function(data) {
      var group = JSON.parse(JSON.stringify(mod.all[data.origin.group]));
      mod.all.splice(data.origin.group, 1);
      mod.all.splice(data.destination.group, 0, group);
    }
  };

  mod.count = function() {
    var count = 0;
    mod.all.forEach(function(arrayItem, index) {
      count = count + arrayItem.items.length
    });
    return count;
  };

  var count = function() {
    return mod.count();
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
    count: count,
    remove: remove
  };

})();
