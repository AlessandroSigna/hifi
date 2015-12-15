//spawner

var scriptURL = Script.resolvePath("myEntityScript.js");
var rotation = Quat.safeEulerAngles(Camera.getOrientation());
rotation = Quat.fromPitchYawRollDegrees(0, rotation.y, 0);
var center = Vec3.sum(MyAvatar.position, Vec3.multiply(3, Quat.getFront(rotation)));

var position = Vec3.sum(center, Vec3.multiply(-0.1, Quat.getFront(rotation)));
var myEntity = Entities.addEntity({
    type: "Box",
    name: "layer1 entity",
    position: position,
    script: scriptURL,
    rotation: rotation

});