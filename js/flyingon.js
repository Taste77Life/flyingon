﻿"use strict";
///以上代码启用严格模式

//注意页面渲染模式设置, 否则IE启用了兼容模式时可能无法执行脚本
//<!--以IE的当前版本渲染,如果安装了ChromeFrame则优先使用-->
//<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />

/*

*/




//根命名空间
var flyingon = this.flyingon = this.flyingon || {};




//全局变量
(function (flyingon) {


    //版本
    flyingon.version = "0.0.0.1";

    //语言
    flyingon.language = "zh-CHS";

    //系统设置 记录当前用户样式语言等信息
    flyingon.setting = flyingon.setting || {};


})(flyingon);





//扩展函数
(function (flyingon) {


    //增加字符串格式化支持
    String.prototype.format = function () {

        return arguments.length == 0 ? this : this.replace(/\{\d+\}/g, function (value) {

            return arguments[value.substring(1, value.length - 1)] || "";
        });
    };



    var prototype = Array.prototype;


    //移除指定项
    prototype.remove = function (item) {

        var index = this.indexOf(item);
        index >= 0 && this.splice(index, 1);
    };


    //移除指定索引
    prototype.removeAt = function (index) {

        this.splice(index, 1);
    };


    //二分法搜索数据段
    prototype.binaryBetween = function (value, start, end) {

        (start == null || start < 0) && (start = 0);
        (end == null || end >= this.length) && (end = this.length - 1);


        if (this[start] >= value)
        {
            return start;
        }

        if (this[end] <= value)
        {
            return end;
        }


        var center, result;

        while (start < end)
        {
            center = Math.floor((start + end) / 2);
            result = this[center];


            if (result == value)
            {
                return center;
            }

            if (result > value)
            {
                end = center;
            }
            else
            {
                if (center >= end)
                {
                    return end;
                }

                if (this[center + 1] > value)
                {
                    return center;
                }

                start = center + 1;
            }
        }


        return start;
    };


    //二分法查找子项位置
    prototype.binaryIndexOf = function (value, start, end) {

        (start == null || start < 0) && (start = 0);
        (end == null || end >= this.length) && (end = this.length - 1);


        if (this[start] > value || this[end] < value)
        {
            return -1;
        }


        var center, result;

        while (start <= end)
        {
            center = Math.floor((start + end) / 2);
            result = this[center];

            if (result < value)
            {
                start = center + 1;
            }
            else if (result > value)
            {
                end = center - 1;
            }

            return center;
        }

        return -1;
    };


    //二分法搜索
    prototype.binarySearch = function (callbackfn, start, end) {

        (start == null || start < 0) && (start = 0);
        (end == null || end >= this.length) && (end = this.length - 1);


        var center, result;

        while (start <= end)
        {
            center = Math.floor((start + end) / 2);
            result = callbackfn.call(this, start, center, end);

            if (result < 0)
            {
                start = center + 1;
            }
            else if (result > 0)
            {
                end = center - 1;
            }

            return center;
        }

        return -1;
    };



    Image.prototype.toDataUrl = function () {

        var canvas = document.createElement("canvas");

        canvas.width = this.width;
        canvas.height = this.height;
        canvas.getContext("2d").drawImage(this, 0, 0);

        return canvas.toDataURL("image/png");
    };



})(flyingon);





//特性支持判断
(function (flyingon) {


    var support = flyingon.support = {};



    //是否支持canvas
    support.canvas = document && (function () {

        var dom = document.createElement("canvas");

        if (!dom.getContext)
        {
            alert("对不起,需要支持Html5特性的浏览器才可以运行本系统!");
            return false;
        }

        return true;

    })();


    //是否支持get或set封装属性
    support.defineProperty = (function () {

        var obj = {};
        Object.defineProperty(obj, "fn", { get: function () { return true; } });
        return obj.fn;

    })();


    //是否支持flash
    support.flash = window && (function () {

        var navigator = window.navigator;

        if (navigator.plugins && navigator.mimeTypes.length)
        {
            var flash = navigator.plugins["Shockwave Flash"];

            if (flash && flash.description)
            {
                return flash.description.replace(/([a-zA-Z]|\s)+/, "").replace(/(\s)+r/, ".") + "#0"
            }
        }
        else if (window.ActiveXObject && !window.opera)
        {
            for (var i = 10; i >= 2; i--)
            {
                try
                {
                    var activeX = new ActiveXObject("ShockwaveFlash.ShockwaveFlash." + i);
                    if (activeX)
                    {
                        var version = activeX.GetVariable("\x24version");
                        return version.replace(/WIN/g, "").replace(/,/g, ".")
                    }
                }
                catch (e)
                {
                }
            }
        }

    })();


})(flyingon);




//通用函数
(function (flyingon) {



    flyingon.defineVariable = function (target, name, value, configurable, enumerable) {

        //target[name] = value;
        Object.defineProperty(target, name, {

            value: value,
            writable: false,
            configurable: configurable === undefined ? false : configurable,
            enumerable: enumerable === undefined ? true : enumerable
        });
    };



    flyingon.defineProperty = flyingon.support.defineProperty ? function (target, name, getter, setter) {

        var attributes = {

            configurable: true,
            enumerable: true
        };

        getter && (attributes.get = getter);
        setter && (attributes.set = setter);

        Object.defineProperty(target, name, attributes);

    } : function (target, name, getter, setter) {

        getter && target.__defineGetter__(name, getter);
        setter && target.__defineSetter__(name, setter);
    };






    //增加模板函数支持 以当前函数为模板动态创建新函数
    flyingon["y:template:to"] = function (fn, values, names) {

        var body = fn.toString().replace(/"\{\w+\}"/g, function (value) {

            value = values[value.substring(2, value.length - 2)] || "";

            if (typeof value == "function")
            {
                value = value.toString();

                var index = value.indexOf("{");
                if (index++ > 0)
                {
                    var lastIndexOf = value.lastIndexOf("}");
                    lastIndexOf > 0 && (value = value.substring(index, lastIndexOf));
                }
            }

            return value;
        });

        return new Function(names, "return (" + body + ")")()
    };


    //浅复制源对象属性至目标属性(对象直接复制引用)
    //ignoreExists: 是否忽略已存在的属性
    flyingon["y:simple:copy"] = function (source, target, ignoreExists) {


        var names = Object.getOwnPropertyNames(source);

        for (var i = 0, length = names.length; i < length; i++)
        {
            var name = names[i],
                value = source[name];

            if (value != null && typeof value == "object")
            {
                var cache = target[name];

                if (cache != null && typeof cache == "object")
                {
                    flyingon["y:simple:copy"](value, cache, ignoreExists);
                    continue;
                }
            }

            (!ignoreExists || !target.hasOwnProperty(name)) && (target[name] = value);
        }

        return target;
    };


    //深度复制源对象属性至目标属性(创建新对象)
    //ignoreExists: 是否忽略已存在的属性
    flyingon["y:deep:copy"] = function (source, target, ignoreExists) {


        var names = Object.getOwnPropertyNames(source);

        for (var i = 0, length = names.length; i < length; i++)
        {
            var name = names[i],
                value = source[name];

            if (value != null && typeof value == "object")
            {
                var cache = target[name];

                if ((cache === undefined && (cache = target[name] = {})) ||
                    (cache !== null && typeof cache == "object"))
                {
                    flyingon["y:deep:copy"](value, cache, ignoreExists);
                }
            }
            else if (!ignoreExists || !target.hasOwnProperty(name))
            {
                target[name] = value instanceof Array ? value.slice(0) : value;
            }
        }

        return target;
    };



    flyingon.parseJson = (window.JSON && window.JSON.parse) || function (data) {

        return (new Function("return " + data))();
    };




    //开始初始化
    flyingon.beginInit = function () {

        flyingon["x:initializing"] = true;
        return this;
    };

    //结束初始化
    flyingon.endInit = function () {

        flyingon["x:initializing"] = false;
        return this;
    };



})(flyingon);




//名字空间
(function (global, flyingon) {


    //缓存命名空间
    var cache = { "flyingon": flyingon };


    //名字空间类
    function Namespace(name) {

        this.namespaceName = name;
        cache[name] = this;
    };



    //创建或切换名字空间方法
    flyingon.namespace = function (name, fn) {

        var result = cache[name];

        if (!result && name)
        {
            result = global;

            var values = name.split(".");

            for (var i = 0, length = values.length; i < length; i++)
            {
                var value = values[i];

                if (value)
                {
                    name = i == 0 ? value : (name + "." + value);

                    !result[value] && (result[value] = new Namespace(name));
                    result = result[value];
                }
            }
        }

        flyingon.namespace.current = result || flyingon; //切换当前命名空间

        fn && fn(flyingon, result);

        return result;
    };


    //切换当前命名空间为默认命名空间
    flyingon.namespace.current = flyingon;


})(this, flyingon);




//函数元数据
(function (flyingon) {


    var prototype = (flyingon.MetaFunction = function (fn) {

        this.fn = fn;

        var body = fn.toString();

        this.body = body.substring(body.indexOf("{") + 1, body.lastIndexOf("}"));

        body = body.match(/\([^)]*\)/)[0];
        body = body.substring(1, body.length - 1).replace(/\s+/, "");;

        this.parameters = body ? body.split(",") : [];

    }).prototype;


    //合并函数内容
    prototype.merge = function (body, insertBefore) {

        if (typeof body == "function")
        {
            body = body.toString();
            body = body.substring(body.indexOf("{") + 1, body.lastIndexOf("}"));
        }

        this.body = insertBefore ? body + this.body : this.body + body;
        this.fn = new Function(this.parameters, this.body);
        return this;
    };


})(flyingon);




//基类及继承实现
(function (flyingon) {



    var prototype = (flyingon.RootObject = function () {


    }).prototype;



    //类名
    prototype.className = flyingon.RootObject.className = "RootObject";


    prototype.toString = prototype.toLocaleString = function () {

        return "[object " + this.className + "]";
    };




    flyingon["x:registryList"] = { "flyingon.RootObject": flyingon.RootObject };


    flyingon.registryClass = function (Class, classFullName) {

        var name = classFullName || Class.classFullName;
        flyingon["x:registryList"][name] = Class;
    };

    flyingon.unregistryClass = function (classFullName) {

        delete flyingon["x:registryList"][classFullName];
    };

    flyingon.getRegistryClass = function (classFullName) {

        return flyingon["x:registryList"][classFullName];
    };



    var errorMsg = "define class error!",

        defineProperty = function (Class, prototype, name, value) {

            Class[name] = value;
            prototype["x:" + name] = value;
            flyingon.defineVariable(prototype, name, value, false, true);
        };


    //定义类方法
    //extension: 类扩展 必须为函数
    //constructor_merge: 是否合并构造函数 true:合并构造函数内容以提升性能 如果构造函数中有局部变量则不可设成true 默认为false
    flyingon.class = function (className, superClass, extension, constructor_merge) {


        //处理参数
        if (!className)
        {
            throw new Error(errorMsg);
        }

        if (extension == null || typeof extension != "function")
        {
            constructor_merge = extension;
            extension = superClass;
            superClass = flyingon.RootObject;
        }
        else if (!superClass) //没有指定基类
        {
            superClass = flyingon.RootObject;
        }

        if (typeof extension != "function") //扩展不是函数
        {
            throw new Error(errorMsg);
        }




        var namespace = flyingon.namespace.current, //当前名字空间
            classFullName = (namespace.namespaceName ? namespace.namespaceName + "." : "") + className; //类全名




        //定义类模板 Class.create为构造函数
        var Class = function () {

            var fn = Class.create;
            if (fn)
            {
                fn.apply(this, arguments);
            }
        };



        //创建类原型
        var prototype = Class.prototype = Object.create(superClass.prototype);


        defineProperty(Class, prototype, "className", className);           //类名
        defineProperty(Class, prototype, "classFullName", classFullName);   //类全名

        Class["superClass"] = superClass;                                   //父类
        Class["super"] = superClass.prototype;                              //父类原型
        prototype["constructor"] = Class;                                   //构造函数
        prototype["x:defaults"] = Class["x:defaults"] = Object.create(superClass["x:defaults"] || Object.prototype);  //默认值


        flyingon.registryClass(Class); //注册类

        namespace[className] = Class; //输出类



        //扩展
        extension.call(prototype, Class, flyingon);



        //处理构造函数
        var superClass_create = superClass.create;
        if (superClass_create)
        {
            var Class_create = Class.create,
                constructor_chain = superClass["x:constructor-chain"];

            if (Class_create)
            {
                //合并构造函数 注:已有构造链时不可以合并
                if (!constructor_chain && constructor_merge) 
                {
                    Class_create = new flyingon.MetaFunction(Class_create);
                    Class.create = Class_create.merge(superClass_create, true).fn;
                }
                else //生成构造链
                {
                    (Class["x:constructor-chain"] = (constructor_chain && constructor_chain.slice(0)) || [superClass_create]).push(Class_create);

                    Class.create = function () {

                        var constructor_chain = Class["x:constructor-chain"];
                        for (var i = 0, length = constructor_chain.length; i < length; i++)
                        {
                            constructor_chain[i].apply(this, arguments);
                        }
                    };
                }
            }
            else
            {
                constructor_chain && (Class["x:constructor-chain"] = constructor_chain);
                Class.create = superClass_create;
            }
        }



        //初始化链
        var initialize_chain = superClass["x:initialize-chain"],
            initialize = Class.initialize;

        if (initialize || initialize_chain)
        {
            initialize_chain = Class["x:initialize-chain"] = initialize_chain ? initialize_chain.slice(0) : [];

            initialize && initialize_chain.push(initialize);

            for (var i = 0; i < initialize_chain.length; i++) //执行初始化类方法(从基类开始执行)
            {
                initialize_chain[i].call(Class, flyingon);
            }
        }



        return Class;
    };




})(flyingon);





﻿/// <reference path="Core.js" />


