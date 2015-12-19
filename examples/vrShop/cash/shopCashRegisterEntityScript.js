//cashRegister

(function () {
    var overlayManagerScript = Script.resolvePath("../../libraries/overlayManager.js");
    
    var SHOPPING_CART_NAME = "Shopping cart";
    var CART_REGISTER_CHANNEL = "Hifi-vrShop::";      //the ID of the cart which has to pay will be appended to this channel name
    var CREDIT_CARD_NAME = "CreditCard";
    
    var _this;
    var cartID = null;
    var actualCartRegisterChannel = null;
    var registerPanel;
    var priceText;
    var payingAvatarID = null;

    function CashRegister() {
        _this = this;
        return;
    };
    
    function receivingMessage(channel, message, senderID) {     //The senderID is the ID of the Avatar who runs the interface, not the ID on the entity which calls sendMessage()
        var messageObj = JSON.parse(message);
        if (messageObj.senderEntity != _this.entityID && channel == actualCartRegisterChannel) {
            print("Register received message");
            print("The price is: " + messageObj.totalPrice);
            //create or update the Overlay
            _this.cashRegisterOverlayOn(messageObj.totalPrice);
        }
    };

    CashRegister.prototype = {

        preload: function (entityID) {
            this.entityID = entityID;
            Messages.messageReceived.connect(receivingMessage);
        },
        
        //This method is called by the cashZone when an avatar comes in it
        //It has to find the cart belonging to that avatar and compute the total price of the items
        cashRegisterOn: function() {
            print("cashRegisterOn called");
            // Entities.findEntities (center: vec3, radius: number): EntityItemID[]
            var cashRegisterPosition = Entities.getEntityProperties(_this.entityID).position;
            var foundEntities = Entities.findEntities(cashRegisterPosition, 50);
            //itemsID.forEach( function(p) { print(p) });
            foundEntities.forEach( function (foundEntityID) {
                var entityName = Entities.getEntityProperties(foundEntityID).name;
                if (entityName == SHOPPING_CART_NAME) {
                    var cartOwnerID = getEntityCustomData('ownerKey', foundEntityID, null).ownerID;
                    if (cartOwnerID == MyAvatar.sessionUUID) {
                        cartID = foundEntityID;
                        actualCartRegisterChannel = CART_REGISTER_CHANNEL + cartID;
                        Messages.subscribe(actualCartRegisterChannel);      //subsribing to a channel to communicate with the cart
                        Messages.sendMessage(actualCartRegisterChannel, JSON.stringify({senderEntity: _this.entityID}));    //sending a json object with the ID of this entity
                    }
                }
            });
            if (cartID != null) {
                print("Cart found! Its ID is: " + cartID);
                payingAvatarID = MyAvatar.sessionUUID;
            } else {
                print("Cart NOT found!");
                payingAvatarID = null;
            }
        },
        
        cashRegisterOff: function() {
            priceText.visible = false;
        },
        
        cashRegisterOverlayOn: function (price) {
            if (priceText == null) {
                
                registerPanel = new OverlayPanel({
                    anchorPositionBinding: { entity: _this.entityID },
                    //anchorRotationBinding: { entity: entityBindID },
                    offsetPosition: { x: 0, y: 0.2, z: 0.1 },
                    isFacingAvatar: true,
                    
                });
                
                priceText = new Text3DOverlay({
                        text: price + "$",
                        isFacingAvatar: false,
                        alpha: 1.0,
                        ignoreRayIntersection: true,
                        dimensions: { x: 0, y: 0 },
                        backgroundColor: { red: 255, green: 255, blue: 255 },
                        color: { red: 0, green: 0, blue: 0 },
                        topMargin: 0.00625,
                        leftMargin: 0.00625,
                        bottomMargin: 0.1,
                        rightMargin: 0.00625,
                        lineHeight: 0.02,
                        alpha: 1,
                        backgroundAlpha: 0.3,
                        visible: true
                    });
                
                registerPanel.addChild(priceText);
            } else {
                priceText.text = price + "$";
                priceText.visible = true;
            }
        },
        
        collisionWithEntity: function(myID, otherID, collisionInfo) {
            var entityName = Entities.getEntityProperties(otherID).name;
            var entityOwnerID = getEntityCustomData('ownerKey', otherID, null).ownerID;
            
            if (entityName == CREDIT_CARD_NAME && entityOwnerID == payingAvatarID) {
                //The register collided with the right credit card
                print("CHECKOUT: total price is " + totalPrice + "$");
                Entities.deleteEntity(otherID);
                cartID.resetCart();
                Entities.deleteEntity(cartID);
            }
        },

        unload: function (entityID) {
            Messages.unsubscribe(actualCartRegisterChannel);
            Messages.messageReceived.disconnect(receivingMessage);
        }
    }

    return new CashRegister();
});