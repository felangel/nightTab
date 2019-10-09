var link = (function() {

  var _previousFocus = null;

  var stagedLink = {
    position: {
      origin: {
        group: null,
        item: null
      },
      destination: {
        group: null,
        item: null
      },
      group: {
        new: null,
        name: null
      }
    },
    link: {
      display: null,
      letter: null,
      icon: {
        name: null,
        prefix: null,
        label: null
      },
      name: null,
      url: null,
      timeStamp: null,
      accent: {
        override: null,
        color: {
          r: null,
          g: null,
          b: null
        }
      }
    }
  };

  stagedLink.init = function() {
    stagedLink.position.origin.group = 0;
    stagedLink.position.origin.item = 0;
    stagedLink.position.destination.group = 0;
    stagedLink.position.destination.item = 0;
    stagedLink.position.group.new = false;
    stagedLink.link.display = "letter";
    stagedLink.link.accent.override = false;
  };

  stagedLink.reset = function() {
    stagedLink.position.origin.group = null;
    stagedLink.position.origin.item = null;
    stagedLink.position.destination.group = null;
    stagedLink.position.destination.item = null;
    stagedLink.position.group.new = null;
    stagedLink.position.group.name = null;
    stagedLink.link.display = null;
    stagedLink.link.letter = null;
    stagedLink.link.icon.name = null;
    stagedLink.link.icon.prefix = null;
    stagedLink.link.icon.label = null;
    stagedLink.link.name = null;
    stagedLink.link.url = null;
    stagedLink.link.timeStamp = null;
    stagedLink.link.accent.override = null;
    stagedLink.link.accent.color.r = null;
    stagedLink.link.accent.color.g = null;
    stagedLink.link.accent.color.b = null;
  };

  var mod = {};

  mod.accent = {
    clear: function() {
      bookmarks.get().forEach(function(arrayItem, index) {
        arrayItem.accent = {
          override: false,
          color: {
            r: null,
            g: null,
            b: null
          }
        };
      });
    },
    rainbow: function() {
      var units = 360 / bookmarks.get().length;
      var degree = 0;
      bookmarks.get().forEach(function(arrayItem, index) {
        arrayItem.accent.override = true;
        arrayItem.accent.color = helper.hslToRgb({
          h: degree,
          s: 1,
          l: 0.5
        });
        degree = degree + units;
      });
    }
  };

  mod.edit = {
    toggle: function() {
      if (state.get().link.edit) {
        mod.edit.close();
      } else {
        mod.edit.open();
      };
    },
    open: function() {
      helper.setObject({
        object: state.get(),
        path: "link.edit",
        newValue: true
      });
    },
    close: function() {
      helper.setObject({
        object: state.get(),
        path: "link.edit",
        newValue: false
      });
    },
    check: function() {
      if (bookmarks.get().length <= 0) {
        helper.setObject({
          object: state.get(),
          path: "link.edit",
          newValue: false
        });
      };
    }
  };

  mod.add = {
    open: function() {
      helper.setObject({
        object: state.get(),
        path: "link.add",
        newValue: true
      });
    },
    close: function() {
      helper.setObject({
        object: state.get(),
        path: "link.add",
        newValue: false
      });
    }
  };

  var bind = {};

  bind.sort = {
    group: function() {
      sortable(".link", "destroy");
      sortable(".link", {
        items: ".link-area",
        handle: ".link-area-name",
        placeholder: helper.node("div|class:link-placeholder"),
        forcePlaceholderSize: true
      });
      helper.eA(".link").forEach(function(arrayItem, index) {
        sortable(arrayItem)[0].addEventListener("sortupdate", function(event) {
          bookmarks.mod.move.group({
            origin: {
              group: event.detail.origin.index
            },
            destination: {
              group: event.detail.destination.index
            }
          });
          data.save();
        });
      });
    },
    link: function() {
      sortable(".link-area-list", "destroy");
      sortable(".link-area-list", {
        items: ".link-item",
        handle: ".link-control-item-handle",
        acceptFrom: '.link-area-list',
        orientation: "horizontal",
        placeholder: helper.node("div|class:link-placeholder"),
        forcePlaceholderSize: true
      });
      helper.eA(".link-area-list").forEach(function(arrayItem, index) {
        sortable(arrayItem)[0].addEventListener("sortupdate", function(event) {
          bookmarks.mod.move.link({
            origin: {
              group: Array.from(helper.getClosest(event.detail.origin.container, ".link-area").parentNode.children).indexOf(helper.getClosest(event.detail.origin.container, ".link-area")),
              item: event.detail.origin.index
            },
            destination: {
              group: Array.from(helper.getClosest(event.detail.destination.container, ".link-area").parentNode.children).indexOf(helper.getClosest(event.detail.destination.container, ".link-area")),
              item: event.detail.destination.index
            }
          });
          data.save();
        });
      });
    }
  };

  var render = {};

  render.remove = function(link, position) {
    stagedLink.link = link;
    stagedLink.position = position;
    stagedLink.position.origin = JSON.parse(JSON.stringify(stagedLink.position.destination));
    var heading;
    if (stagedLink.link.name != null && stagedLink.link.name != "") {
      heading = "Remove " + stagedLink.link.name + " bookmark";
    } else {
      heading = "Remove unnamed bookmark";
    };
    var successAction = function() {
      _previousFocus = _previousFocus - 1;
      bookmarks.remove(stagedLink);
      mod.edit.check();
      header.render.button.edit();
      data.save();
      render.clear();
      render.item.all();
      render.item.tabindex();
      render.previousFocus();
      bind.sort.group();
      bind.sort.link();
      stagedLink.reset();
      control.render.dependents();
      control.render.class();
      shade.close();
      pagelock.unlock();
    };
    var cancelAction = function() {
      render.previousFocus();
      shade.close();
      pagelock.unlock();
    };
    modal.open({
      heading: heading,
      content: "Are you sure you want to remove this bookmark? This can not be undone.",
      successAction: successAction,
      cancelAction: cancelAction,
      actionText: "Remove",
      size: "small"
    });
    shade.open({
      action: function() {
        render.clear();
        render.item.all();
        render.item.tabindex();
        render.previousFocus();
        bind.sort.group();
        bind.sort.link();
        stagedLink.reset();
        autoSuggest.close();
        pagelock.unlock();
        modal.close();
      }
    });
    pagelock.lock();
  };

  render.clear = function() {
    var link = helper.e(".link");
    while (link.lastChild) {
      link.removeChild(link.lastChild);
    };
  };

  render.area = {
    width: function() {
      var html = helper.e("html");
      html.style.setProperty("--link-area-width", state.get().link.area.width + "%");
    }
  };

  render.areaName = function(data) {
    var linkArea = helper.node("div|class:link-area");
    var name = helper.node("h1:" + data.name + "|class:link-area-name");
    linkArea.appendChild(name);
    return linkArea;
  };

  render.item = {
    all: function() {
      var linkSection = helper.e(".link");
      var bookmarksToRender = false;
      if (state.get().search) {
        bookmarksToRender = search.get();
      } else {
        bookmarksToRender = bookmarks.get();
      };
      var action = {
        bookmarks: function(data) {
          data.forEach(function(arrayItem, index) {
            stagedLink.position.destination.group = index;
            linkArea = render.areaName(arrayItem);
            linkArea.position = JSON.parse(JSON.stringify(stagedLink.position));
            var linkAreaList = helper.node("div|class:link-area-list");
            arrayItem.items.forEach(function(arrayItem, index) {
              stagedLink.link = JSON.parse(JSON.stringify(arrayItem));
              stagedLink.position.destination.item = index;
              var linkItem = render.item.link();
              linkItem.position = JSON.parse(JSON.stringify(stagedLink.position));
              linkAreaList.appendChild(linkItem);
            });
            linkArea.appendChild(linkAreaList);
            linkSection.appendChild(linkArea);
            stagedLink.reset();
          });
        },
        empty: {
          search: function() {
            linkSection.appendChild(render.empty.search());
          },
          bookmarks: function() {
            linkSection.appendChild(render.empty.bookmarks());
          }
        }
      };
      // if searching
      if (state.get().search) {
        // if bookmarks exist to be searched
        if (bookmarksToRender.total > 0) {
          // if matching bookmarks found
          if (bookmarksToRender.matching.length > 0) {
            action.bookmarks(bookmarksToRender.matching);
          } else {
            action.empty.search();
          };
        } else {
          action.empty.bookmarks();
        };
      } else {
        // if bookmarks exist
        if (bookmarksToRender.length > 0) {
          action.bookmarks(bookmarksToRender);
        } else {
          action.empty.bookmarks();
        };
      };
    },
    display: {
      letter: function() {
        var html = helper.e("html");
        html.style.setProperty("--link-item-display-letter-size", state.get().link.item.display.letter.size + "em");
      },
      icon: function() {
        var html = helper.e("html");
        html.style.setProperty("--link-item-display-icon-size", state.get().link.item.display.icon.size + "em");
      }
    },
    name: function() {
      var html = helper.e("html");
      html.style.setProperty("--link-item-name-size", state.get().link.item.name.size + "em");
    },
    size: function() {
      var html = helper.e("html");
      html.style.setProperty("--link-item-size", state.get().link.item.size + "em");
    },
    link: function() {
      var linkItemOptions = {
        tag: "div",
        attr: [{
          key: "class",
          value: "link-item"
        }]
      };
      if (stagedLink.link.accent.override) {
        linkItemOptions.attr.push({
          key: "style",
          value: "--theme-accent: " + stagedLink.link.accent.color.r + ", " + stagedLink.link.accent.color.g + ", " + stagedLink.link.accent.color.b
        });
        if (invert(stagedLink.link.accent.color, true) == "#000000") {
          linkItemOptions.attr[0].value = linkItemOptions.attr[0].value + " link-url-text-dark";
        } else if (invert(stagedLink.link.accent.color, true) == "#ffffff") {
          linkItemOptions.attr[0].value = linkItemOptions.attr[0].value + " link-url-text-light";
        };
      } else {
        if (invert(state.get().theme.accent.current, true) == "#000000") {
          linkItemOptions.attr[0].value = linkItemOptions.attr[0].value + " link-url-text-dark";
        } else if (invert(state.get().theme.accent.current, true) == "#ffffff") {
          linkItemOptions.attr[0].value = linkItemOptions.attr[0].value + " link-url-text-light";
        };
      };
      var linkItem = helper.makeNode(linkItemOptions);
      var linkPanelFrontOptions = {
        tag: "a",
        attr: [{
          key: "class",
          value: "link-panel-front"
        }, {
          key: "href",
          value: stagedLink.link.url
        }, {
          key: "tabindex",
          value: 1
        }]
      };
      if (state.get().link.newTab) {
        linkPanelFrontOptions.attr.push({
          key: "target",
          value: "_blank"
        });
      };
      var linkPanelFront = helper.makeNode(linkPanelFrontOptions);
      var linkPanelBack = helper.makeNode({
        tag: "div",
        attr: [{
          key: "class",
          value: "link-panel-back"
        }]
      });
      var linkDisplay = helper.makeNode({
        tag: "div",
        attr: [{
          key: "class",
          value: "link-display"
        }]
      });
      var linkDisplayLetter = null;
      var linkDisplayIcon = null;
      if (stagedLink.link.display == "letter") {
        linkDisplayLetter = helper.makeNode({
          tag: "p",
          text: stagedLink.link.letter,
          attr: [{
            key: "class",
            value: "link-display-letter"
          }]
        });
      } else if (stagedLink.link.display == "icon" && stagedLink.link.icon.prefix != null && stagedLink.link.icon.name != null) {
        linkDisplayIcon = helper.makeNode({
          tag: "div",
          attr: [{
            key: "class",
            value: "link-display-icon " + stagedLink.link.icon.prefix + " fa-" + stagedLink.link.icon.name
          }]
        });
      };
      var linkName = helper.makeNode({
        tag: "p",
        text: stagedLink.link.name,
        attr: [{
          key: "class",
          value: "link-name"
        }]
      });
      var linkUrl = helper.makeNode({
        tag: "div",
        attr: [{
          key: "class",
          value: "link-url"
        }]
      });
      var url = "";
      if (stagedLink.link.url != null) {
        url = stagedLink.link.url.replace(/^https?\:\/\//i, "").replace(/\/$/, "");
      };
      var linkUrlText = helper.makeNode({
        tag: "p",
        text: url,
        attr: [{
          key: "class",
          value: "link-url-text"
        }, {
          key: "title",
          value: url
        }]
      });
      var linkControl = helper.makeNode({
        tag: "div",
        attr: [{
          key: "class",
          value: "link-control"
        }]
      });
      var linkHandle = helper.makeNode({
        tag: "div",
        attr: [{
          key: "class",
          value: "button button-small link-control-item link-control-item-handle"
        }, {
          key: "tabindex",
          value: -1
        }, {
          key: "title",
          value: "Drag and drop to reorder"
        }]
      });
      var linkHandleIcon = helper.makeNode({
        tag: "span",
        attr: [{
          key: "class",
          value: "button-icon icon-reorder"
        }]
      });
      var linkEdit = helper.makeNode({
        tag: "button",
        attr: [{
          key: "class",
          value: "button button-small link-control-item link-control-item-edit"
        }, {
          key: "tabindex",
          value: -1
        }, {
          key: "title",
          value: "Edit this bookmark"
        }]
      });
      var linkEditIcon = helper.makeNode({
        tag: "span",
        attr: [{
          key: "class",
          value: "button-icon icon-edit"
        }]
      });
      var linkRemove = helper.makeNode({
        tag: "button",
        attr: [{
          key: "class",
          value: "button button-small link-control-item link-control-item-remove"
        }, {
          key: "tabindex",
          value: -1
        }, {
          key: "title",
          value: "Remove this bookmark"
        }]
      });
      var linkRemoveIcon = helper.makeNode({
        tag: "span",
        attr: [{
          key: "class",
          value: "button-icon icon-close"
        }]
      });
      if (stagedLink.link.display == "letter") {
        linkDisplay.appendChild(linkDisplayLetter);
      } else if (stagedLink.link.display == "icon" && stagedLink.link.icon.prefix != null && stagedLink.link.icon.name != null) {
        linkDisplay.appendChild(linkDisplayIcon);
      };
      if (state.get().link.item.order == "displayname") {
        linkPanelFront.appendChild(linkDisplay);
        linkPanelFront.appendChild(linkName);
      } else if (state.get().link.item.order == "namedisplay") {
        linkPanelFront.appendChild(linkName);
        linkPanelFront.appendChild(linkDisplay);
      };
      linkHandle.appendChild(linkHandleIcon);
      linkControl.appendChild(linkHandle);
      linkEdit.appendChild(linkEditIcon);
      linkControl.appendChild(linkEdit);
      linkRemove.appendChild(linkRemoveIcon);
      linkControl.appendChild(linkRemove);
      linkUrl.appendChild(linkUrlText);
      linkPanelBack.appendChild(linkUrl);
      linkPanelBack.appendChild(linkControl);
      linkItem.appendChild(linkPanelFront);
      linkItem.appendChild(linkPanelBack);

      var copyStagedLinkLink = JSON.parse(JSON.stringify(stagedLink.link));
      var copyStagedLinkPosition = JSON.parse(JSON.stringify(stagedLink.position));

      linkEdit.addEventListener("click", function() {
        _previousFocus = stagedLink.position;
        render.item.edit(copyStagedLinkLink, copyStagedLinkPosition);
      }, false);

      linkRemove.addEventListener("click", function() {
        _previousFocus = stagedLink.position;
        render.remove(copyStagedLinkLink, copyStagedLinkPosition);
      }, false);

      return linkItem;
    },
    edit: function(link, position) {
      stagedLink.link = link;
      stagedLink.position = position;
      stagedLink.position.origin = JSON.parse(JSON.stringify(stagedLink.position.destination));
      var form = render.form();
      // console.log(form.querySelector(".link-form-position").querySelectorAll("option"));
      form.querySelector(".link-form-position").selectedIndex = stagedLink.position.origin.item
      form.querySelector(".link-form-select-group").selectedIndex = stagedLink.position.destination.group;
      if (stagedLink.link.display == "letter" || stagedLink.link.display == null) {
        form.querySelector(".link-form-input-letter").removeAttribute("disabled");
        form.querySelector(".link-form-input-icon").setAttribute("disabled", "");
        helper.addClass(form.querySelector(".form-group-text"), "disabled");
        form.querySelector(".link-form-input-icon").setAttribute("disabled", "");
        helper.addClass(form.querySelector(".link-form-input-icon-helper"), "disabled");
        form.querySelector(".link-form-icon-clear").setAttribute("disabled", "");
        form.querySelector(".link-form-text-icon").tabIndex = -1;
      } else if (stagedLink.link.display == "icon") {
        form.querySelector(".link-form-input-letter").setAttribute("disabled", "");
        form.querySelector(".link-form-input-icon").removeAttribute("disabled");
        helper.removeClass(form.querySelector(".form-group-text"), "disabled");
        form.querySelector(".link-form-input-icon").removeAttribute("disabled");
        helper.removeClass(form.querySelector(".link-form-input-icon-helper"), "disabled");
        form.querySelector(".link-form-icon-clear").removeAttribute("disabled");
        form.querySelector(".link-form-input-display-icon").checked = true;
        form.querySelector(".link-form-text-icon").tabIndex = 1;
      };
      if (stagedLink.link.icon.name != null && stagedLink.link.icon.prefix != null && stagedLink.link.icon.label != null) {
        form.querySelector(".link-form-text-icon").appendChild(helper.node("span|class:link-form-icon " + stagedLink.link.icon.prefix + " fa-" + stagedLink.link.icon.name));
      };
      form.querySelector(".link-form-input-letter").value = stagedLink.link.letter;
      form.querySelector(".link-form-input-icon").value = stagedLink.link.icon.label;
      form.querySelector(".link-form-input-name").value = stagedLink.link.name;
      form.querySelector(".link-form-input-url").value = stagedLink.link.url;
      if (stagedLink.link.accent.override) {
        form.querySelector(".link-form-input-accent-global").checked = false;
        form.querySelector(".link-form-input-accent-custom").checked = true;
        form.querySelector(".link-form-input-accent-picker").removeAttribute("disabled");
        form.querySelector(".link-form-input-accent-hex").removeAttribute("disabled");
        helper.removeClass(form.querySelector(".link-form-input-accent-helper"), "disabled");
      } else {
        form.querySelector(".link-form-input-accent-global").checked = true;
        form.querySelector(".link-form-input-accent-custom").checked = false;
        form.querySelector(".link-form-input-accent-picker").setAttribute("disabled", "");
        form.querySelector(".link-form-input-accent-hex").setAttribute("disabled", "");
        helper.addClass(form.querySelector(".link-form-input-accent-helper"), "disabled");
      };
      if (stagedLink.link.accent.color.r != null && stagedLink.link.accent.color.g != null && stagedLink.link.accent.color.b != null) {
        form.querySelector(".link-form-input-accent-picker").value = helper.rgbToHex(stagedLink.link.accent.color);
        form.querySelector(".link-form-input-accent-hex").value = helper.rgbToHex(stagedLink.link.accent.color);
      };
      var heading;
      if (stagedLink.link.name != null && stagedLink.link.name != "") {
        heading = "Edit " + stagedLink.link.name;
      } else {
        heading = "Edit unnamed bookmark";
      };
      var successAction = function() {
        bookmarks.edit(JSON.parse(JSON.stringify(stagedLink)));
        data.save();
        render.clear();
        render.item.all();
        render.item.tabindex();
        render.previousFocus();
        bind.sort.group();
        bind.sort.link();
        stagedLink.reset();
        autoSuggest.close();
        shade.close();
        pagelock.unlock();
      };
      var cancelAction = function() {
        render.previousFocus();
        stagedLink.reset();
        autoSuggest.close();
        pagelock.unlock();
        shade.close();
      };
      modal.open({
        heading: heading,
        successAction: successAction,
        cancelAction: cancelAction,
        actionText: "Save",
        size: "small",
        content: form
      });
      shade.open({
        action: function() {
          render.clear();
          render.item.all();
          render.item.tabindex();
          render.previousFocus();
          bind.sort.group();
          bind.sort.link();
          stagedLink.reset();
          autoSuggest.close();
          pagelock.unlock();
          modal.close();
        }
      });
    },
    tabindex: function() {
      var allLinkControlItem = helper.eA(".link-control-item");
      if (state.get().link.edit) {
        allLinkControlItem.forEach(function(arrayItem, index) {
          arrayItem.tabIndex = 1;
        });
      } else {
        allLinkControlItem.forEach(function(arrayItem, index) {
          arrayItem.tabIndex = -1;
        });
      };
    },
    border: function() {
      var html = helper.e("html");
      html.style.setProperty("--link-item-border", state.get().link.item.border);
    }
  };

  render.empty = {
    search: function() {
      var div = helper.node("div|class:link-empty");
      var h1 = helper.node("h1:No matching bookmarks found|class:link-empty-heading");
      var para = helper.node("p:\"Enter\" to Search " + state.get().header.search.engine[state.get().header.search.engine.selected].name + "|class:small muted");
      div.appendChild(h1);
      div.appendChild(para);
      return div;
    },
    bookmarks: function() {
      var div = helper.node("div|class:link-empty");
      var h1 = helper.node("h1:No bookmarks added|class:link-empty-heading");
      var para = helper.node("p:Why not add some?|class:small muted");
      div.appendChild(h1);
      div.appendChild(para);
      return div;
    }
  };

  render.previousFocus = function() {
    if (_previousFocus != null) {
      var linkPanelFront = helper.eA(".link-panel-front");
      if (linkPanelFront.length > 0) {
        if (_previousFocus >= 0) {
          linkPanelFront[_previousFocus].focus();
        } else {
          linkPanelFront[0].focus();
        };
      } else {
        helper.e("body").focus();
      };
      _previousFocus = null;
    };
  };

  render.form = function() {
    var form = helper.node("form|class:link-form");
    var fieldset = helper.node("fieldset");

    // group existing
    var groupExistingRadioWrap = helper.node("div|class:input-wrap");
    var groupExistingRadio = helper.node("input|class:link-form-input-group-existing,id:link-form-input-group-existing,type:radio,name:link-form-input-group,tabindex:1,checked,value:existing");
    var groupExistingLable = helper.node("label:Existing group|for:link-form-input-group-existing");
    var groupExistingFormIndent = helper.node("div|class:form-indent");
    var groupExistingGroupInputWrap = helper.node("div|class:input-wrap");
    var groupExistingGroup = helper.node("select|id:link-form-select-group,class:link-form-select-group mb-0,tabindex:1");
    var groupExistingPositionLabel = helper.node("label:Position|for:link-form-position");
    var groupExistingPositionInputWrap = helper.node("div|class:input-wrap");
    var groupExistingPosition = helper.node("select|id:link-form-position,class:link-form-position mb-0,tabindex:1");

    // group new
    var groupNewRadioWrap = helper.node("div|class:input-wrap");
    var groupNewRadio = helper.node("input|class:link-form-input-group-new,id:link-form-input-group-new,type:radio,name:link-form-input-group,tabindex:1,value:new");
    var groupNewLable = helper.node("label:New group|for:link-form-input-group-new");
    var groupNewFormIndent = helper.node("div|class:form-indent");
    var groupNewInputWrap = helper.node("div|class:input-wrap");
    var groupNewInput = helper.node("input|type:text,class:link-form-input-new-group mb-0,id:link-form-input-new-group,placeholder:Example group,tabindex:1,autocomplete:off,autocorrect:off,autocapitalize:off,spellcheck:false,disabled");

    // letter
    var displayLetterRadioWrap = helper.node("div|class:input-wrap");
    var displayLetterRadio = helper.node("input|class:link-form-input-display-letter,id:link-form-input-display-letter,type:radio,name:link-form-input-display,tabindex:1,checked,value:letter");
    var displayLetterLable = helper.node("label:Letters|for:link-form-input-display-letter");
    var displayLetterFormIndent = helper.node("div|class:form-indent");
    var displayLetterInputWrap = helper.node("div|class:input-wrap");
    var displayLetterInput = helper.node("input|type:text,class:link-form-input-letter mb-0,id:link-form-input-letter,placeholder:E,tabindex:1,autocomplete:off,autocorrect:off,autocapitalize:off,spellcheck:false");

    // icon
    var displayIconRadiotWrap = helper.node("div|class:input-wrap");
    var displayIconRadio = helper.node("input|class:link-form-input-display-icon,id:link-form-input-display-icon,type:radio,name:link-form-input-display,tabindex:1,value:icon");
    var displayIconLable = helper.node("label:Icon|for:link-form-input-display-icon");
    var displayIconFormIndent = helper.node("div|class:form-indent");
    var displayIconInputWrap = helper.node("div|class:input-wrap");
    var displayIconFormGroup = helper.node("div|class:form-group mb-0 auto-suggest-wrapper");
    var displayIconInput = helper.node("input|type:text,class:form-group-item-grow link-form-input-icon auto-suggest-input,id:link-form-input-icon,placeholder:Search for Brands or Icons,tabindex:1,autocomplete:off,autocorrect:off,autocapitalize:off,spellcheck:false,disabled");
    var displayIconFormGroupText = helper.node("div|class:form-group-text link-form-text-icon disabled,tabindex:-1");
    var displayIconFormGroupClear = helper.node("button|class:link-form-icon-clear button mb-0,type:button,tabindex:1,disabled");
    var displayIconFormGroupClearIcon = helper.node("span|class:icon-close");
    var displayIconHelper = helper.node("p:Refer to the \"Free\" and \"Brand\" icons from FontAwesome for full set of icons supported.|class:link-form-input-icon-helper form-helper small muted disabled");

    // name
    var nameInputWrap = helper.node("div|class:input-wrap");
    var nameLabel = helper.node("label:Name|for:link-form-input-name");
    var nameInput = helper.node("input|type:text,class:link-form-input-name mb-0,id:link-form-input-name,placeholder:Example,tabindex:1,autocomplete:off,autocorrect:off,autocapitalize:off,spellcheck:false");

    // url
    var urlInputWrap = helper.node("div|class:input-wrap");
    var urlLabel = helper.node("label:URL|for:link-form-input-url");
    var urlInput = helper.node("input|type:text,class:link-form-input-url mb-0,id:link-form-input-url,placeholder:https://www.example.com/,tabindex:1,autocomplete:off,autocorrect:off,autocapitalize:off,spellcheck:false");
    var urlInputHelper = helper.makeNode({
      tag: "p",
      text: "Be sure to use the full URL and include \"http://\" or \"https://\".",
      attr: [{
        key: "class",
        value: "form-helper small muted"
      }]
    });

    // accent
    var accentLabel = helper.node("label:Accent colour");
    var accentGlobalRadioWrap = helper.node("div|class:input-wrap");
    var accentGlobalRadio = helper.node("input|class:link-form-input-accent-global,id:link-form-input-accent-global,type:radio,name:link-form-input-accent,tabindex:1,checked,value:global");
    var accentGlobalLabel = helper.node("label:Global|for:link-form-input-accent-global");
    var accentCustomInputWrap = helper.node("div|class:input-wrap");
    var accentCustomRadio = helper.node("input|class:link-form-input-accent-custom,id:link-form-input-accent-custom,type:radio,name:link-form-input-accent,tabindex:1,value:custom");
    var accentCustomLabel = helper.node("label:Custom|for:link-form-input-accent-custom");
    var accentColorFormIndent = helper.node("div|class:form-indent");
    var accentColorInputWrap = helper.node("div|class:input-wrap");
    var accentColorFormGroup = helper.node("div|class:form-group mb-0");
    var accentColorPicker = helper.node("input|id:link-form-input-accent-picker,class:form-group-item-half link-form-input-accent-picker mb-0,type:color,value:#000000,tabindex:1,disabled");
    var accentColorHex = helper.node("input|id:link-form-input-accent-hex,class:form-group-item-half link-form-input-accent-hex mb-0,type:text,placeholder:Hex code,value:#000000,tabindex:1,maxlength:7,disabled");
    var accentColorInputHelper = helper.node("p:Use this colour to override the global Accent colour.|class:link-form-input-accent-helper form-helper small muted disabled");

    groupExistingRadioWrap.appendChild(groupExistingRadio);
    groupExistingRadioWrap.appendChild(groupExistingLable);
    groupExistingGroupInputWrap.appendChild(groupExistingGroup);
    groupExistingPositionInputWrap.appendChild(groupExistingPositionLabel);
    groupExistingPositionInputWrap.appendChild(groupExistingPosition);
    groupExistingFormIndent.appendChild(groupExistingGroupInputWrap);
    groupExistingFormIndent.appendChild(groupExistingPositionInputWrap);
    fieldset.appendChild(groupExistingRadioWrap);
    fieldset.appendChild(groupExistingFormIndent);
    bookmarks.get().forEach(function(arrayItem, index) {
      var option = helper.node("option:" + arrayItem.name + "|value:" + arrayItem.name);
      groupExistingGroup.appendChild(option);
    });
    var optionCount = bookmarks.get()[groupExistingGroup.selectedIndex].items.length + 1;
    for (var i = 1; i <= optionCount; i++) {
      var option = helper.node("option:" + i);
      groupExistingPosition.appendChild(option);
    };
    groupExistingPosition.selectedIndex = optionCount - 1;

    groupNewRadioWrap.appendChild(groupNewRadio);
    groupNewRadioWrap.appendChild(groupNewLable);
    groupNewInputWrap.appendChild(groupNewInput);
    groupNewFormIndent.appendChild(groupNewInputWrap);
    fieldset.appendChild(groupNewRadioWrap);
    fieldset.appendChild(groupNewFormIndent);
    fieldset.appendChild(helper.node("hr"));

    displayLetterRadioWrap.appendChild(displayLetterRadio);
    displayLetterRadioWrap.appendChild(displayLetterLable);
    fieldset.appendChild(displayLetterRadioWrap);
    displayLetterInputWrap.appendChild(displayLetterInput);
    displayLetterFormIndent.appendChild(displayLetterInputWrap);
    fieldset.appendChild(displayLetterFormIndent);
    displayIconRadiotWrap.appendChild(displayIconRadio);
    displayIconRadiotWrap.appendChild(displayIconLable);
    fieldset.appendChild(displayIconRadiotWrap);
    displayIconFormGroupClear.appendChild(displayIconFormGroupClearIcon);
    displayIconFormGroup.appendChild(displayIconInput);
    displayIconFormGroup.appendChild(displayIconFormGroupText);
    displayIconFormGroup.appendChild(displayIconFormGroupClear);
    displayIconInputWrap.appendChild(displayIconFormGroup);
    displayIconFormIndent.appendChild(displayIconInputWrap);
    displayIconFormIndent.appendChild(displayIconHelper);
    fieldset.appendChild(displayIconFormIndent);
    fieldset.appendChild(helper.node("hr"));
    nameInputWrap.appendChild(nameLabel);
    nameInputWrap.appendChild(nameInput);
    fieldset.appendChild(nameInputWrap);
    urlInputWrap.appendChild(urlLabel);
    urlInputWrap.appendChild(urlInput);
    fieldset.appendChild(urlInputWrap);
    fieldset.appendChild(urlInputHelper);
    fieldset.appendChild(helper.node("hr"));
    fieldset.appendChild(accentLabel);
    accentGlobalRadioWrap.appendChild(accentGlobalRadio);
    accentGlobalRadioWrap.appendChild(accentGlobalLabel);
    fieldset.appendChild(accentGlobalRadioWrap);
    accentCustomInputWrap.appendChild(accentCustomRadio);
    accentCustomInputWrap.appendChild(accentCustomLabel);
    fieldset.appendChild(accentCustomInputWrap);
    accentColorFormGroup.appendChild(accentColorPicker);
    accentColorFormGroup.appendChild(accentColorHex);
    accentColorInputWrap.appendChild(accentColorFormGroup);
    accentColorFormIndent.appendChild(accentColorInputWrap);
    accentColorFormIndent.appendChild(accentColorInputHelper);
    fieldset.appendChild(accentColorFormIndent);
    form.appendChild(fieldset);

    groupExistingRadio.addEventListener("change", function(event) {
      stagedLink.position.destination.group = groupExistingGroup.selectedIndex;
      stagedLink.position.group.new = false;
      groupExistingGroup.removeAttribute("disabled");
      groupExistingPosition.removeAttribute("disabled");
      helper.removeClass(groupExistingPositionLabel, "disabled");
      groupNewInput.setAttribute("disabled", "");
    }, false);
    groupExistingGroup.addEventListener("change", function(event) {
      stagedLink.position.destination.group = this.selectedIndex;
      var linkCount = bookmarks.get()[groupExistingGroup.selectedIndex].items.length + 2;
      while (groupExistingPosition.lastChild) {
        groupExistingPosition.removeChild(groupExistingPosition.lastChild);
      };
      for (var i = 1; i < linkCount; i++) {
        var option = helper.node("option:" + i);
        groupExistingPosition.appendChild(option);
      };
      groupExistingPosition.selectedIndex = linkCount - 2;
    }, false);
    groupExistingPosition.addEventListener("change", function(event) {
      stagedLink.position.destination.item = groupExistingPosition.selectedIndex;
    }, false);
    groupNewRadio.addEventListener("change", function(event) {
      stagedLink.position.destination.group = bookmarks.get().length;
      stagedLink.position.group.new = true;
      groupExistingGroup.setAttribute("disabled", "");
      groupExistingPosition.setAttribute("disabled", "");
      helper.addClass(groupExistingPositionLabel, "disabled");
      groupNewInput.removeAttribute("disabled");
    }, false);
    groupNewInput.addEventListener("input", function(event) {
      stagedLink.position.group.name = this.value;
    }, false);
    displayLetterRadio.addEventListener("change", function(event) {
      stagedLink.link.display = this.value;
    }, false);
    displayIconRadio.addEventListener("change", function(event) {
      stagedLink.link.display = this.value;
    }, false);
    displayLetterInput.addEventListener("input", function(event) {
      stagedLink.link.letter = this.value;
    }, false);
    nameInput.addEventListener("input", function(event) {
      stagedLink.link.name = this.value;
    }, false);
    urlInput.addEventListener("input", function(event) {
      stagedLink.link.url = this.value;
    }, false);
    accentGlobalRadio.addEventListener("change", function() {
      stagedLink.link.accent.override = false;
      accentColorPicker.setAttribute("disabled", "");
      accentColorHex.setAttribute("disabled", "");
      helper.addClass(accentColorInputHelper, "disabled");
    }, false);
    accentCustomRadio.addEventListener("change", function() {
      stagedLink.link.accent.override = true;
      stagedLink.link.accent.color = helper.hexToRgb(accentColorPicker.value);
      accentColorPicker.removeAttribute("disabled");
      accentColorHex.removeAttribute("disabled");
      helper.removeClass(accentColorInputHelper, "disabled");
    }, false);
    accentColorPicker.addEventListener("change", function() {
      if (helper.isHexNumber(this.value)) {
        stagedLink.link.accent.color = helper.hexToRgb(this.value);
        accentColorHex.value = this.value;
      };
    }, false);
    accentColorHex.addEventListener("input", function() {
      if (helper.isHexNumber(this.value)) {
        stagedLink.link.accent.color = helper.hexToRgb(this.value);
        accentColorPicker.value = this.value;
      };
    }, false);
    displayIconFormGroupClear.addEventListener("click", function(event) {
      stagedLink.link.icon.name = null;
      stagedLink.link.icon.prefix = null;
      stagedLink.link.icon.label = null;
      var existingIcon = helper.e(".link-form-icon");
      if (existingIcon) {
        existingIcon.remove();
      };
      displayIconInput.value = "";
    }, false);
    displayLetterRadio.addEventListener("change", function(event) {
      displayLetterInput.removeAttribute("disabled");
      displayIconInput.setAttribute("disabled", "");
      helper.addClass(displayIconFormGroupText, "disabled");
      helper.addClass(displayIconHelper, "disabled");
      displayIconFormGroupClear.setAttribute("disabled", "");
      displayIconFormGroupText.tabIndex = -1;
    }, false);
    displayIconRadio.addEventListener("change", function(event) {
      displayLetterInput.setAttribute("disabled", "");
      displayIconInput.removeAttribute("disabled");
      helper.removeClass(displayIconFormGroupText, "disabled");
      helper.removeClass(displayIconHelper, "disabled");
      displayIconFormGroupClear.removeAttribute("disabled");
      displayIconFormGroupText.tabIndex = 1;
    }, false);
    autoSuggest.bind.input({
      input: displayIconInput,
      type: "fontawesomeIcon",
      postFocus: displayIconFormGroupText
    });
    return form;
  };

  render.autoSuggestIconAction = function(autoSuggestData) {
    stagedLink.link.icon.label = autoSuggestData.label;
    stagedLink.link.icon.name = autoSuggestData.name;
    if (autoSuggestData.styles.includes("solid")) {
      stagedLink.link.icon.prefix = "fas";
    } else if (autoSuggestData.styles.includes("brands")) {
      stagedLink.link.icon.prefix = "fab";
    };
    var existingIcon = helper.e(".link-form-icon");
    if (existingIcon) {
      existingIcon.remove();
    };
    helper.e(".link-form-input-icon").value = autoSuggestData.label;
    helper.e(".link-form-text-icon").appendChild(helper.node("span|class:link-form-icon " + stagedLink.link.icon.prefix + " fa-" + stagedLink.link.icon.name));
    helper.e(".link-form-text-icon").focus();
  };

  var add = {
    open: function() {
      mod.add.open();
      stagedLink.init();
      var successAction = function() {
        stagedLink.link.timeStamp = new Date().getTime();
        bookmarks.mod.add.link(JSON.parse(JSON.stringify(stagedLink)));
        data.save();
        mod.add.close();
        render.clear();
        render.item.all();
        render.item.tabindex();
        bind.sort.group();
        bind.sort.link();
        control.render.dependents();
        control.render.class();
        stagedLink.reset();
        shade.close();
        pagelock.unlock();
      };
      var cancelAction = function() {
        mod.add.close();
        stagedLink.reset();
        autoSuggest.close();
        shade.close();
        pagelock.unlock();
      };
      modal.open({
        heading: "Add a new bookmark",
        successAction: successAction,
        cancelAction: cancelAction,
        actionText: "Add",
        size: "small",
        content: render.form()
      });
      shade.open({
        action: function() {
          mod.add.close();
          modal.close();
          stagedLink.reset();
          pagelock.unlock();
        }
      });
      stagedLink.position.destination.item = helper.e(".link-form-position").selectedIndex;
      pagelock.lock();
    },
    close: function() {
      mod.add.close();
      modal.close();
      stagedLink.reset();
      pagelock.unlock();
    }
  };

  var edit = function() {
    mod.edit.toggle();
  };

  var tabindex = function() {
    render.item.tabindex();
  };

  var items = function() {
    render.clear();
    render.item.all();
    bind.sort.group();
    bind.sort.link();
  };

  var init = function() {
    mod.add.close();
    render.area.width();
    render.item.all();
    render.item.tabindex();
    render.item.size();
    render.item.display.letter();
    render.item.display.icon();
    render.item.name();
    render.item.border();
    bind.sort.group();
    bind.sort.link();
  };

  // exposed methods
  return {
    init: init,
    mod: mod,
    render: render,
    add: add,
    edit: edit,
    items: items,
    tabindex: tabindex,


    stagedLink: stagedLink

  };

})();
