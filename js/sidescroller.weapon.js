/*jslint browser:true */
/*global sidescroller: false, $: false, alert: false, confirm: false, console: false, Debug: false, opera: false, prompt: false, WSH: false */
sidescroller.weapon = (function () {
    "use strict";
    return {
        weaponFactory: function (name, magSize, dmg, totalAmmo, owner, array, automatic) {
            var owner,
                fireSound = new Audio('assets/sounds/weapon01.wav'),
                lifeTime = 3,
                isAutomatic = automatic,
                stopped = false,
                hasDied = false,
                beginFire = function () {
                    if (owner.velocity[1] > 0) {
                        fireSound.play();
                        array.push(sidescroller.entity.entityFactory("projectile01", true, owner.yPos, owner.xPos, 0, 200, 200, function () {}, 1));
                    } else if (owner.velocity[1] < 0) {
                        fireSound.play();
                        array.push(sidescroller.entity.entityFactory("projectile01", true, owner.yPos, owner.xPos, 0, 200, 200, function () {}, 2));
                    }
                    if (isAutomatic == true && stopped == false) {
                        setTimeout(beginFire, 100);
                    } else {
                        stopFire();
                        stopped = false;
                    }

                },
                stopFire = function () {
                    stopped = true;
                };
            return {
                owner: owner,
                beginFire: beginFire,
                stopFire: stopFire,
                lifeTime: lifeTime,
                weaponName: name,
                mag: magSize,
                ammo: totalAmmo,
                damage: dmg
            };

        }
    };
}());