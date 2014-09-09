/*jslint browser:true */
/*global $: false, sidescroller: false, entityFactory: false, alert: false, confirm: false, console: false, Debug: false, opera: false, prompt: false, WSH: false */
var sidescroller = {};

//yPos = xPos and xPos = yPos, I somehow got those mixed up the very start and kept going with them. Refactoring could work yes but it is too much work for a test project like this since everything is tied to it. 

$(function () {
    "use strict";
    var canvas = document.querySelector("canvas"),
        fxCanvas = $("canvas"),
        ctx = canvas.getContext("2d"),
        background = new Image(),
        background2 = new Image(),
        brushImg = new Image(),
        tree = new Image(),
        brush = new Image(),
        brush2 = new Image(),
        brush3 = new Image(),
        gridImg = new Image(),
        a,
        b,
        bGravity = true,
        entities = [],
        projectiles = [],
        level = [],
        levelDecor = [],
        levelDecorForeground = [],
        levelDecorBackground = [],
        undo = [],
        redo = [],
        removerIsActive = false,
        currentRemoveGroup = "level",
        entityPlacer = false,
        selectedBlockForRemoval = {
            array: level,
            index: 0
        },
        removerObj = {
            xPos: mouseY,
            yPos: mouseX
        },
        clearBool = false,
        playerY = 0,
        playerX = 0,
        mouseX = 0,
        oldMouseX = 0,
        mouseY = 0,
        oldMouseY = 0,
        cloudPos = 0,
        globalPosX = 0,
        lastI = 0,
        second = 1,
        selectedBlock = "block01",
        selectedPaintGroup = "level",
        paintSizeX = 16,
        paintSizeY = 16,
        showGridBrush = false,
        gridVisible = false,
        noclip = false,
        pause = false,
        c = 0,
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
        player = sidescroller.entity.entityFactory("jonas01", true, 400, 10),
        brushCanvas = document.createElement("canvas"),
        brushContext = brushCanvas.getContext('2d'),
        brushPtrn;

    player.giveInventory(sidescroller.weapon.weaponFactory("pistol", 10, 10, 2, player, projectiles, false));
    player.currentWeapon = 0;
    brushContext.globalAlpha = 0.6;
    gridImg.src = "assets/grid01.png";

    //console.log(player.inventory[player.currentWeapon]);

    //  fxCanvas.hide();
    // fxCanvas.fadeIn(500);
    background.src = "assets/background01.png";
    background2.src = "assets/background02.png";
    tree.src = "assets/blocks/vegetation/tree01.png";
    brush.src = "assets/blocks/distance01.png";
    brush2.src = "assets/blocks/distance02.png";
    brush3.src = "assets/blocks/distance02.png";

    entities.push(player);

    //game tick - triggering all necessary stuff. 
    function tick() {
        fps += 1;
        render();
        brushContext.globalAlpha = 0.6;
        animateClouds();
        backgroundOffset = globalPosX / 10;
        backgroundOffset2 = globalPosX / 10;
        $(".numberBlocks").text(renderedBlocks);
        $(".numberEntities").text(renderedEntities);
        $(".hp").text(player.health);
        if (player.health <= 0) {
            $(".dead").show();
        }
        //$(".grid").css("background-position", 0);

        if (pause === false) {
            setTimeout(tick, 1000 / 60);
        }
        if (undo.length > 2000 ||  redo.length > 2000) {
            if (clearBool === false) {
                alert("Undo history is above 500, clean to avoid meltdown!");
                $("#clearDo").addClass("selected");
                clearBool = true;
            }

        } else {
            $("#clearDo").removeClass("selected");
        }

    }

    for (var i = 0; i < 50; i++) {
        levelDecor.push(sidescroller.block.blockFactory(Math.random() * 2000 + globalPosX, 364, "vegetation/grass01", true, function () {}, 0.2, 17, 32));
    }

    //Debug function to update collision checks/gravity for specific or all entites in the game.
    function collisionUpdate(entity) {

        if (entity === undefined) {
            for (var i = 0; i < entities.length; i += 1) {
                entities[i].onGround = false;
            }
        } else {
            entity.onGround = false;
        }
    }

    //Load and init saved level
    loadSavedLevel(sidescroller.level1);

    function loadSavedLevel(inputLevel) {
        var newBlock;
        if (typeof inputLevel === "string") {
            var levelObj = JSON.parse(inputLevel);
        } else {
            levelObj = inputLevel;
        }

        for (var i in levelObj) {
            if (levelObj[i].type !== "entity") {
                if (levelObj[i].distance !== undefined) {
                    if (levelObj[i].distance > 1) {
                        newBlock = sidescroller.block.blockFactory(levelObj[i].yPos, levelObj[i].xPos, levelObj[i].block, levelObj[i].collision, undefined, undefined, undefined, levelObj[i].xSize, levelObj[i].ySize);
                        newBlock.distance = levelObj[i].distance;
                        levelDecorBackground.push(newBlock);
                    } else if (levelObj[i].distance < 1) {
                        newBlock = sidescroller.block.blockFactory(levelObj[i].yPos, levelObj[i].xPos, levelObj[i].block, levelObj[i].collision, undefined, undefined, undefined, levelObj[i].xSize, levelObj[i].ySize);
                        newBlock.distance = 1;
                        levelDecorForeground.push(newBlock);
                    } else {
                        newBlock = sidescroller.block.blockFactory(levelObj[i].yPos, levelObj[i].xPos, levelObj[i].block, levelObj[i].collision, undefined, undefined, undefined, levelObj[i].xSize, levelObj[i].ySize);
                        newBlock.distance = 1;
                        levelDecorBackground.push(newBlock);
                    }
                } else if (levelObj[i].collision === false) {
                    levelDecor.push(sidescroller.block.blockFactory(levelObj[i].yPos, levelObj[i].xPos, levelObj[i].block, levelObj[i].collision, undefined, undefined, undefined, levelObj[i].xSize, levelObj[i].ySize));
                } else {
                    level.push(sidescroller.block.blockFactory(levelObj[i].yPos, levelObj[i].xPos, levelObj[i].block, levelObj[i].collision, undefined, undefined, undefined, levelObj[i].xSize, levelObj[i].ySize));
                }
            } else {
                placeEntity(levelObj[i].yPos, levelObj[i].xPos, levelObj[i].sprite);
            }

            continue;
        }
    }

    function saveLevel() {
        var obj = {},
            JSONOBJ;
        for (var i = 0; i < level.length; i += 1) {

            var saveObject = {
                type: "level",
                xPos: level[i].xPos,
                yPos: level[i].yPos,
                xSize: level[i].blockXSize,
                ySize: level[i].blockYSize,
                block: level[i].block,
                collision: true
            }

            obj["pos" + i] = saveObject;
        }
        for (var i = 0; i < levelDecor.length; i += 1) {
            var saveObject = {
                type: "levelDecor",
                xPos: levelDecor[i].xPos,
                yPos: levelDecor[i].yPos,
                xSize: levelDecor[i].blockXSize,
                ySize: levelDecor[i].blockYSize,
                block: levelDecor[i].block,
                collision: false
            }

            obj["pos" + (i + level.length)] = saveObject;
        }
        for (var i = 0; i < levelDecorBackground.length; i += 1) {
            var saveObject = {
                type: "levelDecorBackground",
                xPos: levelDecorBackground[i].xPos,
                yPos: levelDecorBackground[i].yPos,
                xSize: levelDecorBackground[i].blockXSize,
                ySize: levelDecorBackground[i].blockYSize,
                block: levelDecorBackground[i].block,
                distance: levelDecorBackground[i].distance,
                collision: false
            }

            obj["pos" + (i + level.length + levelDecor.length)] = saveObject;
        }
        for (var i = 0; i < levelDecorForeground.length; i += 1) {
            var saveObject = {
                type: "levelDecorForeground",
                xPos: levelDecorForeground[i].xPos,
                yPos: levelDecorForeground[i].yPos,
                xSize: levelDecorForeground[i].blockXSize,
                ySize: levelDecorForeground[i].blockYSize,
                block: levelDecorForeground[i].block,
                distance: levelDecorForeground[i].distance,
                collision: false
            }

            obj["pos" + (i + level.length + levelDecor.length + levelDecorBackground.length)] = saveObject;
        }
        for (var i = 0; i < entities.length; i += 1) {
            if (entities[i] !== player) {
                var saveObject = {
                    type: "entity",
                    xPos: entities[i].xPos,
                    yPos: entities[i].yPos,
                    sprite: entities[i].sprite

                }

                obj["pos" + (i + level.length + levelDecor.length + levelDecorBackground.length + levelDecorForeground.length)] = saveObject;
            }
        }

        JSONOBJ = JSON.stringify(obj);
        console.save(JSONOBJ, "savedLevel.json");
    }

    $("#save").click(function () {
        saveLevel();
    });
    $("#load").click(function () {
        var fileInput = document.getElementById('jsonInput');
        if ($("#jsonInput").val() !== "") {
            var file = fileInput.files[0];
            var textType = ".json";
            var fileExtention = getFileExtention(file.name);

            console.log("Loading new level...");
            if (fileExtention.toLowerCase() === "json") {
                var reader = new FileReader();

                reader.onload = function (e) {
                    $("#clear").click();
                    $(".clear").click();
                    $("#clearDo").click();
                    $("#jsonInput").val("");

                    loadSavedLevel(reader.result);
                    console.log("Level loaded!");
                }

                reader.readAsText(file);
                console.log(reader.result);
            } else {
                console.log("File not supported!");
            }

        } else {
            console.log("No level selected!");
        }
    });

    function getFileExtention(filename) {
        return filename.split('.').pop();
    }

    $(".clear").click(function () {
        level.length = 0;
        levelDecor.length = 0;
        levelDecorBackground.length = 0;
        levelDecorForeground.length = 0;
        $("#clearDo").click();
    });

    //Animating the clouds
    function animateClouds() {
        if (cloudPos < 209) {
            cloudPos += 1;
        } else {
            cloudPos = 0;
        }
    }

    //Display fps on the webpage
    setInterval(function () {
        $(".frameRate").text(fps);
        if (fps < 25) {
            $(".frameRate").css("color", "red");
        } else {
            $(".frameRate").css("color", "white");
        }
        fps = 0;
    }, 1000)

    //Velocity, gravity and friction; entity movement in the world.
    function velocity(entity) {

        globalPosX = Math.round(Math.ceil((canvas.width / 2) - player.yPos));
        /* gravity
        If the player is not on the groun (entity.onGround === false) then the gravity is triggered. 
        */
        if (entity.onGround === false) {
            b = undefined;
        }
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
            //Adding entity-based friction to the ground in order to slow down movement. 
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
        //Determine and play/change animation.
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

    //Checks if source and target is intersecting. 
    function isIntersecting(source, target) {
        return !(
            ((source.yPos + source.canvas.width) < (target.yPos)) ||
            (source.yPos > (target.yPos + target.canvas.width)) ||
            ((source.xPos + source.canvas.height) < target.xPos) ||
            (source.xPos > (target.xPos + target.canvas.height))
        );
    }

    function mouseIsIntersecting(source, target) {
        return !(
            ((source.yPos) < (target.yPos)) ||
            (source.yPos > (target.yPos + target.canvas.width)) ||
            ((source.xPos) < target.xPos) ||
            (source.xPos > (target.xPos + target.canvas.height))
        );
    }

    //Checks if block is inside the render space of the canvas.
    function isInsideScreen(block) {
        if (block.yPos + globalPosX < canvas.width &&
            block.yPos + globalPosX > -block.canvas.width) {
            return true;
        } else {
            return false;
        }
    }

    //Same as isInsideScreen block but with images being rendered with the drawSingleImage function. 
    function imageIsInsideScreen(y, width) {

        if (y < canvas.width && y > -width) {
            return true;
        } else {
            return false;
        }
    }

    //checks if block is close enough to entity. 
    function isInVicinity(block, entity) {
        if (block.yPos + globalPosX < entity.yPos + globalPosX + 128 &&
            block.yPos + globalPosX > entity.yPos + globalPosX - 128 &&
            block.xPos < entity.xPos + 128 &&
            block.xPos > entity.xPos - 128) {
            return true;
        } else {
            return false;
        }
    }

    //Checks for collisions between the world (level array) and specified entity.
    function collision(entity) {
        if (entity === player && noclip === true) {

        } else {
            var i = 0,
                numb = 1;
            c += 1;
            if (entity.xPos > canvas.height) {
                entity.health = 0;
            } else if (level.length > 0) {
                if (entity.onGround === true && (entity.lastCollider.yPos + 1 > entity.yPos + entity.canvas.width || entity.lastCollider.yPos + 1 + entity.lastCollider.canvas.width < entity.yPos)) {
                    if (entity.yPos !== entity.previousPosition[1] && entity.xPos !== entity.previousPosition[0] + 1 && c >= 20) {
                        entity.onGround = false;
                        c = 0;
                    }
                } else {
                    c += 1;
                    // console.log(c);
                }
                for (i = 0; i < level.length; i += 1) {

                    if (level[i].hasCollision === true) {
                        if (isInVicinity(level[i], entity)) {
                            if (isIntersecting(entity, level[i])) {
                                entity.xPos = entity.previousPosition[0];
                                entity.yPos = entity.previousPosition[1];
                                if (entity.velocity > 0) {
                                    entity.velocity[1] += level[i].friction;
                                } else {
                                    entity.velocity[1] -= level[i].friction;
                                }

                                if (level[i].yPos < entity.yPos &&
                                    level[i].xPos <= entity.xPos + entity.canvas.height &&
                                    level[i].xPos + level[i].canvas.height > entity.xPos) {
                                    //From the RIGHT side
                                    entity.velocity[1] = 0;
                                    level[i].onCollision(entity, "right");
                                    entity.lastCollider = level[i];
                                    break;
                                } else if (level[i].yPos > entity.yPos &&
                                    level[i].xPos < entity.xPos + entity.canvas.height) {
                                    //From the LEFT side
                                    entity.velocity[1] = 0;
                                    level[i].onCollision(entity, "left");
                                    entity.lastCollider = level[i];
                                    break;
                                } else if (level[i].xPos < entity.xPos) {
                                    //From the BOTTOM
                                    if (hold === false) {
                                        entity.velocity[0] = -entity.velocity[0] / 2;
                                        entity.xPos = level[i].xPos + level[i].canvas.height;
                                        level[i].onCollision(entity, "bottom");
                                    } else {
                                        entity.onGround = true;
                                        player.isHanging = true;
                                    }
                                    break;

                                } else if (level[i].xPos > entity.xPos + entity.canvas.height &&
                                    (entity.yPos > level[i].yPos ||
                                        entity.yPos < level[i].yPos + level[i].canvas.width)) {
                                    //From the TOP
                                    entity.velocity[0] = 0;
                                    entity.xPos = level[i].xPos - entity.canvas.height - 1;
                                    level[i].onCollision(entity, "top");
                                    entity.onGround = true;
                                    entity.lastCollider = level[i];

                                    break;

                                }

                            }
                        }
                    }
                }
                if (entity.xPos !== entity.previousPosition[0] && c === 40) {
                    entity.onGround = false;
                    c = 0;
                }
            }
            entity.previousPosition = [Math.round(entity.xPos), Math.round(entity.yPos)];

        }
    }

    //Game render. 
    function render() {
        var tempImg = new Image();
        renderedBlocks = 0;
        renderedEntities = 0;

        ctx.fillStyle = "none";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (var i = 0; i < canvas.width / 209; i += 1) {
            ctx.drawImage(background2, Math.round((i * 209) + cloudPos), 0);
        }
        ctx.drawImage(background2, Math.round(-209 + cloudPos), 0);

        for (var i = 0; i < 20; i += 1) {
            ctx.drawImage(background, Math.round(backgroundOffset2 + -50 + (127 * i)), 120);
            renderedBlocks += 1;
        }
        if (1 == 2) {
            for (var i = 0; i < 4; i += 1) {
                ctx.drawImage(tree, Math.round(backgroundOffset2 * 5 + (127 * i)), 279);
            }

            drawSingleImage(-80 + globalPosX / 1.5, 346, 112, "assets/blocks/misc/car01.png");
            drawSingleImage(-50 + globalPosX, 355, 40, "assets/blocks/misc/sign01.png");
            drawSingleImage(700 + globalPosX, 257, 18, "assets/blocks/misc/oldGuy01.png");
        }

        if (gridVisible === true) {
            var gridPattern = ctx.createPattern(gridImg, 'repeat');
            ctx.fillStyle = gridPattern;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.translate(globalPosX, 0);
            ctx.fillRect(-globalPosX, 0, canvas.width, canvas.height);
            ctx.translate(-globalPosX, 0);
        }

        //BACKGROUND BLOCKS
        if (levelDecorBackground.length > 0) {
            for (var i = 0; i < levelDecorBackground.length; i += 1) {
                var numberOfWhites = levelDecorBackground[i].distance;
                renderedBlocks += 1;
                ctx.drawImage(levelDecorBackground[i].canvas, Math.round(levelDecorBackground[i].yPos + (globalPosX / levelDecorBackground[i].distance)), levelDecorBackground[i].xPos);

                for (var p = 0; p < numberOfWhites + numberOfWhites; p += 1) {
                    if (levelDecorBackground[i].block !== "vegetation/tree01" && levelDecorBackground[i].block !== "vegetation/grass01") {
                        ctx.drawImage(brush, Math.round(levelDecorBackground[i].yPos + (globalPosX / levelDecorBackground[i].distance)), levelDecorBackground[i].xPos, levelDecorBackground[i].canvas.width, levelDecorBackground[i].canvas.height);
                        renderedBlocks += 1;
                    }
                }
            }
        }

        //PROJECTILES
        for (var p = 0; p < projectiles.length; p += 1) {
            var stop = false,
                index;
            if (isInsideScreen(projectiles[p])) {
                renderedEntities += 1;
                ctx.drawImage(projectiles[p].canvas, projectiles[p].yPos + globalPosX, projectiles[p].xPos, 8, 6);
            }

            if (projectiles[p].direction !== undefined) {
                if (projectiles[p].direction === 1) {
                    projectiles[p].yPos += 7;
                } else {
                    projectiles[p].yPos -= 7;
                }
            }
            for (var i = 0; i < level.length; i += 1) {
                index = i;
                if (level[i].hasCollision === true) {
                    if (isInVicinity(level[i], projectiles[p])) { //
                        if (isIntersecting(projectiles[p], level[i])) {
                            projectiles.splice(p, 1);
                            stop = true;
                            break;
                        }
                    }
                }
            }
            if (stop === false) {
                if (projectiles.length > 0) {
                    for (var i = 0; i < entities.length; i += 1) {
                        if (entities[i] !== player && entities[i].health > 0) {
                            if (projectiles.length > 0 && projectiles[p].yPos > entities[i].yPos && projectiles[p].yPos < entities[i].yPos + entities[i].canvas.width && projectiles[p].xPos > entities[i].xPos - 40 && projectiles[p].xPos < entities[i].xPos + entities[i].canvas.height) {
                                projectiles.splice(p, 1);
                                entities[i].health -= 40;
                                break;
                            }
                        }
                    }
                }
            }

        }

        //ENTITIES
        for (var i = 0; i < entities.length; i = i + 1) {

            if (entities[i].health > entities[i].maxHealth) {
                entities[i].health = entities[i].maxHealth;
            } else if (entities[i].health < 0) {
                entities[i].health = 0;
            }
            if (entities[i].health <= 0) {
                entities[i].onDeath();
            }
            if (entities[i].health > 0 && isInsideScreen(entities[i])) {
                if (entities[i] !== player && noclip === false) {
                    entities[i].behaviour(player);
                }
                collision(entities[i]);
                velocity(entities[i]);
                entities[i].xPos = Math.round(entities[i].xPos);
                entities[i].yPos = Math.round(entities[i].yPos);
                if (isInsideScreen(entities[i])) {
                    renderedEntities += 1;
                    ctx.drawImage(entities[i].canvas, entities[i].yPos + globalPosX, entities[i].xPos);
                }
            }
        }
        //LEVEL BLOCKS
        if (level.length > 0) {
            for (var i = 0; i < level.length; i += 1) {
                if (isInsideScreen(level[i])) {
                    renderedBlocks += 1;
                    ctx.drawImage(level[i].canvas, level[i].yPos + globalPosX, level[i].xPos);
                }
            }
        }

        //DECOR BLOCKS
        if (levelDecor.length > 0) {
            for (var i = 0; i < levelDecor.length; i += 1) {
                if (isInsideScreen(levelDecor[i])) {
                    renderedBlocks += 1;
                    ctx.drawImage(levelDecor[i].canvas, levelDecor[i].yPos + globalPosX, levelDecor[i].xPos);
                }

            }
        }

        //FOREGROUND
        if (levelDecorForeground.length > 0) {
            for (var i = 0; i < levelDecorForeground.length; i += 1) {
                renderedBlocks += 1;
                ctx.drawImage(levelDecorForeground[i].canvas, Math.round(levelDecorForeground[i].yPos + (globalPosX)), levelDecorForeground[i].xPos);
                if (levelDecorForeground[i].block !== "vegetation/tree01" && levelDecorForeground[i].block !== "vegetation/grass01") {
                    ctx.drawImage(brush2, Math.round(levelDecorForeground[i].yPos + (globalPosX)), levelDecorForeground[i].xPos, levelDecorForeground[i].canvas.width, levelDecorForeground[i].canvas.height);
                }
            }
        }

        if (showGridBrush === true && removerIsActive === false) {
            brushCanvas.height = paintSizeY;
            brushCanvas.width = paintSizeX;
            brushPtrn = brushContext.createPattern(brushImg, "repeat");
            brushContext.globalAlpha = 0.6;
            brushContext.fillStyle = brushPtrn;
            brushContext.fillRect(0, 0, paintSizeX, paintSizeY);

            ctx.drawImage(brushCanvas, Math.ceil((mouseX - 8 - globalPosX) / 16) * 16 + globalPosX, Math.ceil((mouseY - 8) / 16) * 16);
        }

        if (removerIsActive === true) {
            var stop = false;

            if (currentRemoveGroup === "level") {
                for (var i = 0; i < level.length; i += 1) {
                    if (isInVicinity(level[i], removerObj)) {
                        if (mouseIsIntersecting(removerObj, level[i])) {
                            stop = true;
                            ctx.drawImage(brush3, level[i].yPos + globalPosX, level[i].xPos, level[i].blockXSize, level[i].blockYSize);
                            selectedBlockForRemoval.array = level;
                            selectedBlockForRemoval.index = i;
                        }
                    }
                }
            } else if (currentRemoveGroup === "decor") {

            }
            if ($("#distance").val() < 1) {
                for (var i = 0; i < levelDecorForeground.length; i += 1) {
                    if (isInVicinity(levelDecorForeground[i], removerObj)) {
                        if (mouseIsIntersecting(removerObj, levelDecorForeground[i])) {
                            stop = true;
                            ctx.drawImage(brush3, levelDecorForeground[i].yPos + globalPosX, levelDecorForeground[i].xPos, levelDecorForeground[i].blockXSize, levelDecorForeground[i].blockYSize);
                            selectedBlockForRemoval.array = levelDecorForeground;
                            selectedBlockForRemoval.index = i;
                        }
                    }
                }
            } else if ($("#distance").val() > 1) {
                for (var i = 0; i < levelDecorBackground.length; i += 1) {
                    if (isInVicinity(levelDecorBackground[i], removerObj)) {
                        if (mouseIsIntersecting(removerObj, levelDecorBackground[i])) {
                            stop = true;
                            ctx.drawImage(brush3, levelDecorBackground[i].yPos + globalPosX, levelDecorBackground[i].xPos, levelDecorBackground[i].blockXSize, levelDecorBackground[i].blockYSize);
                            selectedBlockForRemoval.array = levelDecorBackground;
                            selectedBlockForRemoval.index = i;
                        }
                    }
                }
            } else {
                for (var i = 0; i < levelDecor.length; i += 1) {
                    if (isInVicinity(levelDecor[i], removerObj)) {
                        if (mouseIsIntersecting(removerObj, levelDecor[i])) {
                            stop = true;
                            ctx.drawImage(brush3, levelDecor[i].yPos + globalPosX, levelDecor[i].xPos, levelDecor[i].blockXSize, levelDecor[i].blockYSize);
                            selectedBlockForRemoval.array = levelDecor;
                            selectedBlockForRemoval.index = i;
                        }
                    }
                }
            }
        }
    }

    canvas.width = 850;
    canvas.height = 440;
    ctx.fillStyle = "lightblue";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    render();

    //TO draw a single image without assigning variables. 
    function drawSingleImage(xPos, yPos, width, imageSrc, height) {
        var tempImg = new Image();
        if (imageIsInsideScreen(xPos, width)) {
            tempImg.src = imageSrc;
            ctx.drawImage(tempImg, Math.round(xPos), Math.round(yPos));

            renderedBlocks += 1;
        }
    }
    //Debug - Spam entities
    function spam() {
        if (a < 500) {
            a += 1;
            entities.push(sidescroller.entity.entityFactory("jonas0" + ((Math.round(Math.random())) + 1), false, Math.random() * 800, 0, [0, Math.random() * 5]));
            setTimeout(spam, (Math.random() * 10));
        }
    }

    //Debug - Spawn random block at a random location 
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
    $("#clear").click(function () {
        entities.length = 0;
        player = sidescroller.entity.entityFactory("jonas01", true, 400, 0);
        entities.push(player);
        player.giveInventory(sidescroller.weapon.weaponFactory("pistol", 10, 2, 2, player, projectiles));
        player.currentWeapon = 0;
        $(".dead").hide();
    });

    $("#clear2").click(function () {
        for (var i = 0; i < entities.length; i += 1) {
            if (entities[i] === player) {
                entities.splice(i, 1);
            }
        }
        player = undefined;
        player = sidescroller.entity.entityFactory("jonas01", true, 400, 0);
        entities.push(player);
        player.giveInventory(sidescroller.weapon.weaponFactory("pistol", 10, 2, 2, player, projectiles));
        player.currentWeapon = 0;
        $(".dead").hide();
    });

    tick();

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
                player.inventory[player.currentWeapon].beginFire();
            }
            if (key.which === 38) {
                hold = true;
            }
            if (key.which === 17 && player.inventory.length !== 0) {
                player.inventory[player.currentWeapon].beginFire();
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

    $("#undo").click(function () {
        doUndo();
    });

    function doUndo() {
        var lastUndo = undo.length - 1;
        if (undo.length > 0) {
            if (undo[lastUndo].action === "create") {
                undo[lastUndo].array.length = undo[lastUndo].array.length - 1;
                redo.push(undo[lastUndo]);
                undo.length = undo.length - 1;
            } else if (undo[lastUndo].action === "delete") {
                undo[lastUndo].array.push(undo[lastUndo].object);
                redo.push(undo[lastUndo]);
                undo.length = undo.length - 1;
            }
        }

    }

    $("#redo").click(function () {
        doRedo();
    });

    function doRedo() {
        var lastRedo = redo.length - 1;
        if (redo.length > 0) {
            if (redo[lastRedo].action === "create") {
                redo[lastRedo].array.push(redo[lastRedo].object);
                undo.push(redo[lastRedo]);
                redo.length = redo.length - 1;
            } else if (redo[lastRedo].action === "delete") {
                redo[lastRedo].array.length = redo[lastRedo].array.length - 1;
                undo.push(redo[lastRedo]);
                redo.length = redo.length - 1;
            }
        }
    }

    $("#clearDo").click(function () {
        undo.length = 0;
        redo.length = 0;
        clearBool = false;
    });

    //Spawn block when painting
    function spawnInputBlock() {
        var newBlock,
            blockDistance = parseInt($("#distance").val());
        if (removerIsActive === false && entityPlacer === false) {
            if (selectedPaintGroup === "level") {
                newBlock = sidescroller.block.blockFactory(Math.ceil((mouseX - 8 - globalPosX) / 16) * 16, Math.ceil(((mouseY - 8) / 16)) * 16, selectedBlock, true, undefined, undefined, undefined, paintSizeX, paintSizeY);
                level.push(newBlock);
                undo.push({
                    action: "create",
                    array: level,
                    index: undo.length + 1,
                    object: newBlock
                });
            } else if (selectedPaintGroup === "decor") {
                //console.log("decor");
                if (blockDistance === 1) {
                    newBlock = sidescroller.block.blockFactory(Math.ceil((mouseX - 8 - globalPosX) / 16) * 16, Math.ceil(((mouseY - 8) / 16)) * 16, selectedBlock, true, undefined, undefined, undefined, paintSizeX, paintSizeY);
                    newBlock.distance = 1;
                    levelDecor.push(newBlock);
                    undo.push({
                        action: "create",
                        array: levelDecor,
                        index: undo.length + 1,
                        object: newBlock
                    });
                } else {

                    if (blockDistance > 1) {
                        newBlock = sidescroller.block.blockFactory(Math.ceil((mouseX - 8) / 16) * 16 - (globalPosX / blockDistance), Math.ceil(((mouseY - 8) / 16)) * 16, selectedBlock, true, undefined, undefined, undefined, paintSizeX, paintSizeY);
                        newBlock.distance = blockDistance;
                        levelDecorBackground.push(newBlock);
                        undo.push({
                            action: "create",
                            array: levelDecorBackground,
                            index: undo.length + 1,
                            object: newBlock
                        });
                    } else {
                        newBlock = sidescroller.block.blockFactory(Math.ceil((mouseX - 8 - globalPosX) / 16) * 16, Math.ceil(((mouseY - 8) / 16)) * 16, selectedBlock, true, undefined, undefined, undefined, paintSizeX, paintSizeY);
                        levelDecorForeground.push(newBlock);
                        undo.push({
                            action: "create",
                            array: levelDecorForeground,
                            index: undo.length + 1,
                            object: newBlock
                        });
                    }
                }
            }

            redo.length = 0;
        } else if (removerIsActive === true) {
            undo.push({
                action: "delete",
                array: selectedBlockForRemoval.array,
                index: undo.length + 1,
                object: selectedBlockForRemoval.array[selectedBlockForRemoval.index]
            });
            selectedBlockForRemoval.array.splice(selectedBlockForRemoval.index, 1);
            redo.length = 0;
        } else if (entityPlacer === true) {
            placeEntity(mouseX - globalPosX, mouseY, $("#custom").val());
        }
    }

    function placeEntity(posX, posY, type) {
        var newEntity = sidescroller.entity.entityFactory(type, false, posX, posY, undefined);
        entities.push(newEntity);

    }

    canvas.addEventListener("mousedown", function (e) {
        mouseDown = true;
        spawnInputBlock();
    }, false);
    canvas.addEventListener("mouseup", function (e) {
        mouseDown = false;

    }, false);
    canvas.addEventListener("mousemove", function (e) {
        var abort = false;
        mouseY = e.offsetY;
        mouseX = e.offsetX;

        removerObj.xPos = mouseY;
        removerObj.yPos = mouseX - globalPosX;

        if (removerIsActive === false) {
            if (mouseDown === true && (oldMouseY !== mouseY ||  oldMouseX !== mouseX)) {
                for (var i = 0; i < level.length; i += 1) {
                    if (level[i].yPos === Math.ceil((mouseX - 8) / 16) * 16 - globalPosX && level[i].xPos === Math.ceil(((mouseY - 8) / 16)) * 16) {
                        abort = true;
                    }
                }
                if (abort === false) {
                    spawnInputBlock();
                }

                oldMouseY = mouseY;
                oldMouseX = mouseX;
            }
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
            player.onGround = false;
        }
        if (keyUp.which === 17) {
            player.inventory[player.currentWeapon].stopFire();
        }
    });

    $("#block1").click(function () {
        selectedBlock = "block01";
        $(".block").removeClass("selected");
        $("#block1").addClass("selected");
        setBrushBlock();
    });

    $("#block2").click(function () {
        selectedBlock = "block01Beach";
        $(".block").removeClass("selected");
        $("#block2").addClass("selected");
        setBrushBlock();
    });
    $("#block3").click(function () {
        selectedBlock = "block01Green";
        $(".block").removeClass("selected");
        $("#block3").addClass("selected");
        setBrushBlock();
    });
    $("#block4").click(function () {
        selectedBlock = "block01White";
        $(".block").removeClass("selected");
        $("#block4").addClass("selected");
        setBrushBlock();
    });
    $("#block5").click(function () {
        selectedBlock = "grass01";
        $(".block").removeClass("selected");
        $("#block5").addClass("selected");
        setBrushBlock();
    });
    $("#block6").click(function () {
        selectedBlock = "dirt01";
        $(".block").removeClass("selected");
        $("#block6").addClass("selected");
        setBrushBlock();
    });
    $("#block7").click(function () {
        selectedBlock = "dirt01Mossy";
        $(".block").removeClass("selected");
        $("#block7").addClass("selected");
        setBrushBlock();
    });
    $("#block12").click(function () {
        selectedBlock = "dirt01MossyNoTop";
        $(".block").removeClass("selected");
        $("#block12").addClass("selected");
        setBrushBlock();
    });
    $("#block8").click(function () {
        selectedBlock = "box01";
        $(".block").removeClass("selected");
        $("#block8").addClass("selected");
        setBrushBlock();
    });
    $("#block9").click(function () {
        selectedBlock = "burger01";
        $(".block").removeClass("selected");
        $("#block9").addClass("selected");
        setBrushBlock();
    });
    $("#block10").click(function () {
        selectedBlock = "blockade01";
        $(".block").removeClass("selected");
        $("#block10").addClass("selected");
        setBrushBlock();
    });
    $("#block11").click(function () {
        selectedBlock = "vegetation/grass01";
        $(".block").removeClass("selected");
        $("#block11").addClass("selected");
        $("#brushSizeX").val(2);
        $("#brushSizeY").val(1);
        paintSizeX = 2 * 16;
        paintSizeY = 16;
        setBrushBlock();

    });
    $("#block13").click(function () {
        selectedBlock = "vegetation/tree01";
        $(".block").removeClass("selected");
        $("#block13").addClass("selected");
        $("#brushSizeX").val(6);
        $("#brushSizeY").val(6);
        paintSizeX = 6 * 16;
        paintSizeY = 6 * 16;
        setBrushBlock();
    });

    $("#block14").click(function () {
        selectedBlock = $("#custom").val();
        $("#block14").css("background-image", "url(assets/blocks/" + $("#custom").val() + ".png)");
        $(".block").removeClass("selected");
        $("#block14").addClass("selected");
        setBrushBlock();
    });

    $("#decor").click(function () {
        selectedPaintGroup = "decor";
        $("#decor").addClass("selected");
        $("#entity").removeClass("selected");
        $("#level").removeClass("selected");
        $("#brushSizeX").attr("max", "");
        $("#brushSizeY").attr("max", "");
        entityPlacer = false;
        setBrushBlock();
        currentRemoveGroup = "decor";
    });
    $("#level").click(function () {
        selectedPaintGroup = "level";
        $("#decor").removeClass("selected");
        $("#entity").removeClass("selected");
        $("#level").addClass("selected");
        $("#brushSizeX").attr("max", 8);
        $("#brushSizeY").attr("max", 8);
        if ($("#brushSizeY").val() > 8) {
            $("#brushSizeY").val(8);
            paintSizeY = 8 * 16;
        }
        if ($("#brushSizeX").val() > 8) {
            $("#brushSizeX").val(8);
            paintSizeX = 8 * 16;
        }
        entityPlacer = false;
        setBrushBlock();
        currentRemoveGroup = "level";
    });

    $("#entity").click(function () {
        entityPlacer = true;
        $("#decor").removeClass("selected");
        $("#level").removeClass("selected");
        $("#entity").addClass("selected");
        paintSizeX = 28;
        paintSizeY = 32;
        selectedBlock = "../" + $("#custom").val();
        setBrushBlock();
        currentRemoveGroup = "entity";
    });

    $("#remover").click(function () {
        removerIsActive = !removerIsActive;
        $("#remover").toggleClass("selected");
    });

    $("#grid").click(function () {
        gridVisible = !gridVisible;
        $("#grid").toggleClass("selectedSmall");
    });

    $("#gridBrush").click(function () {
        showGridBrush = !showGridBrush;
        $("#gridBrush").toggleClass("selectedSmall");
    });
    $("#noclip").click(function () {
        noclip = !noclip;
        player.xPos = 0;
        if (noclip === false) {
            player.onGround = false;
        }
        $("#noclip").toggleClass("selectedSmall");
    });

    $("#pauseButton").click(function () {
        pause = !pause;
        $("#pauseButton").toggleClass("selectedSmall");
        $(".pausedText").toggle();
        if (pause === false) {
            tick();
            $("#pauseButton").val("Pause");
        } else {
            $("#pauseButton").val("Paused");
        }
    });

    $("#debug").click(function () {
        $(".debug").toggle();
    });
    $(".debug").toggle();
    $("#brushSizeX").click(function () {
        paintSizeX = $("#brushSizeX").val() * 16;
        paintSizeY = paintSizeY;
        setBrushBlock();
    });
    $("#brushSizeY").click(function () {
        paintSizeY = $("#brushSizeY").val() * 16;
        paintSizeX = paintSizeX;
        setBrushBlock();
    });

    function setBrushBlock() {
        brushImg.src = "assets/blocks/brush01.png";

        if (selectedBlock !== "blockade01") {
            brushImg.src = "assets/blocks/" + selectedBlock + ".png";
        } else {
            brushImg.src = "assets/blocks/brush01.png";
        }

    }

    setBrushBlock();

    return {
        entities: entities,
        level: level,
        levelDecor: levelDecor
    }
});

(function (console) {

    console.save = function (data, filename) {

        if (!data) {
            console.error('Console.save: No data')
            return;
        }

        if (!filename) filename = 'console.json'

        if (typeof data === "object") {
            data = JSON.stringify(data)
        }

        var blob = new Blob([data], {
            type: 'text/json'
        }),
            e = document.createEvent('MouseEvents'),
            a = document.createElement('a')

            a.download = filename
            a.href = window.URL.createObjectURL(blob)
            a.dataset.downloadurl = ['text/json', a.download, a.href].join(':')
            e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
            a.dispatchEvent(e)
    }
})(console)