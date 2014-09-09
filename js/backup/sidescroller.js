/*jslint browser:true */
/*global $: false, sidescroller: false, entityFactory: false, alert: false, confirm: false, console: false, Debug: false, opera: false, prompt: false, WSH: false */
var sidescroller = {};

$(function () {
    "use strict";
    var canvas = document.querySelector("canvas"),
        fxCanvas = $("canvas"),
        ctx = canvas.getContext("2d"),
        background = new Image(),
        background2 = new Image(),
        a = 0,
        b = 0,
        bGravity = true,
        entities = [],
        level = [],
        levelDecor = [],
        playerY = 0,
        playerX = 0,
        mouseX = 0,
        mouseY = 0,
        cloudPos = 0,
        globalPosX = 0,
        backgroundOffset2,
        backgroundOffset,
        mouseDown = false,
        hold = false,
        movementButtonIsPressed = false,
        ground = $('<canvas/>', {
            'class': 'groundz'
        })
            .width(100)
            .height(100),
        renderedBlocks = 0,
        renderedEntities = 0,
        fps = 0,
        player = sidescroller.entity.entityFactory("jonas01", true, 400, 10);

    fxCanvas.hide();
    fxCanvas.fadeIn(500);
    background.src = "assets/background01.png";
    background2.src = "assets/city01.png";

    entities.push(player);
    level.push(sidescroller.block.blockFactory(78, 300, "grass01", true, function (actor, direction) {
        player.maxVelocity = 100;
        player.minVelocity = -player.maxVelocity;
    }));

    level.push(sidescroller.block.blockFactory(350, 144, "grass01", true, function (actor, direction) {
        if (direction === "top") {
            if (this.yPos > 500) {
                actor.velocity[1] = 0;
                this.xPos += 2;
            } else {
                actor.velocity[0] = 0;
                this.yPos += 1;
            }
        }
    }));

    function collisionUpdate(entity) {

        if (entity === undefined) {
            for (var i = 0; i < entities.length; i += 1) {
                entities[i].onGround = false;
            }
        } else {
            entity.onGround = false;
        }
    }

    function buildLevel() {
        var a,
            functionality = function () {
                //  this.xPos += 1;
                // var blocks = ["block01Beach", "block01BeachCracks", "dirt01", "dirt01MossyNoTop", "grass01"];
                // this.setBlock(blocks[Math.round(Math.random() * 4)]);
            };
        for (var i = 0; i < 1000; i += 1) {
            if (i % 0) {
                a = 1;
            } else {
                a = 1;
            }
            levelDecor.push(sidescroller.block.blockFactory(i * (16 * a), 426, "dirt01", false));
            levelDecor.push(sidescroller.block.blockFactory(i * (16 * a), 410, "dirt01", false));
            levelDecor.push(sidescroller.block.blockFactory(i * (16 * a), 394, "dirt01MossyNoTop", false));
            level.push(sidescroller.block.blockFactory(i * (16 * a), 378, "grass01", true, functionality));
        }
        for (var i = 0; i < 27; i += 1) {

            levelDecor.push(sidescroller.block.blockFactory(-i * (16 * a), 426, "dirt01", false));
            levelDecor.push(sidescroller.block.blockFactory(-i * (16 * a), 410, "dirt01", false));
            levelDecor.push(sidescroller.block.blockFactory(-i * (16 * a), 394, "dirt01MossyNoTop", false));
            level.push(sidescroller.block.blockFactory(-i * (16 * a), 378, "grass01", true, functionality));

            level.push(sidescroller.block.blockFactory(16, i * (16 * a), "blockade01", true, functionality));
            // level.push(sidescroller.block.blockFactory(500, i * (16 * a), "dirt01", true));
        }

        level.push(sidescroller.block.blockFactory(648, 300, "block01Beach", true, functionality));
        level.push(sidescroller.block.blockFactory(648, 316, "block01Beach", true, functionality));

        level.push(sidescroller.block.blockFactory(632, 332, "block01Beach", true, functionality));
        level.push(sidescroller.block.blockFactory(616, 332, "block01Beach", true, functionality));
        level.push(sidescroller.block.blockFactory(632, 348, "block01Beach", true, functionality));
        level.push(sidescroller.block.blockFactory(616, 348, "block01Beach", true, functionality));

        level.push(sidescroller.block.blockFactory(600, 364, "block01Beach", true, functionality));
        level.push(sidescroller.block.blockFactory(584, 364, "block01Beach", true, functionality));

        for (i = 0; i < 200; i += 1) {
            level.push(sidescroller.block.blockFactory(700 + Math.sin(Math.PI) + (i * 16), 290 + Math.tan(Math.PI * i) + (i * Math.random()), "block01Beach", true, function (actor, direction) {
                this.thisX = this.xPos;
                //this.callback();
                if (direction === "bottom") {
                    if (this.touched === false) {
                        this.setBlock("block01BeachCracks");
                        this.touched = true;
                    } else {
                        this.setBlock("blockade01");
                        this.hasCollision = false;
                        actor.health += 1;
                    }
                }
            }, function () {
                console.log("the default collision is " + this.hasCollision);
            }));
        }

    }
    buildLevel();
    // buildLevel();

    function animateClouds() {
        cloudPos += 1;
        document.querySelector("canvas").style.backgroundPosition = backgroundOffset / 2 + cloudPos + "px 0px";
    }
    setTimeout(function () {
        // level[0].hasCollision = false;
        // collisionUpdate();
    }, 5000);

    function tick() {
        fps += 1;
        animate();
        animateClouds();
        backgroundOffset = globalPosX / 10;
        backgroundOffset2 = globalPosX / 10;
        $(".numberBlocks").text(renderedBlocks);
        $(".hp").text(player.health);
        if (player.health <= 0) {
            $(".dead").show();
        }

        setTimeout(tick, 1000 / 60);
    }

    setInterval(function () {
        $(".frameRate").text(fps);
        if (fps < 25) {
            $(".frameRate").css("color", "red");
        } else {
            $(".frameRate").css("color", "white");
        }
        fps = 0;
    }, 1000)

    function isIntersecting(source, target) {
        return !(
            ((source.yPos + source.canvas.width) < (target.yPos)) ||
            (source.yPos > (target.yPos + target.canvas.width)) ||
            ((source.xPos + source.canvas.height) < target.xPos) ||
            (source.xPos > (target.xPos + target.canvas.height))
        );
    }

    function isInsideScreen(block) {
        if (block.yPos + globalPosX < canvas.width - 10 && block.yPos + globalPosX > 0) {
            return true;
        } else {
            return false;
        }
    }

    function isInVicinity(block, entity) {
        if (block.yPos + globalPosX < entity.yPos + globalPosX + 40 && block.yPos + globalPosX > entity.yPos + globalPosX - 40 && block.xPos < entity.xPos + 40 && block.xPos > entity.xPos - 40) {
            return true;
        } else {
            return false;
        }
    }

    function velocity(entity) {
        //gravity
        globalPosX = Math.ceil(400 - player.yPos);
        if (entity.onGround === false) {
            entity.velocity[0] += 0.5;
            entity.xPos += entity.velocity[0];
        }
        //vertical velocity 
        if (entity.isJumping === true && entity.isHanging === false) {
            entity.onGround = false;
            entity.velocity[0] -= entity.jumpHeight;
            entity.xPos += entity.velocity[0];
            entity.isJumping = false;
        }
        //horizontal velocity
        if (movementButtonIsPressed === true) {
            switch (entity.direction) {
            case 1:
                if (entity.velocity[1] < entity.maxVelocity && entity.isHanging === false) {
                    entity.velocity[1] += 0.35;
                }
                break;
            case 2:
                if (entity.velocity[1] > entity.minVelocity && entity.isHanging === false) {
                    entity.velocity[1] -= 0.35;
                }
                break;

            }
        } else if (entity.onGround === true) {
            if (entity.velocity[1] !== 0) {
                if (Math.round(entity.velocity[1]) < 0) {
                    entity.velocity[1] += entity.friction;
                } else if (Math.round(entity.velocity[1]) > 0) {
                    entity.velocity[1] -= entity.friction;
                }
            }
        } else {
            if (entity.velocity[1] !== 0) {
                if (entity.velocity[1] < 0) {
                    entity.velocity[1] += entity.friction / 10;
                } else if (entity.velocity[1] > 0) {
                    entity.velocity[1] -= entity.friction / 10;
                }
            }
        }
        entity.yPos += entity.velocity[1];
        if (isInsideScreen(entity)) {
            if (entity.onGround === true) {
                if (Math.round(entity.velocity[1]) === 0 && entity.direction === 2) {
                    entity.setAnimation(entity.animTree.idleLeft);
                } else if (Math.round(entity.velocity[1]) === 0) {
                    entity.setAnimation(entity.animTree.idleRight);
                } else if (entity.velocity[1] > 0) {
                    entity.setAnimation(entity.animTree.walkRight);
                } else if (entity.velocity[1] < 0) {
                    entity.setAnimation(entity.animTree.walkLeft);
                }
            } else if (entity.direction === 2) {
                entity.setAnimation(entity.animTree.jumpLeft);
            } else {
                entity.setAnimation(entity.animTree.jumpRight);
            }
        }

    }

    function collision(entity) {
        var previousPosition = [entity.xPos, entity.yPos],
            direction;

        /* 
                Check if intersecting. If so, move the character back to last non-intersecting position. Afterwards check where the last position was compared to the collider block. If the last position is above the block, the "top" onCollide function should trigger. And so on. 
            */
        if (level.length > 0) {
            for (var i = 0; i < level.length; i += 1) {
                if (level[i].hasCollision === true) {
                    if (entity.xPos > canvas.height) {
                        entity.health = 0;
                        break;
                    } else if (isInVicinity(entity, level[i])) {
                        if (isIntersecting(entity, level[i])) {

                            if (entity.yPos > level[i].yPos + level[i].canvas.width) {
                                direction = "right";
                            } else if (entity.xPos < level[i].xPos) {
                                direction = "top";
                            } else if (entity.yPos < level[i].yPos) {
                                direction = "left";
                            } else if (entity.xPos > level[i].xPos) {
                                direction = "bottom";
                                //level[i].onCollision(entity, "bottom");
                            }
                            //console.clear();
                            //console.log(direction);

                            break;
                        } else {
                            entity.onGround = false;
                        }
                    }
                }
            }
        }
        testForWall(entity);
    }

    function testForWall(entity) {
        var previousPosition = {
            yPos: entity.yPos,
            xPos: entity.xPos
        };

        if (level.length > 0) {
            for (var i = 0; i < level.length; i += 1) {
                if (level[i].hasCollision === true) {
                    if (isInVicinity(entity, level[i])) {
                        if (isIntersecting(entity, level[i])) {
                            entity.onGround = true;
                            if (level[i].xPos > entity.xPos) {
                                entity.velocity[0] = 0;
                                entity.xPos = level[i].xPos - level[i].canvas.height * 2;
                                level[i].onCollision(entity, "top");
                            } else if (level[i].xPos < entity.xPos) {
                                entity.onGround = false;
                                entity.xPos = level[i].xPos + level[i].canvas.height;
                                if (hold === false) {
                                    entity.velocity[0] = -entity.velocity[0] / 2;
                                } else {
                                    entity.onGround = true;
                                    player.isHanging = true;
                                }
                                level[i].onCollision(entity, "bottom");

                            } else if (entity.yPos > level[i].yPos && entity.xPos >= level[i].xPos) {
                                //console.log("right");
                                //entity.yPos = level[i].yPos - entity.canvas.width - 16;

                                entity.yPos = entity.yPos + 1;
                                entity.velocity[1] = entity.velocity[1] / 5;
                                //entity.velocity[1] = -entity.velocity[1] / 1.2;
                                // entity.velocity[0] = entity.velocity[0];
                                level[i].onCollision(entity, "right");
                                break;
                            } else if (entity.yPos < level[i].yPos + level[i].canvas.width && entity.xPos >= level[i].xPos) {
                                //console.log("left");
                                // entity.yPos = level[i].yPos + 16;
                                // entity.velocity[1] = -entity.velocity[1] / 1.2;
                                entity.yPos = entity.yPos - 1;
                                entity.velocity[1] = entity.velocity[1] / 5;
                                level[i].onCollision(entity, "left");

                                break;
                            }
                        }
                    }
                }
            }
        }
    }

    //    function collision(entity) {
    //     var previousPosition = [entity.xPos, entity.yPos],
    //         direction;
    //     if (level.length > 0) {
    //         for (var i = 0; i < level.length; i += 1) {
    //             if (isInVicinity(entity, level[i])) {
    //                 if (isIntersecting(entity, level[i])) {

    //                     if (entity.yPos > level[i].yPos + level[i].canvas.width) {
    //                         direction = "right";
    //                     } else if (entity.xPos < level[i].xPos) {
    //                         direction = "top";
    //                     } else if (entity.yPos < level[i].yPos) {
    //                         direction = "left";
    //                     } else if (entity.xPos > level[i].xPos) {
    //                         direction = "bottom";
    //                         //level[i].onCollision(entity, "bottom");
    //                     }
    //                     //console.clear();
    //                     //console.log(direction);

    //                     entity.onGround = true;
    //                     if (level[i].xPos > entity.xPos) {
    //                         entity.velocity[0] = 0;
    //                         entity.xPos = level[i].xPos - level[i].canvas.height * 2;
    //                         level[i].onCollision(entity, "top");
    //                     } else if (level[i].xPos < entity.xPos) {
    //                         entity.onGround = false;
    //                         entity.xPos = level[i].xPos + level[i].canvas.height;
    //                         if (hold === false) {
    //                             entity.velocity[0] = -entity.velocity[0] / 2;
    //                         } else {
    //                             entity.onGround = true;
    //                             player.isHanging = true;
    //                         }
    //                         level[i].onCollision(entity, "bottom");
    //                     }
    //                     break;
    //                 } else {
    //                     entity.onGround = false;
    //                 }
    //             }
    //         }
    //     }
    //     testForWall(entity);
    // }

    // function testForWall(entity) {
    //     var previousPosition = {
    //         yPos: entity.yPos,
    //         xPos: entity.xPos
    //     };

    //     if (level.length > 0) {
    //         for (var i = 0; i < level.length; i += 1) {
    //             if (isInVicinity(entity, level[i])) {
    //                 if (isIntersecting(entity, level[i])) {
    //                     if (entity.yPos > level[i].yPos && entity.xPos >= level[i].xPos) {
    //                         //console.log("right");
    //                         //entity.yPos = level[i].yPos - entity.canvas.width - 16;
    //                         entity.yPos = entity.yPos + 1;
    //                         entity.velocity[1] = 0;
    //                         //entity.velocity[1] = -entity.velocity[1] / 1.2;
    //                         // entity.velocity[0] = entity.velocity[0];
    //                         break;
    //                     } else if (entity.yPos < level[i].yPos + level[i].canvas.width && entity.xPos >= level[i].xPos) {
    //                         //console.log("left");
    //                         // entity.yPos = level[i].yPos + 16;
    //                         // entity.velocity[1] = -entity.velocity[1] / 1.2;
    //                         entity.yPos = entity.yPos - 1;
    //                         entity.velocity[1] = 0;
    //                         break;
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // }

    function animate() {
        renderedBlocks = 0;
        renderedEntities = 0;
        ctx.fillStyle = "none";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (var i = 0; i < 20; i += 1) {
            if (backgroundOffset2 + (127 * i) > 0 - 127 && backgroundOffset2 + (127 * i) < canvas.width) {
                ctx.drawImage(background, Math.round(backgroundOffset2 + (127 * i)), 120);
                renderedBlocks += 1;
            }
        }
        //3d test
        // ctx.drawImage(background2, Math.round((globalPosX * 0.5) + (127 * 1)), 220, background2.width * 1.5, background2.height * 1.5);
        // ctx.drawImage(background2, Math.round((globalPosX * 0.53) + (127 * 1)), 220, background2.width * 1.5, background2.height * 1.5);
        // ctx.drawImage(background2, Math.round((globalPosX * 0.56) + (127 * 1)), 220, background2.width * 1.5, background2.height * 1.5);
        // ctx.drawImage(background2, Math.round((globalPosX * 0.59) + (127 * 1)), 220, background2.width * 1.5, background2.height * 1.5);
        // ctx.drawImage(background2, Math.round((globalPosX * 0.62) + (127 * 1)), 220, background2.width * 1.5, background2.height * 1.5);

        ctx.drawImage(canvas, 0, 0);
        for (var i = 0; i < entities.length; i = i + 1) {

            if (entities[i].health > entities[i].maxHealth) {
                entities[i].health = entities[i].maxHealth;
            } else if (entities[i].health < 0) {
                entities[i].health = 0;
            }
            if (entities[i].health <= 0) {
                entities[i].onDeath();
            }
            if (entities[i].health > 0) {
                velocity(entities[i]);
                collision(entities[i]);
                entities[i].xPos = Math.round(entities[i].xPos);
                entities[i].yPos = Math.round(entities[i].yPos);
                if (isInsideScreen(entities[i])) {
                    renderedEntities += 1;
                    ctx.drawImage(entities[i].canvas, entities[i].yPos + globalPosX, entities[i].xPos);
                }
            }
        }
        if (level.length > 0) {
            for (var i = 0; i < level.length; i += 1) {
                if (isInsideScreen(level[i])) {
                    renderedBlocks += 1;
                    ctx.drawImage(level[i].canvas, level[i].yPos + globalPosX, level[i].xPos);
                }
            }
        }
        if (levelDecor.length > 0) {
            for (var i = 0; i < levelDecor.length; i += 1) {
                if (isInsideScreen(levelDecor[i])) {
                    renderedBlocks += 1;
                    ctx.drawImage(levelDecor[i].canvas, levelDecor[i].yPos + globalPosX, levelDecor[i].xPos);
                }
            }
        }

        ctx.beginPath();
        ctx.arc(player.yPos + globalPosX + (player.canvas.width / 2), player.xPos + (player.canvas.height / 2), 16, 20, Math.PI * 2, true);
        ctx.fillStyle = "black";
        ctx.closePath();
        ctx.fill();

    }

    canvas.width = 850;
    canvas.height = 440;
    ctx.fillStyle = "lightblue";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    animate();

    function spam() {
        if (a < 500) {
            a += 1;
            entities.push(sidescroller.entity.entityFactory("jonas0" + ((Math.round(Math.random())) + 1), false, Math.random() * 800, 0, [0, Math.random() * 5]));
            setTimeout(spam, (Math.random() * 10));
        }
    }

    function spawnRandomBlock() {
        level.push(sidescroller.block.blockFactory(Math.round(Math.random() * canvas.width) - globalPosX, Math.round(Math.random() * canvas.height), "grass01"));
    }

    function fallDown() {
        if (b < entities.length) {
            entities[b].onGround = false;
            b += 1;
            bGravity = false;
            setTimeout(fallDown, 10);
        }
    }

    $("#spam").click(function () {
        a = 0;
        spam();
    });
    $("#spawn").click(function () {
        spawnEntity();
    });

    tick();
    console.log(entities);
    console.log(level);

    function spawnEntity() {
        entities.push(sidescroller.entity.entityFactory("jonas02", false, Math.random() * 800, 50, [0, Math.random() * 5]));
    }

    $(window).keydown(function (key) {

        if (player.health > 0) {
            if (key.which === 39) {
                //right
                player.direction = 1;
                movementButtonIsPressed = true;
                player.setAnimation(player.animTree.walkRight);

            }

            if (key.which === 37) {
                //left

                player.direction = 2;
                movementButtonIsPressed = true;
                player.setAnimation(player.animTree.walkLeft);

            }
            if (key.which === 32) {
                if (player.onGround === true && player.isHanging === false) {
                    player.isJumping = true;
                }
            }
            if (key.which === 40) {
                spawnEntity();
            }
            if (key.which === 67) {
                spawnRandomBlock();
            }
            if (key.which === 38) {
                hold = true;
            }
        }
    });

    $(window).keydown(function (key) {
        if (key.which === 65) {
            for (var i = 0; i < entities.length; i = i + 1) {
                if (entities[i].onGround === true && entities[i].isPlayer === false) {
                    entities[i].jumpHeight = 8 + (Math.random() * 10);
                    entities[i].velocity[1] = Math.random() < 0.5 ? -1 : 1;
                    entities[i].isJumping = true;
                }
            }
        }
    });

    canvas.addEventListener("mousedown", function (e) {
        //mouseDown = true;
        level.push(sidescroller.block.blockFactory(mouseX - globalPosX, mouseY, "block01Beach", true, function (actor, direction) {
            if (direction === "top") {
                //  this.xPos += 2;
            } else if (direction === "bottom") {
                this.setBlock("block01BeachCracks");
                actor.health -= 10;
            }
        }));
    }, false);
    canvas.addEventListener("mouseup", function (e) {
        mouseDown = false;

    }, false);
    canvas.addEventListener("mousemove", function (e) {
        mouseY = e.offsetY;
        mouseX = e.offsetX;
        if (mouseDown === true) {
            level.push(sidescroller.block.blockFactory(mouseX - globalPosX, mouseY, "block01Beach", true, function (actor, direction) {
                if (direction === "top") {
                    //  this.xPos += 2;
                } else if (direction === "bottom") {
                    this.setBlock("block01BeachCracks");

                }
            }));
        }

    }, false);

    $(window).keyup(function (keyUp) {
        if (keyUp.which === 37) {
            movementButtonIsPressed = false;
        }
        if (keyUp.which === 39) {
            movementButtonIsPressed = false;
        }
        if (keyUp.which === 38) {
            hold = false;
            player.isHanging = false;
        }
    });
});