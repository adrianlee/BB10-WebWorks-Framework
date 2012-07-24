/*
 *  Copyright 2012 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var contextmenu,
    menuVisible,
    menuPeeked,
    currentContext,
    config,
    utils,
    includePath,
    elementToExecute,
    previousIndex,
    elements,
    elementsLength;


function requireLocal(id) {
    return require(!!require.resolve ? "../../" + id.replace(/\/chrome/, "") : id);
}

function init() {
    var menu = document.getElementById('contextMenu');
    menu.addEventListener('webkitTransitionEnd', contextmenu.transitionEnd.bind(contextmenu));
    config = requireLocal("../chrome/lib/config.js");
    utils = requireLocal("../chrome/lib/utils");
}

function getNewElementSelection(currentYPosition, elementHeight) {
    var screenHeight = window.screen.availHeight,
        middle = screenHeight / 2,
        diff = currentYPosition - middle,
        elementIndex;

    if ((elementsLength % 2) === 0) {
        elementIndex = (elementsLength / 2)  + Math.floor(diff / elementHeight);
    } else {
        // Base case that we have just a single one, so index that one on touchend
        if (elementsLength === 1) {
            elementIndex = 0;
        }
        else {
            elementIndex = Math.ceil(elementsLength / 2) + Math.floor(diff / elementHeight);
        }
    }

    //Check if the index is greater then the number of elems or less then
    //if so, let's reset the elements and hide all elements
    if (elementIndex > elementsLength || elementIndex < 0) {
        previousIndex = null;
        elementToExecute = null;
        return;
    }

    // Check if we are still on the same element? then return nothing
    // or if we somehow get an off calculation don't do anything
    if (previousIndex === elementIndex)
        return;

    // Else continue and set our values for next time
    // while returning the new element to be shown
    previousIndex = elementIndex;
    elementToExecute = elements[elementIndex];
    return elementToExecute;
}

function handleTouchMove(touchEvent) {
    touchEvent.preventDefault();

    var currentYPosition = touchEvent.touches[0].clientY,
        elementHeight = elements[0].clientHeight,
        elementToShow,
        previousToHideIndex = previousIndex;

    //Base on our current Y position let's calculate which
    // element this touch point belongs to
    elementToShow = getNewElementSelection(currentYPosition, elementHeight);

    if (elementToShow) {
        if ((typeof previousToHideIndex !== "undefined") && elements[previousToHideIndex]) {
            elements[previousToHideIndex].className = "menuItem peekItem";
        }
        elementToShow.className = 'menuItem showItem';
    }
}

/*function handleTouchStart(menuItem) {
    /*if (!menuItem || !menuPeeked) {
        return;
    }
    menuItem.className = 'menuItem showItem';
}*/

function handleTouchEnd(actionId, menuItem) {
    if (menuItem) {
        menuItem.className = 'menuItem peekItem';
    }
    if (elementToExecute) {
        window.qnx.webplatform.getController().remoteExec(1, 'executeMenuAction', [elementToExecute.attributes["actionId"].value]);
    } else {
        window.qnx.webplatform.getController().remoteExec(1, 'executeMenuAction', [actionId]);
    }

    elementToExecute = null;
    previousIndex = null;
}

