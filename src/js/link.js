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
    update: {
      func: {
        group: function(event) {
          bookmarks.mod.move.group({
            origin: {
              group: event.detail.origin.index
            },
            destination: {
              group: event.detail.destination.index
            }
          });
          data.save();
          render.clear();
          render.item.all();
          render.item.tabindex();
          render.previousFocus();
          bind.sort.group();
          bind.sort.item();
        },
        item: function(event) {
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
          render.clear();
          render.item.all();
          render.item.tabindex();
          render.previousFocus();
          bind.sort.group();
          bind.sort.item();
        }
      },
      remove: {
        group: function() {
          helper.eA(".link").forEach(function(arrayItem, index) {
            sortable(arrayItem)[0].removeEventListener("sortupdate", bind.sort.update.func.group, false);
          });
        },
        item: function() {
          helper.eA(".link-area-list").forEach(function(arrayItem, index) {
            sortable(arrayItem)[0].removeEventListener("sortupdate", bind.sort.update.func.item, false);
          });
        }
      }
    },
    group: function() {
      sortable(".link", {
        items: ".link-area",
        handle: ".group-control-item-handle",
        orientation: "vertical",
        placeholder: helper.node("div|class:link-placeholder"),
        forcePlaceholderSize: true
      });
      bind.sort.update.remove.group();
      helper.eA(".link").forEach(function(arrayItem, index) {
        sortable(arrayItem)[0].addEventListener("sortupdate", bind.sort.update.func.group, false, event);
      });
    },
    item: function() {
      sortable(".link-area-list", {
        items: ".link-item",
        handle: ".link-control-item-handle",
        acceptFrom: '.link-area-list',
        orientation: "horizontal",
        placeholder: helper.node("div|class:link-placeholder"),
        forcePlaceholderSize: true
      });
      bind.sort.update.remove.item();
      helper.eA(".link-area-list").forEach(function(arrayItem, index) {
        sortable(arrayItem)[0].addEventListener("sortupdate", bind.sort.update.func.item, false, event);
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
      bind.sort.item();
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
        bind.sort.item();
        stagedLink.reset();
        autoSuggest.close();
        pagelock.unlock();
        modal.close();
      }
    });
    pagelock.lock();
  };

  render.move = {
    link: function() {
      bookmarks.edit(JSON.parse(JSON.stringify(stagedLink)));
      data.save();
      render.clear();
      render.item.all();
      render.item.tabindex();
      render.previousFocus();
      bind.sort.group();
      bind.sort.item();
      stagedLink.reset();
    },
    left: function(copyStagedLink) {
      stagedLink.link = JSON.parse(JSON.stringify(copyStagedLink)).link;
      stagedLink.position = JSON.parse(JSON.stringify(copyStagedLink)).position;
      stagedLink.position.destination.item = stagedLink.position.destination.item - 1;
      if (stagedLink.position.destination.item < 0) {
        stagedLink.position.destination.item = 0;
      };
      render.move.link();
    },
    right: function(copyStagedLink) {
      stagedLink.link = JSON.parse(JSON.stringify(copyStagedLink)).link;
      stagedLink.position = JSON.parse(JSON.stringify(copyStagedLink)).position;
      stagedLink.position.destination.item = stagedLink.position.destination.item + 1;
      render.move.link();
    }
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
    var groupControl = helper.node("div|class:group-control");
    var groupHandle = helper.node("div|class:button button-small group-control-item group-control-item-handle,tabindex:-1,title:Drag and drop to reorder");
    var groupHandleIcon = helper.node("span|class:button-icon icon-reorder");
    var groupEdit = helper.node("button|class:button button-small group-control-item group-control-item-edit,tabindex:-1,title:Edit this bookmark");
    var groupEditIcon = helper.node("span|class:button-icon icon-edit");
    var groupRemove = helper.node("button|class:button button-small group-control-item link-control-item-remove,tabindex:-1,title:Remove this bookmark");
    var groupRemoveIcon = helper.node("span|class:button-icon icon-close");
    var groupDown = helper.node("button|class:button button-small group-control-item link-control-item-remove,tabindex:-1,title:Remove this bookmark");
    var groupDownIcon = helper.node("span|class:button-icon icon-arrow-down");
    var groupUp = helper.node("button|class:button button-small group-control-item link-control-item-remove,tabindex:-1,title:Remove this bookmark");
    var groupUpIcon = helper.node("span|class:button-icon icon-arrow-up");
    groupHandle.appendChild(groupHandleIcon);
    groupControl.appendChild(groupHandle);
    groupDown.appendChild(groupDownIcon);
    groupControl.appendChild(groupDown);
    groupUp.appendChild(groupUpIcon);
    groupControl.appendChild(groupUp);
    groupEdit.appendChild(groupEditIcon);
    groupControl.appendChild(groupEdit);
    groupRemove.appendChild(groupRemoveIcon);
    groupControl.appendChild(groupRemove);
    linkArea.appendChild(groupControl);
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
            stagedLink.position.origin.group = index;
            stagedLink.position.destination.group = index;
            linkArea = render.areaName(arrayItem);
            linkArea.position = JSON.parse(JSON.stringify(stagedLink.position));
            var linkAreaList = helper.node("div|class:link-area-list");
            arrayItem.items.forEach(function(arrayItem, index) {
              stagedLink.link = JSON.parse(JSON.stringify(arrayItem));
              stagedLink.position.origin.item = index;
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
      var linkPanelBack = helper.node("div|class:link-panel-back");
      var linkDisplay = helper.node("div|class:link-display");
      var linkDisplayLetter = null;
      var linkDisplayIcon = null;
      if (stagedLink.link.display == "letter") {
        linkDisplayLetter = helper.node("p:" + stagedLink.link.letter + "|class:link-display-letter");
      } else if (stagedLink.link.display == "icon" && stagedLink.link.icon.prefix != null && stagedLink.link.icon.name != null) {
        linkDisplayIcon = helper.node("div|class:link-display-icon " + stagedLink.link.icon.prefix + " fa-" + stagedLink.link.icon.name);
      };
      var linkName = helper.node("p:" + stagedLink.link.name + "|class:link-name");
      var linkUrl = helper.node("div|class:link-url");
      var url = "";
      if (stagedLink.link.url != null) {
        url = stagedLink.link.url.replace(/^https?\:\/\//i, "").replace(/\/$/, "");
      };
      var linkUrlText = helper.node("p:" + url + "|class:link-url-text,title:" + url);
      var linkControl = helper.node("div|class:link-control");
      var linkHandle = helper.node("div|class:button button-small link-control-item link-control-item-handle,tabindex:-1,title:Drag and drop to reorder");
      var linkHandleIcon = helper.node("span|class:button-icon icon-reorder");
      var linkEdit = helper.node("button|class:button button-small link-control-item link-control-item-edit,tabindex:-1,title:Edit this bookmark");
      var linkEditIcon = helper.node("span|class:button-icon icon-edit");
      var linkLeft = helper.node("button|class:button button-small link-control-item link-control-item-left,tabindex:-1,title:Move this bookmark left");
      var linkLeftIcon = helper.node("span|class:button-icon icon-arrow-left");
      var linkRight = helper.node("button|class:button button-small link-control-item link-control-item-right,tabindex:-1,title:Move this bookmark right");
      var linkRightIcon = helper.node("span|class:button-icon icon-arrow-right");
      var linkRemove = helper.node("button|class:button button-small link-control-item link-control-item-remove,tabindex:-1,title:Remove this bookmark");
      var linkRemoveIcon = helper.node("span|class:button-icon icon-close");

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
      linkLeft.appendChild(linkLeftIcon);
      linkControl.appendChild(linkLeft);
      linkRight.appendChild(linkRightIcon);
      linkControl.appendChild(linkRight);
      linkEdit.appendChild(linkEditIcon);
      linkControl.appendChild(linkEdit);
      linkRemove.appendChild(linkRemoveIcon);
      linkControl.appendChild(linkRemove);
      linkUrl.appendChild(linkUrlText);
      linkPanelBack.appendChild(linkUrl);
      linkPanelBack.appendChild(linkControl);
      linkItem.appendChild(linkPanelFront);
      linkItem.appendChild(linkPanelBack);

      var copyStagedLink = JSON.parse(JSON.stringify(stagedLink));

      linkLeft.addEventListener("click", function() {
        render.move.left(copyStagedLink);
      }, false);

      linkRight.addEventListener("click", function() {
        render.move.right(copyStagedLink);
      }, false);

      linkEdit.addEventListener("click", function() {
        // _previousFocus = stagedLink.position;
        render.item.edit(copyStagedLink);
      }, false);

      linkRemove.addEventListener("click", function() {
        // _previousFocus = stagedLink.position;
        render.remove(copyStagedLink);
      }, false);

      return linkItem;
    },
    edit: function(copyStagedLink) {
      stagedLink.link = JSON.parse(JSON.stringify(copyStagedLink)).link;
      stagedLink.position = JSON.parse(JSON.stringify(copyStagedLink)).position;
      var form = render.form({
        useStagedLink: true
      });
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
        bind.sort.item();
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
          bind.sort.item();
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

  render.form = function(override) {
    var options = {
      useStagedLink: null
    };
    if (override) {
      options = helper.applyOptions(options, override);
    };
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

    var makeGroupOptions = function() {
      bookmarks.get().forEach(function(arrayItem, index) {
        groupExistingGroup.appendChild(helper.node("option:" + arrayItem.name + "|value:" + arrayItem.name));
      });
    };

    var makePostionOptions = function() {
      while (groupExistingPosition.lastChild) {
        groupExistingPosition.removeChild(groupExistingPosition.lastChild);
      };
      var optionCount;
      if (options.useStagedLink && stagedLink.position.origin.group == stagedLink.position.destination.group) {
        optionCount = bookmarks.get()[stagedLink.position.origin.group].items.length;
      } else {
        optionCount = bookmarks.get()[stagedLink.position.destination.group].items.length + 1;
      };
      for (var i = 1; i <= optionCount; i++) {
        groupExistingPosition.appendChild(helper.node("option:" + helper.ordinalNumber(i)));
        if (optionCount == i) {
          groupExistingPosition.selectedIndex = i - 1;
        }
      };
    };

    var populateForm = function() {
      groupExistingGroup.selectedIndex = stagedLink.position.origin.group;
      groupExistingPosition.selectedIndex = stagedLink.position.origin.item;
      if (stagedLink.link.display == "letter") {
        displayLetterInput.removeAttribute("disabled");
        displayIconInput.setAttribute("disabled", "");
        helper.addClass(displayIconFormGroupText, "disabled");
        displayIconInput.setAttribute("disabled", "");
        helper.addClass(displayIconHelper, "disabled");
        displayIconFormGroupClear.setAttribute("disabled", "");
        displayIconFormGroupText.tabIndex = -1;
      } else if (stagedLink.link.display == "icon") {
        displayLetterInput.setAttribute("disabled", "");
        displayIconInput.removeAttribute("disabled");
        helper.removeClass(displayIconFormGroupText, "disabled");
        displayIconInput.removeAttribute("disabled");
        helper.removeClass(displayIconHelper, "disabled");
        displayIconFormGroupClear.removeAttribute("disabled");
        displayIconRadio.checked = true;
        displayIconFormGroupText.tabIndex = 1;
      };
      if (stagedLink.link.icon.name != null && stagedLink.link.icon.prefix != null && stagedLink.link.icon.label != null) {
        displayIconFormGroupText.appendChild(helper.node("span|class:link-form-icon " + stagedLink.link.icon.prefix + " fa-" + stagedLink.link.icon.name));
      };
      displayLetterInput.value = stagedLink.link.letter;
      displayIconInput.value = stagedLink.link.icon.label;
      nameInput.value = stagedLink.link.name;
      urlLabel.value = stagedLink.link.url;
      if (stagedLink.link.accent.override) {
        accentGlobalRadio.checked = false;
        accentCustomRadio.checked = true;
        accentColorPicker.removeAttribute("disabled");
        accentColorHex.removeAttribute("disabled");
        helper.removeClass(form.querySelector(".link-form-input-accent-helper"), "disabled");
      } else {
        accentGlobalRadio.checked = true;
        accentCustomRadio.checked = false;
        accentColorPicker.setAttribute("disabled", "");
        accentColorHex.setAttribute("disabled", "");
        helper.addClass(form.querySelector(".link-form-input-accent-helper"), "disabled");
      };
      if (stagedLink.link.accent.color.r != null && stagedLink.link.accent.color.g != null && stagedLink.link.accent.color.b != null) {
        accentColorPicker.value = helper.rgbToHex(stagedLink.link.accent.color);
        accentColorHex.value = helper.rgbToHex(stagedLink.link.accent.color);
      };
    };

    makeGroupOptions();
    makePostionOptions();
    if (options.useStagedLink) {
      populateForm();
    };

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
      makePostionOptions();
      stagedLink.position.destination.item = groupExistingPosition.selectedIndex;
    }, false);
    groupExistingPosition.addEventListener("change", function(event) {
      stagedLink.position.destination.item = this.selectedIndex;
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
        bind.sort.item();
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
    bind.sort.item();
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
    bind.sort.item();
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
    // temp
    stagedLink: stagedLink
  };

})();
