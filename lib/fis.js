var fs = require("fs");
var myUtitl = require("./util.js");
var DEFAULT_FOLDER = "";
var defaultOuput = "./output";
var CssController = require("./css.js");
var WidgetController = require("./widget.js");
var ImgController = require("./img.js");
var PageController = require("./page.js");
var translator = require('./translate.js');


var fisController = function(config){
    this.module = DEFAULT_FOLDER
    this.folder = DEFAULT_FOLDER;
    this.output = defaultOuput;
    myUtitl.extend(this, config);

    this._widgetController = new WidgetController(config);
    this._pageController = new PageController(config);
    this._cssController = new CssController(config);
    this._imgController = new ImgController(config);
    translator.init(config);

};
myUtitl.extend(fisController.prototype, {
    start: function(){
        var me = this;
        //创建基础结构框架

        console.log("创建基础文件夹结构开始");
        this._createStructure();
        console.log("创建基础文件夹结构结束");

        console.log("开始搜集widget信息");
        var widgetInfos = this._widgetController.collect();
        var pageInfos = this._pageController.collect();


        widgetInfos = widgetInfos.concat(pageInfos);


        console.log("搜集widget信息结束");
        console.log("开始翻译");

        translator.translate(widgetInfos, function(){

            console.log("开始img路径替换");
            widgetInfos.forEach(function(item, i){
                me._imgController.replace(item);
            });
        });




        console.log("为css添加widget依赖信息");
        widgetInfos.forEach(function(item){
            me._cssController.addwidgetDepends(item);
        });

        console.log("开始创建css文件");
        this._cssController.createCssFile();
        console.log("创建css文件结束");

        console.log("为图片添加widget依赖信息");
        widgetInfos.forEach(function(item){
            me._imgController.addwidgetDepends(item);
        });

        console.log("开始创建图片文件")
        this._imgController.createImg();
    },
    _createStructure: function(){
        var me = this;
        var folders = ["config", "static", "widget", "page"];
        if(!fs.existsSync(this.output)){
            fs.mkdirSync(this.output);
        }
        fs.mkdirSync(this.output + "/" + this.module );
        folders.forEach(function(item){
            fs.mkdirSync(me.output + "/" + me.module + "/" + item );

            if(item == "config"){
                return;
            }
            fs.mkdirSync(me.output + "/" + me.module + "/" + item + "/" + me.module );
        });
    }
});


module.exports = fisController;