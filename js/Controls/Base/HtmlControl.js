﻿//Html控件基类
flyingon.class("HtmlControl", flyingon.Control, function (Class, flyingon) {


    Class.create = function () {

        this.dom = $(this.render.apply(this, arguments));
    };


    this.render = function (layer) {

    };

}, true);



flyingon.class("HtmlFrame", flyingon.HtmlControl, function (Class, flyingon) {

    var fn;
    //if (flyingon.Browser.IE) {
    //
    //    fn = function (frame, html) {
    //        frame.contentWindow.contentHtml = html;
    //        frame.src = "javascript:window['contentHtml']";
    //    }
    //}
    //else {
    fn = function (frame, html) {

        var doc = frame.contentWindow.document;
        doc.open();
        doc.write(html);
        doc.close();
    };
    //};

    this.loadHtml = function (html) {

        var self = this;
        var frame = document.createElement("iframe");

        frame.setAttribute("border", "0");
        frame.setAttribute("marginwidth", "0");
        frame.setAttribute("marginheight", "0");
        frame.setAttribute("frameborder", "no");
        frame.setAttribute("scrolling", "no");
        frame.setAttribute("allowtransparency", "yes");

        frame.onload = function () {

            frame.onload = null;

            html && fn(frame, html);
            self.loaded && self.loaded(frame);
        };

        frame.src = "about:blank";
        return frame;
    };

});

