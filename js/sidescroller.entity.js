/*jslint browser:true */
/*global sidescroller: false, $: false, alert: false, confirm: false, console: false, Debug: false, opera: false, prompt: false, WSH: false */
sidescroller.entity = (function () {
    "use strict";
    return {
        entityFactory: function (type, player, posY, posX, inputVelocity, entityHealth, entityMaxHealth, deadFunc, inDirection) {
            var canvas = document.createElement("canvas"),
                context = canvas.getContext("2d"),
                imageLoaded = false,
                image = new Image(),
                direction = "stop",
                speed = 200,
                x = 0,
                y = 0,
                timeLived = 0,
                lifeTime = 3,
                counter = 0,
                previousPosition = [0, 0],
                direction = "right",
                lastCollider = undefined,
                friction = 0.2,
                isJumping = false,
                dynamicEntity = true,
                inventory = [],
                currentWeapon,
                bump = function (direction) {
                    if (direction = "left") {
                        this.velocity[1] += 20;
                    } else if (direction = "left") {
                        this.velocity[1] -= 20;
                    }
                },
                velocity = [0, 0],
                maxVelocity = 5,
                minVelocity = 0,
                victory = 0,
                givingUpJumps = 0,
                jumpHeight = 8,
                onGround = false,
                currentFrame = 0,
                noCollision = 0,
                isHanging = false,
                health = 100,
                maxHealth = 100,
                onDeath,
                animTree = {
                    walkRight: {
                        frames: 3,
                        horizontal: 1,
                        vertical: 0
                    },
                    walkLeft: {
                        frames: 3,
                        horizontal: 1,
                        vertical: 1
                    },
                    idleRight: {
                        frames: 0,
                        horizontal: 1,
                        vertical: 2
                    },
                    idleLeft: {
                        frames: 0,
                        horizontal: 2,
                        vertical: 2
                    },
                    jumpRight: {
                        frames: 0,
                        horizontal: 3,
                        vertical: 2
                    },
                    jumpLeft: {
                        frames: 0,
                        horizontal: 4,
                        vertical: 2
                    }
                },
                currentAnim = animTree.idleRight,
                animate = function () {
                    if (currentFrame < currentAnim.frames) {
                        currentFrame += 1;
                    } else {
                        currentFrame = 0;
                    }
                    if (imageLoaded === true) {
                        context.fillStyle = "red";
                        context.clearRect(0, 0, canvas.width, canvas.height);
                        context.drawImage(image, currentFrame * (-24 * currentAnim.horizontal), (-32 * currentAnim.vertical));
                    }

                    setTimeout(animate, speed);

                },
                behaviour = function (target) {
                    this.jumpHeight = 4;
                    if (target.health > 0) {
                        this.victory = 0;
                        this.givingUpJumps = 0;
                        if (this.velocity[1] === 0) {
                            this.isJumping = true;
                        }
                        if (target.yPos > this.yPos) {
                            if (this.velocity[1] < this.maxVelocity) {
                                this.velocity[1] = 2;
                            }
                        } else if (target.yPos < this.yPos) {
                            if (this.velocity[1] < this.maxVelocity) {
                                this.velocity[1] = -2;
                            }
                        }
                        if (target.yPos > this.yPos - 1 && target.yPos < this.yPos + 11 && target.xPos < this.xPos + 45 && target.xPos > this.xPos - 10) {
                            target.health -= 1;
                        }
                    } else {
                        if (this.victory < 3) {
                            this.velocity[1] = 0;
                            if (this.onGround === true) {
                                this.isJumping = true;
                                this.victory += 1;
                            }
                        } else if (this.yPos > 100 && this.yPos < 700 && this.givingUpJumps < 3) {
                            this.jumpHeight = 8;
                            if (this.velocity[1] === 0 && this.onGround === true) {
                                this.givingUpJumps += 1;
                                this.isJumping = true;
                            }
                            if (this.yPos < 400) {
                                this.velocity[1] = -2;
                            } else {
                                this.velocity[1] = 2;

                            }
                        }
                    }
                };

            if (deadFunc !== undefined) {
                onDeath = deadFunc;
            } else {
                onDeath = function () {
                    image.src = "assets/blocks/blockade01.png";
                };
            }
            canvas.width = 24;
            canvas.height = 32;
            image.src = "assets/" + type + ".png";
            image.onload = function () {
                imageLoaded = true;
                // console.log("image loaded === " + true);
            };
            y = posY;
            x = posX;
            previousPosition = [posY, posX];

            animate();
            if (entityHealth !== undefined) {
                health = entityHealth;
            }
            if (entityMaxHealth !== undefined) {
                maxHealth = entityMaxHealth;
            }
            if (inputVelocity !== undefined) {
                velocity = inputVelocity;
            } else {
                velocity = [0, 0];
            }

            if (inDirection !== undefined) {
                direction = inDirection;
            }

            function giveInventory(weapon) {
                inventory.push(weapon);
            }
            return {
                canvas: canvas,
                isPlayer: player,
                isHanging: isHanging,
                behaviour: behaviour,
                speed: speed,
                yPos: y,
                xPos: x,
                previousPosition: previousPosition,
                velocity: velocity,
                maxVelocity: maxVelocity,
                minVelocity: -maxVelocity,
                direction: direction,
                onGround: onGround,
                currentAnim: currentAnim,
                animTree: animTree,
                friction: friction,
                noCollision: noCollision,
                jumpHeight: jumpHeight,
                dynamicEntity: dynamicEntity,
                health: health,
                onDeath: onDeath,
                onCollision: bump,
                maxHealth: maxHealth,
                counter: counter,
                lastCollider: lastCollider,
                inventory: inventory,
                currentWeapon: currentWeapon,
                giveInventory: giveInventory,
                lifeTime: lifeTime,
                timeLived: timeLived,
                sprite: type,
                getDirection: function () {
                    return direction;
                },
                setAnimation: function (anim) {
                    currentAnim = anim;
                },
                setImage: function (img) {
                    image.src = "assets/" + img + ".png";
                }
            };
        }
    };
}());