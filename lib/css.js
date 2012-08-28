"use strict";
/**
 * Created with JetBrains PhpStorm.
 * User: dang
 * Date: 12-8-8
 * Time: 下午3:39
 * 作用是将一个文件夹里所有css混成一个.
 */


var REG_CLASS_MATCH = /class="([^"]*)"/gi;
var myUtil = require("./util.js");

//文件系统操作的对象
var fs = require("fs");



var cssmin = require("./cssmin.js");

//解析css方法
var parse = require('./parser.js');


var cssBuilder = {
    join: function(cssInfo){
        var result = []
        var selectors = cssInfo.selectors.join(",");
        result.push(selectors);
        result.push("{");
        if(!cssInfo.declarations){
            console.log("请注意此class内的css写法，引擎未正常读出结构化数据", cssInfo);
            return "";
        }

        cssInfo.declarations.forEach(function(item) {
            result.push(["\n    ", item.property, ":", item.value, ";"].join(""));
        });
        result.push("\n}");
        return result.join("");
    },
    comment: function(msg){
        return  "/*" + msg + "*/";
    },
    filterComment: function(content){
        return cssmin(content);
    }
};


var DEFAULT_FOLDER = "";
var cssController = function (config) {
    this.folder = DEFAULT_FOLDER;
    this.module = DEFAULT_FOLDER;
    this.output = DEFAULT_FOLDER;
    myUtil.extend(this, config);
    this._merge();
};


