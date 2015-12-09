//
//  detectGrabExample.js
//  examples/entityScripts
//
//  Created by Brad Hefta-Gaub on 9/3/15.
//  Copyright 2015 High Fidelity, Inc.
//
//  This is an example of an entity script which when assigned to an entity, will detect when the entity is being grabbed by the hydraGrab script
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() {
    HIFI_PUBLIC_BUCKET = "http://s3.amazonaws.com/hifi-public/";
    Script.include(HIFI_PUBLIC_BUCKET + "scripts/libraries/utils.js");

    var _this;
    var hand;
    var inspectingMyItem = false;
    var waitingForBumpReleased = false;
    var overlayLine = null;
    var pickRay = null;
    
    var MIN_DIMENSION_THRESHOLD = null;
    var LINE_LENGTH = 500;
    
    var COLOR = {
        red: 10,
        green: 10,
        blue: 255
    };
    

    
    // this is the "constructor" for the entity as a JS object we don't do much here, but we do want to remember
    // our this object, so we can access it in cases where we're called without a this (like in the case of various global signals)
    InspectEntity = function() { 
         _this = this;
    };
    
    function update(deltaTime) {
        _this.updateRay();
        _this.overlayLineOn(pickRay.origin, Vec3.sum(pickRay.origin, Vec3.multiply(pickRay.direction, LINE_LENGTH)), COLOR);
        var bumperPressed = Controller.getValue(Controller.Standard.RB);
        //print("bumper value: " + value);
        if (bumperPressed && !waitingForBumpReleased) {
            print("BUMPER PRESSED");
            waitingForBumpReleased = true;
        } else if (!bumperPressed && waitingForBumpReleased) {
            print("BUMPER RELEASED");
            waitingForBumpReleased = false;
        }
    };
    

    InspectEntity.prototype = {
        
        preload: function(entityID) {
            this.entityID = entityID;
            print("PRELOAD INSPECT ENTITY");
            //get the owner ID from user data and compare to the mine
            //the update will be connected just for the owner
            var ownerObj = getEntityCustomData('ownerKey', this.entityID, null);
            if (ownerObj.ownerID === MyAvatar.sessionUUID) {
                inspectingMyItem = true;
                Script.update.connect(update);
                print("PRELOAD USER DATA: " + Entities.getEntityProperties(_this.entityID).userData);
            }
        },
        
        doSomething: function (entityID, dataArray) {
            var data = JSON.parse(dataArray[0]);
            var itemOwnerObj = getEntityCustomData('ownerKey', data.id, null);
            print("------- The owner of the item is: " + ((itemOwnerObj == null) ? itemOwnerObj : itemOwnerObj.ownerID));
            print("item ID: " + data.id);
                    
            var mapping = Controller.newMapping(MAPPING_NAME);
            mapping.from(Controller.Standard.LX).to(function (value) {
                deltaLX = value;
            });
            mapping.from(Controller.Standard.LY).to(function (value) {
                deltaLY = value;
            });
            mapping.from(Controller.Standard.RX).to(function (value) {
                deltaRX = value;
            });
            mapping.from(Controller.Standard.RY).to(function (value) {
                deltaRY = value;
            });
            Controller.enableMapping(MAPPING_NAME);
            
            
            var cartOwnerObj = getEntityCustomData('ownerKey', this.entityID, null);
            print("------- The owner of the cart is: " + ((cartOwnerObj == null) ? cartOwnerObj : cartOwnerObj.ownerID));
            print("cart ID: " + this.entityID);
            
            if (cartOwnerObj == null) {
                print("The cart doesn't have a owner.");
                Entities.deleteEntity(data.id);
            }
            
            if (itemOwnerObj.ownerID === cartOwnerObj.ownerID) {
                // if itemsQuantity == fullCart resize all the items present in the cart and change the scaleFactor for this and next insert

                print("Going to put item in the cart!");
                var itemsQuantity = itemsID.length;
                
                itemsID[itemsQuantity] = data.id;
                
                var oldDimension = Entities.getEntityProperties(data.id).dimensions;
                Entities.editEntity(data.id, { dimensions: Vec3.multiply(oldDimension, scaleFactor) });
                print("Item resized!");
                
                Entities.editEntity(data.id, { velocity: MyAvatar.getVelocity() }); // MyAvatar.getVelocity() should be zero at this time
                var oldPosition = Entities.getEntityProperties(data.id).position;
                var cartPosition = Entities.getEntityProperties(this.entityID).position;
                relativeItemsPosition[itemsQuantity] = Vec3.subtract(oldPosition, cartPosition);
                
                
                // debug prints
                //Vec3.print("Relative position saved: ", relativeItemsPosition[(itemsQuantity === 1) ? itemsQuantity : itemsQuantity.num]);      
                itemsQuantity = itemsID.length;
                print("Item " + itemsQuantity + itemsID[itemsQuantity-1] + " inserted! New quantity: " + itemsQuantity);
                relativeItemsPosition.forEach( function(p) { Vec3.print("", p) });
                
                setEntityCustomData('statusKey', data.id, {
                    status: "inCart"
                });
                
                print("Set status!");
            }else {
                print("Not your cart!");
                Entities.deleteEntity(data.id);
            }
        },
        
        updateRay: function(){
            pickRay = {
               origin: MyAvatar.getRightPalmPosition(),
               direction: Quat.getUp(MyAvatar.getRightPalmRotation())
            };
            // pickRayLeft = {
               // origin: MyAvatar.getLeftPalmPosition(),
               // direction: Quat.getUp(MyAvatar.getLeftPalmRotation())
            // };
        },
        
        
        overlayLineOn: function(closePoint, farPoint, color) {
            // for (var i = 0; i < overlayLines){
                
            // }
            if (overlayLine == null) {
                var lineProperties = {
                    lineWidth: 5,
                    start: closePoint,
                    end: farPoint,
                    color: color,
                    ignoreRayIntersection: true, // ??
                    visible: true,
                    alpha: 1
                };
                overlayLine = Overlays.addOverlay("line3d", lineProperties); 
            } else {
               var success = Overlays.editOverlay(overlayLine, {
                   lineWidth: 5,
                   start: closePoint,
                   end: farPoint,
                   color: color,
                   visible: true,
                   ignoreRayIntersection: true, // always ignore this
                   alpha: 1
               });
           }
        },

        
        releaseGrab: function () {

        },
        orientationPositionUpdate: function() {

        },
        
        unload: function (entityID) {
            if(inspectingMyItem){
                print("UNLOAD INSPECT ENTITY");
                Script.update.disconnect(update);
                Overlays.deleteOverlay(overlayLine);
                //_this.resetCart();  
                // clean UI
                Entities.deleteEntity(_this.entityID);
            }
        }
    };
    return new InspectEntity();
})