/*

Xml解析实现



XHTML中的js操作dom原属差不多,不过没有getElementById,只有getElementsByTagName

xmlDoc.documentElement.childNodes(0).nodeName,可以得到这个节点的名称
xmlDoc.documentElement.childNodes(0).nodeValue,可以得到这个节点的值
xmlDoc.documentElement.childNodes(0).hasChild,可以判断是否有子节点

可通过使用getElementsByTagName(xPath)的方法对节点进行访问

*/
(function (flyingon) {




    var prototype = (flyingon.Xml = function (data) {

        data && this.parse(data);

    }).prototype;




    //如果支持W3C DOM 则使用此方式创建
    if (document.implementation && document.implementation.createDocument)
    {
        prototype.parse = function (data) {

            this.dom = new DOMParser().parseFromString(data, "text/xml");
            this.root = this.dom.documentElement;

            return this;
        };

        prototype.load = function (file) {

            this.dom = document.implementation.createDocument('', '', null);
            this.dom.load(file);
            this.root = this.dom.documentElement;

            return this;
        };

        prototype.serialize = function () {

            return new XMLSerializer().serializeToString(this.dom);
        };
    }
    else if (window.ActiveXObject) //IE使用ActiveX方式创建
    {
        prototype.parse = function (data) {

            this.dom = new ActiveXObject("Microsoft.XMLDOM");
            this.dom.async = "false";
            this.dom.loadXML(data);
            this.root = this.dom.documentElement;

            return this.dom;
        };

        prototype.load = function (file) {

            this.dom = new ActiveXObject('Microsoft.XMLDOM');
            this.dom.async = false;
            this.dom.load(file);
            this.root = this.dom.documentElement;

            return this.dom;
        };

        prototype.serialize = function () {

            return this.dom.xml;
        };
    }
    else
    {
        throw "you browse does not support w3c xml api!";
    }





    /**************************扩展Xml解析方法****************************/


    var encode_keys = {

        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&apos;",
        " ": "&nbsp;",
        "&": "&amp;"
    },

    decode_keys = {

        "&lt;": "<",
        "&gt;": ">",
        "&quot;": "\"",
        "&apos;": "'",
        "&nbsp;": " ",
        "&amp;": "&"
    };


    //编码
    flyingon.encodeXml = function (data) {

        return data.replace(/[\<\>\"\' \&]/g, function (key) {

            return encode_keys[key];
        });
    };

    //解码
    flyingon.decodeXml = function (data) {

        return data.replace(/&lt;|&gt;|&quot;|&apos;|&nbsp;|&amp;/g, function (key) {

            return decode_keys[key];
        });
    };






    //解析Xml数据为Json对象 根节点的名称忽略
    flyingon.parseXml = function (data) {


        if (!data)
        {
            return null;
        }


        //处理空格
        data = data.replace(/^[^\<]+|[^>]+$/, "").replace(/\>\s+\</g, "><");


        var decodeXml = flyingon.decodeXml,              //解码方法
            segments = data.match(/[^<>]+|\<\/?[^<>]+\/?>/g),
            escape = /&lt;|&gt;|&quot;|&apos;|&nbsp;|&amp;/.test(data),   //是否存在需解码的字符

            node,
            name,
            type,
            value,

            nodes = [],
            types = [];


        for (var i = 0, length = segments.length; i < length; i++)
        {
            var segment = segments[i];

            if (segment[0] == "<") //如果是标签
            {
                if (!(name = segment.match(/[\w\.\:_\-\u0370-\uffff]+/)))
                {
                    throw new Error("xml tag error!");
                }

                name = name[0];

                if (segment[1] != "/") //开始标签
                {
                    if (type = segment.match(/type\s*=\s*[\"\']/))
                    {
                        var index = type.index + type[0].length,
                            type = segment.substring(index, segment.indexOf(segment[index - 1], index));
                    }
                    else if (length > i + 1) //未指定类型时有子项则为对象否则为字符串
                    {
                        var text = segments[i + 1];
                        type = text[0] == "<" && text[1] != "/" ? "object" : "string";
                    }
                    else
                    {
                        type = "string";
                    }

                    switch (type)
                    {
                        case "null":
                        case "boolean":
                        case "number":
                        case "string":
                        case "function":
                            break;

                        case "array":
                            nodes.push(node = []);
                            break;

                        case "object":
                            nodes.push(node = {});
                            break;

                        default:
                            nodes.push(node = {});
                            node.className = type;
                            break;
                    }

                    types.push(type);
                }
                else //结束标签
                {
                    switch (types.pop())
                    {
                        case "null":
                            value = null;
                            break;

                        case "boolean":
                            value = !!value;
                            break;

                        case "number":
                            value = parseFloat(value);
                            break;

                        case "string":
                            break;

                        case "function":
                            value = new Function(value);
                            break;

                        default: //对象或数组
                            value = nodes.pop();

                            //根节点时返回(不处理根节点名称)
                            if (nodes.length == 0)
                            {
                                return value;
                            }

                            node = nodes[nodes.length - 1];
                            break;
                    }

                    if (Array.isArray(node) == Array)
                    {
                        node.push(value);
                    }
                    else
                    {
                        node[name] = value;
                    }
                }
            }
            else //否则是文本内容
            {
                value = escape && segment.charAt("&") >= 0 ? decodeXml(segment) : segment;
            }
        }


        return node;
    };




})(flyingon);



﻿//集合
flyingon.class("Collection", function (Class, flyingon) {


    Class.create = function () {

        this["x:items"] = [];
    };





    flyingon.defineProperty(this, "length", function () {

        return this["x:items"].length;
    });


    this.get = function (index) {

        return this["x:items"][index];
    };

    this.set = function (index, item) {

        var fn = this["y:validate"];

        (!fn || (item = fn.call(this, item)) !== undefined) && (this["x:items"][index] = item);

        return this;
    };

    this.indexOf = function (item) {

        return this["x:items"].indexOf(item);
    };

    this.append = function (item) {

        var fn = this["y:validate"];
        (!fn || (item = fn.call(this, item)) !== undefined) && this["x:items"].push(item);

        return this;
    };

    this.insert = function (index, item) {

        var fn = this["y:validate"];
        (!fn || (item = fn.call(this, item)) !== undefined) && this["x:items"].splice(index, 0, item);

        return this;
    };


    this.remove = function (item) {

        var items = this["x:items"],
            index = items.indexOf(item);

        if (index >= 0)
        {
            var fn = this["y:remove"];
            (!fn || fn.call(this, index) !== false) && items.splice(index, 1);
        }

        return this;
    };

    this.removeAt = function (index) {

        var items = this["x:items"];

        if (items.length > index)
        {
            var fn = this["y:remove"];
            (!fn || fn.call(this, index) !== false) && items.splice(index, 1);
        }

        return this;
    };

    this.clear = function () {

        var items = this["x:items"];

        if (items.length > 0)
        {
            var fn = this["y:clear"];
            (!fn || fn.call(this, items) !== false) && (items.length = 0);
        }

        return this;
    };



    //自定义序列化
    this.serialize = function (writer) {

        writer.array("items", this["x:items"]);
    };

    //自定义反序列化
    this.deserialize = function (reader, data) {

        reader.array(this, "x:items", data["items"]);
    };


});



﻿
//可序列化类
flyingon.class("SerializableObject", function (Class, flyingon) {



    //客户端唯一Id
    var id = 0;

    //自动名称
    var auto_name = 0;


    Class.create = function () {


        //变量管理器
        this["x:storage"] = Object.create(this["x:defaults"]);

    };




    //唯一Id
    flyingon.newId = function () {

        return "id" + (++id);
    };



    flyingon.defineProperty(this, "id", function () {

        return this["x:id"] || (this["x:id"] = "id" + (++id));
    });


    flyingon["x:define:getter"] = function (name, attributes) {

        var body = "return this['x:storage']['" + name + "'];";
        return new Function(body);
    };

    flyingon["x:define:binding"] = "(cache = this['x:bindings']) && this['y:bindings'](name, cache);\n"; //处理绑定源

    flyingon["x:define:initialize"] = "if (flyingon['x:initializing'])\n"
        + "{\n"
        + "storage[name] = value;\n"
        + flyingon["x:define:binding"]
        + "return this;\n"
        + "}\n";

    flyingon["x:define:change"] = "if ((cache = this['x:events']) && (cache = cache['change']) && cache.length > 0)\n"
        + "{\n"
        + "var event = new flyingon.ChangeEvent(this, name, value, oldValue);\n"
        + "if (this.dispatchEvent(event) === false) return this;\n"
        + "value = event.value;\n"
        + "}\n";

    flyingon["x:define:setter"] = function (name, attributes) {

        var body = "var storage = this['x:storage'], cache, name = '" + name + "';\n"

            + flyingon["x:define:initialize"]
            + "var oldValue = storage[name];\n"

            + (attributes.valueChangingCode ? attributes.valueChangingCode + "\n" : "") //自定义值变更代码

            + "if (oldValue !== value)\n"
            + "{\n"

            + flyingon["x:define:change"]

            + "storage[name] = value;\n"

            + (attributes.valueChangedCode ? attributes.valueChangedCode + "\n" : "")  //自定义值变更代码

            + flyingon["x:define:binding"]

            + "}\n"

            + "return this;\n";

        return new Function("value", body);
    };


    flyingon["x:define:attributes"] = function (attributes) {

        if (attributes)
        {
            attributes.constructor == String && (attributes = { attributes: attributes });

            if (attributes.attributes)
            {
                var values = attributes.attributes.split("|");

                for (var i = 0, length = values.length; i < length; i++)
                {
                    attributes[values[i]] = true;
                }

                attributes.attributes = null;
            }

            return attributes;
        }

        return {};
    };


    //定义属性及set_XXX方法
    this.defineProperty = function (name, defaultValue, attributes) {

        if (typeof defaultValue == "function" && (attributes === undefined || typeof attributes == "function"))
        {
            flyingon.defineProperty(this, name, defaultValue, attributes);
        }
        else
        {
            defaultValue !== undefined && (this["x:defaults"][name] = defaultValue);

            attributes = flyingon["x:define:attributes"](attributes);

            var getter = attributes.getter || flyingon["x:define:getter"](name, attributes),
                setter = !attributes.readOnly ? (attributes.setter || flyingon["x:define:setter"](name, attributes)) : null;

            flyingon.defineProperty(this, name, getter, setter);

            setter && attributes.autoset !== false && (this["set_" + name] = setter);
        }
    };

    //定义多个属性及set_XXX方法
    this.defineProperties = function (names, defaultValue, attributes) {

        for (var i = 0; i < names.length; i++)
        {
            this.defineProperty(names[i], defaultValue, attributes);
        }
    };



    //定义事件 name为不带on的事件名
    this.defineEvent = function (name) {

        flyingon.defineProperty(this, "on" + name, null,

            function (listener) {

                var events = (this["x:events"] || (this["x:events"] = {}))[name];

                events ? (events.length > 0 && (events.length = 0)) : (events = this["x:events"][name] = []);
                events.push(listener);

                return this;
            });
    };

    //定义多个事件 names为不带on的事件名数组
    this.defineEvents = function (names) {

        for (var i = 0; i < names.length; i++)
        {
            this.defineEvent(names[i]);
        }
    };


    //绑定事件处理 注:type不带on
    this.addEventListener = function (type, listener) {

        if (listener)
        {
            var events = (this["x:events"] || (this["x:events"] = {}));
            (events[type] || (events[type] = [])).push(listener);
        }

        return this;
    };

    //移除事件处理
    this.removeListener = function (type, listener) {

        var events = this["x:events"];

        if (events && (events = events[type]))
        {
            if (listener == null)
            {
                events.length = 0;
            }
            else
            {
                var index = events.indexOf(listener);
                index >= 0 && events.splice(index, 1);
            }
        }

        return this;
    };

    //分发事件
    this.dispatchEvent = function (event) {

        var target = this,
            type = event.type,
            result = true,
            events,
            length;

        if (!type)
        {
            type = event;
            event = new flyingon.Event(type, this);
        }

        while (target)
        {
            //处理默认事件 默认事件方法规定: "event:" + type
            if ((events = target["event:" + type]) && events.call(target, event) === false)
            {
                result = false;

                if (event.cancelBubble)
                {
                    break;
                }
            }

            //处理冒泡事件
            if ((events = target["x:events"]) && (events = events[type]) && (length = events.length) > 0)
            {
                for (var i = 0; i < length; i++)
                {
                    if (events[i].call(target, event) === false)
                    {
                        result = false;
                    }
                }

                if (event.cancelBubble)
                {
                    break;
                }
            }

            target = target["x:parent"];
        }

        if (event.originalEvent)
        {
            if (event.defaultPrevented)
            {
                event.originalEvent.preventDefault();
            }

            if (event.cancelBubble)
            {
                event.originalEvent.stopPropagation();
            }
        }

        return result;
    };


    //是否绑定了指定名称(不带on)的事件
    this.hasEvent = function (type, bubbleEvent) {

        var events = this["x:events"];

        if (events && (events = events[type]) && events.length > 0)
        {
            return true;
        }

        return bubbleEvent ? parent.hasEvent(type, true) : false;
    };




    //引用序列化标记(为true时只序列化名称不序列化内容)
    this["x:reference"] = false;

    //对象名称
    this.defineProperty("name", null);



    //获取或设置属性默认值
    this.defaultValue = function (name, value) {

        var defaults = this["x:defaults"];

        if (value === undefined)
        {
            return defaults[name];
        }

        defaults[name] = value;
        return this;
    };


    //获取或设置存储值
    this.storageValue = function (name, value) {

        if (value === undefined)
        {
            return this["x:storage"][name];
        }

        this["x:storage"][name] = value;
        return this;
    };





    this.setBinding = function (name, source, expression, setter) {

        if (name && source)
        {
            !source.name && (source.name = "auto_name_" + (++auto_name));

            var binding = new flyingon.DataBinding(source, expression || name, setter);

            binding["y:initialize"](this, name);
            binding.pull();
            return binding;
        }
    };

    this.clearBinding = function (name, dispose) {

        if (name)
        {
            var bindings = this["x:bindings"];
            bindings && (bindings = bindings[name]) && bindings.clear(dispose);
        }
    };

    //执行绑定
    this["y:bindings"] = function (name, storage) {

        var bindings = storage.push;

        bindings && bindings.hasOwnProperty(name) && flyingon.bindingTo(this, name);
        (bindings = storage.pull) && (bindings = bindings[name]) && !bindings['x:binding'] && bindings.push();
    };




    //自定义序列化
    this.serialize = function (writer) {

        writer.object("storage", this["x:storage"]);
        writer.bindings(this);
    };

    //自定义反序列化
    this.deserialize = function (reader, data) {

        if (data)
        {
            var storage = reader.object(this, "x:storage", data["storage"]);

            reader.bindings(this, data);
            storage && storage.name && ((reader.references || (reader.references = {}))[storage.name] = this);
        }
    };




    //销毁
    this.dispose = function () {

        flyingon.clearBindings(this, true);
    };


});







﻿
flyingon.class("SerializeReader", function (Class, flyingon) {



    var registryList = flyingon["x:registryList"];




    this.deserialize = function (data, context) {

        if (data)
        {
            data.constructor == String && (data = data[0] == "<" ? flyingon.parseXml : this.parse(data));

            var result = this[Array.isArray(data) ? "array" : "object"](null, null, data);

            this["y:complete"](this, context || result);
            return result;
        }

        return null;
    };


    //序列化完毕后执行方法(内部方法)
    this["y:complete"] = function (reader, context) {

        //缓存的资源
        var references = reader.references,
            items = reader["x:bindings"],
            binding,
            source;

        if (items)
        {
            for (var i = 0, length = items.length; i < length; i++)
            {
                var item = items[i],
                    bindings = item[1];

                for (var name in bindings)
                {
                    if (binding = bindings[name])
                    {
                        if (binding.constructor == String)
                        {
                            binding = new flyingon.DataBinding(context, binding);
                        }
                        else
                        {
                            if (source = binding.source)
                            {
                                source.constructor == String && (binding.source = (references && references[source]) || context);
                            }
                            else
                            {
                                binding.source = context;
                            }

                            !(binding instanceof flyingon.DataBinding) && (binding = new flyingon.DataBinding(binding));
                        }

                        binding["y:initialize"](item[0], name);
                        binding.pull();
                    }
                }
            }
        }
    };




    this.parse = flyingon.parseJson;


    this.boolean = function (target, name, value) {

        if (value !== undefined)
        {
            return target[name] = !!value;
        }
    };

    this.number = function (target, name, value) {

        if (value !== undefined)
        {
            return target[name] = parseFloat("" + value);
        }
    };

    this.string = function (target, name, value) {

        if (value !== undefined)
        {
            return target[name] = value == null ? null : "" + value;
        }
    };


    this.object = function (target, name, value) {

        if (value != null)
        {
            var result;

            if (!target || !(result = target[name]))
            {
                result = value.className && (result = registryList[value.className]) ? new result() : {};
                target && (target[name] = result);
            }


            if (result.deserialize)
            {
                result.deserialize(this, value);
            }
            else
            {
                var names = Object.getOwnPropertyNames(value);

                for (var i = 0, length = names.length; i < length; i++)
                {
                    var name = names[i],
                        item = value[name];

                    if (item != null)
                    {
                        switch (typeof item)
                        {
                            case "object":
                                item = this[Array.isArray(item) ? "array" : "object"](null, null, item);
                                break;

                            case "function":
                                item = item ? new Function("" + item) : null;
                                break;
                        }
                    }

                    result[name] = item;
                }
            }

            return result;
        }
        else if (value !== undefined && target)
        {
            target[name] = null;
        }

        return null;
    };


    this.array = function (target, name, value) {

        if (value != null)
        {
            var result;

            if (target)
            {
                !(result = target[name]) && (result = target[name] = []);
            }
            else
            {
                result = [];
            }


            for (var i = 0, length = value.length; i < length; i++)
            {
                var item = value[i];

                if (item != null)
                {
                    switch (typeof item)
                    {
                        case "object":
                            item = this[Array.isArray(item) ? "array" : "object"](null, null, item);
                            break;

                        case "function":
                            item = item ? new Function("" + item) : null;
                            break;
                    }
                }

                result.push(item);
            }

            return result;
        }
        else if (value !== undefined && target)
        {
            target[name] = null;
        }

        return null;
    };

    this.function = function (target, name, value) {

        if (value !== undefined)
        {
            return target[name] = value ? new Function("" + value) : null;
        }
    };

    this.reference = function (target, name, value) {

        if (value != null)
        {
            var fn = value.constructor;

            if (fn != String)
            {
                value = this[fn == Array ? "array" : "object"](target, name, value);
            }
            else
            {
                target[name] = value;
            }

            return value;
        }
    };

    this.bindings = function (target, data) {

        target && (data = data["bindings"]) && (this["x:bindings"] || (this["x:bindings"] = [])).push([target, data]);
    };

});





flyingon.class("XmlSerializeReader", flyingon.SerializeReader, function (Class, flyingon) {


    this.parse = flyingon.parseXml;

});





﻿
flyingon.class("SerializeWriter", function (Class, flyingon) {



    Class.create = function () {

        this["x:data"] = [];
    };



    this["x:root"] = null;

    this.serialize = function (target) {

        this[Array.isArray(target) ? "array" : "object"](this["x:root"], target);
        return this.toString();
    };



    this["y:value"] = function (name, value) {

        switch (typeof value)
        {
            case "boolean":
                this.boolean(name, value);
                break;

            case "number":
                this.number(name, value);
                break;

            case "string":
                this.string(name, value);
                break;

            case "object":
                if (value == null)
                {
                    this.null(name);
                }
                else
                {
                    var cache = value.constructor;

                    if (cache == String)
                    {
                        this.string(name, value);
                    }
                    else if (cache == Array) //数组
                    {
                        this.array(name, value);
                    }
                    else //对象
                    {
                        this.object(name, value);
                    }
                }
                break;

            case "function":
                this.function(name, value);
                break;
        }
    };






    var key = function (data, name) {

        data[data.length - 1] != "{" && data.push(",");
        data.push("\"" + name + "\":");
    };




    this.null = function (name) {

        var data = this["x:data"];

        name && key(data, name);
        data.push("null");
    };

    this.boolean = function (name, value) {

        if (value !== undefined)
        {
            var data = this["x:data"];

            name && key(data, name);
            data.push(!!value);
        }
    };

    this.number = function (name, value) {

        if (value !== undefined)
        {
            var data = this["x:data"];

            name && key(data, name);
            data.push(value || 0);
        }
    };

    this.string = function (name, value) {

        if (value !== undefined)
        {
            var data = this["x:data"];

            name && key(data, name);
            data.push(value != null ? "\"" + value.replace("\"", "\\\"") + "\"" : "null");
        }
    };

    this.object = function (name, value) {

        if (value !== undefined)
        {
            var data = this["x:data"];

            name && key(data, name);

            if (value != null)
            {
                data.push("{");

                (name = value.className) && data.push("\"className\":\"" + name + "\"");

                if ("serialize" in value)
                {
                    value.serialize(this);
                }
                else
                {
                    var names = Object.getOwnPropertyNames(value);

                    for (var i = 0, length = names.length; i < length; i++)
                    {
                        (i > 0 || name) && data.push(",");

                        data.push("\"" + (name = names[i]) + "\":");
                        this["y:value"](null, value[name]);
                    }
                }


                data.push("}");
            }
            else
            {
                data.push("null");
            }
        }
    };

    this.array = function (name, value) {

        if (value !== undefined)
        {
            var data = this["x:data"];

            name && key(data, name);
 
            if (value != null)
            {
                data.push("[");

                for (var i = 0, length = value.length; i < length; i++)
                {
                    i > 0 && data.push(",");
                    this["y:value"](null, value[i]);
                }

                data.push("]");
            }
            else
            {
                data.push("null");
            }
        }
    };

    this.function = function (name, value) {

        value !== undefined && this.string(name, value ? value.toString() : null);
    };


    this.reference = function (name, value) {

        if (value != null)
        {
            //未设置名称则直接序列化
            if (!value["x:reference"])
            {
                this[Array.isArray(value) ? "array" : "object"](name, value);
            }
            else if (value = value.name)
            {
                this.string(name, value);
            }
            else
            {
                throw new Error("serialize reference fail! no name!");
            }
        }
    };


    this.bindings = function (target) {

        target && (target = target["x:bindings"]) && (target = target.pull) && this.object("bindings", target);
    };


    this.toString = this.toLocaleString = function () {

        return this["x:data"].join("");
    };

});




//t 0:null 1:boolean 2:number 3:string 4:object 5:array 9:function
flyingon.class("XmlSerializeWriter", flyingon.SerializeWriter, function (Class, flyingon) {


    this["x:root"] = "xml";


    this.null = function (name) {

        this["x:data"].push("<" + name + " type=\"null\"/>");
    };

    this.boolean = function (name, value) {

        value !== undefined && this["x:data"].push("<" + name + " type=\"boolean\">" + (value ? "1" : "0") + "</" + name + ">");
    };

    this.number = function (name, value) {

        value !== undefined && this["x:data"].push("<" + name + " type=\"number\">" + (value || 0) + "</" + name + ">");
    };

    this.string = function (name, value) {

        if (value !== undefined)
        {
            if (value != null)
            {
                value.indexOf("&") >= 0 && (value = flyingon.decodeXml(value));
                this["x:data"].push("<" + name + " type=\"string\">" + value + "</" + name + ">");
            }
            else
            {
                data.push("<" + name + " type=\"null\"/>");
            }
        }
    };

    this.object = function (name, value) {

        if (value === undefined)
        {
            return;
        }


        var data = this["x:data"];

        if (data != null)
        {
            data.push("<" + name + " type=\"" + (value.className || "object") + "\">");

            if ("serialize" in value)
            {
                value.serialize(this);
            }
            else
            {
                var names = Object.getOwnPropertyNames(value);

                for (var i = 0, length = names.length; i < length; i++)
                {
                    var key = names[i];
                    this["y:value"](key, value[key]);
                }
            }

            data.push("</" + name + ">");
        }
        else
        {
            data.push("<" + name + " type=\"null\"/>");
        }
    };

    this.array = function (name, value) {

        if (value === undefined)
        {
            return;
        }


        var data = this["x:data"];

        if (value != null)
        {
            data.push("<" + name + " type=\"array\"");

            for (var i = 0, length = value.length; i < length; i++)
            {
                this["y:value"]("item", value[i]);
            }

            data.push("</" + name + ">");
        }
        else
        {
            data.push("<" + name + " type=\"null\"/>");
        }
    };

    this.function = function (name, value) {

        if (value !== undefined)
        {
            if (value)
            {
                value = value.toString();
                value.indexOf("&") >= 0 && (value = flyingon.decodeXml(value));
            }

            this.string(name, value);
        }
    };


});




﻿//表达式
(function (flyingon) {


    var prototype = (flyingon.Expression = function (expression) {

        expression && (this.expression = expression);

    }).prototype;



    var parse = function (expression, variables) {


        if (!expression)
        {
            return null;
        }


        !expression.match(/return[\s;]/) && (expression = "return " + expression);


        var values = expression.match(/['"\\]|@\w+|[^'"\\@]+/g),
            value,
            quote,  //引号
            escape, //转义
            body = "";

        for (var i = 0, length = values.length; i < length; i++)
        {
            switch (value = values[i])
            {
                case "'":
                case "\"":
                    if (!escape)
                    {
                        quote ? ((quote == value) && (quote = null)) : (quote = value);
                    }
                    else
                    {
                        escape = false;
                    }
                    break;

                case "\\":
                    escape = quote ? !escape : false;
                    break;

                default:
                    if (value[0] == "@" && !quote)
                    {
                        value = values[i] = value.substring(1);

                        if (!values[value])
                        {
                            values[value] = true;
                            variables.push(value);
                        }
                    }

                    escape = false;
                    break;
            }
        }


        for (var i = 0, length = variables.length; i < length; i++)
        {
            body += "var " + (value = variables[i]) + " = this[\"" + value + "\"];\n";
        }


        body += values.join("");
        return new Function(body);
    };


    prototype["x:expression"] = "";



    //表达式内容
    flyingon.defineProperty(prototype, "expression",

        function () {

            return this["x:expression"];
        },

        function (value) {

            this["x:expression"] = "" + value;
            this.variables = [];
            this["x:fn"] = parse(this["x:expression"], this.variables);
        });


    //计算
    prototype.eval = function (thisArg) {

        var fn = this["x:fn"];

        if (fn)
        {
            return fn.call(thisArg);
        }
    };



    prototype.serialize = function (writer) {

        writer.string("expression", this["x:expression"]);
    };

    prototype.deserialize = function (reader, data) {

        reader.string(this, "expression", data.expression);
    };





})(flyingon);



﻿/// <reference path="Core.js" />
/// <reference path="SerializableObject.js" />


(function (flyingon) {




    //正向绑定(绑定数据源至目标控件)
    flyingon.bindingTo = function (source, name) {

        var bindings = source["x:bindings"],
            binding;

        if (bindings && (bindings = bindings.push) && (binding = bindings[name]))
        {
            var keys = Object.getOwnPropertyNames(binding),
                length = keys.length;

            if (length == 0)
            {
                delete bindings[name];
            }
            else
            {
                for (var i = 0; i < length; i++)
                {
                    binding[keys[i]].pull();
                }
            }
        }
    };


    var clearBindings = function (storage, dispose) {

        var names = Object.getOwnPropertyNames(storage),
            name,
            bindings;

        for (var i = 0, length = names.length; i < length; i++)
        {
            if ((name = names[i]) && (bindings = source[name]))
            {
                var keys = Object.getOwnPropertyNames(bindings);

                for (var j = 0, count = keys.length; j < count; j++)
                {
                    bindings[keys[j]].clear(dispose);
                }
            }
        }
    };

    flyingon.clearBindings = function (source, dispose) {

        if (source && (source = source["x:bindings"]))
        {
            var storage = source.pull;

            storage && clearBindings(storage, dispose);
            (storage = source.push) && clearBindings(storage, dispose);
        }
    };




    var prototype = (flyingon.DataBinding = function (source, expression, setter) {

        if (source)
        {
            if (!expression && (expression = source.expression))
            {
                setter = source.setter;
                source = source.source;
            }

            this["x:source"] = source;
            this["x:expression"] = expression;
            this["x:setter"] = setter;
        }

    }).prototype;


    var defineProperty = function (name) {

        flyingon.defineProperty(prototype, name, function () {

            return this["x:" + name];
        });
    };



    //绑定目标
    defineProperty("target");

    //绑定目标属性名
    defineProperty("name");

    //绑定源
    defineProperty("source");

    //绑定表达式
    defineProperty("expression");

    //更新表达式
    defineProperty("setter");




    //是否正在处理绑定
    prototype["x:binding"] = false;

    //获取值函数
    prototype["y:getter"] = null;

    //设置值函数
    prototype["y:setter"] = null;



    //初始化绑定关系
    prototype["y:initialize"] = function (target, name) {

        var source = this["x:source"],
            expression = this["x:expression"],
            bindings = target["x:bindings"] || (target["x:bindings"] = {}),
            id = target.id || (target.id = flyingon.newId()),
            cache;


        this["x:target"] = target;
        this["x:name"] = name;


        //缓存目标
        if (cache = bindings.pull)
        {
            //一个目标属性只能绑定一个
            cache[name] && cache[name].clear();
            cache[name] = this;
        }
        else
        {
            (bindings.pull = {})[name] = this;
        }



        bindings = source["x:bindings"] || (source["x:bindings"] = { push: {} });
        bindings = bindings.push || (bindings.push = {});

        //如果表达式以数据开头或包含字母数字下划线外的字符则作表达式处理
        if (expression.match(/^\d|[^\w]/))
        {
            cache = (this["y:getter"] = new flyingon.Expression(expression)).variables;

            for (var i = 0, length = cache.length; i < length; i++)
            {
                expression = cache[i];
                (bindings[expression] || (bindings[expression] = {}))[id] = this;
            }
        }
        else
        {
            this["y:getter"] = null;
            (bindings[expression] || (bindings[expression] = {}))[id] = this;
        }


        //处理更新
        (cache = this["x:setter"]) && (this["y:setter"] = new flyingon.Expression(cache));
    };



    //从数据源同步数据至目标属性
    prototype.pull = function () {

        var source = this["x:source"],
            result;

        if (result = this["y:getter"])
        {
            result = result.eval(source);
        }
        else
        {
            var name = this["x:expression"];
            if ((result = source[name]) === undefined)
            {
                source instanceof flyingon.DataObject && (result = source.value(name));
            }
        }

        this["x:binding"] = true;
        this["x:target"][this["x:name"]] = result;
        this["x:binding"] = false;
    };


    //从目标属性同步数据至源
    prototype.push = function () {

        var cache = this["x:expression"];

        if (cache)
        {
            this["x:binding"] = true;

            if (!this["y:getter"]) //直接绑定字段
            {
                var target = this["x:target"],
                    name = this["x:name"];

                (result = target[name]) === undefined && target instanceof flyingon.DataObject && (result = target.value(name));
                this["x:source"][cache] = result;
            }
            else if (cache = this["y:setter"]) //表达式需要自定义setter方法
            {
                cache.call(this["x:target"]);
            }

            this["x:binding"] = false;
        }
    };


    //清除绑定关系
    prototype.clear = function (dispose) {

        var source = this["x:source"],
            target = this["x:target"],
            bindings,
            cache;

        if (source && target && (bindings = source["x:bindings:source"]))
        {
            if (cache = this["x:getter"])
            {
                var variables = cache.variables;

                for (var i = 0, length = variables.length; i < length; i++)
                {
                    if (cache = bindings[variables[i]])
                    {
                        delete cache[target.id];
                    }
                }
            }
            else if ((cache = this["x:expression"]) && (cache = bindings[cache]))
            {
                delete cache[target.id];
            }


            delete target["x:bindings"][this["x:name"]];
        }


        if (dispose)
        {
            delete this["x:source"];
            delete this["x:target"];
            delete this["y:getter"];
            delete this["y:setter"];
        }
    };


    prototype.serialize = function (writer) {

        writer.reference("source", this["x:source"]);
        writer.string("expression", this["x:expression"]);
        writer.string("setter", this["x:setter"]);
    };

    prototype.deserialize = function (reader, data) {

        reader.reference(this, "x:source", data["source"]);
        reader.string(this, "x:expression", data["expression"]);
        reader.string(this, "x:setter", data["setter"]);
    };



})(flyingon);



﻿/// <reference path="../Base/Core.js" />



//数据对象
flyingon.class("DataObject", flyingon.SerializableObject, function (Class, flyingon) {


    function getter(name, attributes) {

        var body = "var name = \"" + name + "\";\nreturn this['x:data'][name] || this.defaultValue(name);";

        return new Function(body);
    };

    function setter(name, attributes) {

        var body = "var storage = this['x:data'], cache, name = '" + name + "';\n"

            + flyingon["x:define:initialize"]
            + "var oldValue = storage[name];\n"

            + (attributes.valueChangingCode ? attributes.valueChangingCode + "\n" : "") //自定义值变更代码

            + "if (oldValue !== value)\n"
            + "{\n"

            + flyingon["x:define:change"]

            + "var original = storage['x:original'] || (storage['x:original'] = {});\n"
            + "if (!original.hasOwnProperty(name))\n"
            + "{\n"
            + "original[name] = oldValue;\n"
            + "}\n"

            + "storage[name] = value;\n"

            + (attributes.valueChangedCode ? attributes.valueChangedCode + "\n" : "")  //自定义值变更代码

            + flyingon["x:define:binding"]

            + "}\n"

            + "return this;\n";


        return new Function("value", body);
    };




    Class.create = function () {

        this["x:data"] = {};
    };



    this.defineDataProperty = function (name, defaultValue, attributes) {


        defaultValue !== undefined && (this["x:defaults"][name] = defaultValue);

        var schema = this["x:schema"] || (this["x:schema"] = {});

        attributes = schema[name] = flyingon["x:define:attributes"](attributes);
        attributes.defaultValue = defaultValue;

        flyingon.defineProperty(this, name, getter.call(this, name, attributes), setter.call(this, name, attributes));
        return this;
    };

    this.removeDataProperty = function (name) {

        delete this["x:data"][name];

        var schema = this["x:schema"];
        if (schema)
        {
            delete schema[name];
        }
    };



    //值变更事件
    this.defineEvent("change");



    //数据
    this.defineProperty("data",

        function () {

            return this["x:data"];
        },

        function (value) {

            var oldValue = this["x:data"];
            if (oldValue != value)
            {
                this["x:data"] = value;
                this.dispatchEvent("change", "name", value, oldValue);
            }
        });


    //获取或设置存储的值
    this.value = function (name, value) {

        if (value === undefined)
        {
            return this["x:storage"][name];
        }

        this["x:storage"][name] = value;
        return this;
    };

    //获取或设值
    this.value = function (name, value) {

        var data = this["x:data"];

        if (value === undefined)
        {
            return (data && data[name]) || this[name];
        }

        data[name] = value;
        return this;
    };

    //获取原始值
    this.originalValue = function (name) {

        var data = this["x:data"],
            original = data["x:original"];

        return (original && original[name]) || data[name];
    };

    this.hasChanged = function (name) {

        var data = this["x:data"]["x:original"];
        return data && (!name || data.hasOwnProperty(name));
    };

    this.acceptChanges = function () {

        this["x:data"]["x:original"] = null;
    };

    this.rejectChanges = function () {

        var data = this["x:data"],
            original = data["x:original"];

        if (original)
        {
            data["x:original"] = null;
            this["x:data"] = original;
        }
    };



    //自定义序列化
    this.serialize = function (writer) {

        flyingon.DataObject.super.serialize.call(this, writer);
        this["y:serialize:data"](writer);
    };

    this["y:serialize:data"] = function (writer) {

        writer.object("data", this["x:data"]);
    };

    this.deserialize = function (reader, data) {

        flyingon.DataObject.super.deserialize.call(this, reader, data);
        this["y:deserialize:data"](reader, data);
    };

    this["y:deserialize:data"] = function (reader, data) {

        reader.object(this, "x:data", data.data);
    };

}, true);




//
flyingon.class("DataArray", flyingon.DataObject, function (Class, flyingon) {



    this.ondataadd = null;

    this.ondataremove = null;




    //当前位置
    this.defineProperty("position", 0, {

        valueChangingCode: "if (value < 0) value = 0; else if (value >= storage.length) value = storage.length - 1;",
    });




    //数据结构
    this.defineProperty("schema", function () {

        return this["x:schema"];
    });



    this.append = function (item) {


    };

    this.insert = function (index, item) {

    };

    this.remove = function (item) {

    };

    this.removeAt = function (index) {

    };

}, true);





﻿
///Ajax实现
(function (global, flyingon) {


    var ajax_fn = null, //ajax创建函数

        defaults = {

            type: "GET",

            dataType: "text/plain",

            contentType: "application/x-www-form-urlencoded",

            error: function (request) {

                alert(request.status + ":" + request.statusText);
            }
        };




    function ajax() {


        if (!ajax_fn)
        {
            var items = [

                function () { return new XMLHttpRequest(); },
                function () { return new ActiveXObject("Microsoft.XMLHTTP"); },
                function () { return new ActiveXObject("MSXML2.XMLHTTP.3.0"); },
                function () { return new ActiveXObject("MSXML2.XMLHTTP"); }
            ];

            for (var i = 0, length = items.length; i < length; i++)
            {
                try
                {
                    var result = (ajax_fn = items[i])();
                    if (result)
                    {
                        return result;
                    }
                }
                catch (e)
                {
                }
            }
        }


        return ajax_fn();
    };


    flyingon.encodeURL = function (url, json) {

        if (url && json)
        {
            var values = [];

            for (var name in json)
            {
                values.push(encodeURIComponent(name).replace(/%20/g, "+"));
                values.push("=");
                values.push(encodeURIComponent((json[name].toString()).replace(/%20/g, "+")));
            }

            return url + "?" + values.join("&");
        }

        return url;
    };



    function response(event) {

        var fn,
            target = event.target,
            options = target.options;

        if (target.readyState == 4)
        {
            if (options.timer)
            {
                clearTimeout(options.timer);
                delete options.timer;
            }

            if (target.status < 300)
            {
                switch (options.dataType || defaults.dataType)
                {
                    case "json":
                        options.response = flyingon.parseJson(target.responseText);
                        break;

                    case "script":
                        options.response = eval(target.responseText);
                        break;

                    case "xml":
                        options.response = target.responseXML;
                        break;

                    default:
                        options.response = target.responseText;
                        break;
                }

                (fn = options.success) && fn(target, options.response);
            }
            else
            {
                (options["error"] || defaults["error"])(target);
            }

            (fn = options.complete) && fn(target, options.response);
        }
        else if (fn = options.progress)
        {
            fn(options.progressValue ? ++options.progressValue : (options.progressValue = 1));
        }
    };

    /*
    {

        url: "http://www.xxx.com"

        type: "GET",

        dataType: "text/plain" || "json" || "script" || "xml"

        contentType: "application/x-www-form-urlencoded",

        async: true,

        user: undefined,

        password: undefined,

        timeout: 0,

        data: null,

        success: function(request, response) {

        },

        error: function (request) {

            alert(request.status + ":" + request.statusText);
        },

        abort: function(request) {

        },

        complete: function(request) {

        }

    }
    */
    flyingon.ajax = function (options) {

        var type = options.type || defaults.type,
            result = ajax_fn ? ajax_fn() : ajax(),
            async = options.async !== false;


        if (options.timeout > 0)
        {
            options.timer = setTimeout(function () {

                result.abort();
                options.abort && options.abort(result);

            }, options.timeout);
        }

        result.options = options;
        result.onreadystatechange = response;
        result.open(type, options.url, async, options.user, options.password);

        (type == "POST" || type == "PUT") && result.setRequestHeader("Content-Type", options["contentType"] || defaults["contentType"]);

        if (options.headers)
        {
            for (var name in options.headers)
            {
                result.setRequestHeader(name, options.headers[name]);
            }
        }

        result.send(options.data);
        return async ? result : options.response;
    };


    flyingon.get = function (url, options) {

        (options || (options = {})).url = url;
        options.type = "GET";

        return flyingon.ajax(options);
    };

    flyingon.post = function (url, options) {

        (options || (options = {})).url = url;
        options.type = "POST";

        return flyingon.ajax(options);
    };

    flyingon.require = function (url) {

        if (url)
        {
            var options = {

                url: url,
                type: "GET",
                dataType: "script",
                async: false
            };

            flyingon.ajax(options);
            return options.response;
        };
    };




})(this, flyingon);









﻿
/*
延时执行器

*/
flyingon.DelayExecutor = function (interval, handler, thisArg) {


    var timer = 0, data;


    //时间间隔
    this.interval = interval;



    this.registry = function (args) {

        timer && clearTimeout(timer);

        data = args;
        timer = setTimeout(this.execute, this.interval);
    };

    this.execute = function () {

        if (timer)
        {
            clearTimeout(timer);
            handler.apply(thisArg, data);

            timer = 0;
            data = null;
        };

        return thisArg;
    };

};





﻿/*

*/
(function (flyingon) {


    var prototype = (flyingon.Point = function (x, y) {

        this.x = x || 0;
        this.y = y || 0;

    }).prototype;



    prototype.toString = prototype.toLocaleString = function () {

        return "{ x:" + this.x + ", y:" + this.y + " }";
    };


})(flyingon);




(function (flyingon) {


    var prototype = (flyingon.Size = function (width, height) {

        this.width = width || 0;
        this.height = height || 0;

    }).prototype;



    prototype.toString = prototype.toLocaleString = function () {

        return "{ width:" + this.width + ", height:" + this.height + " }";
    };


})(flyingon);




(function (flyingon) {


    var prototype = (flyingon.Rect = function (x, y, width, height) {

        if (arguments.length > 0)
        {
            this.x = x || 0;
            this.y = y || 0;
            this.width = width || 0;
            this.height = height || 0;
        }

    }).prototype;



    prototype.x = 0;

    prototype.y = 0;

    prototype.width = 0;

    prototype.height = 0;



    flyingon.defineProperty(prototype, "right", function () {

        return this.x + this.width;
    });

    flyingon.defineProperty(prototype, "bottom", function () {

        return this.y + this.height;
    });



    prototype.copy = function (width_delta, height_delta) {

        return new flyingon.Rect(this.x, this.y, this.width + (width_delta || 0), this.height + (height_delta || 0));
    };

    prototype.toString = prototype.toLocaleString = function () {

        return "{ x:" + this.x + ", y:" + this.y + ", width:" + this.width + ", height:" + this.height + " }";
    };


})(flyingon);




(function (flyingon) {


    //角度转弧度系数
    var radian = Math.PI / 180;


    //2D仿射变换矩阵
    //a	水平旋转绘图
    //b	水平倾斜绘图
    //c	垂直倾斜绘图
    //d	垂直缩放绘图
    //e	水平移动绘图
    //f	垂直移动绘图
    var prototype = (flyingon.Matrix = function () {

        this.a = 1;

        this.b = 0;

        this.c = 0;

        this.d = 1;

        this.e = 0;

        this.f = 0;

    }).prototype;


    prototype.fromArray = function (array) {

        this.a = array[0];
        this.b = array[1];
        this.c = array[2];
        this.d = array[3];
        this.e = array[4];
        this.f = array[5];

        return this;
    };

    prototype.toArray = function () {

        return [this.a, this.b, this.c, this.d, this.e, this.f];
    };

    prototype.translate = function (x, y) {

        this.append(1, 0, 0, 1, x, y);
        return this;
    };

    prototype.scale = function (scaleX, scaleY) {

        this.append(scaleX, 0, 0, scaleY, 0, 0);
        return this;
    };

    prototype.rotate = function (angle) {

        angle *= radian;

        var cos = Math.cos(angle);
        var sin = Math.sin(angle);

        this.append(-sin, cos, cos, sin, 0, 0);
        return this;
    };

    prototype.skew = function (skewX, skewY) {

        var x = Math.Tan(skewX * n);
        var y = Math.Tan(skewY * n);

        this.append(1, x, y, 1, 0, 0);
        return this;
    };

    prototype.append = function (a, b, c, d, e, f) {

        var a1 = this.a;
        var b1 = this.b;
        var c1 = this.c;
        var d1 = this.d;

        this.a = a * a1 + b * c1;
        this.b = a * b1 + b * d1;
        this.c = c * a1 + d * c1;
        this.d = c * b1 + d * d1;
        this.e = e * a1 + f * c1 + this.e;
        this.f = e * b1 + f * d1 + this.f;

        return this;
    };


    prototype.transform = function (x, y) {

        return {
            x: Math.round(x * this.a + y * this.b + this.e, 0),
            y: Math.round(x * this.c + y * this.d + this.f, 0)
        };
    };

    prototype.reverse = function (x, y) {

        return {
            x: Math.round((this.b * y - this.d * x + this.d * this.e - this.b * this.f) / (this.c * this.b - this.a * this.d)),
            y: Math.round((this.c * x - this.a * y - this.c * this.e + this.a * this.f) / (this.c * this.b - this.a * this.d))
        };
    };


})(flyingon);




﻿/*
枚举定义
*/
(function (flyingon) {



    //显示方式
    flyingon.Visibility = {

        //显示
        visible: "visible",

        //不显示但保留占位
        hidden: "hidden",

        //不显示也不占位
        collapsed: "collapsed"

    };



    //停靠方式
    flyingon.Dock = {

        //左
        left: "left",

        //顶
        top: "top",

        //右
        right: "right",

        //底
        bottom: "bottom",

        //充满
        fill: "fill"

    };



    //拉伸方式
    flyingon.Stretch = {

        //不拉伸
        no: "no",

        //宽度拉伸
        width: "width",

        //高度拉伸
        height: "height",

        //全部拉伸
        all: "all"

    };



    //自动调整大小方式
    flyingon.AutoSize = {

        //不调整
        no: "no",

        //宽度调整
        width: "width",

        //高度调整
        height: "height",

        //全部调整
        all: "all"

    };



    //水平对齐方式
    flyingon.HorizontalAlign = {

        //左对齐
        left: "left",

        //居中对齐
        center: "center",

        //右对齐
        right: "right"

    };



    //垂直对齐方式
    flyingon.VerticalAlign = {

        //顶部对齐
        top: "top",

        //居中对齐
        center: "center",

        //底部对齐
        bottom: "bottom"

    };




    //布局方式
    flyingon.Layout = {

        //单行排列
        row: "row",

        //单列排列
        column: "column",

        //多行排列
        rows: "rows",

        //多列排列
        columns: "columns",

        //停靠
        dock: "dock",

        //单页显示
        page: "page",

        //风格排列
        grid: "grid",

        //表格排列
        table: "table",

        //绝对定义
        absolute: "absolute",

        //自定义
        custom: "custom"

    };



    //滚动条显示方式
    flyingon.ScrollBarVisibility = {

        //自动显示或隐藏
        auto: "auto",

        //总是显示
        always: "always",

        //从不显示
        never: "never"

    };

    


})(flyingon);




﻿
//文字片段
(function (flyingon) {



    var prototype = (flyingon.TextSnippet = function (font, text) {

        this.font = font;
        this.text = text;

    }).prototype = [];



    //字体
    prototype.font = null;

    //文本内容
    prototype.text = null;

    //文本内容
    prototype.text = null;

    //文字段宽度
    prototype.width = 0;


    //测量单词中每一个字符占用的宽度
    function measureText(font, text) {

        if (!text)
        {
            return [];
        }


        var result = [],
            cache = font["x:cache"],
            context = font["x:context"];


        for (var i = 0, length = text.length; i < length; i++)
        {
            var char = text[i];
            result.push(cache[char] || (cache[char] = context.measureText(char).width));
        }

        return result;
    };


    function initialize() {

        var value = 0,
            chars = this.chars = measureText(this.font, this.text),
            cache = this.cache = [0];


        for (var i = 0, length = chars.length; i < length; i++)
        {
            cache.push(value += chars[i]);
        }

        return cache;
    };




    //获取指定位置的字符索引
    prototype.charAt = function (x) {

        return this.unit ? Math.round(x / this.unit) : (this.cache || initialize.call(this)).binaryBetween(x);
    };


    //获取指定字符索引的相对位置
    prototype.position = function (charIndex) {

        return this.unit ? charIndex * this.unit : (this.cache || initialize.call(this))[charIndex];
    };



})(flyingon);






﻿//文本行
(function (flyingon) {


    var prototype = (flyingon.TextPiece = function (font, text) {

        this.font = font;
        this.text = text;
        this.height = font.lineHeight;

    }).prototype = [];



    //字体
    prototype.font = null;

    //文本内容
    prototype.text = null;

    //文本行总宽度
    prototype.width = 0;

    //文本行总高度
    prototype.height = 0;



    function initialize() {

        var value_1 = 0,
            value_2 = 0,
            cache_1 = this["x:cache:1"] = [0],
            cache_2 = this["x:cache:2"] = [0];

        for (var i = 0, length = this.length - 1; i < length; i++)
        {
            var snippet = this[i];

            cache_1.push(value_1 += snippet.text.length);     //文本索引
            cache_2.push(value_2 += snippet.width);           //位置
        }

        return this;
    };





    //unicode码: \u2e80-\ufffy:东方字符 \u00c0-\u00ff 拉丁字母1  \u0400-\u04ff 西里尔字母
    //[\u2e80-\uffff]+                      汉字类 按等宽字符 注:可能对其它字符处理不好
    //[\w\u00c0-\u00ff\u0400-\u04ff]+       类英文单词类 按英文单词的方式处理
    //[^\w\u00c0-\u00ff\u0400-\u04ff]       其它符号类 按单个字符的方式处理
    var regex_measure = /[\u2e80-\uffff]+|[^\w\r\u00c0-\u00ff\u0400-\u04ff]|[\w\u00c0-\u00ff\u0400-\u04ff]+/g;


    //测量文字 以提升canvas的measureText方法性能较差的问题
    //请尽量使用相同的字体对象以获得较好的性能
    //需注意此方法对内存占用有一定的影响 在IE下可能存在一定的误差(IE的字体渲染有问题:分段测量值的和<>直接测量值???)
    prototype.measureText = function () {

        var font = this.font,
            cache = font["x:cache"],
            context = font["x:context"],
            chinese = cache["汉"],
            values = this.text.match(regex_measure) || [""],
            x = 0;


        for (var i = 0, length = values.length; i < length; i++)
        {
            var text = values[i],
                snippet = new flyingon.TextSnippet(font, text);


            if (text[0] > "\u2e80") //东方字符类
            {
                snippet.width = text.length * chinese;
                snippet.unit = chinese; //每个字符的宽度(汉字)
            }
            else //类英文单词及其它符号类
            {
                snippet.width = cache[text] || (cache[text] = context.measureText(text).width); //总宽
            }


            this.push(snippet);

            x += snippet.width;
        }


        this.width = x;
    };




    //获取指定索引的测量信息
    prototype.find = function (columnIndex) {

        if (columnIndex >= this.text.length)
        {
            return {

                snippetIndex: this.length - 1,
                charIndex: this[this.length - 1].text.length,
                columnIndex: this.text.length,
                x: this.width
            };
        }


        columnIndex < 0 && (columnIndex = 0);


        var index = (this["x:cache:1"] || initialize.call(this)["x:cache:1"]).binaryBetween(columnIndex),
            snippet = this[index],
            charIndex = columnIndex - this["x:cache:1"][index];


        return {

            snippetIndex: index,
            charIndex: charIndex,
            columnIndex: columnIndex,
            x: this["x:cache:2"][index] + snippet.position(charIndex)
        };
    };


    //查找指定位置的测量信息
    prototype.findAt = function (x) {

        var index = (this["x:cache:2"] || initialize.call(this)["x:cache:2"]).binaryBetween(x),
            snippet = this[index],
            charIndex,
            x;


        if (x >= this.width) //末尾
        {
            charIndex = snippet.text.length;
            x = this.width;
        }
        else
        {
            charIndex = snippet.charAt(x - this["x:cache:2"][index]);
            x = this["x:cache:2"][index] + snippet.position(charIndex);
        }


        return {

            snippetIndex: index,
            charIndex: charIndex,
            columnIndex: this["x:cache:1"][index] + charIndex,
            x: x
        };
    };



})(flyingon);





﻿

//文本测量
(function (flyingon) {



    var prototype = (flyingon.TextMetrics = function (ownerControl) {

        this.ownerControl = ownerControl;

    }).prototype = [];



    //字体
    prototype.font = null;

    //文本
    prototype.text = null;

    //最大宽度
    prototype.width = 0;

    //最大高度
    prototype.height = 0;

    //是否多行
    prototype.multiline = false;


    //开始选中位置
    prototype.selectionStart = 0;

    //结束选中位置
    prototype.selectionEnd = 0;

    //选中文本
    prototype.selectedText = "";






    function initialize() {

        var value_1 = 0,
            value_2 = 0,
            cache_1 = this["x:cache:1"] = [0],
            cache_2 = this["x:cache:2"] = [0],
            length = this.length - 1;


        for (var i = 0; i < length; i++)
        {
            var line = this[i];

            cache_1.push(value_1 += line.text.length);     //文本索引
            cache_2.push(value_2 += line.height);          //位置
        }

        return this;
    };




    prototype.measureText = function (font, text, multiline) {

        this.font = font;
        this.text = text;
        this.multiline = multiline;


        if (this.length > 0)
        {
            this.length = 0;
            this.width = 0;
            this.height = 0;
        }


        if (text)
        {
            var values = multiline ? text.split(/\r?\n/g) : [text.replace(/[\r\n]?/g, "")];

            for (var i = 0, length = values.length; i < length; i++)
            {
                var piece = new flyingon.TextPiece(font, values[i]);

                piece.measureText();
                this.push(piece);

                this.width < piece.width && (this.width = piece.width); //最大宽度
                this.height += piece.height;
            }
        }
    };







    //获取指定索引的字符信息
    prototype.find = function (textIndex) {

        textIndex < 0 && (textIndex = 0);

        var index = (this["x:cache:1"] || initialize.call(this)["x:cache:1"]).binaryBetween(textIndex),
            start = this["x:cache:1"][index],
            result = this[index].find(textIndex - start);

        result.pieceIndex = index;
        result.textIndex = start + result.columnIndex;

        return result;
    };


    //查找指定位置的字符信息
    prototype.findAt = function (x, y) {

        var index = (this["x:cache:2"] || initialize.call(this)["x:cache:2"]).binaryBetween(y),
            result = this[index].findAt(x);

        result.pieceIndex = index;
        result.textIndex = this["x:cache:1"][index] + result.columnIndex;

        return result;
    };



    function selectionEnd() {

        this.selectionStart = this.caretStart.textIndex;
        this.selectionEnd = this.caretEnd.textIndex;

        if (this.selectionEnd < this.selectionStart)
        {
            this.selectionStart = (this.caretMin = this.caretEnd).textIndex;
            this.selectionEnd = (this.caretMax = this.caretStart).textIndex;
        }
        else
        {
            this.caretMin = this.caretStart;
        }

        this.selectedText = this.text.substring(this.selectionStart, this.selectionEnd);
    };



    //移动至指定坐标
    prototype.moveAt = function (x, y) {

        this.caretStart = this.caretEnd = this.caretMin = this.caretMax = this.findAt(x, y);
        this.selectionStart = this.selectionEnd = this.caretStart.textIndex;
        this.selectedText = "";
    };


    //选择至指定坐标
    prototype.selectionAt = function (x, y) {

        this.caretEnd = this.caretMax = this.findAt(x, y);
        selectionEnd.call(this);
    };


    prototype.moveTo = function (textIndex) {

        this.caretStart = this.caretEnd = this.caretMin = this.caretMax = this.find(textIndex);
        this.selectionStart = this.selectionEnd = this.caretStart.textIndex;
        this.selectedText = "";
    };


    prototype.selectionTo = function (textIndex) {

        this.caretEnd = this.caretMax = this.find(textIndex);
        selectionEnd.call(this);
    };


    prototype.replace = function (text) {

        var ownerControl = this.ownerControl;

        if (ownerControl.dispatchEvent("textchanging"))
        {
            var start = this.caretMin,
                end = this.caretMax,
                textIndex = start.textIndex + text.length,
                index1 = start.pieceIndex,
                index2 = end.pieceIndex;


            text = this[index1].text.substring(0, start.columnIndex) + (text || "") + this[index2].text.substring(end.columnIndex);

            start = index1 > 0 ? this[index1 - 1].text : "";
            end = index2 + 1 < this.length ? this[index2 + 1].text : "";


            var piece = new flyingon.TextPiece(this.font, text);
            piece.measureText();

            this.splice(index1, index2 - index1 + 1, piece);

            this.text = start + text + end;

            this.moveTo(textIndex);


            ownerControl.dispatchEvent("textchanged");
            return true;
        }

        return false;
    };


    prototype.remove = function (length) {

        !this.selectedText && this.selectionTo(this.selectionEnd + length); //未选择
        return this.replace("");
    };



})(flyingon);






﻿/*

*/
(function (flyingon) {




    var prototype = (flyingon.Text = function () {


    }).prototype;




})(flyingon);




﻿/*

字体对象 注:字体的属性一旦创建就不能够更改 只能根据当前字体衍生(derive)出新字体


*/
(function (flyingon) {



    var prototype = (flyingon.Font = function (style, variant, weight, size, family) {

        if (arguments.length > 0)
        {
            this["x:storage"] = [style, variant, weight, size, family];
            initialize.call(this);
        }

    }).prototype;



    function initialize() {

        var storage = this["x:storage"];

        if (typeof storage[3] == "number")
        {
            this.lineHeight = storage[3];
            storage[3] += "px";
        }
        else
        {
            this.lineHeight = parseInt(storage[3]);
        }

        var cache = this["x:cache"] = {},
            context = this["x:context"] = document.createElement("canvas").getContext("2d"),
            text = "a b";

        context.font = storage[5] = storage.join(" ");

        cache["汉"] = context.measureText("汉").width;
        cache[" "] = context.measureText(" ").width;
    };




    var defineProperty = function (name, index) {

        flyingon.defineProperty(prototype, name, function () {

            return this["x:storage"][index];
        });
    };



    //字体样式 normal italic oblique
    defineProperty("style", 0);

    //字体变体 normal small-caps
    defineProperty("variant", 1);

    //字体粗细 normal bold bolder lighter 100 200 300 400 500 600 700 800 900
    defineProperty("weight", 2);

    //字号
    defineProperty("size", 3);

    //字体系列
    defineProperty("family", 4);

    //字体值
    defineProperty("value", 5);

    //行高
    prototype.lineHeight = 12;


    ////start     文本在指定的位置开始
    ////end       文本在指定的位置结束
    ////center    文本的中心被放置在指定的位置
    ////left      文本左对齐
    ////right     文本右对齐
    //prototype.align = "start";

    ////alphabetic    文本基线是普通的字母基线
    ////top           文本基线是 em 方框的顶端
    ////hanging       文本基线是悬挂基线
    ////middle        文本基线是 em 方框的正中
    ////ideographic   文本基线是表意基线
    ////bottom        文本基线是 em 方框的底端
    //prototype.baseline = "alphabetic";




    //以当前字体为原型衍生出新字体  properties : { style:XXX, variant:XXX, weight:XXX, size:XXX, family:XXX }
    prototype.derive = function (properties) {

        var result = new flyingon.Font(),
            data = result["x:storage"] = this["x:storage"].slice(0, 4);

        data[0] = properties.style || data[0];
        data[1] = properties.variant || data[1];
        data[2] = properties.weight || data[2];
        data[3] = properties.size || data[3];
        data[4] = properties.family || data[4];

        initialize.call(result);

        return result;
    };


    //根据当前字体衍生出粗体
    prototype.deriveBold = function () {

        return this["bold"] = this.derive({ weight: "bold" });
    };

    //根据当前字体衍生出斜体
    prototype.deriveItalic = function () {

        return this["italic"] = this.derive({ style: "italic" });
    };

    //根据当前字体衍生出粗斜体
    prototype.deriveBoldItalic = function () {

        var result = this.derive({ weight: "bold", style: "italic" });

        this["bold"] && (this["bold"]["italic"] = result);
        this["italic"] && (this["italic"]["bold"] = result);

        return this["bold-italic"] = result;
    };



})(flyingon);




﻿/*

Canvas2D绘图扩展


参考:http://www.w3school.com.cn/html5/html5_ref_canvas.asp

*/

(function (flyingon) {




    /*
    转成RGB颜色

    */
    flyingon.toRGBString = function (r, g, b, alpha) {

        if (arguments.length <= 2)
        {
            alpha = g;
            b = r & 0xFF;
            g = r >> 8 & 0xFF;
            r = r >> 16 & 0xFF;
        }

        if (alpha == null)
        {
            return "rgb(" + r + "," + g + "," + b + ")";
        }

        return "rgba(" + r + "," + g + "," + b + "," + alpha + ")";
    };

    /*
    转成HSL颜色

    */
    flyingon.toHSLString = function (hue, saturation, lightness, alpha) {

        if (alpha == null)
        {
            return "hsl(" + (hue % 360) + "," + saturation + "%," + lightness + "%)";
        }

        return "hsla(" + (hue % 360) + "," + saturation + "%," + lightness + "%," + alpha + ")";
    };




    /*
    线性渐变

    */
    var LinearGradient = flyingon.LinearGradient = function (x0, y0, x1, y1, colorStops) {

        this.x0 = x0;
        this.y0 = y0;
        this.x1 = x1;
        this.y1 = y1;
        this.colorStops = colorStops;
    };

    LinearGradient.prototype.createBrush = function (context) {

        var r = context.boxModel.innerRect,

            x = r.windowX,
            y = r.windowY,
            width = r.width,
            height = r.height,

            g = context.createLinearGradient(x + this.x0 * width, y + this.y0 * height, x + this.x1 * width, y + this.y1 * height),

            colorStops = this.colorStops;


        for (var i = 0; i < colorStops.length; i++)
        {
            g.addColorStop(colorStops[i][0], colorStops[i][1]);
        }

        return g;
    };



    /*
    径向渐变

    */
    var RadialGradient = flyingon.RadialGradient = function (x0, y0, r0, x1, y1, r1, colorStops) {

        this.x0 = x0;
        this.y0 = y0;
        this.r0 = r0;
        this.x1 = x1;
        this.y1 = y1;
        this.r1 = r1;
        this.colorStops = colorStops;
    };

    RadialGradient.prototype.createBrush = function (context) {

        var r = context.boxModel.innerRect,

            x = r.windowX,
            y = r.windowY,
            width = r.width,
            height = r.height,

            g = context.createRadialGradient(x + this.x0 * width, y + this.y0 * height, this.r0, x + this.x1 * width, y + this.y1 * height, this.r1),

            colorStops = this.colorStops;


        for (var i = 0; i < colorStops.length; i++)
        {
            g.addColorStop(colorStops[i][0], colorStops[i][1]);
        }

        return g;
    };


    /*
    图像填充模式

    */
    var ImagePattern = flyingon.ImagePattern = function (image, repetition) {

        this.image = image;
        this.repetition = repetition;
    };

    ImagePattern.prototype.createBrush = function (context) {

        return context.createPattern(this.image, this.repetition);
    };




    /*
    加载主题

    */
    flyingon.loadTheme = function (themeName) {

        flyingon.require("/themes/" + (themeName || flyingon.setting.themeName || "default") + ".js");
        (flyingon.styles["Control"] || (flyingon.styles["Control"] = {}))["x:cache"] = true; //缓存标记
    };

    flyingon.loadTheme();





    var colors = flyingon.colors, //系统颜色

        fonts = flyingon.fonts, //系统字体

        radian = Math.PI / 180, //角度转弧度系数

        prototype = CanvasRenderingContext2D.prototype;



    /****************************以下为属性方法扩展********************************/


    /*    
    set_fillStyle(color) = "#000000"	设置填充色
    set_strokeStyle(color) = "#000000"	设置边框色
    */
    ["fillStyle", "strokeStyle"].forEach(function (name) {

        this["set_" + name] = function (value) {

            var color = value && (colors[value] || value);

            this[name] = color && color.createBrush ? color.createBrush(this) : color;
            return this;
        };

    }, prototype);



    /*    
    set_shadowColor(color) = "#000000"	设置或返回用于阴影的颜色 
    */
    prototype.set_shadowColor = function (color) {

        this.shadowColor = color;
        return this;
    };

    /* 
    set_shadowBlur(number) = 0	    设置或返回用于阴影的模糊级别 
    */
    prototype.set_shadowBlur = function (value) {

        this.shadowBlur = value;
        return this;
    };

    /* 
    set_shadowOffsetX(number) = 0	设置或返回阴影距形状的水平距离 
    */
    prototype.set_shadowOffsetX = function (value) {

        this.shadowOffsetX = value;
        return this;
    };

    /* 
    set_shadowOffsetY(number) = 0	设置或返回阴影距形状的垂直距离 
    */
    prototype.set_shadowOffsetY = function (value) {

        this.shadowOffsetY = value;
        return this;
    };

    /* 
    set_lineCap("butt|round|square") = "butt"	    设置或返回线条的结束端点样式 
    */
    prototype.set_lineCap = function (value) {

        this.lineCap = value;
        return this;
    };

    /* 
    set_lineJoin("bevel|round|miter") = "miter"	    设置或返回两条线相交时 所创建的拐角类型 
    */
    prototype.set_lineJoin = function (value) {

        this.lineJoin = value;
        return this;
    };

    /* 
    set_lineWidth(number) = 1	    设置或返回当前的线条宽度 
    */
    prototype.set_lineWidth = function (value) {

        this.lineWidth = value;
        return this;
    };

    /* 
    set_miterLimit(number) = 10	    设置或返回最大斜接长度 
    */
    prototype.set_miterLimit = function (value) {

        this.miterLimit = value;
        return this;
    };

    /* 
    set_font("italic small-caps bold 12px arial") = "10px sans-serif"	设置或返回文本内容的当前字体属性 
    */
    prototype.set_font = function (value) {

        var font = fonts[value] || value;

        this.font = font && (font.value || font);
        return this;
    };

    /* 
    set_textAlign("center|end|left|right|start") = "start"	设置或返回文本内容的当前对齐方式 
    */
    prototype.set_textAlign = function (value) {

        this.textAlign = value;
        return this;
    };

    /* 
    set_textBaseline("alphabetic|top|hanging|middle|ideographic|bottom") = "alphabetic"	设置或返回在绘制文本时使用的当前文本基线
    */
    prototype.set_textBaseline = function (value) {

        this.textBaseline = value;
        return this;
    };

    /* 
    set_globalAlpha(number)	透明值 必须介于0.0(完全透明)与1.0(不透明)之间
    */
    prototype.set_globalAlpha = function (value) {

        this.globalAlpha = value;
        return this;
    };

    /* 
    set_globalCompositeOperation("source-over|source-atop|source-in|source-out|destination-over|destination-atop|destination-in|destination-out|lighter|copy|source-over") = "source-over"	设置或返回新图像如何绘制到已有的图像上

    source-over	默认 在目标图像上显示源图像 
    source-atop	在目标图像顶部显示源图像 源图像位于目标图像之外的部分是不可见的 
    source-in	在目标图像中显示源图像 只有目标图像内的源图像部分会显示 目标图像是透明的 
    source-out	在目标图像之外显示源图像 只会显示目标图像之外源图像部分 目标图像是透明的 
    destination-over	在源图像上方显示目标图像 
    destination-atop	在源图像顶部显示目标图像 源图像之外的目标图像部分不会被显示 
    destination-in	在源图像中显示目标图像 只有源图像内的目标图像部分会被显示 源图像是透明的 
    destination-out	在源图像外显示目标图像 只有源图像外的目标图像部分会被显示 源图像是透明的 
    lighter	显示源图像 + 目标图像 
    copy	显示源图像 忽略目标图像 
    source-over	使用异或操作对源图像与目标图像进行组合 
    */
    prototype.set_globalCompositeOperation = function (value) {

        this.globalCompositeOperation = value;
        return this;
    };


    /*****************************************************************************/






    /****************************以下为标准方法说明********************************/

    /*
    rect()	        创建矩形
    fillRect()	    绘制“被填充”的矩形
    strokeRect()	绘制矩形(无填充)
    clearRect()	    在给定的矩形内清除指定的像素

    fill()	    填充当前绘图(路径)
    stroke()	绘制已定义的路径
    beginPath()	起始一条路径 或重置当前路径
    closePath()	创建从当前点回到起始点的路径
    clip()	    从原始画布剪切任意形状和尺寸的区域
    save()	    保存当前环境的状态
    restore()	返回之前保存过的路径状态和属性

    moveTo(x, y)	把路径移动到画布中的指定点 不创建线条
    lineTo(x, y)	添加一个新点 然后在画布中创建从该点到最后指定点的线条
    translate(x, y)	重新映射画布上的 (0,0) 位置
    scale(x, y)	    缩放当前绘图至更大或更小
    isPointInPath(x, y)	如果指定的点位于当前路径中 则返回 true 否则返回 false

    quadraticCurveTo(cpx, cpy, x, y)	创建二次贝塞尔曲线
    cpx	贝塞尔控制点的 x 坐标
    cpy	贝塞尔控制点的 y 坐标
    x	结束点的 x 坐标
    y	结束点的 y 坐标

    bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y)	创建三次方贝塞尔曲线
    cp1x	第一个贝塞尔控制点的 x 坐标
    cp1y	第一个贝塞尔控制点的 y 坐标
    cp2x	第二个贝塞尔控制点的 x 坐标
    cp2y	第二个贝塞尔控制点的 y 坐标
    x	结束点的 x 坐标
    y	结束点的 y 坐标

    arc(x,y,r,sAngle,eAngle,counterclockwise)	创建弧/曲线(用于创建圆形或部分圆)
    x	圆的中心的 x 坐标 
    y	圆的中心的 y 坐标 
    r	圆的半径 
    sAngle	起始角 以弧度计 (弧的圆形的三点钟位置是 0 度) 
    eAngle	结束角 以弧度计 
    counterclockwise	可选 规定应该逆时针还是顺时针绘图 False = 顺时针 true = 逆时针 

    arcTo(x1, y1, x2, y2, radius)	创建两切线之间的弧/曲线
    x1  
    y1  
    x2  
    y2      
    radius  半径

    rotate(angle)	旋转当前绘图

    transform(a, b, c, d, e, f)	    替换绘图的当前转换矩阵
    setTransform(a, b, c, d, e, f)	将当前转换重置为单位矩阵 然后运行 transform()
    a	水平缩放绘图
    b	水平倾斜绘图
    c	垂直倾斜绘图
    d	垂直缩放绘图
    e	水平移动绘图
    f	垂直移动绘图

    fillText(text, x, y, maxWidth)	在画布上绘制“被填充的”文本
    strokeText(text, x, y, maxWidth)	在画布上绘制文本(无填充)

    text	    规定在画布上输出的文本
    x	        开始绘制文本的x坐标位置(相对于画布)
    y	        开始绘制文本的y坐标位置(相对于画布)
    maxWidth	可选 允许的最大文本宽度,以像素计
 
    measureText(text)	返回包含指定文本宽度

    drawImage(img, sx, sy, swidth, sheight, x, y, width, height)	向画布上绘制图像、画布或视频

    img	    规定要使用的图像、画布或视频
    sx	    可选 开始剪切的x坐标位置
    sy	    可选 开始剪切的y坐标位置
    swidth	可选 被剪切图像的宽度
    sheight	可选 被剪切图像的高度
    x	    可选 在画布上放置图像的x坐标位置
    y	    可选 在画布上放置图像的y坐标位置
    width	可选 要使用的图像的宽度(伸展或缩小图像)
    height	可选 要使用的图像的高度(伸展或缩小图像)
    */


    /*****************************************************************************/




    /****************************以下为方法扩展********************************/


    prototype.drawBorder = function (x, y, width, height, border) {

        this.beginPath();

        this.rect(x, y, width - border[1], border[0]);
        this.rect(x + width - border[1], y, border[1], height - border[2]);
        this.rect(x + border[3], y + height - border[2], width - border[3], border[2]);
        this.rect(x, y + border[0], border[3], height - border[0]);

        this.fill();
    };



    prototype.rectTo = function (x, y, width, height, anticlockwise) {

        var right = x + width,
            bottom = y + height;

        if (anticlockwise)
        {
            this.moveTo(x, y);
            this.lineTo(x, bottom);
            this.lineTo(right, bottom);
            this.lineTo(right, y);
            this.lineTo(x, y);
        }
        else
        {
            this.moveTo(x, y);
            this.lineTo(right, y);
            this.lineTo(right, bottom);
            this.lineTo(x, bottom);
            this.lineTo(x, y);
        }
    };


    /*
    * 绘制圆角矩形路径
    * @param {Number} x The top left x coordinate
    * @param {Number} y The top left y coordinate 
    * @param {Number} width The width of the rectangle 
    * @param {Number} height The height of the rectangle
    * @param {Number} radius The corner radius. Defaults to 5;
    */
    prototype.roundRect = function (x, y, width, height, radius, anticlockwise) {

        var right = x + width,
            bottom = y + height;

        if (anticlockwise)
        {
            this.moveTo(x, y + radius);

            this.lineTo(x, bottom - radius);
            this.quadraticCurveTo(x, bottom, x + radius, bottom);

            this.lineTo(right - radius, bottom);
            this.quadraticCurveTo(right, bottom, right, bottom - radius);

            this.lineTo(right, y + radius);
            this.quadraticCurveTo(right, y, right - radius, y);

            this.lineTo(x + radius, y);
            this.quadraticCurveTo(x, y, x, y + radius);
        }
        else
        {
            this.moveTo(x + radius, y);

            this.lineTo(right - radius, y);
            this.quadraticCurveTo(right, y, right, y + radius);

            this.lineTo(right, bottom - radius);
            this.quadraticCurveTo(right, bottom, right - radius, bottom);

            this.lineTo(x + radius, bottom);
            this.quadraticCurveTo(x, bottom, x, bottom - radius);

            this.lineTo(x, y + radius);
            this.quadraticCurveTo(x, y, x + radius, y);
        }
    };

    /*
    * 填充圆角矩形
    * @param {Number} x The top left x coordinate
    * @param {Number} y The top left y coordinate 
    * @param {Number} width The width of the rectangle 
    * @param {Number} height The height of the rectangle
    * @param {Number} radius The corner radius. Defaults to 5;
    */
    prototype.fillRoundRect = function (x, y, width, height, radius) {

        this.beginPath();
        this.roundRect(x, y, width, height, radius);
        this.fill();
    };

    /*
    * 描边圆角矩形
    * @param {Number} x The top left x coordinate
    * @param {Number} y The top left y coordinate 
    * @param {Number} width The width of the rectangle 
    * @param {Number} height The height of the rectangle
    * @param {Number} radius The corner radius. Defaults to 5;
    */
    prototype.strokeRoundRect = function (x, y, width, height, radius) {

        this.beginPath();
        this.roundRect(x, y, width, height, radius);
        this.stroke();
    };


    //多边形
    prototype.polygon = function (sides, x, y, radius, angle, anticlockwise) {

        var delta = (anticlockwise ? -2 : 2) * Math.PI / sides;

        angle = angle ? angle * radian : 0;

        this.moveTo(x + radius * Math.sin(angle), y - radius * Math.cos(angle));

        for (var i = 1; i <= sides; i++)
        {
            angle += delta;
            this.lineTo(x + radius * Math.sin(angle), y - radius * Math.cos(angle));
        }
    };

    prototype.fillPolygon = function (sides, x, y, radius, angle, anticlockwise) {

        this.beginPath();
        this.polygon(sides, x, y, radius, angle, anticlockwise);
        this.fill();
    };

    prototype.strokePolygon = function (sides, x, y, radius, angle, anticlockwise) {

        this.beginPath();
        this.polygon(sides, x, y, radius, angle, anticlockwise);
        this.stroke();
    };



    prototype.starPolygon = function (vertexes, x, y, radius1, radius2, angle, anticlockwise) {

        var delta = (anticlockwise ? -1 : 1) * Math.PI / vertexes;

        angle = angle ? angle * radian : 0;

        this.moveTo(x + radius1 * Math.sin(angle), y - radius1 * Math.cos(angle));

        for (var i = 1; i <= vertexes; i++)
        {
            angle += delta;
            this.lineTo(x + radius2 * Math.sin(angle), y - radius2 * Math.cos(angle));

            angle += delta;
            this.lineTo(x + radius1 * Math.sin(angle), y - radius1 * Math.cos(angle));
        }
    };

    prototype.fillStarPolygon = function (vertexes, x, y, radius1, radius2, angle, anticlockwise) {

        this.beginPath();
        this.starPolygon(vertexes, x, y, radius1, radius2, angle, anticlockwise);
        this.fill();
    };

    prototype.strokeStarPolygon = function (vertexes, x, y, radius1, radius2, angle, anticlockwise) {

        this.beginPath();
        this.starPolygon(vertexes, x, y, radius1, radius2, angle, anticlockwise);
        this.stroke();
    };



    prototype.ellipse = function (x, y, width, height, anticlockwise) {

        var controlX = width / 1.5,  //控制点x(width / 0.75) / 2
            controlY = height / 2;   //控制点y

        if (anticlockwise)
        {
            this.moveTo(x, y + controlY);
            this.bezierCurveTo(x + controlX, y + controlY, x + controlX, y - controlY, x, y - controlY);
            this.bezierCurveTo(x - controlX, y - controlY, x - controlX, y + controlY, x, y + controlY);
        }
        else
        {
            this.moveTo(x, y - controlY);
            this.bezierCurveTo(x + controlX, y - controlY, x + controlX, y + controlY, x, y + controlY);
            this.bezierCurveTo(x - controlX, y + controlY, x - controlX, y - controlY, x, y - controlY);
        }
    };

    prototype.fillEllipse = function (x, y, width, height) {

        this.beginPath();
        this.ellipse(x, y, width, height);
        this.fill();
    };

    prototype.strokeEllipse = function (x, y, width, height) {

        this.beginPath();
        this.ellipse(x, y, width, height);
        this.stroke();
    };



    //画虚线
    prototype.dashLine = function (x1, y1, x2, y2, dashArray) {

        !dashArray && (dashArray = [10, 5]);


        this.moveTo(x1, y1);

        var length = dashArray.length,
            width = (x2 - x1),
            height = (y2 - y1),
            slope = height / width,
            distRemaining = Math.sqrt(width * width + height * height),
            index = 0,
            draw = false;


        while (distRemaining >= 0.1)
        {
            var dashLength = dashArray[index++ % length];
            dashLength > distRemaining && (dashLength = distRemaining);


            var step = Math.sqrt(dashLength * dashLength / (1 + slope * slope));

            width < 0 && (step = -step);

            x1 += step;
            y1 += slope * step;

            this[(draw = !draw) ? "lineTo" : "moveTo"](x1, y1);

            distRemaining -= dashLength;
        }
    };



    /*****************************************************************************/




    var cache = document.createElement("canvas");

    //缓冲绘图
    prototype.cache = function (width, height) {

        cache.width = width;
        cache.height = height;

        return cache.getContext("2d");
    };

    //复制至指定目标
    prototype.copyTo = function (target, x, y) {

        var data = this.getImageData(0, 0, this.canvas.width, this.canvas.height);
        target.putImageData(data, x, y);
    };



})(flyingon);




﻿
//事件类型基类
flyingon.class("Event", function (Class, flyingon) {


    //事件类型
    this.type = null;

    //事件目标
    this.target = null;

    //是否取消冒泡
    this.cancelBubble = false;

    //是否阻止默认动作
    this.defaultPrevented = false;



    this.stopPropagation = function () {

        this.cancelBubble = true;
    };

    this.preventDefault = function () {

        this.defaultPrevented = true;
    };


});




//鼠标事件类型
flyingon.class("MouseEvent", flyingon.Event, function (Class, flyingon) {


    Class.create = function (type, target, originalEvent) {

        this.type = type;
        this.target = target;
        this.originalEvent = originalEvent;
    };


    var target = this,

        defineProperty = function (name) {

            flyingon.defineProperty(target, name, function () {

                return this.originalEvent[name];
            });
        };


    //是否按下ctrl键
    defineProperty("ctrlKey");

    //是否按下shift键
    defineProperty("shiftKey");

    //是否按下alt键
    defineProperty("altKey");

    //是否按下meta键
    defineProperty("metaKey");

    //事件触发时间
    defineProperty("timeStamp");

    //鼠标按键 左:0 中:1 右:2 IE9以上与W3C相同
    defineProperty("button");

    //相对屏幕的x坐标
    defineProperty("screenX");

    //相对屏幕的y坐标
    defineProperty("screenY");

    //相对窗口客户区的x坐标
    defineProperty("clientX");

    //相对窗口客户区的y坐标
    defineProperty("clientY");





    function offsetToTarget() {

        var event = this.originalEvent;

        if (!event["x:targetX"])
        {
            var offset = this.target["x:boxModel"].offsetToTarget(event["x:offsetX"], event["x:offsetY"]);

            event["x:targetX"] = offset.x;
            event["x:targetY"] = offset.y;
        }

        return event;
    };


    function offsetToWindow() {

        var event = this.originalEvent;

        if (!event["x:windowX"])
        {
            var offset = this.target["x:boxModel"].offsetToWindow(event["x:offsetX"], event["x:offsetY"]);

            event["x:windowX"] = offset.x;
            event["x:windowY"] = offset.y;
        }

        return event;
    };


    function offsetToControl() {

        var event = this.originalEvent;

        if (!event["x:controlX"])
        {
            var offset = this.target["x:boxModel"].offsetToControl(event["x:offsetX"], event["x:offsetY"]);

            event["x:controlX"] = offset.x;
            event["x:controlY"] = offset.y;
        }

        return event;
    };




    //x偏移坐标
    flyingon.defineProperty(this, "offsetX", function () {

        return this.originalEvent["x:offsetX"];
    });

    //y偏移坐标
    flyingon.defineProperty(this, "offsetY", function () {

        return this.originalEvent["x:offsetY"];
    });


    //x目标坐标
    flyingon.defineProperty(this, "targetX", function () {

        return this.originalEvent["x:targetX"] || offsetToTarget.call(this)["x:targetX"];
    });

    //y目标坐标
    flyingon.defineProperty(this, "targetY", function () {

        return this.originalEvent["x:targetY"] || offsetToTarget.call(this)["x:targetY"];
    });


    //x窗口坐标
    flyingon.defineProperty(this, "windowX", function () {

        return this.originalEvent["x:windowX"] || offsetToWindow.call(this)["x:windowX"];
    });

    //y窗口坐标
    flyingon.defineProperty(this, "windowY", function () {

        return this.originalEvent["x:windowY"] || offsetToWindow.call(this)["x:windowY"];
    });

    //x相对坐标
    flyingon.defineProperty(this, "controlX", function () {

        return this.originalEvent["x:controlX"] || offsetToControl.call(this)["x:controlX"];
    });

    //y相对坐标
    flyingon.defineProperty(this, "controlY", function () {

        return this.originalEvent["x:controlY"] || offsetToControl.call(this)["x:controlY"];
    });




    //鼠标滚轮数据
    flyingon.defineProperty(this, "wheelDelta", function () {

        return this.originalEvent.wheelDelta || (-this.originalEvent.detail * 40);
    });


}, true);




//拖拉事件类型
flyingon.class("DragEvent", flyingon.MouseEvent, function (Class, flyingon) {


    Class.create = function (type, target, originalEvent) {

        this.dragTargets = [target];
    };


    //拖动目标
    this.dragTargets = null;

    //接收目标
    this.dropTarget = null;


}, true);




//键盘事件类型
flyingon.class("KeyEvent", flyingon.Event, function (Class, flyingon) {


    Class.create = function (type, target, originalEvent) {

        this.type = type;
        this.target = target;
        this.originalEvent = originalEvent || {};
    };



    //是否按下ctrl键
    flyingon.defineProperty(this, "ctrlKey", function () {

        return this.originalEvent["ctrlKey"];
    });

    //是否按下shift键
    flyingon.defineProperty(this, "shiftKey", function () {

        return this.originalEvent["shiftKey"];
    });

    //是否按下alt键
    flyingon.defineProperty(this, "altKey", function () {

        return this.originalEvent["altKey"];
    });

    //是否按下meta键
    flyingon.defineProperty(this, "metaKey", function () {

        return this.originalEvent["metaKey"];
    });

    //事件触发时间
    flyingon.defineProperty(this, "timeStamp", function () {

        return this.originalEvent["timeStamp"];
    });

    //键码
    flyingon.defineProperty(this, "keyCode", function () {

        return this.originalEvent.which || this.originalEvent.keyCode;
    });

});





//属性值变更事件类型
flyingon.class("ChangeEvent", flyingon.Event, function (Class, flyingon) {


    Class.create = function (target, name, value, oldValue) {

        this.target = target;
        this.name = name;
        this.value = value;
        this.oldValue = oldValue;
    };


    this.type = "change";

});






﻿/*

*/
(function (flyingon) {



    //拖拉管理
    var Dragdrop = flyingon.Dragdrop = {};





    //局部变量
    var dragger,            //拖拉者
        timer,              //定时器

        ownerWindow,        //所属窗口
        ownerLayer,         //拖拉层
        ownerControl,       //目标控件

        dragTargets,        //拖动目标
        dropTarget,         //接收目标

        allowdropCursor,    //允许拖放时的光标
        nodropCursor,       //禁止拖放时的光标

        dragging,   //是否正在拖动
        start_event,         //原始事件
        last_event,  //记录最后的mousemove事件参数, 用于记录停止拖拉时的最后位置, mouseup为鼠标按下时的坐标,与需求不符
        offsetX,    //X方向因移动造成的修正距离
        offsetY;    //Y方向因移动造成的修正距离




    //新建事件
    function new_event(type, originalEvent) {

        var result = new flyingon.DragEvent(type, ownerControl, originalEvent);

        result.dragTargets = dragTargets;
        result.dropTarget = dropTarget;

        return result;
    };

    //创建拖拉层
    function createLayer() {

        ownerLayer = new flyingon.Layer();
        ownerLayer.disableGetControlAt = true;
        ownerLayer["x:storage"].clipToBounds = false;

        var style = ownerLayer.domLayer.style;

        style.overflow = "visible";
        style.cursor = dragger.allowdropCursor;
        style.opacity = dragger.opacity || 0.5;

        ownerWindow.appendLayer(9999, ownerLayer);
    };




    //默认拖拉者
    Dragdrop.dragger = {

        //允许拖放地显示光标
        allowdropCursor: flyingon.cursors["allow-drop"],

        //不允许拖放时显示光标
        nodropCursor: flyingon.cursors["no-drop"],

        //透明度
        opacity: 0.5,

        //默认开始行为
        start: function (event) {

            //发送事件
            ownerControl.dispatchEvent(event);
        },

        //默认绘制行为
        paint: function (context, dragTargets) {

            for (var i = 0; i < dragTargets.length; i++)
            {
                var box = dragTargets[i]["x:boxModel"];
                box && box.render(context);
            }
        },

        //默认移动行为
        move: function (domMouseEvent, offsetX, offsetY) {

            //需修正div移动偏差
            var target = ownerWindow.getControlAt(domMouseEvent.offsetX + offsetX, domMouseEvent.offsetY + offsetY),
                event;


            target == ownerControl && (target = ownerControl["x:parent"]);

            if (dropTarget != target)
            {
                ownerLayer.domLayer.style.cursor = target == null ? nodropCursor : allowdropCursor;

                if (dropTarget)
                {
                    event = new_event("dragleave", domMouseEvent);
                    dropTarget.dispatchEvent(event);
                }


                if (target && target["x:storage"].droppable)
                {
                    dropTarget = target;

                    event = new_event("dragenter", domMouseEvent);
                    target.dispatchEvent(event);
                }
                else
                {
                    dropTarget = target = null;
                }
            }


            event = new_event("drag", domMouseEvent);
            ownerControl.dispatchEvent(event);


            if (target)
            {
                event = new_event("dragover", domMouseEvent);
                target.dispatchEvent(event);
            }
        },

        //默认停止行为
        stop: function (domMouseEvent, offsetX, offsetY) {

            dropTarget && dropTarget.dispatchEvent(new_event("drop", domMouseEvent));
            ownerControl.dispatchEvent(new_event("dragend", domMouseEvent));
        }

    };







    //执行拖动
    function start() {

        if (timer)
        {
            clearTimeout(timer);
            timer = null;
        }


        //拖动者
        dragger = ownerControl.dragger || Dragdrop.dragger;

        allowdropCursor = dragger.allowdropCursor || Dragdrop.dragger.allowdropCursor;
        nodropCursor = dragger.nodropCursor || Dragdrop.dragger.nodropCursor;


        //拖动目标
        dragTargets = [ownerControl];


        //开始拖拉事件
        var event = new_event("dragstart", start_event);

        //是否取消
        event.canceled = false;


        //开始
        dragger.start && dragger.start(event);


        if (!event.canceled)
        {
            event.dragTargets && (dragTargets = event.dragTargets);

            createLayer();
            dragger.paint.call(ownerControl, ownerLayer.context, dragTargets);
        }
        else
        {
            dragging = false;
        }
    };

    //开始拖动(200毫秒内保持按下鼠标则执行拖动)
    Dragdrop.start = function (window, target, domMouseEvent) {

        timer && clearTimeout(timer);

        dragging = true;

        ownerWindow = window;
        ownerControl = target;
        start_event = domMouseEvent;

        offsetX = 0;
        offsetY = 0;

        timer = setTimeout(start, 200);
    };


    //移动
    Dragdrop.move = function (domMouseEvent) {

        if (!dragging)
        {
            return;
        }

        if (timer)
        {
            clearTimeout(timer);
            timer = null;

            start();
        }

        if (ownerLayer)
        {
            var event = last_event = domMouseEvent;

            //div移动距离
            offsetX = event.clientX - start_event.clientX;
            offsetY = event.clientY - start_event.clientY;

            var offset = dragger.move.call(ownerControl, event, offsetX, offsetY);

            if (offset)
            {
                offsetX = offset.x || 0;
                offsetY = offset.y || 0;
            };

            ownerLayer.domLayer.style.left = offsetX + "px";
            ownerLayer.domLayer.style.top = offsetY + "px";

            return true;
        };

        return false;
    };



    //停止拖动, 成功取消则返回true
    Dragdrop.stop = function () {

        if (timer)
        {
            clearTimeout(timer);
            timer = null;
        };

        var result = !ownerLayer;

        //如果未执行则补上mousedown事件
        if (ownerLayer)
        {
            //如果按下且移动过且可接受拖放时才触发停止方法
            if (last_event && ownerLayer.domLayer.style.cursor != nodropCursor)
            {
                dragger.stop.call(ownerControl, last_event, offsetX, offsetY);
            };

            ownerWindow.removeLayer(ownerLayer);
            ownerLayer = null;

            //处理捕获控件
            ownerWindow["x:captureDelay"].registry([last_event]);
        }
        else
        {
            ownerControl.dispatchEvent(new flyingon.MouseEvent("mousedown", ownerControl, start_event));
        };

        ownerWindow = ownerLayer = ownerControl = null;
        start_event = last_event = null;
        dragger = dragTargets = dropTarget = dragging = null;

        return result;
    };



})(flyingon);




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

    //子盒模型
    prototype.children = null;

    //附加项
    prototype.additions = null;

    //是否需要渲染
    prototype.visible = true;




    //是否需要重绘
    prototype["x:update"] = false;

    //子模型是否需要重绘
    prototype["x:update:children"] = false;

    //重绘模式 0:重绘自身  1:重绘父级  2:重绘图层
    prototype["x:update:mode"] = 0;



    //是否需要测量
    prototype["x:measure"] = false;

    //是否图层
    prototype["x:layer"] = false;



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
    prototype.right = 0;

    //底部y坐标
    prototype.bottom = 0;


    //x渲染偏移
    prototype.offsetX = 0;

    //y渲染偏移
    prototype.offsetY = 0;

    //最大可显示宽度
    prototype.maxWidth = 0;

    //最大可显示高度
    prototype.maxHeight = 0;


    //外边距
    prototype.margin = [0, 0, 0, 0];

    //边框
    prototype.border = [0, 0, 0, 0];

    //内边距
    prototype.padding = [0, 0, 0, 0];





    //获取滚动偏移
    function scroll() {

        var target = this,
            parent,
            x = 0,
            y = 0;

        while (parent = target.offsetParent)
        {
            x += parent.offsetX;
            y += parent.offsetY;

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
        if (this.offsetX && result.x < this.windowX + this.innerRect.right)
        {
            result.x += this.offsetX;
        }

        if (this.offsetY && result.y < this.windowY + this.innerRect.bottom)
        {
            result.y += this.offsetY;
        }

        return result;
    };

    //偏移坐标转控件坐标
    prototype.offsetToControl = function (x, y) {

        var result = scroll.call(this);

        result.x += x - this.windowX;
        result.y += y - this.windowY;

        //如果控件自身有滚动动条且落在客户区内则加上滚动偏移
        if (this.offsetX && result.x < this.innerRect.right)
        {
            result.x += this.offsetX;
        }

        if (this.offsetY && result.y < this.innerRect.bottom)
        {
            result.y += this.offsetY;
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
        if (this.offsetX && result.x <= this.windowX + this.offsetX + this.innerRect.right)
        {
            result.x -= this.offsetX;
        }

        if (this.offsetY && result.y <= this.windowY + this.offsetY + this.innerRect.bottom)
        {
            result.y -= this.offsetY;
        }

        return result;
    };

    //控件坐标转偏移坐标
    prototype.controlToOffset = function (x, y) {

        var result = scroll.call(this);

        result.x = this.windowX + x - result.x;
        result.y = this.windowY + y - result.y;

        //如果控件自身有滚动动条且落在客户区内则加上滚动偏移
        if (this.offsetX && result.x <= this.windowX + this.offsetX + this.innerRect.right)
        {
            result.x -= this.offsetX;
        }

        if (this.offsetY && result.y <= this.windowY + this.offsetY + this.innerRect.bottom)
        {
            result.y -= this.offsetY;
        }

        return result;
    };





    //使当前盒模型无效
    prototype.invalidate = function () {

        if (!this["x:update"])
        {
            this["x:update"] = true;

            var parent = this.parent,
                update = this["x:update:mode"];


            while (parent)
            {
                if (!parent["x:update"])
                {
                    if (update == 0) //如果重绘模式为重绘自身
                    {
                        parent["x:update:children"] = true;
                    }
                    else
                    {
                        parent["x:update"] = true;
                        update == 1 && (update = 0);
                    }
                }

                parent = !parent["x:layer"] && parent.parent;
            }
        }

        return this;
    };



    //更新
    prototype.update = function (context) {

        if (this["x:update"]) //如果需要更新
        {
            this.render(context);
        }
        else if (this["x:update:children"]) //如果子控件需要更新
        {
            this["y:render:children"](context, "update");
            this["x:update:children"] = false;
        }

        return this;
    };




    //计算位置
    var position = function (storage, width, height) {

        var value;

        if (width > 0 && (value = (width - this.width)))
        {
            switch (storage.horizontalAlign)
            {
                case "center":
                    this.x += value >> 1;
                    break;

                case "right":
                    this.x += value;
                    break;
            }
        }

        if (height > 0 && (value = (height - this.height)))
        {
            switch (storage.verticalAlign)
            {
                case "center":
                    this.y += value >> 1;
                    break;

                case "bottom":
                    this.y += value;
                    break;
            }
        }
    };


    ////初始化盒模型
    //prototype.measure = function (parent, x, y, width, height, additions) {

    //    this.x = x;
    //    this.y = y;
    //    this.width = width;
    //    this.height = height;

    //    this.locate(parent, additions);
    //};


    //测量 传入的区域为可用区域 系统会自动根据此范围计算出实际占用空间
    //注:width, height <= 0 表示可使用无限大的空间 
    prototype.measure = function (parent, x, y, width, height, additions) {


        var ownerControl = this.ownerControl,
            storage = ownerControl["x:storage"],

            margin = this.margin = ownerControl.styleValue("margin");


        //减去外框
        this.x = x + margin[3];
        this.y = y + margin[0];


        //先测量大小
        switch (width > 0 && ((width -= margin[3] + margin[1]) > 0 || (width = 0)) && storage.stretch)
        {
            case "width":
            case "all":
                this.width = width < storage.minWidth ? storage.minWidth : (storage.maxWidth > 0 && width > storage.maxWidth ? storage.maxWidth : (width || storage.width));
                break;

            default: //no或无限宽度
                this.width = storage.width;
                break;
        }

        switch (height > 0 && ((height -= margin[0] + margin[2]) > 0 || (height = 0)) && storage.stretch)
        {
            case "height":
            case "all":
                this.height = height < storage.minHeight ? storage.minHeight : (storage.maxHeight > 0 && height > storage.maxHeight ? storage.maxHeight : (height || storage.height));
                break;

            default: //no或无限宽度
                this.height = storage.height;
                break;
        }


        //计算位置
        position.call(this, storage, width, height);


        //处理父模型
        this.parent = parent;

        if (parent)
        {
            if (additions !== true)
            {
                this.offsetParent = parent;
                (parent.children || (parent.children = [])).push(this);
            }
            else
            {
                this.offsetParent = parent && parent.parent;
                (parent.additions || (parent.additions = [])).push(this);
            }
        }
        else
        {
            this.offsetParent = null;
        }


        //处理自动大小
        if (storage.autoSize != "no")
        {
            //测量
            this["y:measure"](ownerControl);

            ownerControl.adjustAutoSize(this);
            position.call(this, storage, width, height);

            this.compute();
        }
        else //延迟测量
        {
            this["x:measure"] = true;
        }


        //
        this.right = this.x + this.width;
        this.bottom = this.y + this.height;


        this["x:update"] = true;
    };


    //移动至指定位置(大小不变)
    prototype.moveTo = function (x, y) {

        this.right = (this.x += x - this.x) + this.width;
        this.bottom = (this.y += y - this.y) + this.height;

        if (!this["x:measure"])
        {
            this.compute();
        }
    };


    //定位单个内容控件
    prototype.content = function (content) {

        if (content)
        {
            var r = this.innerRect,
                box = content["x:boxModel"],
                margin = box.margin = content.styleValue("margin");

            box.measure(this, margin[3], margin[0], r.width - margin[3] - margin[1], r.height - margin[0] - margin[2]);
        }
    };



    prototype["y:measure"] = function (ownerControl) {

        var fn;

        //测量
        this["x:measure"] = false;
        this["x:update:mode"] = 0;


        //设置最大范围
        this.maxWidth = this.width;
        this.maxHeight = this.height;


        (fn = ownerControl.measure) ? fn.call(ownerControl, this) : this.compute();


        if (fn = ownerControl.measureText) //自定义文字测量
        {
            fn.call(ownerControl, this);
        }
        else
        {
            var storage = ownerControl["x:storage"];
            if (storage.text != null && !ownerControl["x:textMetrics"])
            {
                var result = ownerControl["x:textMetrics"] = new flyingon.TextMetrics(this);
                result.measureText(this.font, storage.text, storage.multiline);
            }
        }
    };


    //计算盒模型
    prototype.compute = function () {


        var ownerControl = this.ownerControl,
            storage = ownerControl["x:storage"],

            outerRect = this.outerRect = new flyingon.Rect(),
            borderRect = this.borderRect = new flyingon.Rect(),
            innerRect = this.innerRect = new flyingon.Rect(),

            x = outerRect.x = this.x,
            y = outerRect.y = this.y,
            width = outerRect.width = this.width,
            height = outerRect.height = this.height,

            border = this.border = ownerControl.styleValue("border"),
            padding = this.padding = ownerControl.styleValue("padding");


        borderRect.x = x + border[3];
        borderRect.y = y + border[0];
        borderRect.width = width - (border[3] + border[1]);
        borderRect.height = height - (border[0] + border[2]);

        innerRect.x = x + (innerRect.spaceX = border[3] + padding[3]);
        innerRect.y = y + (innerRect.spaceY = border[0] + padding[0]);
        innerRect.width = borderRect.width - (padding[3] + padding[1]);
        innerRect.height = borderRect.height - (padding[0] + padding[2]);


        //标记需计算绝对位置
        this["x:initialize"] = true;

        return this;
    };


    //初始化(内部方法)
    prototype["y:initialize"] = function () {

        var ownerControl = this.ownerControl,

            r = this.offsetParent && this.offsetParent.innerRect,
            windowX = r ? r.windowX : 0,
            windowY = r ? r.windowY : 0,

            outerRect = this.outerRect,
            borderRect = this.borderRect,
            innerRect = this.innerRect,

            border = this.border;


        this["x:initialize"] = false;

        outerRect.windowX = this.windowX = outerRect.x + windowX;
        outerRect.windowY = this.windowY = outerRect.y + windowY;

        borderRect.windowX = borderRect.x + windowX;
        borderRect.windowY = borderRect.y + windowY;

        innerRect.windowX = innerRect.x + windowX;
        innerRect.windowY = innerRect.y + windowY;


        border.border = (border[0] + border[1] + border[2] + border[3]) > 0; //是否有边框线

        this.borderRadius = border[0] > 0 && ownerControl.styleValue("borderRadius"); //圆角边框不能隐藏边线及不支持粗细不同的边线
    };


    //渲染
    prototype.render = function (context) {


        var ownerControl = this.ownerControl;


        //测量
        if (this["x:measure"])
        {
            this["y:measure"](ownerControl);
        }

        //初始化
        if (this["x:initialize"])
        {
            this["y:initialize"]();
        }


        //设置渲染环境
        context.boxModel = this;

        //绘制背景
        if (!ownerControl.paintBackground(context) || context.globalAlpha < 1)
        {
            this["x:update:mode"] = 1;
        }


        //绘制子项
        if (this.children)
        {
            this["y:render:children"](context, "render");
        }


        //设置渲染环境
        context.boxModel = this;

        //绘制内框
        ownerControl.paint(context);

        //绘制外框
        ownerControl.paintBorder(context);


        //绘制装饰
        var decorates = ownerControl.styleValue("decorates");
        if (decorates && decorates.length > 0)
        {
            this["y:paint:decorates"](context, decorates);
        }

        //修改状态
        this["x:update"] = false;

        return this;
    };


    //渲染或更新子项
    prototype["y:render:children"] = function (context, fn) {

        var ownerControl = this.ownerControl,
            items = ownerControl["y:render:children"],
            item,
            length;


        items = (items && items.call(ownerControl, this)) || this.children;

        if ((length = items.length) > 0)
        {
            context.save();

            if (this.offsetX || this.offsetY)
            {
                context.translate(-this.offsetX, -this.offsetY);
            }

            if (ownerControl["x:storage"].clipToBounds)
            {
                var r = this.innerRect;

                context.beginPath();
                context.rect(r.x + this.offsetX, r.y + this.offsetY, r.width, r.height);
                context.clip();
            }

            for (var i = 0; i < length; i++)
            {
                if ((item = items[i]) && item.visible)
                {
                    item[fn](context);
                }
            }

            context.restore();
        }


        //绘制附加内容
        if (this.additions)
        {
            items = this.additions;
            length = items.length;

            for (var i = 0; i < length; i++)
            {
                if ((item = items[i]) && item.visible)
                {
                    item[fn](context);
                }
            }
        }
    };

    //绘制装饰
    prototype["y:paint:decorates"] = function (context, decorates) {

        var reader;

        for (var i = 0, length = decorates.length; i < length; i++)
        {
            var item = decorates[i];

            //未处理
            if (!(item instanceof flyingon.Shape))
            {
                (item = decorates[i] = (reader || (reader = new flyingon.SerializeReader()))).deserialize(item);
            }

            //重绘模式
            if (item.updateMode > this["x:update:mode"])
            {
                this["x:update:mode"] = item.updateMode;
            }

            item.paint(context);
        }
    };



})(flyingon);



﻿/*
形状基类

*/
flyingon.class("Shape", flyingon.SerializableObject, function (Class, flyingon) {



    //填充色
    this.defineProperty("fillStyle", null);

    //边框色
    this.defineProperty("strokeStyle", flyingon.colors["control-border"]);

    //线宽
    this.defineProperty("lineWidth", 1);



    //固定宽度
    this.defineProperty("width", 0);

    //固定高度
    this.defineProperty("height", 0);

    //x轴缩放比例
    this.defineProperty("scaleX", 1);

    //y轴缩放比例
    this.defineProperty("scaleY", 1);

    //偏移距离 上->右->底->左
    this.defineProperty("offset", [0, 0, 0, 0]);

    //是否逆时针绘制
    this.defineProperty("anticlockwise", false);

    //重绘模式 0:重绘自身  1:重绘父级  2:重绘图层
    this.defineProperty("updateMode", 0);

    //子形状
    this.defineProperty("children", null);




    function children(context, storage, borderRect) {

        var items = storage.children;

        for (var i = 0, length = items.length; i < length; i++)
        {
            var item = items[i];

            storage = item["x:storage"];
            var offset = storage.offset;

            item.buildPath(context,
                borderRect.windowX + offset[3],
                borderRect.windowY + offset[0],
                storage.width <= 0 ? borderRect.width * storage.scaleX - offset[3] - offset[1] : storage.width,
                storage.height <= 0 ? borderRect.height * storage.scaleY - offset[0] - offset[2] : storage.height);

            storage.children && children(context, storage, borderRect);
        }
    };


    this.paint = function (context) {


        var borderRect = context.boxModel.borderRect,
            storage = this["x:storage"],
            offset = storage.offset;


        context.beginPath();

        this.buildPath(context,
            borderRect.windowX + offset[3],
            borderRect.windowY + offset[0],
            storage.width <= 0 ? borderRect.width * storage.scaleX - offset[3] - offset[1] : storage.width,
            storage.height <= 0 ? borderRect.height * storage.scaleY - offset[0] - offset[2] : storage.height);


        storage.children && children(context, storage, borderRect);


        if (storage.fillStyle)
        {
            context.set_fillStyle(storage.fillStyle);
            context.fill();
        }

        if (storage.strokeStyle)
        {
            context.lineWidth = storage.lineWidth;
            context.set_strokeStyle(storage.strokeStyle);
            context.stroke();
        }
    };

    this.buildPath = function (context, x, y, width, height) {

    };


});





﻿/*
线条

*/
flyingon.class("Line", flyingon.Shape, function (Class, flyingon) {


    this.buildPath = function (context, x, y, width, height) {

        context.moveTo(x, y);
        context.lineTo(x + width, y + height);
    };


});





﻿/*
线条

*/
flyingon.class("DashLine", flyingon.Shape, function (Class, flyingon) {


    //虚线规则
    this.defineProperty("dashArray", [3, 3]);



    this.buildPath = function (context, x, y, width, height) {

        context.dashLine(x, y, x + width, y + height, this.dashArray);
    };


});





﻿/*
矩形

*/
flyingon.class("Rectangle", flyingon.Shape, function (Class, flyingon) {



    this.buildPath = function (context, x, y, width, height) {

        context.rect(x, y, width, height, this["x:storage"].anticlockwise);
    };


});





﻿/*
矩形

*/
flyingon.class("RoundRectangle", flyingon.Shape, function (Class, flyingon) {



    this.defineProperty("radius", 5);



    this.buildPath = function (context, x, y, width, height) {

        var storage = this["x:storage"];
        context.roundRect(x, y, width, height, storage.radius, storage.anticlockwise);
    };


});





﻿/*
椭圆

*/
flyingon.class("Ellipse", flyingon.Shape, function (Class, flyingon) {





    this.buildPath = function (context, x, y, width, height) {

        context.ellipse(x + width / 2, y + height / 2, width, height, this["x:storage"].anticlockwise);
    };


});





﻿/*
椭圆

*/
flyingon.class("Polygon", flyingon.Shape, function (Class, flyingon) {



    this.defineProperty("sides", 6);

    this.defineProperty("radius", 20);

    this.defineProperty("angle", 0);



    this.buildPath = function (context, x, y, width, height) {

        var storage = this["x:storage"];
        context.polygon(storage.sides, x + width / 2, y + height / 2, storage.radius, storage.angle, storage.anticlockwise);
    };


});





﻿/*
椭圆

*/
flyingon.class("StarPolygon", flyingon.Shape, function (Class, flyingon) {



    this.defineProperty("vertexes", 5);

    this.defineProperty("radius1", 20);

    this.defineProperty("radius2", 10);

    this.defineProperty("angle", 0);



    this.buildPath = function (context, x, y, width, height) {

        var storage = this["x:storage"];
        context.starPolygon(storage.vertexes, x + width / 2, y + height / 2, storage.radius1, storage.radius2, storage.angle, storage.anticlockwise);
    };


});





﻿/// <reference path="../Base/Core.js" />


//控件基类
flyingon.class("Control", flyingon.SerializableObject, function (Class, flyingon) {




    Class.create = function () {


        //盒模型
        this["x:boxModel"] = new flyingon.BoxModel(this);
    };



    //初始化类方法
    Class.initialize = function (flyingon) {


        var className = this.className,
            styles = flyingon.styles,
            style = styles[className] || (styles[className] = {}),
            templates = flyingon.templates,
            template = templates[className] || (templates[className] = {});


        className = this["superClass"].className;

        //复制上级样式
        styles.hasOwnProperty(className) && flyingon["y:simple:copy"](styles[className], style, true);

        //复制上级模板
        templates.hasOwnProperty(className) && flyingon["y:simple:copy"](templates[className], template, true);

    };





    //引用序列化标记(为true时只序列化名称不序列化内容)
    this["x:reference"] = true;




    //父控件
    this.defineProperty("parent", null, {

        getter: function () {

            return this["x:parent"];
        },

        setter: function (value) {

            var oldValue = this["x:parent"];

            if (value != oldValue)
            {
                oldValue && oldValue["x:children"].remove(this);
                value && value["x:children"].append(this);
            }

            return this;
        }
    });


    //触发父控件变更
    this["y:parent"] = function (parent) {

        var box = this["x:boxModel"];

        box.parent && (box.parent["x:partition"] = true);
        parent && (parent["x:boxModel"]["x:partition"] = true);

        this["x:parent"] = parent;
        this.dispatchEvent(new flyingon.ChangeEvent(this, "parent", parent, this["x:parent"]));
    };






    //主窗口
    this.defineProperty("mainWindow", function () {

        var result = this.ownerWindow;
        return result && (result.mainWindow || result);
    });

    //所属窗口
    this.defineProperty("ownerWindow", function () {

        var parent = this["x:parent"];
        return parent && parent.ownerWindow;
    });

    //所属图层
    this.defineProperty("ownerLayer", function () {

        var parent = this["x:parent"];
        return parent && parent.ownerLayer;
    });


    //当前控件是否指定控件的父控件
    this.isParent = function (control) {

        if (!control || control == this)
        {
            return false;
        }

        var target = control["x:parent"];

        while (target)
        {
            if (target == this)
            {
                return true;
            }

            target = target["x:parent"];
        }

        return false;
    };

    //指定控件是否当前控件的父控件
    this.isParentTo = function (control) {

        return control ? control.isParent(this) : false;
    };

    //获取当前控件的上级控件列表(按从上到下的顺序显示)
    this.getParentList = function () {

        var result = [],
            parent = this["x:parent"];

        while (parent)
        {
            result.unshift(parent);
            parent = parent["x:parent"];
        }

        return result;
    };

    //从父控件中移除自身
    this.remove = function () {

        var parent = this["x:parent"];

        parent && parent["x:children"].remove(this);

        return this;
    };








    flyingon["x:define:getter"] = function (name, options) {

        var body;

        if (options.style) // 样式属性
        {
            body = "return this.styleValue('" + name + "');";
        }
        else
        {
            body = "return this['x:storage']['" + name + "'];"
        }

        return new Function(body);
    };

    flyingon["x:define:setter"] = function (name, attributes) {


        var body = "var storage = this['x:storage'], cache, name = '" + name + "';\n"

            + flyingon["x:define:initialize"]


            + (attributes.style ? "var oldValue = this.styleValue(name);\n" : "var oldValue = storage[name];\n")

            + (attributes.valueChangingCode ? attributes.valueChangingCode + "\n" : "") //自定义值变更代码


            + "if (oldValue !== value)\n"
            + "{\n"

            + flyingon["x:define:change"]

            + "storage[name] = value;\n"
            + "var boxModel = this['x:boxModel'];\n";


        attributes.valueChangedCode && (body += attributes.valueChangedCode + "\n"); //自定义值变更代码

        body += flyingon["x:define:binding"]; //处理绑定源


        //需要重新定位
        if (attributes.locate)
        {
            body += "if (cache = boxModel.parent)\n"
                + "{\n"
                + "cache['x:measure'] = true;\n"
                + "cache.ownerControl.invalidate();\n"
                + "}\n"
                + "else\n"
                + "{\n"
                + "boxModel['x:measure'] = true;\n"
                + "this.invalidate();\n"
                + "}\n";
        }
        else if (attributes.measure) //需要重新测量
        {
            body += "boxModel['x:measure'] = true;\nthis.invalidate();\n";
        }
        else if (attributes.invalidate)  //需要重新绘制
        {
            body += "this.invalidate();\n";
        }


        body += "}\nreturn this;"


        return new Function("value", body);
    };




    //指定样式Key
    this.defineProperty("styleKey", null, "invalidate");

    //自定义样式
    this.defineProperty("style", null, "invalidate");

    /*
    预定义状态组:
    common-states:  普通状态组(enter-animate disabled pressed)
    check-states:   选中状态组(checked unchecked unkown)
    focus-states:   焦点状态组(focused leaver-animate)
    hover-states:   鼠标悬停状态组(hover leaver-animate)
    */
    this["x:states"] = ["common-states", "focus-states", "hover-states"];

    //自定义状态组
    this.defineStates = function (statesName, defaultValue, index) {

        var states = this["x:states"] = this["x:states"].slice(0);
        states.splice(index || states.length - 2, 0, statesName);

        defaultValue !== undefined && this.defaultValue(statesName, defaultValue);
    };

    this.defaultValue("common-states", null);

    this.defaultValue("focus-states", null);

    this.defaultValue("hover-states", null);

    //切换状态
    this.switchState = function (statesName, stateName) {

        if (statesName && stateName)
        {
            this["x:storage"][statesName] = (stateName == "enter-animate" || stateName == "leave-animate") ? null : stateName;

            //记录最后变更的状态组以作为状态变更动画依据
            this["x:statesName"] = statesName;
            this["x:stateName"] = stateName;

            this.invalidate();
        }
    };


    function styleValue(style, name) {

        var storage = this["x:storage"],
            states = this["x:states"],
            i = states.length - 1,
            statesName,
            stateName,
            result;

        while (i >= 0)
        {
            if ((statesName = states[i--]) && (stateName = storage[statesName]))
            {
                if ((result = (style.states && style.states[statesName])) &&
                    (result = (result[stateName])) &&
                    (result = result[name]) !== undefined)
                {
                    return result;
                }
            }
        }


        return style[name];
    };

    //获取样式值
    this.styleValue = function (name) {


        var storage = this["x:storage"];

        if (storage.hasOwnProperty(name))
        {
            return storage[name];
        }

        var style = storage.style;
        if (style && (style = styleValue.call(this, style, name)) != undefined)
        {
            return style;
        }


        var styles = flyingon.styles,
            styleKey;

        if ((styleKey = storage.styleKey) &&
            (style = (styles[styleKey])) &&
            (style = styleValue.call(this, style, name)) != undefined)
        {
            return style;
        }


        styleKey = this["x:className"];
        style = styles[styleKey];

        if ((style = styleValue.call(this, style, name)) != undefined)
        {
            return style;
        }

        return storage[name] || null;
    };




    /***************BoxModel相关属性***************/

    //盒式模型
    this.defineProperty("boxModel", function () {

        return this["x:boxModel"];
    });



    //
    this.defineProperties(["left", "top", "width", "height"], 0, "locate");




    //是否显示 visible:显示 hidden:不显示但保留占位 collapsed:不显示也不占位 见枚举flyingon.Visibility对象
    this.defineProperty("visibility", "visible", "locate");

    //
    this.defineProperties(["minWidth", "maxWidth", "minHeight", "maxHeight"], 0, "locate");



    //拉伸方式 no:不拉伸 width:宽度拉伸 height:高度拉伸 all:全部拉伸 见枚举flyingon.Stretch对象
    this.defineProperty("stretch", "no", "locate");

    //水平对齐 left center right 见枚举flyingon.HorizontalAlign对象
    this.defineProperty("horizontalAlign", "left", "locate");

    //垂直对齐 top center bottom 见枚举flyingon.VerticalAlign对象
    this.defineProperty("verticalAlign", "top", "locate");

    //停靠方式 left top right bottom fill 见枚举flyingon.Dock对象
    this.defineProperty("dock", "left", "locate");

    //表格布局时行及列索引 
    this.defineProperties(["rowIndex", "columnIndex"], null, "locate");




    /*********************************************/


    /***************BoxModel及样式相关属性***************/

    this.defineProperty("margin", [0, 0, 0, 0], "locate|style");

    this.defineProperty("border", [0, 0, 0, 0], "measure|style");

    this.defineProperty("padding", [0, 0, 0, 0], "measure|style");

    this.defineProperty("borderRadius", 0, "measure|style");

    /*********************************************/


    /***************样式相关属性***************/

    //
    this.defineProperty("background", null, "style");

    //
    this.defineProperty("foreground", "black", "style");

    //
    this.defineProperty("borderColor", "rgb(100,100,100)", "style");

    //透明度
    this.defineProperty("opacity", 1, "style");

    //变换器
    this.defineProperty("transform", null, "measure|style");

    //字体
    this.defineProperty("font", "normal", {

        attributes: "measure|style",
        getter: function () {

            return flyingon.fonts[this.styleValue("font") || "normal"] || flyingon.fonts["normal"];
        }

    }, "this['x:textMetrics'] = null;");




    //装饰
    this.defineProperty("decorates", null, "invalidate|style");




    //自动调整大小方式(根据内容大小自动变化)  no:不调整 width:宽度调整 height:高度调整 all:全部调整见枚举flyingon.AutoSize对象
    this.defineProperty("autoSize", "no", {

        valueChangedCode: "value && value != 'no' && this.adjustAutoSize(this['x:boxModel']);"
    });

    //调整自动大小
    this.adjustAutoSize = function (boxModel, size) {

    };



    this.defineProperty("text", null, {

        attributes: "measure",
        valueChangingCode: "value += '';",
        valueChangedCode: "this['x:textMetrics'] = null;"
    });

    this.defineProperty("textHorizontalAlign", "left", "measure");

    this.defineProperty("textVerticalAlign", "center", "measure");




    this.defineProperty("cursor", null);

    this["y:cursor"] = function (event) {

        var cursor = this.styleValue("cursor") || "default";
        return flyingon.cursors[cursor] || cursor;
    };



    /*********************************************/



    //是否只绘制有效范围
    this.defineProperty("clipToBounds", true, "measure");



    //快捷键(按下alt+accesskey)
    this.defineProperty("accesskey", null);


    //是否可用
    this.defineProperty("enabled", true, {

        valueChangedCode: "this.switchState('common-states', value ? 'disabled' : 'enter-animate');"
    });


    //是否可具有焦点
    this.defineProperty("focusable", true);


    //是否为焦点控件
    this.defineProperty("focused", function () {

        return this.ownerWindow && this.ownerWindow["x:focusControl"] == this;
    });

    //是否为焦点控件或包含焦点控件
    this.defineProperty("containsFocused", function () {

        var focusControl = this.ownerWindow && this.ownerWindow["x:focusControl"];
        return focusControl && (focusControl == this || this.isParent(focusControl));
    });





    //是否可以拖动
    this.defineProperty("draggable", false);

    //是否可以接受拖放
    this.defineProperty("droppable", false);



    //值变更事件
    this.defineEvent("change");

    //定义鼠标事件
    this.defineEvents(["mousedown", "mousemove", "click", "dblclick", "mouseup", "mouseover", "mouseout", "mousewheel"]);

    //定义拖拉事件
    this.defineEvents(["dragstart", "drag", "dragend", "dragenter", "dragover", "dragleave", "drop"]);

    //定义键盘事件
    this.defineEvents(["keydown", "keypress", "keyup"]);

    //定义其它事件
    this.defineEvents(["focus", "blur", "locationchanged", "resize", "validate"]);






    //模板
    this.defineProperty("template", null, {

        attributes: "measure",
        valueChangedCode: "this.clearTemplate();",

        getter: function () {

            var storage = this["x:storage"];

            if (storage.hasOwnProperty("template"))
            {
                return storage.template;
            }

            return flyingon.templates[this["x:className"]] || storage.template;
        }
    });

    //创建模板控件
    this.createTemplateControl = function (template, context) {

        var result = new flyingon.SerializeReader().deserialize(template, context || this);

        if (result)
        {
            result["x:parent"] = this;
            return result;
        }
    };

    //清除模板控件
    this.clearTemplate = function () {

    };






    //执行验证
    this.validate = function () {

        return this.dispatchEvent("validate");
    };

    this["y:focus"] = function (event) {

        return this.focus();
    };

    this["y:blur"] = function () {

        return this.blur();
    };


    //设置当前控件为焦点控件
    //注:需此控件focusable为true时才可设为焦点控件
    this.focus = function () {

        if (this["x:storage"].focusable)
        {
            var ownerWindow = this.ownerWindow;

            if (ownerWindow && ownerWindow["x:focusControl"] != this)
            {
                ownerWindow["x:focusControl"] = this;

                this.dispatchEvent("focus");
                this.switchState("focus-states", "focused");
            }

            return true;
        }

        return false;
    };

    //此控件失去焦点
    this.blur = function () {

        var ownerWindow = this.ownerWindow;

        if (ownerWindow && ownerWindow["x:focusControl"] == this)
        {
            ownerWindow["x:focusControl"] = null;

            this.dispatchEvent("blur");
            this.switchState("focus-states", "leave-animate");

            return true;
        }

        return false;
    };





    //显示弹出控件
    this.showPopup = function (x, y) {

        var ownerWindow = this.ownerWindow;

        if (ownerWindow)
        {
            var layer = ownerWindow["x:popupLayer"];

            if (!layer)
            {
                layer = ownerWindow["x:popupLayer"] = ownerWindow.appendLayer(9997);
                layer.layout = "absolute";
                layer.paintBackground = function () { };
            }

            x != null && (this["x:storage"].left = x);
            y != null && (this["x:storage"].top = y);

            layer["x:children"].append(this);
            layer.invalidate();
        }
    };

    //关闭弹出控件
    this.closePopup = function () {

        var ownerWindow = this.ownerWindow;
        ownerWindow && ownerWindow.removeLayer(ownerWindow["x:popupLayer"]);
    };





    //捕获鼠标
    this.setCapture = function () {

        var ownerWindow = this.ownerWindow;
        ownerWindow && (ownerWindow["x:captureControl"] = this);
    };

    //释放鼠标
    this.releaseCapture = function () {

        var ownerWindow = this.ownerWindow;
        ownerWindow && (ownerWindow["x:captureControl"] = null);
    };




    /**********************************坐标说明**********************************/

    //offsetX, offsetY:  偏移坐标 相对目标窗口左上角的显示偏移距离(不受滚动条影响)
    //targetX, targetY:  目标坐标 相对目标控件左上角的物理偏移距离(不受滚动条影响)
    //windowX, windowY:  窗口坐标 相对目标窗口左上角的渲染偏移距离(受滚动条影响)
    //targetX, targetY:控件坐标 相对目标控件左上角的渲染偏移距离(受滚动条影响)

    /****************************************************************************/


    //偏移坐标转窗口坐标
    this.offsetToWindow = function (x, y) {

        return this["x:boxModel"].offsetToWindow(x, y);
    };

    //偏移坐标转目标坐标
    this.offsetToTarget = function (x, y) {

        return this["x:boxModel"].offsetToTarget(x, y);
    };

    //偏移坐标转控件坐标
    this.offsetToControl = function (x, y) {

        return this["x:boxModel"].offsetToControl(x, y);
    };


    //目标坐标转偏移坐标
    this.targetToOffset = function (x, y) {

        return this["x:boxModel"].targetToOffset(x, y);
    };

    //窗口坐标转偏移坐标
    this.windowToOffset = function (x, y) {

        return this["x:boxModel"].windowToOffset(x, y);
    };

    //控件坐标转偏移坐标
    this.controlToOffset = function (x, y) {

        return this["x:boxModel"].controlToOffset(x, y);
    };




    this.hitTest = function (x, y) {

        var r = this["x:boxModel"].outerRect;
        return x >= r.x && y >= r.y && x <= r.right && y <= r.bottom;
    };



    //使区域无效
    this.invalidate = function () {

        var layer = this.ownerLayer;

        this["x:boxModel"].invalidate();
        layer && layer.registryUpdate();
    };


    //更新绘制控件
    this.update = function () {

        var layer = this.ownerLayer;

        this["x:boxModel"].invalidate();

        if (layer)
        {
            layer.unregistryUpdate();
            layer["x:boxModel"].render(layer.context);
        }
    };



    //绘制边框
    this.paintBorder = function (context) {

        var boxModel = this["x:boxModel"],
            border = boxModel.border;

        if (border && border.border)
        {
            var color = this.styleValue("borderColor");

            if (boxModel.borderRadius > 0)
            {
                var r = boxModel.borderRect,
                    lineWidth = border[0],
                    offset = lineWidth / 2;

                context.lineWidth = lineWidth;
                context.set_strokeStyle(color);
                context.strokeRoundRect(r.windowX + offset, r.windowY + offset, r.width - lineWidth, r.height - lineWidth, boxModel.borderRadius);
            }
            else
            {
                var r = boxModel.outerRect;

                context.set_fillStyle(color);
                context.drawBorder(r.windowX, r.windowY, r.width, r.height, border);
            }
        }

    };


    //绘制背景
    this.paintBackground = function (context) {

        var boxModel = context.boxModel,
            background = this.background;

        if (background)
        {
            var r = boxModel.borderRect;

            context.beginPath();
            context.set_fillStyle(background);

            if (boxModel.borderRadius > 0) //圆角矩形
            {
                context.roundRect(r.windowX, r.windowY, r.width, r.height, boxModel.borderRadius);
            }
            else
            {
                context.rect(r.windowX, r.windowY, r.width, r.height);
            }

            context.fill();

            return true;
        }
    };


    //绘制内框
    this.paint = function (context) {

        this.paintText(context);
    };


    //绘制文字
    this.paintText = function (context) {

        var textMetrics = this["x:textMetrics"];

        if (textMetrics)
        {
            var boxModel = context.boxModel,
                r = boxModel.innerRect,
                font = textMetrics.font;


            context.save();


            //区域剪切
            var cliped = this["x:storage"].clipToBounds;
            if (cliped)
            {
                context.beginPath();
                context.rect(r.windowX, r.windowY, r.width, r.height);
                context.clip();
            }


            this.paintTextBackground && this.paintTextBackground(context);


            context.set_fillStyle(this.foreground);
            context.set_font(font);


            var x = r.windowX - boxModel.offsetX,
                y = r.windowY + textMetrics[0].height;


            for (var i = 0, length = textMetrics.length; i < length; i++)
            {
                var line = textMetrics[i];

                for (var j = 0, count = line.length; j < count; j++)
                {
                    var snippet = line[j];
                    context.fillText(snippet.text, x, y);

                    x += snippet.width;
                }
            }


            context.restore();
            return true;
        }
    };



}, true);




﻿flyingon.class("ScrollEvent", flyingon.Event, function (Class, flyingon) {


    Class.create = function (target) {

        this.target = target;
    };


    this.type = "scroll";

    //水平滚动条
    this.horizontalScrollBar = null;

    //竖起滚动条
    this.verticalScrollBar = null;

    //水平变化距离
    this.changedX = 0;

    //竖直变化距离
    this.changedY = 0;

});


//滚动条控件
flyingon.class("ScrollBase", flyingon.Control, function (Class, flyingon) {


    var timer,      //定时变更定时器
        dragger;    //拖拉者



    //是否竖直滚动条
    this.defineProperty("isVertical", false, {

        attributes: "locate",
        valueChangedCode: "var width = storage.width;\nstorage.width = storage.height;\nstorage.height = width;"
    });



    this.defaultValue("focusable", false);

    this.defaultValue("width", 200);

    this.defaultValue("height", 16);



    //当前值
    this.defineProperty("value", 0, "measure");

    //最大值
    this.defineProperty("maxValue", 100, "measure");

    //最小值
    this.defineProperty("minValue", 0, "measure");

    //显示值大小
    this.defineProperty("viewportSize", 10, "measure");

    //最大步进
    this.defineProperty("maxStep", 10);

    //最小步进
    this.defineProperty("minStep", 1);



    //滑块背景
    this.defineProperty("sliderBackground", undefined, "style");

    //滑块图片
    this.defineProperty("slider", undefined, "style");



    this.defineEvent("scroll");



    this.supportPartialUpdate = function () {

        return true;
    };



    this["event:mousedown"] = function (event) {


        timer && clearTimeout(timer);


        var storage = this["x:storage"],
            step,
            limit,
            type = this.getScrollTypeAt(event.windowX, event.windowY);


        switch (type)
        {
            case "decreaseMin":
                step = -storage.minStep;
                break;

            case "increaseMin":
                step = storage.minStep;
                break;

            case "decreaseMax":
                step = -storage.maxStep;
                limit = this.getValueAt(event.controlX, event.controlY, false);
                break;

            case "increaseMax":
                step = storage.maxStep;
                limit = this.getValueAt(event.controlX, event.controlY, true);
                break;

            default: //slider
                this.ownerWindow["x:captureControl"] = this;
                dragger = { x: event.offsetX, y: event.offsetY, value: storage.value };
                return;
        }


        this.changeValue(step, limit) && this.changeValueTime(step, limit);
    };


    this["event:mousemove"] = function (event) {

        if (dragger)
        {
            var storage = this["x:storage"],
                offset = storage.isVertical ? (event.offsetY - dragger.y) : (event.offsetX - dragger.x),
                value = Math.round(offset * (storage.maxValue - storage.minValue) / this["x:boxModel"].length);

            value && this.changeValue(0, dragger.value + value);
        }
    };

    this["event:mouseup"] = function (event) {

        if (timer)
        {
            clearTimeout(timer);
            timer = null;
        }

        this.ownerWindow["x:captureControl"] = null;
        dragger = null;
    };



    //变更值
    this.changeValue = function (step, limit) {

        var storage = this["x:storage"],
            value = storage.value + step,
            maxValue = storage.maxValue - storage.viewportSize;


        if (limit == null)
        {
            limit = step < 0 ? storage.minValue : maxValue;
        }
        else if (limit < storage.minValue)
        {
            limit = storage.minValue;
        }
        else if (limit > maxValue)
        {
            limit = maxValue;
        }


        (!step || (step > 0 && value > limit) || (step < 0 && value < limit)) && (value = limit);


        step = value - storage.value;

        if (step == 0)
        {
            return false;
        }


        storage.value = value;


        var event = new flyingon.ScrollEvent("scroll", this);

        if (storage.isVertical)
        {
            event.verticalScrollBar = this;
            event.changedY = step;
        }
        else
        {
            event.horizontalScrollBar = this;
            event.changedX = step;
        }

        this.dispatchEvent(event);


        this["x:boxModel"]["x:measure"] = true;
        this.invalidate();

        return value != limit;
    };


    //定时变更值
    this.changeValueTime = function (step, limit) {

        var self = this;

        var fn = function () {

            clearTimeout(timer);
            self.changeValue(step, limit) && (timer = setTimeout(fn, 200));
        };

        timer = setTimeout(fn, 200);
    };


    //根据位置获取当前值
    this.getValueAt = function (x, y, exclueSlider) {

        var storage = this["x:storage"],
            boxModel = this["x:boxModel"],
            value = storage.isVertical ? y : x;

        exclueSlider && (value -= boxModel.slider);
        boxModel.thickness && (value -= boxModel.thickness);

        return storage.minValue + Math.round(value * storage.maxValue / boxModel.length);
    };


});








﻿
//滚动条控件
flyingon.class("ScrollBar", flyingon.ScrollBase, function (Class, flyingon) {


    this.defaultValue("maxStep", 200);

    this.defaultValue("minStep", 20);


    //箭头背景
    this.defineProperty("arrowBackground", "black", "style");

    //向左箭头图片
    this.defineProperty("arrowLeft", null, "style");

    //向上箭头图片
    this.defineProperty("arrowUp", null, "style");

    //向右箭头图片
    this.defineProperty("arrowRight", null, "style");

    //向下箭头图片
    this.defineProperty("arrowDown", null, "style");





    this.defineEvent("scroll");





    //根据坐标获取当前滚动类型
    this.getScrollTypeAt = function (x, y) {

        var segments = this["x:boxModel"].segments,
            value = this["x:storage"].isVertical ? y : x;
    

        if (value <= segments[0])
        {
            return "decreaseMin";
        }

        if (value >= segments[3])
        {
            return "increaseMin";
        }

        if (value < segments[1])
        {
            return "decreaseMax";
        }

        if (value > segments[2])
        {
            return "increaseMax";
        }

        return "slider";
    };


    function computeSliderLenth(storage, length) {

        if (length <= 8)
        {
            return 0;
        }

        var result = Math.round(length * storage.viewportSize / (storage.maxValue - storage.minValue));
        return result <= 8 ? 8 : result;
    };

    function computeSliderStart(storage, length, slider) {

        if (length <= 0)
        {
            return 0;
        }

        if (storage.value >= storage.maxValue - storage.viewportSize)
        {
            return length - slider;
        }

        return Math.round((storage.value - storage.minValue) * length / storage.maxValue, 0);
    };



    this.measure = function (boxModel) {


        boxModel.compute();


        var storage = this["x:storage"],
            x = boxModel.x,
            y = boxModel.y,
            width = boxModel.width,
            height = boxModel.height;


        if (storage.isVertical)
        {
            var thickness = boxModel.thickness = width;
            var length = boxModel.length = height - (thickness << 1);
            var slider = boxModel.slider = computeSliderLenth(storage, length);

            var r_1 = boxModel.arrow1Rect = [x, y, thickness, thickness];
            var r_2 = boxModel.sliderRect = [x, y + thickness + computeSliderStart(storage, length, slider), thickness, slider];
            var r_3 = boxModel.arrow2Rect = [x, y + Math.max(height - thickness, 0), thickness, thickness];

            boxModel.segments = [r_1[1] + thickness, r_2[1], r_2[1] + slider, r_3[1]]; //位置段坐标
        }
        else
        {
            var thickness = boxModel.thickness = height;
            var length = boxModel.length = width - (thickness << 1);
            var slider = boxModel.slider = computeSliderLenth(storage, length);

            var r_1 = boxModel.arrow1Rect = [x, y, thickness, thickness];
            var r_2 = boxModel.sliderRect = [x + thickness + computeSliderStart(storage, length, slider), y, slider, thickness];
            var r_3 = boxModel.arrow2Rect = [x + Math.max(width - thickness, 0), y, thickness, thickness];

            boxModel.segments = [r_1[0] + thickness, r_2[0], r_2[0] + slider, r_3[0]]; //位置段坐标
        }
    };



    this.paint = function (context) {


        var boxModel = context.boxModel;


        context.save();


        context.fillStyle = "blue";
        context.fillRect.apply(context, boxModel.sliderRect);


        context.fillStyle = "red";

        context.fillRect.apply(context, boxModel.arrow1Rect);
        context.fillRect.apply(context, boxModel.arrow2Rect);


        context.restore();
    };



});



flyingon.class("ScrollCorner", flyingon.Control, function (Class, flyingon) {



});




﻿//可滚动控件
flyingon.class("ScrollableControl", flyingon.Control, function (Class, flyingon) {




    this.defineProperty("horizontalScrollBar", function () {

        return this["x:hScrollBar"];
    });


    this.defineProperty("verticalScrollBar", function () {

        return this["x:vScrollBar"];
    });




    //定义水平及竖直滚动条显示方式 auto always never  见枚举flyingon.ScrollBarVisibility对象
    this.defineProperties(["horizontalScroll", "verticalScroll"], "auto", "measure");




    function defineProperty(name, boxModel, attributes) {

        this.defineProperty("name", 0, {

            attributes: attributes || "invalidate",
            valueChangedCode: "this['x:boxModel']['" + boxModel + "'] = value;"
        });
    };

    //
    defineProperty.call(this, "scrollLeft", "offsetX");

    //
    defineProperty.call(this, "scrollTop", "offsetY");

    //
    defineProperty.call(this, "scrollWidth", "maxWidth", "measure");

    //
    defineProperty.call(this, "scrollHeight", "maxHeight", "measure");





    this["event:scroll"] = function (event) {

        var box = this["x:boxModel"];

        event.changedX && (box.offsetX += event.changedX);
        event.changedY && (box.offsetY += event.changedY);

        this["x:render:children"] = null;
        this.invalidate();

        //修正因滚动造成的输入符位置变更问题
        var ownerWindow = this.ownerWindow;
        ownerWindow && this.isParent(ownerWindow["x:focusControl"]) && ownerWindow["y:caret"](event.changedX, event.changedY);

        event.stopPropagation();
    };

    this["event:mousewheel"] = function (event) {

        var vScrollBar = this["x:vScrollBar"];

        if (vScrollBar)
        {
            var storage = vScrollBar["x:storage"],
                step = event.wheelDelta < 0 ? storage.minStep : -storage.minStep;

            vScrollBar.changeValue(step);
            event.stopPropagation();
        }
    };





    this.getControlAt = function (x, y) {

        var hScrollBar = this["x:hScrollBar"];
        if (hScrollBar && hScrollBar.hitTest(x, y))
        {
            return hScrollBar;
        }

        var vScrollBar = this["x:vScrollBar"];
        if (vScrollBar && vScrollBar.hitTest(x, y))
        {
            return vScrollBar;
        }

        return null;
    };



    this.measure = function (boxModel) {


        boxModel.compute();


        var innerRect = boxModel.innerRect,
            width = innerRect.width,
            height = innerRect.height;


        //自动滚动条时先按无滚动条进行排列
        var _hScrollBar = horizontalBar.call(this, width),
            _vScrollBar = verticalBar.call(this, height);

        _vScrollBar && (innerRect.width -= _vScrollBar["x:storage"].width);
        _hScrollBar && (innerRect.height -= _hScrollBar["x:storage"].height);

        this.arrange(boxModel, innerRect);


        var hScrollBar = horizontalBar.call(this, width),
            vScrollBar = verticalBar.call(this, height)

        //如果滚动条有变则重新计算及排列
        if (_hScrollBar != hScrollBar || _vScrollBar != vScrollBar)
        {
            innerRect.width = width;
            innerRect.height = height;

            vScrollBar && (width -= vScrollBar["x:storage"].width);
            hScrollBar && (height -= hScrollBar["x:storage"].height);

            this.arrange(boxModel, innerRect);
        }


        //处理滚动条
        if (hScrollBar || vScrollBar)
        {
            hScrollBar && (hScrollBar.maxValue = boxModel.maxWidth);
            vScrollBar && (vScrollBar.maxValue = boxModel.maxHeight);


            //设置滚动条位置
            this["y:measure:scroll"](boxModel, hScrollBar, vScrollBar);


            //处理拐角
            var scrollCorner = this["x:scrollCorner"];

            if (hScrollBar && vScrollBar)
            {
                !scrollCorner && (scrollCorner = this["x:scrollCorner"] = this["x:scrollCorner:cache"] || this.createScrollCorner());
                scrollCorner["x:boxModel"].measure(boxModel, 0, 0, 0, 0);
            }
            else if (scrollCorner)
            {
                this["x:scrollCorner:cache"] = scrollCorner;
                this["x:scrollCorner"] = null;
            }
        }
    };

    this.adjustAutoSize = function (boxModel, size) {

        //size.width = boxModel.maxWidth;
        //size.height = boxModel.maxHeight;
    };



    //排列子控件
    this.arrange = function (boxModel, usableRect) {

    };



    function cache(target, name) {

        target["x:boxModel"].visible = false;

        this[name + ":cache"] = target;
        this[name] = null;
    };

    function restore(name) {

        var result = this[name];
        if (result)
        {
            result["x:boxModel"].visible = true;
            this[name] = undefined;
        }

        return result;
    };

    function horizontalBar(viewportSize) {

        var storage = this["x:storage"],
            box = this["x:boxModel"],
            result = this["x:hScrollBar"];

        if (storage.horizontalScroll == "always" || (storage.horizontalScroll == "auto" && box.maxWidth > viewportSize &&
            storage.autoSize != "width" && storage.autoSize != "all"))
        {
            !result && (result = this["x:hScrollBar"] = restore.call(this, "x:hScrollBar:cache") || this.createHorizontalScrollBar());

            result["x:parent"] = this;

            storage = result["x:storage"];
            storage.value = box.offsetX;
            storage.maxValue = box.maxWidth;
            storage.viewportSize = viewportSize;

            return result;
        }
        else if (result)
        {
            cache.call(this, result, "x:hScrollBar");
        }
    };

    function verticalBar(viewportSize) {

        var storage = this["x:storage"],
            box = this["x:boxModel"],
            result = this["x:vScrollBar"];

        if (storage.verticalScroll == "always" || (storage.verticalScroll == "auto" && box.maxHeight > viewportSize &&
            storage.autoSize != "height" &&
            storage.autoSize != "all"))
        {
            !result && (result = this["x:vScrollBar"] = restore.call(this, "x:vScrollBar:cache") || this.createVerticalScrollBar());

            result["x:parent"] = this;

            storage = result["x:storage"];
            storage.value = box.offsetY;
            storage.maxValue = box.maxHeight;
            storage.viewportSize = viewportSize;

            return result;
        }
        else if (result)
        {
            cache.call(this, result, "x:vScrollBar");
        }
    };



    //创建水平滚动条
    this.createHorizontalScrollBar = function () {

        return new flyingon.ScrollBar();
    };

    //创建竖直滚动条
    this.createVerticalScrollBar = function () {

        var result = new flyingon.ScrollBar();
        result.isVertical = true;
        return result;
    };

    //创建滚动条拐角
    this.createScrollCorner = function () {

        return new flyingon.ScrollCorner();
    };



    //测量滚动条
    this["y:measure:scroll"] = function (boxModel, hScrollBar, vScrollBar) {

        var storage_1 = hScrollBar && hScrollBar["x:storage"],
            storage_2 = vScrollBar && vScrollBar["x:storage"],
            r = boxModel.borderRect;


        if (storage_1 && storage_2) //如果出现两个滚动条
        {
            storage_1.width = r.width - storage_2.width;
            storage_2.height = r.height - storage_1.height;

            hScrollBar["x:boxModel"].measure(boxModel, r.x, r.bottom - storage_1.height, hScrollBar.width, storage_1.height, true);
            vScrollBar["x:boxModel"].measure(boxModel, r.right - storage_2.width, r.y, storage_2.width, vScrollBar.height, true);
        }
        else if (storage_1) //只出现水平滚动条
        {
            storage_1.width = r.width;
            hScrollBar["x:boxModel"].measure(boxModel, r.x, r.bottom - storage_1.height, r.width, storage_1.height, true);
        }
        else //只出现竖直滚动条
        {
            storage_2.height = r.height;
            vScrollBar["x:boxModel"].measure(boxModel, r.right - storage_2.width, r.y, storage_2.width, r.height, true);
        }
    };


});





﻿
//内容控件
flyingon.class("ContentControl", flyingon.Control, function (Class, flyingon) {



    this.defaultValue("width", 100);

    this.defaultValue("height", 21);



    //内容控件
    this.defineProperty("content",

        function () {

            return this["x:content"];
        },

        function (value) {

            var oldValue = this["x:content"];

            if (oldValue != value)
            {
                if (flyingon["x:initializing"])
                {
                    this["x:content"] = value;
                }
                else
                {
                    if (oldValue instanceof flyingon.Control)
                    {
                        oldValue["y:parent"](null);
                    }

                    this["x:content"] = value;
                    this["x:boxModel"]["x:measure"] = true;
                    this.dispatchEvent(new flyingon.ChangeEvent(this, "content", parent, oldValue));

                    this.invalidate();
                }
            }

            return this;
        });




    //获取指定位置的控件
    this.getControlAt = function (x, y) {

        var content = this["x:content"];

        if (content && content.hitTest(x, y))
        {
            return content.getControlAt ? content.getControlAt(x, y) : content;
        }

        return this;
    };


    this.arrange = function (boxModel, usableRect) {

        boxModel.content(this["x:content"]);
    };



    this.serialize = function (writer) {

        flyingon.ContentControl.super.serialize.call(this, writer);

        writer.object("content", this["x:content"]);
    };

    this.deserialize = function (reader, data) {

        if (data)
        {
            flyingon.ContentControl.super.deserialize.call(this, reader, data);

            reader.object(this, "x:content", data["content"]);
        }
    };


});





﻿//模板控件
flyingon.class("TemplateControl", flyingon.Control, function (Class, flyingon) {



    //获取指定位置的控件
    this.getControlAt = function (x, y) {

        if (!this["x:designMode"]) //未实现
        {
            var content = this["x:content"];

            if (content && content.hitTest(x, y))
            {
                return content.getControlAt ? content.getControlAt(x, y) : content;
            }
        }

        return this;
    };


    this.clearTemplate = function () {

        var content = this["x:content"];
        if (content)
        {
            content["x:parent"] = null;
            this["x:content"] = null;
        }
    };


    this.arrange = function (boxModel, usableRect) {

        var content = this["x:content"] || (this["x:content"] = this.createTemplateControl(this.template));
        content && boxModel.content(content);
    };


});





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





﻿
var items_control = function (flyingon) {



    //定义索引状态(根据不同的索引状态显示不同的值)
    this.defineStates("index-states", 0);

    //最大索引号(小于0则不启用索引状态)
    this.defineProperty("maxIndex", 0, "invalidate");



    //子项默认高度
    this.defineProperty("itemHeight", 16, "invalidate");

    //开始显示索引号
    this.defineProperty("visibleIndex", 0, "invalidate");





    this["y:create:item"] = function () {

    };

    this.clearTemplate = function () {

        var items = this["x:items"],
            length = items && items.length;

        for (var i = 0; i < length; i++)
        {
            var item = items[i],
                control = item["x:control"];

            if (control)
            {
                item["x:control"] = null;
                control.dispose();
            }
        }
    };

    //排列子项
    this.arrange = function (boxModel, usableRect) {

        var items = this["x:items"],
            children = this["x:render:children"] = [],

            storage = this["x:storage"],
            maxIndex = storage.maxIndex,
            itemHeight = storage.itemHeight,
            visibleIndex = storage.visibleIndex,

            y = 0,
            width = usableRect.width,
            height = usableRect.height,

            template;


        for (var i = 0, length = items.length; i < length; i++)
        {
            var item = items[i];

            if (item.visible)
            {
                var control = item["x:control"];

                if (!control)
                {
                    template === undefined && (template = this.template);

                    if (template)
                    {
                        control = item["x:control"] = this.createTemplateControl(template, item);
                    }
                    else
                    {
                        control = item["x:control"] = this["y:create:item"]();
                    }
                }


                if (control)
                {
                    var box = control["x:boxModel"];
                    box.measure(boxModel, 0, y, width, itemHeight);

                    children.push(control);

                    if ((y += box.height) >= height)
                    {
                        break;
                    }
                }
            }
        }
    };

    //获取当前可渲染的子项
    this["y:render:children"] = function (boxModel) {

        return this["x:render:children"];
    };





    this.serialize = function (writer) {

        flyingon.SerializableObject.prototype.serialize.call(this, writer);

        var items = this[name];
        items && items.length > 0 && writer.object(items_name, items);
    };

    this.deserialize = function (reader, data) {

        if (data)
        {
            flyingon.SerializableObject.prototype.deserialize.call(this, reader, data);

            reader.object(this, name, data[items_name]);
        }
    };

};





﻿//子项集合
flyingon.class("ItemCollection", flyingon.Collection, function (Class, flyingon) {


    this.value = function (index) {

        var item = this["x:items"][index];
        return item && item.value;
    };


 
    this["y:validate"] = function (item, index) {

        if (item instanceof flyingon.Item)
        {
            return true;
        }

        throw new Error("item not a Item!");
    };

    this["y:remove"] = function (index) {

        return true;
    };

    this["y:clear"] = function () {

        return true;
    };


});





﻿
flyingon.class("ListBoxItem", flyingon.SerializableObject, function (Class, flyingon) {


    this.defineProperty("text", null);

    this.defineProperty("value", null);

    this.defineProperty("image", null);

    this.defineProperty("selected", false);

});



//
flyingon.class("ListBoxItemCollection", flyingon.Collection, function (Class, flyingon) {


    Class.create = function (OwnerControl) {

        this.OwnerControl = OwnerControl;
    };



    this["y:validate"] = function (item) {

        if (!(item instanceof flyingon.ListBoxItem))
        {
            var result = new flyingon.ListBoxItem();

            result.value = item;
            result.text = item ? "" + item : "";
            item = result;
        }

        !flyingon['x:initializing'] && this.ownerControl.invalidate();

        return item;
    };

    this["y:remove"] = function (index) {

        !flyingon['x:initializing'] && this.ownerControl.invalidate();
    };

    this["y:clear"] = function (items) {

        !flyingon['x:initializing'] && this.ownerControl.invalidate();
    };

}, true);




//多子项面板
flyingon.class("ListBox", flyingon.TemplateControl, function (Class, flyingon) {




    items_control.call(this, "items", flyingon.ListBoxItemCollection, flyingon);


});





﻿/*

*/
flyingon.class("ControlCollection", flyingon.Collection, function (Class, flyingon) {


    Class.create = function (ownerControl) {

        this.ownerControl = ownerControl;
    };




    this["y:validate"] = function (item, index) {

        if (item instanceof flyingon.Control)
        {
            if (flyingon["x:initializing"])
            {
                item["x:parent"] = this.ownerControl;
            }
            else
            {
                item["y:parent"](this.ownerControl);
            }

            return item;
        }

        throw new Error("item not a Control!");
    };

    this["y:remove"] = function (index) {

        this["x:items"][index]["y:parent"](null);
    };

    this["y:clear"] = function (items) {

        for (var i = 0, length = items.length; i < length; i++)
        {
            items[i]["y:parent"](null);
        }
    };


}, true);





﻿/*

*/
(function (flyingon) {



    //布局格
    var Cell = function Cell(table, row) {

        this.table = table;
        this.row = row;

    }, prototype = Cell.prototype;



    prototype.subtable = null;

    prototype.x = 0;

    prototype.width = 0;

    prototype.widthSet = "*";

    prototype.widthWeight = 100;

    prototype.widthAuto = false;

    //设置列宽
    prototype.setWidth = function (value) {

        if (this.widthAuto)
        {
            this.row.widthWeights -= this.widthWeight;
            this.widthAuto = false;
        }
        else if (this.width)
        {
            this.row.widthFixed -= this.width;
        }

        this.widthSet = value = value || "*";

        var length = value.length - 1;

        if (value[length] == "*")
        {
            this.widthWeight = length ? value.substring(0, length) : 100;
            this.widthAuto = true;
            this.width = 0;
            this.row.widthWeights += this.widthWeight;
        }
        else
        {
            this.width = parseInt(value);
            this.row.widthFixed += this.width;
        }
    };





    //布局行
    var Row = function Row(table) {

        this.table = table;
        this.cells = [];

    }, prototype = Row.prototype;


    prototype.y = 0;

    prototype.height = 0;

    prototype.heightSet = "*";

    prototype.heightWeight = 100;

    prototype.heightAuto = false;

    //所属单元格所有固定宽度的总和
    prototype.widthFixed = 0;

    //自动宽度的表格数
    prototype.widthWeights = 0;

    //设置行高
    prototype.setHeight = function (value) {

        if (this.heightAuto)
        {
            this.table.heightWeights -= this.heightWeight;
            this.heightAuto = false;
        }
        else if (this.height)
        {
            this.table.heightFixed -= this.height;
        }

        this.heightSet = value = value || "*";
        var length = value.length - 1;

        if (value[length] == "*")
        {
            this.heightWeight = length == 0 ? 100 : value.substring(0, length);
            this.heightAuto = true;
            this.height = 0;
            this.table.heightWeights += this.heightWeight;
        }
        else
        {
            this.height = parseInt(value);
            this.table.heightFixed += this.height;
        }
    };





    //布局表
    var LayoutTable = flyingon.LayoutTable = function () {

        this.rows = [];

    }, prototype = LayoutTable.prototype;



    //列留空
    prototype.spaceX = 0;

    //行留空
    prototype.spaceY = 0;

    //所属行中所有固定高度的总和
    prototype.heightFixed = 0;

    //自动高度的权重总数
    prototype.heightWeights = 0;


    prototype.compute = function (width, height) {

        this.width = width || 0;
        this.height = height || 0;

        var spaceX = this.spaceX || 0,
            spaceY = this.spaceY || 0,

            rows = this.rows,
            length = rows.length,

            y = this.y || 0,
            height = Math.max(this.height - this.heightFixed - (length - 1) * spaceY, 0),
            heightWeights = this.heightWeights;


        for (var i = 0; i < length; i++)
        {
            var row = rows[i];

            row.y = y;

            if (row.heightAuto)
            {
                row.height = Math.round(height * row.heightWeight / heightWeights);
                heightWeights -= row.heightWeight;
                height -= row.height;
            }


            var cells = row.cells,
                count = cells.length,

                x = this.x || 0,
                width = Math.max(this.width - row.widthFixed - (count - 1) * spaceX, 0),
                widthWeights = row.widthWeights;

            for (var j = 0; j < count; j++)
            {
                var cell = cells[j];

                cell.x = x;

                if (cell.widthAuto)
                {
                    cell.width = Math.round(width * cell.widthWeight / widthWeights);
                    widthWeights -= cell.widthWeight;
                    width -= cell.width;
                }

                if (cell.subtable)
                {
                    var t = cell.subtable;

                    t.x = x;
                    t.y = y;
                    t.spaceX = spaceX;
                    t.spaceY = spaceY;
                    t.compute(cell.width, row.height);
                }

                x += cell.width + spaceX;
            }

            y += row.height + spaceY;
        }
    };


    prototype.appendRow = function (height) {

    };


    prototype.insertRow = function (index, height) {

    };

    prototype.appendColumn = function (width) {

    };

    prototype.insertColumn = function (index, width) {

    };



    prototype.create = function (rows, columns) {

        var rows = Math.max(rows, 0) || 3,
            columns = Math.max(columns, 0) || 3;


        for (var i = 0; i < rows; i++)
        {
            var row = new Row(this);

            row.heightAuto = true;
            this.heightWeights += row.heightWeight;

            for (var j = 0; j < columns; j++)
            {
                var cell = new Cell(this, row);

                cell.widthAuto = true;
                row.widthWeights += cell.widthWeight;

                row.cells.push(cell);
            }

            this.rows.push(row);
        }
    };

    prototype.load = function (value) {

        value = value || "T R* C* C* C* R* C* C* C* R* C* C* C* END";

        var tables = [],
            rows = [],
            table = this,
            row,
            cell,
            tokens = value.split(/\s/g);


        for (var i = 0, length = tokens.length; i < length; i++)
        {
            var token = tokens[i],
                value = token.substring(1);

            if (token == "END")
            {
                table = tables.pop();
                row = rows.pop();
            }
            else
            {
                switch (token[0])
                {
                    case "T":
                        if (cell != null)
                        {
                            tables.push(table);
                            rows.push(row);

                            table = cell.subtable = new flyingon.LayoutTable();
                            row = null;
                        }
                        break;

                    case "R":
                        row = new Row(table);
                        row.setHeight(value);
                        table.rows.push(row);

                        cell = null;
                        break;

                    case "C":
                        if (row)
                        {
                            cell = new Cell(table, row);
                            cell.setWidth(value);
                            row.cells.push(cell);
                        }
                        break;
                }
            }
        }
    };


    prototype.serialize = function () {

    };

    prototype.deserialize = function (value) {


    };

    prototype.getAllCells = function () {

        var result = [],
            rows = this.rows;

        for (var i = 0, length = rows.length; i < length; i++)
        {
            var row = rows[i],
                cells = row.cells;

            for (var j = 0, count = cells.length; j < count; j++)
            {
                var cell = cells[j];
                result.push((cell.subtable && cell.subtable.getAllCells()) || cell);
            }
        }

        return result;
    };



    //顺序排列子控件
    prototype.sequenceLayout = function (children, boxModel) {

        var cells = this.getAllCells(),
            length = cells.length,
            index = 0;

        for (var i = 0, count = children.length ; i < count; i++)
        {
            var item = children[i],
                box = item["x:boxModel"];

            if (box.visible = (item["x:storage"].visibility != "collapsed"))
            {
                if (box.visible = (index < length))
                {
                    var cell = cells[index++];
                    box.measure(boxModel, cell.x, cell.y, cell.width, cell.height);
                }
            }
        }
    };


})(flyingon);




﻿//面板控件
flyingon.class("Panel", flyingon.ScrollableControl, function (Class, flyingon) {




    Class.create = function () {


        //子控件集合
        this["x:children"] = new flyingon.ControlCollection(this);
    };





    //修改默认修值接受拖放
    this.defaultValue("droppable", true);



    this.defaultValue("width", 400);

    this.defaultValue("height", 400);



    //子控件集合
    this.defineProperty("children", function () {

        return this["x:children"];
    });



    //当前布局 见枚举flyingon.Layout对象
    this.defineProperty("layout", "rows", {

        attributes: "locate",
        valueChangedCode: "boxModel.offsetX = 0;\nboxModel.offsetY = 0;"
    });

    //布局x轴间隔 0-1之间表示间隔值为总宽度百分比
    this.defineProperty("layoutSpaceX", 0, "locate");

    //布局y轴间隔 0-1之间表示间隔值为总高度的百分比
    this.defineProperty("layoutSpaceY", 0, "locate");

    //布局行高
    this.defineProperty("layoutRowHeight", 0, "locate");

    //布局列宽
    this.defineProperty("layoutColumnWidth", 0, "locate");

    //当前布局页索引
    this.defineProperty("layoutPageIndex", 0, "locate");

    //布局列数
    this.defineProperty("layoutColumns", 3, "locate");

    //布局行数
    this.defineProperty("layoutRows", 3, "locate");

    //布局表
    this.defineProperty("layoutTable", "T R* C* C* C* R* C* C* C* R* C* C* C* END", "locate");




    //布局集
    var layouts = {};

    function getLayoutSpace(value, total) {

        return value > 0 ? (value > 1 ? value : Math.round(total * value)) : 0;
    };


    //单行排列 layoutSpaceX verticalAlign
    layouts.row = function (items, boxModel, usableRect, spaceX, spaceY) {

        var x = 0,
            height = usableRect.height,
            scrollHeight = 0;


        for (var i = 0, length = items.length; i < length; i++)
        {
            var item = items[i],
                box = item["x:boxModel"];

            if (box.visible = (item["x:storage"].visibility != "collapsed"))
            {
                box.measure(boxModel, x, 0, 0, height);
                x = box.right + box.margin[3] + spaceX;

                box.height > scrollHeight && (scrollHeight = box.height);
            }
        }


        boxModel.maxWidth = items[items.length - 1]["x:boxModel"].right;
        scrollHeight > boxModel.maxHeight && (boxModel.maxHeight = scrollHeight);
    };


    //单列排列 layoutSpaceY horizontalAlign
    layouts.column = function (items, boxModel, usableRect, spaceX, spaceY) {

        var y = 0,
            width = usableRect.width,
            scrollWidth = 0;


        for (var i = 0, length = items.length; i < length; i++)
        {
            var item = items[i],
                box = item["x:boxModel"];

            if (box.visible = (item["x:storage"].visibility != "collapsed"))
            {
                box.measure(boxModel, 0, y, width, 0);

                y = box.bottom + box.margin[2] + spaceY;

                box.width > scrollWidth && (scrollWidth = box.width);
            }
        }


        scrollWidth > boxModel.maxWidth && (boxModel.maxWidth = scrollWidth);
        boxModel.maxHeight = items[items.length - 1]["x:boxModel"].bottom;
    };


    //多行排列 layoutSpaceX layoutSpaceY layoutRowHeight verticalAlign
    layouts.rows = function (items, boxModel, usableRect, spaceX, spaceY) {

        var storage = this["x:storage"],

            x = 0,
            y = 0,
            cache,

            maxWidth = usableRect.width,
            rowHeight = storage.layoutRowHeight > 0 ? storage.layoutRowHeight : 0,
            maxHeight = rowHeight,

            scrollWidth = 0;


        for (var i = 0, length = items.length; i < length; i++)
        {
            var item = items[i],
                storage = item["x:storage"],
                box = item["x:boxModel"];

            if (box.visible = (storage.visibility != "collapsed"))
            {
                box.measure(boxModel, x, y, storage.width, maxHeight);
                cache = box.right + box.margin[1] + spaceX;

                if (x > 0 && cache > maxWidth) //如果超出宽度则折行
                {
                    //重新定位
                    box.moveTo(x = 0, y += maxHeight + spaceY);
                    cache = box.right + box.margin[1] + spaceX;
                }

                (x = cache) > scrollWidth && (scrollWidth = x);
                (cache = box.height + box.margin[0] + box.margin[2]) > maxHeight && (maxHeight = cache);
            }
        }


        scrollWidth > boxModel.maxWidth && (boxModel.maxWidth = scrollWidth);
        boxModel.maxHeight = items[items.length - 1]["x:boxModel"].bottom;
    };


    //多列排列 layoutSpaceX layoutSpaceY layoutColumnWidth  horizontalAlign
    layouts.columns = function (items, boxModel, usableRect, spaceX, spaceY) {

        var storage = this["x:storage"],

            x = 0,
            y = 0,
            cache,

            colWidth = storage.layoutColumnWidth > 0 ? storage.layoutColumnWidth : 0,
            maxWidth = colWidth,
            maxHeight = usableRect.height,

            scrollHeight = 0;


        for (var i = 0, length = items.length; i < length; i++)
        {
            var item = items[i],
                storage = item["x:storage"],
                box = item["x:boxModel"];

            if (box.visible = (storage.visibility != "collapsed"))
            {
                box.measure(boxModel, x, y, maxWidth, storage.height);
                cache = box.bottom + box.margin[2] + spaceY;

                if (y > 0 && cache > maxHeight) //如果超出高度则折行
                {
                    //重新定位
                    box.moveTo(x += maxWidth + spaceX, y = 0);
                    cache = box.bottom + box.margin[2] + spaceY;
                }

                (y = cache) > scrollHeight && (scrollHeight = y);
                (cache = box.width + box.margin[3] + box.margin[1]) > maxWidth && (maxWidth = cache);
            }
        }


        boxModel.maxWidth = items[items.length - 1]["x:boxModel"].right;
        scrollHeight > boxModel.maxHeight && (boxModel.maxHeight = scrollHeight);
    };


    //停靠 layoutSpaceX layoutSpaceY dock  horizontalAlign verticalAlign
    layouts.dock = function (items, boxModel, usableRect, spaceX, spaceY) {

        var storage = this["x:storage"],

            x = 0,
            y = 0,
            width = usableRect.width,
            height = usableRect.height,

            right = width,
            bottom = height,

            fills = [];

        for (var i = 0, length = items.length; i < length; i++)
        {
            var item = items[i],
                storage = item["x:storage"],
                box = item["x:boxModel"];


            if (box.visible = (storage.visibility != "collapsed"))
            {
                if (width < 0 || height < 0)
                {
                    box.visible = false;
                }
                else
                {
                    switch (storage.dock)
                    {
                        case "left":
                            box.measure(boxModel, x, y, storage.width, height);

                            x = box.right + spaceX;
                            width = right - x;
                            break;

                        case "top":
                            box.measure(boxModel, x, y, width, storage.height);

                            y = storage.bottom + spaceY;
                            height = bottom - y;
                            break;

                        case "right":
                            right -= box.margin[1] + storage.width;
                            box.measure(boxModel, right, y, storage.width, height);

                            right -= spaceX;
                            width = right - x;
                            break;

                        case "bottom":
                            bottom -= box.margin[2] + storage.height;
                            box.measure(boxModel, x, bottom, width, storage.height);

                            bottom -= spaceY;
                            height = bottom - y;
                            break;

                        default:
                            fills.push(box);
                            break;
                    }
                }
            }
        }


        if (width > x && height > y)
        {
            for (var i = 0; i < fills.length; i++)
            {
                fills[i].measure(boxModel, x, y, width, height);
            }
        }

    };


    //单页显示 layoutPage  horizontalAlign verticalAlign
    layouts.page = function (items, boxModel, usableRect, spaceX, spaceY) {

        var index = this["x:storage"].layoutPageIndex || 0;

        for (var i = 0, length = items.length; i < length; i++)
        {
            var item = items[i],
                box = item["x:boxModel"];

            if (box.visible = (i == index))
            {
                box.measure(boxModel, 0, 0, usableRect.width, usableRect.height);
            }
        }
    };


    //网格排列 layoutColumns layoutRows gridLineColor layoutSpaceX layoutSpaceY  horizontalAlign verticalAlign
    layouts.grid = function (items, boxModel, usableRect, spaceX, spaceY) {

        var storage = this["x:storage"],
            table = new flyingon.LayoutTable();

        table.create(storage.layoutRows, storage.layoutColumns);

        table.spaceX = spaceX;
        table.spaceY = spaceY;

        table.compute(usableRect.width, usableRect.height);
        table.sequenceLayout(items, boxModel);
    };


    //表格排列 layoutTable layoutSpaceX layoutSpaceY  horizontalAlign verticalAlign
    //示例: "T R* C* C* C* R* C* C* C* R* C* C* C* END"
    layouts.table = function (items, boxModel, usableRect, spaceX, spaceY) {

        var storage = this["x:storage"],
            table = storage.layoutTable;

        if (!(table instanceof flyingon.LayoutTable))
        {
            table = new flyingon.LayoutTable();
            table.load(storage.layoutTable);
        }

        table.spaceX = spaceX;
        table.spaceY = spaceY;

        table.compute(usableRect.width, usableRect.height);
        table.sequenceLayout(items, boxModel);
    };


    //绝对定位 left top
    layouts.absolute = function (items, boxModel, usableRect, spaceX, spaceY) {

        for (var i = 0, length = items.length; i < length; i++)
        {
            var item = items[i],
                storage = item["x:storage"],
                box = item["x:boxModel"];

            if (box.visible = (storage.visibility != "collapsed"))
            {
                box.measure(boxModel, storage.left, storage.top, storage.width, storage.height);

                box.right > boxModel.maxWidth && (boxModel.maxWidth = box.right);
                box.bottom > boxModel.maxHeight && (boxModel.maxHeight = box.bottom);
            }
        }
    };



    //注册自定义布局 注意回调函数规范及设置盒模型的maxWidth及maxHeight值
    Class.registryLayout = function (name, layoutfn) {

        layouts[name] = layoutfn;
    };


    //自定义获取布局的方法
    this.getLayout = null;




    //排列子控件
    this.arrange = function (boxModel, usableRect) {


        boxModel.children = null;
        this["x:render:children"] = null;


        var storage = this["x:storage"],
            items = this["x:children"]["x:items"];

        if (items.length > 0)
        {
            var fn = this.getLayout;

            if (fn = ((fn && fn.call(this, storage.layout)) || layouts[storage.layout]))
            {
                var spaceX = storage.layoutSpaceX,
                    spaceY = storage.layoutSpaceY;

                spaceX = spaceX > 0 ? (spaceX > 1 ? spaceX : Math.round(usableRect.width * spaceX)) : 0;
                spaceY = spaceY > 0 ? (spaceY > 1 ? spaceY : Math.round(usableRect.height * spaceY)) : 0;

                fn.call(this, items, boxModel, usableRect, spaceX, spaceY);
            }
        }

        return this;
    };


    //获取当前可渲染的子项
    this["y:render:children"] = function (boxModel) {

        var result = this["x:render:children"];

        if (!result)
        {
            var clipToBounds = this["x:storage"].clipToBounds,

                children = boxModel.children,
                r = boxModel.innerRect,
                x = boxModel.offsetX,
                y = boxModel.offsetY,
                right = x + r.width,
                bottom = y + r.height;

            result = this["x:render:children"] = [];

            for (var i = 0, length = children.length; i < length; i++)
            {
                var item = children[i];

                if (item.visible &&
                    item.right >= x &&
                    item.bottom >= y &&
                    item.ownerControl["x:storage"].visibility == "visible" &&
                    (!clipToBounds || (item.x < right && item.y < bottom)))
                {
                    result.push(item);
                }
            }
        }

        return result;
    };





    //获取指定位置的控件
    this.getControlAt = function (x, y) {

        //判断滚动条
        var result = flyingon.Panel.super.getControlAt.call(this, x, y);

        if (result)
        {
            return result;
        }



        var box = this["x:boxModel"],
            r = box.innerRect;


        x += box.offsetX - r.x;
        y += box.offsetY - r.y;

        //if (storage.transform)
        //{

        //}


        var items = this["x:render:children"];

        if (items && items.length > 0)
        {
            for (var i = items.length - 1; i >= 0 ; i--)
            {
                var item = items[i].ownerControl;

                if (item.hitTest(x, y))
                {
                    return item.getControlAt ? item.getControlAt(x, y) : item;
                }
            }
        }


        return this;
    };




    this.focus = function () {


        if (this.containsFocused)
        {
            return true;
        }


        var items = this["x:children"]["x:items"];

        for (var i = 0, length = items.length; i < length; i++)
        {
            if (items[i].focus(event))
            {
                return true;
            }
        }

        return flyingon.Panel.super.focus.call(this, event);
    };

    this.blur = function () {

        return this.containsFocused ? flyingon.Panel.super.blur.call(this, event) : false;
    };




    this.serialize = function (writer) {

        flyingon.Panel.super.serialize.call(this, writer);

        var items = this["x:children"]["x:items"];
        items && items.length > 0 && writer.array("children", items);
    };

    this.deserialize = function (reader, data) {

        if (data)
        {
            flyingon.Panel.super.deserialize.call(this, reader, data);

            var items = reader.array(this["x:children"], "x:items", data["children"]);
            if (items && items.length > 0)
            {
                for (var i = 0, length = items.length; i < length; i++)
                {
                    items[i]["x:parent"] = this;
                }
            }
        }
    };


}, true);




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





﻿/*
用户控件
*/
flyingon.class("UserControl", flyingon.Panel, function (Class, flyingon) {





});






﻿/*

*/
flyingon.class("Layer", flyingon.Panel, function (Class, flyingon) {



    Class.create = function () {

        var div = this.domLayer = document.createElement("div"),
            canvas = this.domCanvas = document.createElement("canvas");


        div.setAttribute("flyingon", "layer");
        div.setAttribute("style", "position:absolute;width:100%;height:100%;overflow:hidden;outline:none;");

        canvas.setAttribute("flyingon", "canvas");
        canvas.setAttribute("style", "position:absolute;outline:none;");

        div.appendChild(canvas);

        this.context = canvas.getContext("2d");
        this.context.layer = this;


        //注册延时更新
        this["y:initialize:update"](this);
    };



    this.defineProperty("opacity", 1, {

        valueChangedCode: "this.domLayer.style.opacity = value;"
    });


    this.defineProperty("width", function () {

        return this.domCanvas.width;
    });

    this.defineProperty("height", function () {

        return this.domCanvas.height;
    });



    this.defineProperty("ownerLayer", function () {

        return this;
    });



    //初始化延时更新器
    this["y:initialize:update"] = function (layer) {


        var timer,
            boxModel = layer["x:boxModel"];


        boxModel["x:layer"] = true;


        function execute() {

            if (boxModel.innerRect)
            {
                boxModel.update(layer.context);
            }
        };

        layer.registryUpdate = function () {

            if (timer)
            {
                clearTimeout(timer);
            };

            timer = setTimeout(execute, 5);
        };

        layer.unregistryUpdate = function () {

            if (timer)
            {
                clearTimeout(timer);
                timer = 0;
            };
        };
    };




    this.update = function () {

        this.unregistryUpdate();

        this["x:boxModel"].invalidate();
        this["x:boxModel"].update(this.context);
    };



}, true);






﻿//窗口基类
flyingon.class("WindowBase", flyingon.Layer, function (Class, flyingon) {



    var host,                       //主容器
        dragging = false,           //是否处理拖动
        mouseDown = false;          //鼠标是否按下



    Class.create = function () {


        //默认设置为初始化状态,在第一次渲染窗口后终止
        flyingon["x:initializing"] = true;



        var style = "position:absolute;z-index:9990;width:100%;height:100%;overflow:hidden;-moz-user-select:none;-webkit-user-select:none;outline:none;cursor:default;";


        var domMask = this.domMask = document.createElement("div");
        domMask.setAttribute("flyingon", "window.mask");
        domMask.setAttribute("style", style + "background-color:white;opacity:0.1;");


        var domWindow = this.domWindow = document.createElement("div");

        domWindow["x:ownerWindow"] = this.domLayer["x:ownerWindow"] = this.domCanvas["x:ownerWindow"] = this; //缓存当前对象

        domWindow.setAttribute("flyingon", "window");
        domWindow.setAttribute("style", style);
        domWindow.setAttribute("tabindex", "0");

        //IE禁止选中文本 其它浏览器使用样式控件 -moz-user-select:none;-webkit-user-select:none;
        domWindow.onselectstart = domMask.onselectstart = function (event) {

            return false;
        };

        //设置图层
        domWindow.appendChild(this.domLayer);
        this.layers = [this];



        domWindow.addEventListener("mousedown", mousedown, true);

        //宿主
        if (!host)
        {
            host = document.documentElement;

            //样式说明: 禁止选中文本: -moz-user-select:none;-webkit-user-select:none;
            host.setAttribute("style", "-moz-user-select:none;-webkit-user-select:none;");

            host.addEventListener("mousemove", mousemove, false);   //注册顶级dom以便捕获鼠标
            host.addEventListener("mouseup", mouseup, false);       //注册顶级dom以便捕获鼠标
        }


        domWindow.addEventListener("click", click, true);
        domWindow.addEventListener("dblclick", dblclick, true);

        domWindow.addEventListener("mousewheel", mousewheel, true);
        domWindow.addEventListener("DOMMouseScroll", mousewheel, true); //firefox

        domWindow.addEventListener("keydown", keydown, true);
        domWindow.addEventListener("keypress", keypress, true);
        domWindow.addEventListener("keyup", keyup, true);


        //初始化插入符
        caret.call(this, domWindow);


        //子窗口集合
        this["x:windows"] = [];

        //创建控件捕获延迟执行器
        this["x:captureDelay"] = new flyingon.DelayExecutor(10, captureControl, this);
    };





    //所属窗口
    this.defineProperty("ownerWindow", function () {

        return this;
    });

    //图层
    this.defineProperty("ownerLayer", function () {

        return this;
    });




    //窗口切换为活动窗口事件
    this.defineEvent("activate");

    //窗口切换为非活动窗口事件
    this.defineEvent("deactivate");





    //设置当前窗口为活动窗口
    this.activate = function (deactivate) {

        var parentWindow = this.parentWindow,
            activateWindow;


        if (parentWindow)
        {
            deactivate !== false && (activateWindow = parentWindow["x:activateWindow"]) && activateWindow["y:deactivate"]();

            parentWindow["x:activateWindow"] = this;
            this["y:activate"]();
        }
    };


    //获取活动窗口
    this.getActivateWindow = function () {

        var result = this,
            activateWindow;


        while (activateWindow = result["x:activateWindow"])
        {
            result = activateWindow;
        }

        return result == this ? null : result;
    };


    this["y:activate"] = function () {

        this.domWindow.style.zIndex = 9991;
        this.dispatchEvent("activate");
    };

    this["y:deactivate"] = function () {

        this.domWindow.style.zIndex = 9990;
        this.dispatchEvent("deactivate");
    };



    /*

    关于层的顺序 本系统最高层使用9999,默认层为0
    
    拖拉层:     9999
    插入符:     9998
    弹出层:     9997
    活动窗口:   9991
    非活动窗口: 9990
    


    //最大z-index 
    //IE FireFox Safari的z-index最大值是2147483647 。 
    //Opera的最大值是2147483584.。 
    //IE Safari Opera在超过其最大值时按最大值处理。 
    //FireFox 在超过最大值时会数据溢出正负不定,但有一点可以肯定绝对不会高于2147483647层
    //IE FireFox Safari的z-index最小值是-2147483648 
    //Opera的z-index最小值-2147483584 
    //FireFox在-2147483648<=z-index<0时层不显示 在z-index<-2147483648时溢出实际数字正负不定 
    //IE Safari Opera在z-index<0时显示,在小于其最小值时都按其最小值处理

    */

    this.appendLayer = function (zIndex, layer) {

        var storage = this["x:storage"],
            result = layer || new flyingon.Layer();


        zIndex && (result.domLayer.style.zIndex = zIndex);

        result.domCanvas.width = storage.width;
        result.domCanvas.height = storage.height;

        result["x:boxModel"].measure(null, 0, 0, storage.width, storage.height);

        result["x:parent"] = this;

        result.domLayer["x:ownerWindow"] = result.domCanvas["x:ownerWindow"] = this;

        this.domWindow.appendChild(result.domLayer);
        this.layers.push(result);

        return result;
    };


    this.removeLayer = function (layer) {

        if (layer)
        {
            layer["x:parent"] = layer.domLayer["x:ownerWindow"] = layer.domCanvas["x:ownerWindow"] = null;

            this.domWindow.removeChild(layer.domLayer);
            this.layers.remove(layer);
        }
    };



    this.getControlAt = function (x, y) {

        for (var i = this.layers.length - 1; i >= 0; i--)
        {
            var layer = this.layers[i];

            if (!layer.disableGetControlAt && layer.context.getImageData(x, y, 1, 1).data[3] != 0)
            {
                return flyingon.WindowBase.super.getControlAt.call(layer, x, y);
            }
        }

        return this;
    };



    //计算偏移,处理firefox没有offsetX及offsetY的问题
    function offset(event) {

        if (!event["x:offsetX"])
        {
            var x = 0,
                y = 0,
                target = this.domWindow || event.target;

            while (target)
            {
                x += target.offsetLeft;
                y += target.offsetTop;

                target = target.offsetParent;
            }

            //不能使用offsetX 在IE下无法重赋值
            event["x:offsetX"] = event.clientX - x;
            event["x:offsetY"] = event.clientY - y;
        }
    };


    //触发带mouseDown的鼠标事件
    function dispatchEvent(type, target, domMouseEvent) {

        var event = new flyingon.MouseEvent(type, target, domMouseEvent);
        event.mouseDown = mouseDown;

        target.dispatchEvent(event);
    };


    //控件捕获
    function captureControl(domMouseEvent) {


        var source = flyingon["x:mouseControl"],
            target = this.getControlAt(domMouseEvent["x:offsetX"], domMouseEvent["x:offsetY"]) || this;

        if (target != source)
        {
            document.title = target.id;

            flyingon["x:mouseControl"] = target;

            if (source)
            {
                source.switchState("hover-states", "leave-animate");
                dispatchEvent("mouseout", source, domMouseEvent);
            }

            if (target && target["x:storage"].enabled)
            {
                this.domWindow.style.cursor = target["y:cursor"](domMouseEvent);

                target.switchState("hover-states", "hover");

                dispatchEvent("mouseover", target, domMouseEvent);
                dispatchEvent("mousemove", target, domMouseEvent);
            }
        }
    };


    function mousedown(domMouseEvent) {


        var ownerWindow = this["x:ownerWindow"]["x:captureDelay"].execute();


        //设置鼠标按下
        mouseDown = true;



        //处理弹出窗口
        ownerWindow != ownerWindow.mainWindow.getActivateWindow() && ownerWindow.activate(true); //活动窗口不是当前点击窗口



        //处理鼠标按下事件
        var target = ownerWindow["x:captureControl"] || flyingon["x:mouseControl"];

        if (target && target["x:storage"].enabled)
        {
            offset.call(ownerWindow, domMouseEvent);

            //如果可拖动
            if (dragging = target["x:storage"].draggable || ownerWindow["x:storage"].designMode)
            {
                flyingon.Dragdrop.start(ownerWindow, target, domMouseEvent, true);
            }
            else
            {
                //分发事件
                var event = new flyingon.MouseEvent("mousedown", target, domMouseEvent);
                target.dispatchEvent(event);


                //处理焦点
                var focusControl = ownerWindow["x:focusControl"];

                if (target["x:storage"].focusable)
                {
                    var validate = true;

                    focusControl && focusControl != target && (validate = focusControl.validate()) && focusControl["y:blur"]();
                    validate && target["y:focus"](event);
                }
            }


            //设置捕获(注:setCapture及releaseCapture仅IE支持,不能使用)
            host["x:ownerWindow"] = ownerWindow;

            domMouseEvent.stopPropagation();
        }
    };


    function mousemove(domMouseEvent) {


        var ownerWindow = host["x:ownerWindow"] || domMouseEvent.target["x:ownerWindow"],
            target;


        if (ownerWindow)
        {
            offset.call(ownerWindow, domMouseEvent);

            if (dragging) //处理拖动
            {
                flyingon.Dragdrop.move(domMouseEvent);
            }
            else if (target = ownerWindow["x:captureControl"]) //启用捕获
            {
                target["x:storage"].enabled && dispatchEvent("mousemove", target, domMouseEvent);
            }
            else
            {
                ownerWindow["x:captureDelay"].registry([domMouseEvent]); //启用延迟捕获
            }
        }
        else if (target = flyingon["x:mouseControl"])
        {
            flyingon["x:mouseControl"] = null;
            target.switchState("hover-states", "leave-animate");

            dispatchEvent("mouseout", target, domMouseEvent);
        }
    };


    function mouseup(domMouseEvent) {


        var ownerWindow = host["x:ownerWindow"];

        if (ownerWindow)
        {
            var target = ownerWindow["x:captureControl"] || flyingon["x:mouseControl"];

            if (target && target["x:storage"].enabled)
            {
                offset.call(ownerWindow, domMouseEvent);

                if (dragging)
                {
                    dragging = false;

                    if (!flyingon.Dragdrop.stop())
                    {
                        return;
                    }
                }

                target.dispatchEvent(new flyingon.MouseEvent("mouseup", target, domMouseEvent));
            }


            //取消捕获
            host["x:ownerWindow"] = null;

            //设置鼠标弹起
            mouseDown = false;
        }
    };



    //鼠标事件翻译方法
    function translateMouseEvent(type, domMouseEvent) {


        var ownerWindow = this["x:ownerWindow"]["x:captureDelay"].execute(),
            target = ownerWindow["x:captureControl"] || flyingon["x:mouseControl"];


        if (target && target["x:storage"].enabled)
        {
            offset.call(ownerWindow, domMouseEvent);
            target.dispatchEvent(new flyingon.MouseEvent(type, target, domMouseEvent));
        }

        domMouseEvent.stopPropagation();
    };

    function click(domMouseEvent) {

        translateMouseEvent.call(this, "click", domMouseEvent);
    };

    function dblclick(domMouseEvent) {

        translateMouseEvent.call(this, "dblclick", domMouseEvent);
    };

    function mousewheel(domMouseEvent) {

        translateMouseEvent.call(this, "mousewheel", domMouseEvent);
    };



    function keydown(domMouseEvent) {

        var ownerWindow = this["x:ownerWindow"],
            focuseControl = ownerWindow["x:focuseControl"];

        //如果有输入焦点控件则发送事件至输入焦点控件
        if (focuseControl && focuseControl["x:storage"].enabled)
        {
            target.dispatchEvent(new flyingon.KeyEvent(domMouseEvent.type, target, domMouseEvent));
        }
        else //否则处理accessKey
        {

        }

    };

    var keypress = keydown, keyup = keydown;



    this["y:fill"] = function (storage) {

        flyingon["x:initializing"] = false;

        var domHost = this.domWindow.parentNode;

        if (domHost)
        {
            var r = domHost.getBoundingClientRect();

            if (storage)
            {
                this["x:storage"].width = r.width;
                this["x:storage"].height = r.height;
            }

            return r;
        }

        return { width: 0, height: 0 };
    };


    //使区域无效
    this.invalidate = function () {

        this["x:boxModel"].invalidate();

        //绘制窗口内容
        var layers = this.layers;

        for (var i = 0, length = layers.length; i < length; i++)
        {
            layers[i].registryUpdate();
        }
    };



    ///插入符
    function caret(parentNode) {


        var timer,

            target,
            boxModel,
            textMetrics,
            point,

            div = document.createElement("div"),
            input = document.createElement("input"), //输入助手

            ime = 0; //对中文输入时有输入预览的浏览器进行特殊处理 chrome safari Opera


        div.setAttribute("flyingon", "caret");

        input.type = "text";
        input.setAttribute("flyingon", "input");
        input.setAttribute("style", "position:absolute;z-index:-1;padding:0;border:0;width:1px;height:1px;top:100px;");


        navigator.userAgent.match(/MSIE/) && (input.style.width = 0);


        input.onselectstart = function (event) {

            event.stopPropagation();
            return true;
        };


        parentNode.appendChild(div);
        parentNode.appendChild(input);






        function toggle() {

            div.style.visibility = div.style.visibility == "visible" ? "hidden" : "visible";
        };


        function show() {

            var box = boxModel.parent,
                x = point.x,
                y = point.y,
                height = textMetrics.font.lineHeight + 2;


            //处理不完全显示
            if (box)
            {
                var r = box.innerRect,
                    value;

                if ((value = r.windowY - y) > 0)
                {
                    y += value;
                    height -= value
                }

                (value = y + height - r.windowY - r.height) > 0 && (height -= value);
                height < 0 && (height = 0);
            }

            div.setAttribute("style", "visibility:visible;position:absolute;background-color:black;z-Index:9998;width:1px;left:" + x + "px;top:" + y + "px;height:" + height + "px;");
        };


        //更新控件
        function update() {


            timer && clearInterval(timer);


            var r = boxModel.innerRect,
                x = textMetrics.caretEnd.x;


            //自动滚动调整
            if (x < boxModel.offsetX)
            {
                boxModel.offsetX = x;
            }
            else
            {
                var right = boxModel.offsetX + r.width;

                if (x > right)
                {
                    boxModel.offsetX = x - r.width;
                    x = right;
                }
                else if (right <= r.width)
                {
                    boxModel.offsetX = 0;
                }
            }


            //显示插入符
            point = boxModel.targetToOffset(r.spaceX + x - boxModel.offsetX, r.spaceY);
            x > 0 && (point.x -= 1);


            input.style.left = point.x + "px";
            input.style.top = point.y + "px";


            show();
            timer = setInterval(toggle, 500);


            //更新控件
            target.invalidate();
        };


        //输入字符
        function oninput(text) {

            if (ime >= 0) //输入法
            {
                var value = text.charAt(ime);

                if (value >= "A" && value <= "z")
                {
                    return;
                }

                if (++ime >= text.length)
                {
                    ime = 0;
                    input.value = "";
                }

                text = value;
            }
            else
            {
                ime = 0;
                input.value = "";
            }


            textMetrics.replace(text);
            update.call(this);
        };

        //移动
        function move(selectionTo, textIndex, selected) {

            if (selectionTo)
            {
                textMetrics.selectionTo(textIndex);
                reset();
            }
            else
            {
                textMetrics.moveTo(selected && textMetrics.selectedText ? textMetrics.caretEnd.textIndex : textIndex);
                update.call(this);
            }
        };


        input.onkeypress = function (event) {

            ime = -1; //开启输入法时不会触发
            event.stopPropagation();
        };

        input.onkeyup = function (event) {

            event.stopPropagation();


            var keyCode = event.keyCode;

            switch (keyCode)
            {
                case 8: //BackSpace
                    textMetrics.remove(-1);
                    update.call(this);
                    return;

                case 33: //Prior:
                case 37: //Left:
                    move.call(this, event.shiftKey, textMetrics.caretEnd.textIndex - 1, true);
                    return;

                case 34: //Next:
                case 39: //Right:
                    move.call(this, event.shiftKey, textMetrics.caretEnd.textIndex + 1, true);
                    return;

                case 35: //End:
                    move.call(this, event.shiftKey, textMetrics.text.length);
                    return;

                case 36: //Home:
                    move.call(this, event.shiftKey, 0);
                    return;

                case 38: //Up:
                    return;

                case 40: //Down:
                    return;

                case 46: //Delete
                    textMetrics.remove(1);
                    update.call(this);
                    return;
            }


            if (event.ctrlKey)
            {
                switch (keyCode)
                {

                    case 65: //a A
                        textMetrics.moveTo(0);
                        textMetrics.selectionTo(textMetrics.text.length);
                        reset();
                        return;

                    case 67: //c C
                        return;

                    case 86: //v V
                        textMetrics.replace(input.value);
                        input.value = "";
                        update.call(this);
                        return;

                    case 88: //x X
                        textMetrics.remove(0);
                        update.call(this);
                        return;

                        //case 90: //z Z //undo redo 暂未实现
                        //    return;
                }
            }


            keyCode != 17 && !input.readOnly && input.value && oninput.call(this, input.value); //不处理ctrl键
        };




        //变更插入符位置
        this["y:caret"] = function (changedX, changedY) {

            if (boxModel)
            {
                point.x -= changedX;
                point.y -= changedY;

                show();
            }
        };


        //打开输入助手
        this["y:open:input"] = function (ownerControl, readOnly) {

            target = ownerControl;
            boxModel = ownerControl["x:boxModel"];
            textMetrics = ownerControl["x:textMetrics"];

            input.readOnly = readOnly;
            reset();
        };

        //重置输入助手
        var reset = this["y:input"] = function () {

            input.focus();
            input.value = textMetrics.selectedText;
            input.select();

            update.call(this);
        };

        //关闭输入助手
        this["y:close:input"] = function () {

            if (timer)
            {
                clearInterval(timer);
                timer = null;
            }

            div.style.visibility = "hidden";
            input.blur();
        };


    };



});





﻿//主窗口
flyingon.class("Window", flyingon.WindowBase, function (Class, flyingon) {



    Class.create = function (parentNode) {


        var domHost = this.domHost = document.createElement("div");

        domHost.setAttribute("flyingon", "window.host");
        domHost.setAttribute("style", "position:relative;width:100%;height:100%;overflow:hidden;");

        //添加窗口
        domHost.appendChild(this.domWindow);

        //添加至指定dom
        (parentNode || flyingon["x:window:host"] || document.body).appendChild(domHost);



        //定义主窗口变更
        flyingon.defineVariable(this, "mainWindow", this, false, true);

        //设为活动窗口
        this.activate();


        //绑定resize事件
        var self = this;
        window.addEventListener("resize", function (e) { self.update(); }, true);
    };





    //重新绘制
    this.update = function () {


        this["y:fill"](true);


        var storage = this["x:storage"],
            width = storage.width,
            height = storage.height,

            layers = this.layers;

        for (var i = 0, length = layers.length; i < length; i++)
        {
            var layer = layers[i],
                box = layer["x:boxModel"];

            layer.unregistryUpdate();
            layer.domCanvas.width = width; //清空画布
            layer.domCanvas.height = height;

            box.measure(null, 0, 0, width, height);
            box.render(layer.context);
        }

    };



}, true);





﻿

//窗口标题栏
flyingon.class("WindowTitleBar", flyingon.Panel, function (Class, flyingon) {


    Class.create = function () {


        this["button:icon"] = button.call(this, "left", "window-icon");

        this["button:close"] = button.call(this, "right", "window-close", function (event) {

            this.ownerWindow.close();
        });

        this["button:maximize"] = button.call(this, "right", "window-maximize", function (event) {

            this.ownerWindow.close();
        });

        this["button:minimize"] = button.call(this, "right", "window-minimize", function (event) {

            this.ownerWindow.close();
        });

    };



    this.defaultValue("focusable", false);

    this.defaultValue("height", 25);

    this.defaultValue("layout", "dock");




    function button(dock, styleKey, click) {

        var result = new flyingon.PictureBox();

        result.dock = dock;
        result.width = 20;
        result.styleKey = styleKey;

        click && (result.onclick = click);

        this["x:children"].append(result);
        return result;
    };


    var offsetX, offsetY;

    function translate(mainWindow, left, top) {

        if (left < 0)
        {
            left = 0;
        }
        else if (left > mainWindow["x:storage"].width)
        {
            left = mainWindow["x:storage"].width - 4;
        }

        if (top < 0)
        {
            top = 0;
        }
        else if (top > mainWindow["x:storage"].height)
        {
            top = mainWindow["x:storage"].height - 4;
        }

        return { left: left, top: top };
    };



    this["event:mousedown"] = function (event) {

        var ownerWindow = this.ownerWindow,
            storage = ownerWindow["x:storage"],
            offset = translate(ownerWindow.mainWindow, storage.left, storage.top);


        offsetX = offset.left - event.clientX;
        offsetY = offset.top - event.clientY;

        ownerWindow["x:captureControl"] = this; //捕获鼠标
    };

    this["event:mousemove"] = function (event) {

        if (event.mouseDown)
        {
            var ownerWindow = this.ownerWindow,
                storage = ownerWindow["x:storage"],
                style = ownerWindow.domWindow.style;


            storage.left = event.clientX + offsetX,
            storage.top = event.clientY + offsetY;

            var offset = translate(ownerWindow.mainWindow, storage.left, storage.top);

            style.left = offset.left + "px";
            style.top = offset.top + "px";
        }
    };

    this["event:mouseup"] = function (event) {

        this.ownerWindow["x:captureControl"] = null;
    };


}, true);




//子窗口
flyingon.class("ChildWindow", flyingon.WindowBase, function (Class, flyingon) {




    Class.create = function () {


        this.onlocationchange = function (event) {

            this.domWindow.style[event.name] = event.value + "px";
        };


        this.titleBar = this.createTitleBar() || new flyingon.WindowTitleBar();
        this.titleBar["x:parent"] = this;
    };


    //创建标题栏
    this.createTitleBar = function () {

        return null;
    };




    this.defineProperty("width", 640);

    this.defineProperty("height", 480);

    this.defineProperty("fullMode", false, "this['x:resize'] = true");

    //窗口起始位置 center:居中  manual:自定义
    this.defineProperty("startPosition", "center");




    this.defineEvent("closing");

    this.defineEvent("closed");




    this.getControlAt = function (x, y) {

        //判断滚动条
        if (this.titleBar.hitTest(x, y))
        {
            return this.titleBar.getControlAt(x, y);
        }

        return flyingon.ChildWindow.super.getControlAt.call(this, x, y);
    };



    var center;

    function show(parentWindow, modalWindow) {


        if (!parentWindow)
        {
            throw new Error("parentWindow not allow null!");
        }


        var children = parentWindow["x:windows"];
        if (!children)
        {
            throw new Error("parentWindow is not a flyingon.WindowBase object!");
        }


        children.push(this);

        flyingon.defineVariable(this, "parentWindow", parentWindow, true, true);
        flyingon.defineVariable(this, "mainWindow", parentWindow.mainWindow, true, true);


        var domHost = this.mainWindow.domHost;

        //如果是模式窗口则添加遮罩层
        modalWindow && domHost.appendChild(this.domMask);

        domHost.appendChild(this.domWindow);


        center = this["x:storage"].startPosition == "center";

        this.activate(true);
        this.update();
    };

    this.show = function (parentWindow) {

        show.call(this, parentWindow, false);
    };

    this.showDialog = function (parentWindow) {

        show.call(this, parentWindow, true);
    };




    this["y:activate"] = function () {

        this.titleBar["x:boxModel"].render(this.context);

        flyingon.ChildWindow.super["y:activate"].call(this);
    };

    this["y:deactivate"] = function () {

        this.titleBar["x:boxModel"].render(this.context);

        flyingon.ChildWindow.super["y:deactivate"].call(this);
    };



    this.close = function () {

        var parentWindow = this.parentWindow;

        if (parentWindow)
        {
            var index = parentWindow["x:windows"].indexOf(this);

            if (index >= 0 && this.dispatchEvent("closing"))
            {
                var domHost = this.mainWindow.domHost;

                domHost.removeChild(this.domWindow);

                this.domMask.parentNode && domHost.removeChild(this.domMask);

                parentWindow["x:windows"].splice(index, 1);

                flyingon.defineVariable(this, "parentWindow", null, true, true);
                flyingon.defineVariable(this, "mainWindow", null, true, true);

                this.dispatchEvent("closed");


                parentWindow.activate(false);
            }
        }

        this.dispose();
    };




    this.measure = function (boxModel) {


        var storage = this["x:storage"],
            titleBar = this.titleBar,

            y = titleBar["x:storage"].height,

            width = storage.width,
            height = storage.height,

            style = this.domWindow.style;


        if (center)
        {
            var r = this["y:fill"](storage.fullMode);

            storage.left = Math.round((r.width - width) / 2);
            storage.top = Math.round((r.height - height) / 2);

            center = false;
        }


        style.left = storage.left + "px";
        style.top = storage.top + "px";
        style.width = width + "px";
        style.height = height + "px";


        //处理标题栏
        boxModel.children = null;
        titleBar["x:boxModel"].measure(boxModel, 0, 0, width, y, true);


        //绘制窗口内容
        var layers = this.layers;

        for (var i = 0, length = layers.length; i < length; i++)
        {
            var layer = layers[i];

            layer["x:boxModel"].measure(null, 0, y, width, height - y);

            layer.domCanvas.width = width; //清空画布
            layer.domCanvas.height = height;
        }


        //调用默认测量方法
        boxModel.compute();
    };



    //绘制内框
    this.paint = function (context) {

        //绘制窗口内容
        var layers = this.layers;

        for (var i = 1, length = layers.length; i < length; i++)
        {
            var layer = layers[i];

            layer.unregistryUpdate();
            layer["x:boxModel"].render(layer.context);
        }

        flyingon.ChildWindow.super.paint.call(this, context);
    };



}, true);





﻿



﻿



﻿/// <reference path="../Base/Core.js" />
/// <reference path="Control.js" />



//文本框代码实现
var TextBase = function (multiline) {



    this.defaultValue("text", "");


    this.defineProperty("readOnly", false);




    this.defineProperty("selectionStart", 0, {

        getter: function () {

            return (this["x:textMetrics"] && this["x:textMetrics"].selectionStart) || 0;
        },

        setter: function (value) {

            this.ownerWindow && this.ownerWindow["x:focusControl"] == this && this["x:textMetrics"].moveTo(value);
            return this;
        }
    });


    this.defineProperty("selectionLength", 0, {

        getter: function () {

            var textMetrics = this["x:textMetrics"];
            return textMetrics ? textMetrics.selectionEnd - textMetrics.selectionStart : 0;
        },

        setter: function (value) {

            if (this.ownerWindow && this.ownerWindow["x:focusControl"] == this)
            {
                var textMetrics = this["x:textMetrics"];

                value < 0 && (value = 0);
                textMetrics.selectionTo(textMetrics.selectionStart + value);
            }

            return this;
        }
    });


    this.defineProperty("selectedText", function () {

        return this["x:textMetrics"].selectedText;
    });







    this["y:focus"] = function (event) {

        if (this.focus())
        {
            var ownerWindow = this.ownerWindow,
                textMetrics = this["x:textMetrics"];

            if (event || !this.containsFocused || !textMetrics.caretEnd)
            {
                var x = event ? event.controlX : 0,
                    y = event ? event.controlY : 0;

                textMetrics.moveAt(x, y);
            }


            //开启输入助手
            ownerWindow["y:open:input"](this, this["x:storage"].readOnly);
        }
    };

    this["y:blur"] = function () {

        this.blur() && this.ownerWindow["y:close:input"]();
    };




    this["event:mousedown"] = function (event) {

        this.ownerWindow["x:captureControl"] = this; //捕获鼠标
    };

    this["event:mousemove"] = function (event) {

        if (event.mouseDown && this.ownerWindow["x:focusControl"] == this)
        {
            var textMetrics = this["x:textMetrics"],
                x = event.targetX;


            if (x >= this["x:boxModel"].innerRect.right)
            {
                textMetrics.selectionTo(textMetrics.selectionEnd + 1, true);
            }
            else if (x <= 0)
            {
                textMetrics.selectionTo(textMetrics.selectionStart - 1, true);
            }
            else
            {
                textMetrics.selectionAt(event.controlX, event.controlY, true);
            }


            this.ownerWindow["y:input"]();
        }
    };

    this["event:mouseup"] = function (event) {

        var ownerWindow = this.ownerWindow;

        if (ownerWindow)
        {
            ownerWindow["x:focusControl"] == this && ownerWindow["y:input"]();

            //释放鼠标
            ownerWindow["x:captureControl"] = null;
        }
    };




    this.defineEvent("textchanging");

    this.defineEvent("textchanged");





    this.paintTextBackground = function (context) {

        var textMetrics = this["x:textMetrics"];

        if (textMetrics.selectionEnd > textMetrics.selectionStart)
        {
            var boxModel = context.boxModel,
                r = boxModel.innerRect,
                start = textMetrics.caretMin,
                end = textMetrics.caretMax;

            context.fillStyle = "#A9E2F3";// "#E6E6E6";
            context.fillRect(r.windowX + start.x - boxModel.offsetX, r.windowY, end.x - start.x, 16);
        }
    };

};








﻿/// <reference path="../Base/Core.js" />
/// <reference path="Control.js" />


/*

*/
flyingon.class("TextBoxBase", flyingon.Control, function (Class, flyingon) {



    this.defaultValue("width", 100);

    this.defaultValue("height", 21);

    this.defaultValue("multiline", false);



    TextBase.call(this, false);


});









﻿/// <reference path="../Base/Core.js" />
/// <reference path="Control.js" />


/*

*/
flyingon.class("TextButtonBase", flyingon.TextBoxBase, function (Class, flyingon) {



    this.defineProperty("items", []);


    this.defineProperty("showButton", true, "measure");



    this.measure = function (boxModel) {


        boxModel.compute();


        var innerRect = boxModel.innerRect,
            imageRect = boxModel.imageRect;


        !imageRect && (imageRect = boxModel.imageRect = new flyingon.Rect());

        imageRect.x = innerRect.x;
        imageRect.y = innerRect.y;


        if (this["x:storage"].showButton)
        {
            innerRect.width -= 16;

            imageRect.canvasX = innerRect.canvasX + innerRect.width;
            imageRect.canvasY = innerRect.canvasY;

            imageRect.width = 16;
            imageRect.height = innerRect.height;
        }
        else
        {
            imageRect.width = 0;
            imageRect.height = 0;
        }
    };



    //绘制内框
    this.paint = function (context) {

        this.paintText(context);
        this.paintImage(context);
    };

    this.paintImage = function (context) {

        var imageRect = context.boxModel.imageRect;

        if (imageRect.width > 0)
        {
            context.fillStyle = "blue";
            context.fillRect(imageRect.canvasX, imageRect.canvasY, imageRect.width, imageRect.height);
        }
    };


});





﻿/// <reference path="../Base/Core.js" />
/// <reference path="Control.js" />


/*

*/
flyingon.class("TextBox", flyingon.TextBoxBase, function (Class, flyingon) {







});





﻿



﻿



﻿



﻿



﻿



﻿



﻿



﻿



﻿



﻿



﻿/// <reference path="../Base/Core.js" />
/// <reference path="Control.js" />


/*

*/
flyingon.class("PictureBox", flyingon.Control, function (Class, flyingon) {



    this.defineProperty("image", null, "invalidate|style");


    //绘制内框
    this.paint = function (context) {

        this.paintImage(context);
        this.paintText(context);
    };

    this.paintImage = function (context) {

        var image = this.image;

        if (image)
        {
            if (image.constructor == String && (image = flyingon.images[image]) == null)
            {
                return;
            }

            var r = context.boxModel.innerRect;
            context.drawImage(image, r.windowX, r.windowY);
        }
    };


});



﻿



﻿/// <reference path="../Base/Core.js" />
/// <reference path="Control.js" />


/*

*/
flyingon.class("ComboBox", flyingon.TextButtonBase, function (Class, flyingon) {



    this.defineProperty("items", []);



});





﻿/// <reference path="../Base/Core.js" />
/// <reference path="Control.js" />


/*

*/
flyingon.class("Memo", flyingon.ScrollableControl, function (Class, flyingon) {



    this.defaultValue("width", 200);

    this.defaultValue("height", 40);

    this.defaultValue("multiline", true);



    this.defineProperty("textWrap", false, "measure");




    TextBase.call(this, true);




});





﻿/*

*/
flyingon.class("Button", flyingon.Control, function (Class, flyingon) {



    this.defaultValue("width", 100);

    this.defaultValue("height", 21);


});





﻿/*

*/
flyingon.class("TextBlock", flyingon.Control, function (Class, flyingon) {



});