myUtil.extend(cssController.prototype, {
    _merge: function() {
        this._allRules = this._mergeFolder(this.folder + "/static/css/");
        this._allRules = myUtil.filter(this._allRules, function(item){
            return !!item.selectors;
        });
        return this._allRules;

    },
    _getAllRules: function () {
        return this._allRules || [];
    },
    _mergeFolder: function (folder){
        var me = this;
        var cssRules = [];
        var files = fs.readdirSync(folder);
        files.forEach(function(item, i) {
            if(item.indexOf(".") === 0){
                return;
            }
            var path = folder + "/" + item;
            var fileStatus = fs.statSync(path);

            if (fileStatus.isDirectory()){
                cssRules = cssRules.concat(me._mergeFolder(path));
            }

            //这里其实最好判断一下文件类型是css
            else if ( fileStatus.isFile() ) {
                var data = fs.readFileSync(path, "utf8");

                //过滤注释, 因为这个解析css的引擎支持注释支持的不好
                data = cssBuilder.filterComment(data);
                var parseResult = parse(data);

                cssRules = cssRules.concat(parseResult.stylesheet.rules);
            }
        });
        return cssRules;
    },

    //添加依赖列表，将这个widget加进去
    addwidgetDepends: function (widgetInfo) {
        var cssClazzes = this._findCssClasses(widgetInfo.content);
        var widgetPath = widgetInfo.path;
        var allRules = this._getAllRules();
        allRules.forEach(function (cssInfo){

            var collectedSelectors = [];
            cssInfo.selectors.forEach(function(selector){
                collectedSelectors = collectedSelectors.concat(selector.split(/\s/));
            });
            cssClazzes.forEach(function(cssClaszz) {

                //说明含有这个class
                if (collectedSelectors.indexOf("." + cssClaszz) >= 0) {

                    //添加依赖列表，将这个widget加进去
                    cssInfo.widgetDepends = cssInfo.widgetDepends || [];
                    if(cssInfo.widgetDepends.indexOf(widgetPath) < 0){

                        cssInfo.widgetDepends.push(widgetPath);
                    }
                }
            });
        });
    },

    _findCssClasses: function(data){
        var classes = [];
        while (true) {
            var result = REG_CLASS_MATCH.exec(data);
            if (!result) {
                break;
            }
            result = result[1].split(/\s/);
            classes = classes.concat(result);
        }
        return classes;
    },
    createCssFileForce: function(){
        var allRules = this._getAllRules();
        var me = this;
        var map = {};
        allRules.forEach(function(item){
            item.widgetDepends && item.widgetDepends.forEach(function(widgetPath){
                map[widgetPath] = map[widgetPath] || [];
                map[widgetPath].push(item);
            });
        });
        for(var path in map){
            var isPage = (path.indexOf(".tpl") >= 0);
            var w = path.split('/').pop();
            var widgetName = w.replace(".xhtml","");
            var cssPath;
            if(!isPage){
                cssPath = me.output + "/" + this.module + "/widget/" + me.module + "/" + widgetName + "/" + widgetName + ".css";
            }
            else {
                var pageName = (path.split("/").pop()).replace(".tpl", "");
                cssPath = path.replace("page", "static").replace(".tpl", "") + "/" + pageName + ".css";
            }
            var cssInfosInOneWidget = map[path];
            var cssContent = [];
            cssContent.push(cssBuilder.comment(cssPath));
            cssContent.push(cssBuilder.comment("auto create by danghongyang's program"));
            cssInfosInOneWidget.forEach(function(item){
                cssContent.push(cssBuilder.join(item));
            });
            myUtil.writeFile(cssPath , cssContent.join("\n\r"));
        }
    },
    createCssFile: function(){
        var allRules = this._getAllRules();

        //没有widget引用 可能就是页面级别的css
        var usedInPage = myUtil.filter(allRules, function(item){
            return item.widgetDepends && item.widgetDepends.length === 0;
        });

        this._createCssUsedInPage(usedInPage);

        //只有一个widget引用，需要写在widget同目录的css
        var usedInSingleWidget = myUtil.filter(allRules, function(item){
            return item.widgetDepends && item.widgetDepends.length === 1;
        });

        this._createCssUsedInSingleWidget(usedInSingleWidget);

        //两个以上的widget引用, 需要写在static/module里边
        var usedInMultiWidget = myUtil.filter(allRules, function(item){
            return item.widgetDepends && item.widgetDepends.length > 1;
        });

        this._createCssUsedInMultiWidget(usedInMultiWidget);
    },
    _createCssUsedInPage: function(cssInfos){

        //todo 为了page的css
    },
    _createCssUsedInSingleWidget: function(cssInfos){
        var me = this;
        var map = {};
        cssInfos.forEach(function(item){
            var widgetPath = item.widgetDepends[0];
            map[widgetPath] = map[widgetPath] || [];
            map[widgetPath].push(item);
        });
        for(var path in map){

            var isPage = (path.indexOf(".tpl") >= 0);

            var w = path.split('/').pop();
            var widgetName = w.replace(".xhtml","");
            var cssPath;
            if(!isPage){
                cssPath = me.output + "/" + this.module + "/widget/" + me.module + "/" + widgetName + "/" + widgetName + ".css";
            }
            else {
                var pageName = (path.split("/").pop()).replace(".tpl", "");
                cssPath = path.replace("page", "static").replace(".tpl", "") + "/" + pageName + ".css";
            }
            var cssInfosInOneWidget = map[path];
            var cssContent = [];
            cssContent.push(cssBuilder.comment(cssPath));
            cssContent.push(cssBuilder.comment("auto create by danghongyang's program"));
            cssInfosInOneWidget.forEach(function(item){
                cssContent.push(cssBuilder.join(item));
            });
            myUtil.writeFile(cssPath , cssContent.join("\n\r"));
        }
    },

    //todo 定死了就写在css-common.css里
    _createCssUsedInMultiWidget: function(cssInfos){
        var cssContent = [];
        cssInfos.forEach(function(item){
            cssContent.push(cssBuilder.comment("used in " + item.widgetDepends.join("\n    ")));
            cssContent.push(cssBuilder.join(item));
        });
        myUtil.writeFile(this.output +"/" + this.module + "/static/" + this.module + "/ui/css-common/css-common.css", cssContent.join("\n\r"));
    },
    replace: function(){

    }

});

module.exports = cssController;
