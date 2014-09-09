/*jslint browser:true */
/*global sidescroller: false, $: false, alert: false, confirm: false, console: false, Debug: false, opera: false, prompt: false, WSH: false */
sidescroller.block = (function () {
    "use strict";
    return {
        blockFactory: function (posY, posX, type, bCollision, func, callback, fri, sizeX, sizeY) {
            var canvas = document.createElement("canvas"),
                context = canvas.getContext("2d"),
                imageLoaded = false,
                image = new Image(),
                onCollision,
                hasCollision,
                friction = 0.2,
                touched = false,
                ySize = 16,
                xSize = 16,
                callback,
                block = "",
                distance = 1,
                alpha = 1;

            if (bCollision === undefined) {
                hasCollision = true;
            } else {
                hasCollision = bCollision;
            }

            if (callback === undefined) {
                callback = function () {};
            } else {
                callback = callback;
            }

            if (fri !== undefined) {
                friction = fri;
            }

            if (sizeY !== undefined) {
                ySize = sizeY;
            }
            if (sizeX !== undefined) {
                xSize = sizeX;
            }

            canvas.width = xSize;
            canvas.height = ySize;
            block = type;
            image.src = "assets/blocks/" + type + ".png";

            image.onload = function () {
                imageLoaded = true;
                render();
            };

            function render() {
                if (imageLoaded === true) {
                    var ptrn = context.createPattern(image, 'repeat');
                    context.fillStyle = ptrn;
                    context.globalAlpha = alpha;
                    context.fillRect(0, 0, canvas.width, canvas.height);

                    context.drawImage(image, 0, 0);
                }
            }
            if (func === undefined) {
                onCollision = function () {
                    //  setBlock("dirt01");
                };
            } else {
                onCollision = func;
            }

            function setBlock(input) {
                block = input;
                image.src = "assets/blocks/" + input + ".png";
            }
            return {
                canvas: canvas,
                context: context,
                Alpha: function (input) {
                    alpha = input;
                },
                yPos: posY,
                xPos: posX,
                hasCollision: hasCollision,
                onCollision: onCollision,
                setBlock: setBlock,
                touched: touched,
                callback: callback,
                friction: friction,
                image: image,
                block: block,
                blockXSize: xSize,
                blockYSize: ySize,
                distance: distance
            };

        }
    };
}());