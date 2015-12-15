//myEntityScript


(function() {
    
    // Script.include("../libraries/overlayManager.js");
    // var RED_ICON_URL = "https://dl.dropboxusercontent.com/u/14127429/FBX/VRshop/UI_Red.svg";
    // var mainPanel = null;
    
    var scriptURL = Script.resolvePath("./otherFolder/myEntityScriptBis.js");
    var rotation = Quat.safeEulerAngles(Camera.getOrientation());
    rotation = Quat.fromPitchYawRollDegrees(0, rotation.y, 0);
    var position = Vec3.sum(MyAvatar.position, Vec3.multiply(2, Quat.getFront(rotation)));

    //var position = Vec3.sum(center, Vec3.multiply(-0.1, Quat.getFront(rotation)));
    
    
    MyEntity = function() {
        _this = this;
    };

    MyEntity.prototype = {
        preload: function(entityID) {
        this.entityID = entityID;
        },

        unload: function(entityID) {
            // if (mainPanel != null) {
                // mainPanel.destroy();
            // }
        },

        clickDownOnEntity: function(entityID, mouseEvent) {
            var myEntity = Entities.addEntity({
            type: "Box",
            name: "layer2 entity",
            position: position,
            script: scriptURL,
            rotation: rotation,
            color: {
                red: 250,
                green: 0,
                blue: 0
            }

        });
            // if (mainPanel != null) {
                // mainPanel.destroy();
                // mainPanel = null;
            // } else {
                // mainPanel = new OverlayPanel({
                    // anchorPositionBinding: { avatar: "MyAvatar" },
                    // offsetPosition: { x: 0, y: 0.4, z: -1 },
                    // isFacingAvatar: false
                // });
                // var redDot = mainPanel.addChild(new Image3DOverlay({
                    // url: RED_ICON_URL,
                    // dimensions: {
                        // x: 0.1,
                        // y: 0.1,
                    // },
                    // isFacingAvatar: false,
                    // alpha: 1.0,
                    // ignoreRayIntersection: false,
                    // offsetPosition: {
                        // x: -0.15,
                        // y: -0.15,
                        // z: 0
                    // }
                // }));
            // }
        }
    };
    return new MyEntity();
});