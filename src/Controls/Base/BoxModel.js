﻿/*

*/
(function (flyingon) {



    //变量管理器
    var prototype = (flyingon.BoxModel = function (ownerControl) {

        //所属控件
        this.ownerControl = ownerControl;

    }).prototype;



    //上级盒模型
    prototype.parent = null;

    //相对偏移所属父模型
    prototype.offsetParent = null;

    //子项集合
    prototype.children = null;

    //附加子项集合
    prototype.additions = null;

    //是否需要渲染
    prototype.visible = true;



    //是否需要重绘
    prototype.__dirty__ = false;

    //子模型是否需要重绘
    prototype.__children_dirty__ = false;

    //父模型是否需要重绘
    prototype.__parent_dirty__ = false;



    //是否需要测量
    prototype.__measure__ = true;

    //绘图环境
    prototype.context = null;



    //相对x坐标
    prototype.x = 0;

    //相对y坐标
    prototype.y = 0;

    //绝对x坐标
    prototype.windowX = 0;

    //绝对y坐标
    prototype.windowY = 0;


    //渲染宽度
    prototype.width = 0;

    //渲染高度
    prototype.height = 0;

    //右边x坐标
    flyingon.defineProperty(prototype, "right", function () {

        return this.x + this.width;
    });

    //底部y坐标
    flyingon.defineProperty(prototype, "bottom", function () {

        return this.y + this.height;
    });


    //x滚动偏移
    prototype.scrollLeft = 0;

    //y滚动偏移
    prototype.scrollTop = 0;

    //滚动宽度
    prototype.scrollWidth = 0;

    //滚动高度
    prototype.scrollHeight = 0;




    //初始化方法
    prototype.initialize = function (parent) {

        //处理父模型
        this.parent = parent;

        if (parent)
        {
            this.offsetParent = parent;
            parent.children.push(this);
        }
        else
        {
            this.offsetParent = null;
        }

        this.__measure__ = true;
    };

    //初始化附加项方法
    prototype.initialize_addtions = function (parent) {

        //处理父模型
        this.parent = parent;

        if (parent)
        {
            this.offsetParent = parent && parent.parent;
            (parent.additions || (parent.additions = [])).push(this);
        }
        else
        {
            this.offsetParent = null;
        }

        this.__measure__ = true;
    };


    //测量 注:请先调用size方法计算大小
    //传入的区域为可用区域 系统会自动根据此范围计算出实际占用空间
    //options: 扩展选项 见下:
    //width:        指定宽度  0表示不指定由系统自动算出 含margin
    //height:       指定高度  0表示不指定由系统自动算出 含margin
    //maxWidth:     最大可用宽度 含margin
    //maxHeight:    最大可用高度 含margin
    //align_width:  对齐宽度 不设置默认使用指定宽度
    //align_height: 对齐高度 不设置默认使用指定高度
    prototype.measure = function (x, y, width, height, maxWidth, maxHeight, align_width, align_height) {


        var ownerControl = this.ownerControl,

            margin = this.margin = ownerControl.margin,

            spaceX = margin.spaceX,
            spaceY = margin.spaceY,

            align = ownerControl.align,
            width_value = ownerControl.width,
            height_value = ownerControl.height,

            auto_width = this.__auto_width__ = width_value == "auto",
            auto_height = this.__auto_height__ = height_value == "auto",

            cache;


        //记录原始位置作为移动的参考
        this.origin_x = x;
        this.origin_y = y;


        //减去外框
        x += margin.left;
        y += margin.top;

        cache = width;
        width = width > spaceX ? width - spaceX : 0;

        switch (width_value)
        {
            case "default": //默认
                width_value = cache > 0 ? width : ownerControl.__defaults__.width;
                break;

            case "fill": //充满可用区域
            case "auto": //自动大小
                if (cache > 0)
                {
                    width_value = width;
                }
                else if (maxWidth > 0)
                {
                    width_value = maxWidth > spaceX ? maxWidth - spaceX : 0;
                }
                else
                {
                    width_value = ownerControl.__defaults__.width;
                }
                break;

            default:  //固定或百分比
                if (typeof width_value != "number")
                {
                    width_value = flyingon.parseInt(width_value, this.parent.clientRect.width - spaceX);
                }
                break;
        }


        if ((cache = ownerControl.minWidth) >= 0 && width_value < cache)
        {
            width_value = cache;
        }
        else if ((cache = ownerControl.maxWidth) > 0 && width_value > cache)
        {
            width_value = cache;
        }

        cache = height;
        height = height > spaceY ? height - spaceY : 0;

        switch (height_value)
        {
            case "default": //默认
                height_value = cache > 0 ? height : ownerControl.__defaults__.height;
                break;

            case "fill": //充满可用区域
            case "auto": //自动大小
                if (cache > 0)
                {
                    height_value = height;
                }
                else if (maxHeight > 0)
                {
                    height_value = maxHeight > spaceY ? maxHeight - spaceY : 0;
                }
                else
                {
                    height_value = ownerControl.__defaults__.height;
                }
                break;

            default:  //固定或百分比
                if (typeof height_value != "number")
                {
                    height_value = flyingon.parseInt(height_value, this.parent.clientRect.height - spaceY);
                }
                break;
        }

        if ((cache = ownerControl.minWidth) >= 0 && height_value < cache)
        {
            height_value = cache;
        }
        else if ((cache = ownerControl.maxWidth) > 0 && height_value > cache)
        {
            height_value = cache;
        }


        //修正位置
        if ((align_width || (width > 0 && (align_width = width))) && (cache = (align_width - width_value)))
        {
            switch (align_width = align.horizontal)
            {
                case "center":
                    x += cache >> 1;
                    break;

                case "right":
                    x += cache;
                    break;
            }
        }

        if ((align_height || (height > 0 && (align_height = height))) && (cache = (align_height - height_value)))
        {
            switch (align_height = align.vertical)
            {
                case "middle":
                    y += cache >> 1;
                    break;

                case "bottom":
                    y += cache;
                    break;
            }
        }

        this.x = x;
        this.y = y;
        this.width = width_value;
        this.height = height_value;



        //处理自动大小
        if (auto_width || auto_height) //自动大小需立即计算
        {
            //测量
            this.__fn_measure__(ownerControl);

            //自定义文字测量
            ownerControl.measureText(this);
            ownerControl.adjustAutoSize(this, auto_width, auto_height);

            //调整位置
            if (auto_width)
            {
                switch (align_width)
                {
                    case "center":
                        this.x += (width_value - this.width) >> 1;
                        break;

                    case "right":
                        this.x += width_value - this.width;
                        break;
                }
            }

            if (auto_height)
            {
                switch (align_height)
                {
                    case "middle":
                        this.y += (height_value - this.height) >> 1;
                        break;

                    case "bottom":
                        this.y += height_value - this.height;
                        break;
                }
            }

            //计算
            this.compute();
        }
        else
        {
            this.__measure__ = true;
        }



        //标记更新状态
        this.__dirty__ = true;
        return this;
    };



    //移动至指定位置(大小不变)
    prototype.moveTo = function (x, y, origin_position) {

        if (origin_position) //相对原始位置移动
        {
            x -= this.origin_x;
            y -= this.origin_y;
        }
        else //相对真实位置移动(在不按起始位置对齐时有差异)
        {
            x -= this.x;
            y -= this.y;
        }


        this.x += x;
        this.y += y;

        this.origin_x += x;
        this.origin_y += y;


        if (this.clientRect)
        {
            if (x)
            {
                this.windowX += x;

                this.usableRect.x += x;
                this.clientRect.x += x;

                this.usableRect.windowX += x;
                this.clientRect.windowX += x;
            }

            if (y)
            {
                this.windowY += y;

                this.usableRect.y += y;
                this.clientRect.y += y;

                this.usableRect.windowY += y;
                this.clientRect.windowY += y;
            }
        }

        return this;
    };


    //定位单个内容控件
    prototype.content = function (content) {

        if (content && (this.visible = content.visibility != "collapsed"))
        {
            var r = this.clientRect,
                box = content.__boxModel__;

            box.measure(0, 0, r.width, r.height);
        }

        return this;
    };



    prototype.__fn_measure__ = function (ownerControl) {

        //测量
        this.__measure__ = false;

        var fn = ownerControl.measure;
        if (fn)
        {
            fn.call(ownerControl, this);
        }
        else
        {
            this.compute();
        }
    };



    //计算盒模型
    prototype.compute = function () {


        var ownerControl = this.ownerControl,

            r = this.offsetParent && this.offsetParent.clientRect,
            windowX = r ? r.windowX : 0,
            windowY = r ? r.windowY : 0,

            usableRect = this.usableRect = new flyingon.Rect(), //可用区域(除边框及滚动条外的区域,含padding)
            clientRect = this.clientRect = new flyingon.Rect(), //客户区域(内容区,不含padding)

            x = this.x + ownerControl.offsetX,
            y = this.y + ownerControl.offsetY,
            width = this.width,
            height = this.height,

            border = this.border = ownerControl.border,
            padding = this.padding = ownerControl.padding;



        //圆角边框不能隐藏边线及不支持粗细不同的边线
        if (border.border = border.top > 0)
        {
            if (this.borderRadius = ownerControl.borderRadius)
            {
                border.right = border.bottom = border.left = border.top;
            }
        }
        else
        {
            border.border = border.right > 0 || border.bottom > 0 || border.left > 0; //是否有边框线标志
        }

        this.windowX = x + windowX;
        this.windowY = y + windowY;

        usableRect.windowX = (usableRect.x = x + border.left) + windowX;
        usableRect.windowY = (usableRect.y = y + border.top) + windowY;

        if ((usableRect.width = width - border.spaceX) < 0)
        {
            usableRect.width = 0;
        }

        if ((usableRect.height = height - border.spaceY) < 0)
        {
            usableRect.height = 0;
        }

        clientRect.windowX = (clientRect.x = x + (clientRect.spaceX = border.left + padding.left)) + windowX;
        clientRect.windowY = (clientRect.y = y + (clientRect.spaceY = border.top + padding.top)) + windowY;

        if ((clientRect.width = usableRect.width - padding.spaceX) < 0)
        {
            clientRect.width = 0;
        }

        if ((clientRect.height = usableRect.height - padding.spaceY) < 0)
        {
            clientRect.height = 0;
        }

        return this;
    };





    //使当前盒模型无效
    prototype.invalidate = function (measure, update) {

        var target = this, parent;

        if (measure)
        {
            target.__measure__ = true;
        }

        if (!target.__dirty__)
        {
            target.__dirty__ = true;
        }

        while (!target.context && (parent = target.parent))
        {
            if (!parent.__dirty__)
            {
                if (target.__dirty__ && target.__parent_dirty__)
                {
                    parent.__dirty__ = true;
                }
                else
                {
                    parent.__children_dirty__ = true;
                }
            }

            target = parent;
        }

        if (target.context)
        {
            if (update)
            {
                target.__unregistry_update__();
                target.update(target.context);
            }
            else
            {
                target.__registry_update__();
            }
        }
    };



    //更新
    prototype.update = function (context) {

        if (this.__dirty__) //如果需要更新
        {
            this.render(context);
        }
        else if (this.__children_dirty__) //如果子控件需要更新
        {
            this.__children_dirty__ = false;

            if (this.children)
            {
                this.__fn_render_children__(context, "update");
            }

            if (this.additions)
            {
                this.__fn_render_additions__(context, "update");
            }
        }
    };




    //渲染
    prototype.render = function (context) {


        var ownerControl = this.ownerControl;


        //测量
        if (this.__measure__)
        {
            this.__fn_measure__(ownerControl);

            //自定义文字测量
            ownerControl.measureText(this);
        }


        //设置渲染环境
        context.boxModel = this;
        context.save();
        context.globalAlpha = ownerControl.opacity;


        //绘制背景
        this.__parent_dirty__ = !ownerControl.paint_background(context, this) || context.globalAlpha < 1;


        //绘制子项
        if (this.children)
        {
            this.__fn_render_children__(context, "render");
        }

        //绘制附加内容
        if (this.additions)
        {
            this.__fn_render_additions__(context, "render");
        }


        //设置渲染环境
        context.boxModel = this;

        //绘制内框
        ownerControl.paint(context, this);

        //绘制外框
        ownerControl.paint_border(context, this);


        //绘制装饰
        var decorates = ownerControl.decorates;
        if (decorates && decorates.length > 0)
        {
            this.__fn_paint_decorates__(context, decorates);
        }


        context.restore();

        //修改状态
        this.__dirty__ = false;
    };


    //渲染或更新子项
    prototype.__fn_render_children__ = function (context, fn) {

        var ownerControl = this.ownerControl,
            items = ownerControl.__fn_render_children__,
            item,
            length;


        items = items ? items.call(ownerControl, this) : this.children;

        if ((length = items.length) > 0)
        {
            context.save();

            if (this.scrollLeft || this.scrollTop)
            {
                context.translate(-this.scrollLeft, -this.scrollTop);
            }

            if (ownerControl.clipToBounds)
            {
                var r = this.clientRect;

                context.beginPath();
                context.rect(r.x + this.scrollLeft, r.y + this.scrollTop, r.width, r.height);
                context.clip();
            }

            for (var i = 0; i < length; i++)
            {
                if (item = items[i])
                {
                    item[fn](context);
                }
            }

            context.restore();
        }
    };


    //渲染或更新附加内容
    prototype.__fn_render_additions__ = function (context, fn) {

        var additions = this.additions,
            item;

        if (additions)
        {
            for (var i = 0, length = additions.length; i < length; i++)
            {
                if ((item = additions[i]) && item.visible)
                {
                    item[fn](context, this);
                }
            }
        }
    };


    //绘制装饰
    prototype.__fn_paint_decorates__ = function (context, decorates) {

        var reader;

        for (var i = 0, length = decorates.length; i < length; i++)
        {
            var item = decorates[i];

            //未处理
            if (!(item instanceof flyingon.Shape))
            {
                item = decorates[i] = (reader || (reader = new flyingon.SerializeReader())).deserialize(item);
            }

            item.paint(context, this);
        }
    };







    //获取滚动偏移
    function scroll() {

        var target = this,
            parent,
            x = 0,
            y = 0;

        while (parent = target.offsetParent)
        {
            x += parent.scrollLeft;
            y += parent.scrollTop;

            target = parent;
        }

        return { x: x, y: y }
    };

    //偏移坐标转目标坐标
    prototype.offsetToTarget = function (x, y) {

        var result = scroll.call(this);

        result.x += x - this.windowX;
        result.y += y - this.windowY;

        return result;
    };

    //偏移坐标转窗口坐标
    prototype.offsetToWindow = function (x, y) {

        var result = scroll.call(this);

        result.x += x;
        result.y += y;

        //如果控件自身有滚动动条且落在客户区内则加上滚动偏移
        if (this.scrollLeft && result.x < this.windowX + this.clientRect.right)
        {
            result.x += this.scrollLeft;
        }

        if (this.scrollTop && result.y < this.windowY + this.clientRect.bottom)
        {
            result.y += this.scrollTop;
        }

        return result;
    };

    //偏移坐标转控件坐标
    prototype.offsetToControl = function (x, y) {

        var result = scroll.call(this);

        result.x += x - this.windowX;
        result.y += y - this.windowY;

        //如果控件自身有滚动动条且落在客户区内则加上滚动偏移
        if (this.scrollLeft && result.x < this.clientRect.right)
        {
            result.x += this.scrollLeft;
        }

        if (this.scrollTop && result.y < this.clientRect.bottom)
        {
            result.y += this.scrollTop;
        }

        return result;
    };


    //目标坐标转偏移坐标
    prototype.targetToOffset = function (x, y) {

        var result = scroll.call(this);

        result.x = this.windowX + x - result.x;
        result.y = this.windowY + y - result.y;

        return result;
    };

    //窗口坐标转偏移坐标
    prototype.windowToOffset = function (x, y) {

        var result = scroll.call(this);

        result.x = x - result.x;
        result.y = y - result.y;

        //如果控件自身有滚动动条且落在客户区内则加上滚动偏移
        if (this.scrollLeft && result.x <= this.windowX + this.scrollLeft + this.clientRect.right)
        {
            result.x -= this.scrollLeft;
        }

        if (this.scrollTop && result.y <= this.windowY + this.scrollTop + this.clientRect.bottom)
        {
            result.y -= this.scrollTop;
        }

        return result;
    };

    //控件坐标转偏移坐标
    prototype.controlToOffset = function (x, y) {

        var result = scroll.call(this);

        result.x = this.windowX + x - result.x;
        result.y = this.windowY + y - result.y;

        //如果控件自身有滚动动条且落在客户区内则加上滚动偏移
        if (this.scrollLeft && result.x <= this.windowX + this.scrollLeft + this.clientRect.right)
        {
            result.x -= this.scrollLeft;
        }

        if (this.scrollTop && result.y <= this.windowY + this.scrollTop + this.clientRect.bottom)
        {
            result.y -= this.scrollTop;
        }

        return result;
    };



})(flyingon);