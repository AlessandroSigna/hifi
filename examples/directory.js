//
//  directory.js
//  examples
//
//  Created by David Rowe on 8 Jun 2015
//  Copyright 2015 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

Script.include([
    "libraries/toolBars.js",
]);

HIFI_PUBLIC_BUCKET = "http://s3.amazonaws.com/hifi-public/";
var toolIconUrl = HIFI_PUBLIC_BUCKET + "images/tools/";

var DIRECTORY_WINDOW_URL = "https://metaverse.highfidelity.com/directory";
var directoryWindow = new OverlayWebWindow({
    title: 'directory',
    source: "about:blank",
    width: 900,
    height: 700,
    visible: false
});

var toolHeight = 50;
var toolWidth = 50;


function showDirectory() {
    directoryWindow.setURL(DIRECTORY_WINDOW_URL);
    directoryWindow.setVisible(true);
}

function hideDirectory() {
    directoryWindow.setVisible(false);
    directoryWindow.setURL("about:blank");
}

function toggleDirectory() {
    if (directoryWindow.visible) {
        hideDirectory();
    } else {
        showDirectory();
    }
}

var toolBar = (function() {
    var that = {},
        toolBar,
        browseDirectoryButton;

    function initialize() {
        ToolBar.SPACING = 16;
        toolBar = new ToolBar(0, 0, ToolBar.VERTICAL, "highfidelity.directory.toolbar", function(windowDimensions, toolbar) {
            return {
                x: windowDimensions.x - 8 - toolbar.width,
                y: 50
            };
        });
        browseDirectoryButton = toolBar.addTool({
            imageURL: toolIconUrl + "directory.svg",
            width: toolWidth,
            height: toolHeight,
            alpha: 0.9,
            visible: true,
        });

        toolBar.showTool(browseDirectoryButton, true);
    }

    var browseDirectoryButtonDown = false;
    that.mousePressEvent = function(event) {
        var clickedOverlay,
            url,
            file;

        if (!event.isLeftButton) {
            // if another mouse button than left is pressed ignore it
            return false;
        }

        clickedOverlay = Overlays.getOverlayAtPoint({
            x: event.x,
            y: event.y
        });



        if (browseDirectoryButton === toolBar.clicked(clickedOverlay)) {
            toggleDirectory();
            return true;
        }

        return false;
    };

    that.mouseReleaseEvent = function(event) {
        var handled = false;


        if (browseDirectoryButtonDown) {
            var clickedOverlay = Overlays.getOverlayAtPoint({
                x: event.x,
                y: event.y
            });
        }

        newModelButtonDown = false;
        browseDirectoryButtonDown = false;

        return handled;
    }

    that.cleanup = function() {
        toolBar.cleanup();
    };

    initialize();
    return that;
}());

Controller.mousePressEvent.connect(toolBar.mousePressEvent)
Script.scriptEnding.connect(toolBar.cleanup);
