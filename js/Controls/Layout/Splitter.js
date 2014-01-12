﻿//分隔条控件
flyingon.class("Splitter", flyingon.ContentControl, function (Class, flyingon) {



    Class.create = function () {

        var storage = this["x:storage"];
        storage.cursor = flyingon.cursors["col-resize"];
        storage.dock = "left";
        storage.draggable = true;
    };



    this.defaultValue("draggable", true);




    this["event:mousedown"] = function (event) {


    };

    this["event:mousemove"] = function (event) {


    };

    this["event:mouseup"] = function (event) {


    };



    this.dragger = {

        allowdropCursor: flyingon.cursors["col-Resize"],

        nodropCursor: flyingon.cursors["no-drop"],

        paint: function (context, dragTargets) {

            var boxModel = this["x:boxModel"],
                r = boxModel.innerRect;

            context.fillStyle = this.styleValue("dragColor") || "rgba(255,0,0,0.5)";
            context.fillRect(r.x, r.y, r.width, r.height);

            this.paint(context);
            this.paintBorder(context);
        },

        move: function (event, offsetX, offsetY) {

            switch (this["x:storage"].dock)
            {
                case "left":
                case "right":
                    return { x: offsetX, y: 0 };

                case "top":
                case "bottom":
                    return { x: 0, y: offsetY };
            }
        },

        stop: function (event, offsetX, offsetY) {

        }

    };


}, true);