contextmenu = {
    init: init,
    setMenuOptions: function (options) {
        var menu = document.getElementById("contextMenuContent"),
            i,
            header,
            menuItem,
            menuImage;

        while (menu.childNodes.length >= 1) {
            menu.removeChild(menu.firstChild);
        }
        contextmenu.setHeadText('');
        contextmenu.setSubheadText('');

        for (i = 0; i < options.length; i++) {
            if (options[i].headText || options[i].subheadText) {
                header = document.getElementById('contextMenuHeader');
                header.className = 'contextMenuHeader';
                if (options[i].headText) {
                    contextmenu.setHeadText(options[i].headText);
                }
                if (options[i].subheadText) {
                    contextmenu.setSubheadText(options[i].subheadText);
                }
                continue;
            }
            menuItem = document.createElement('div');
            menuImage = document.createElement('img');
            menuImage.src = options[i].imageUrl ? options[i].imageUrl : 'assets/generic_81_81_placeholder.png';
            menuItem.appendChild(menuImage);
            menuItem.appendChild(document.createTextNode(options[i].name));
            menuItem.setAttribute("class", "menuItem");
            menuItem.setAttribute("actionId", options[i].actionId);
            //menuItem.ontouchstart = handleTouchStart.bind(this, menuItem);
            menuItem.ontouchend = handleTouchEnd.bind(this, options[i].actionId, menuItem);
            menuItem.ontouchmove = handleTouchMove.bind(this);
            menuItem.addEventListener('mousedown', contextmenu.handleMouseDown, false);
            menu.appendChild(menuItem);
        }
    },

    handleMouseDown: function (evt) {
        evt.preventDefault();
    },

    setHeadText: function (text) {
        var headText = document.getElementById('contextMenuHeadText');
        headText.innerText = text;
    },

    setSubheadText: function (text) {
        var subheadText = document.getElementById('contextMenuSubheadText');
        subheadText.innerText = text;
    },

    showContextMenu: function (evt) {
        if (menuVisible) {
            return;
        }
        var menu = document.getElementById('contextMenu');
        menu.className = 'showMenu';
        menuVisible = true;
        if (menuPeeked) {
            evt.cancelBubble = true;
            menuPeeked = false;
        }

        // reset the event listeners since we are now shown, and do not
        // want to continue unfolding the menu
        for (i = 0; i < elements.length; i++) {
            elements[i].ontouchmove = null;
        }

    },

    isMenuVisible: function () {
        return menuVisible || menuPeeked;
    },

    hideContextMenu: function () {
        if (!menuVisible && !menuPeeked) {
            return;
        }
        var menu = document.getElementById('contextMenu'),
            handle = document.getElementById('contextMenuHandle'),
            elements = document.getElementsByClassName("menuItem"),
            i;
        menu.removeEventListener('touchend', contextmenu.hideContextMenu, false);
        handle.removeEventListener('touchend', contextmenu.showContextMenu, false);
        menuVisible = false;
        menuPeeked = false;
        menu.className = 'hideMenu';
        for (i = 0; i < elements.length; i++) {
            elements[i].className = "menuItem peekItem";
        }
        // Reset sensitivity
        window.qnx.webplatform.getController().remoteExec(1, 'webview.setSensitivity', ['SensitivityTest']);
    },

    peekContextMenu: function (show, zIndex) {
        if (menuVisible || menuPeeked) {
            return;
        }

        elements = document.getElementsByClassName("menuItem");
        elementsLength = elements.length;
        window.qnx.webplatform.getController().remoteExec(1, 'webview.setSensitivity', ['SensitivityNoFocus']);
        var menu = document.getElementById('contextMenu'),
            handle = document.getElementById('contextMenuHandle');
        handle.className = 'showContextMenuHandle';
        menuVisible = false;
        menuPeeked = true;
        menu.className = 'peekContextMenu';
    },

    transitionEnd: function () {
        var menu = document.getElementById('contextMenu'),
            handle = document.getElementById('contextMenuHandle'),
            header;
        if (menuVisible) {
            menu.addEventListener('touchend', contextmenu.hideContextMenu, false);
            handle.removeEventListener('touchend', contextmenu.showContextMenu, false);
        } else if (menuPeeked) {
            handle.addEventListener('touchend', contextmenu.showContextMenu, false);
            menu.addEventListener('touchend', contextmenu.hideContextMenu, false);
        } else {
            header = document.getElementById('contextMenuHeader');
            header.className = '';
            contextmenu.setHeadText('');
            contextmenu.setSubheadText('');
        }
    },

    setCurrentContext: function (context) {
        currentContext = context;
    }
};

module.exports = contextmenu;
