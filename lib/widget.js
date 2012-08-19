/**
 * Created with JetBrains PhpStorm.
 * User: Administrator
 * Date: 12-8-9
 * Time: 上午12:02
 * To change this template use File | Settings | File Templates.
 */

var fs = require("fs");
var querystring = require('querystring');
var http = require('http');
var myUtil = require("./util.js");
var widgetBuilder = require('./translate.js');

var DEFAULT_FOLDER = "";

var widgetController = function(config){
    this.module = DEFAULT_FOLDER
    this.folder = DEFAULT_FOLDER;
    this.output = DEFAULT_FOLDER;
    myUtil.extend(this, config);
};
myUtil.extend(widgetController.prototype, {
    collect: function(callback){
        var targetFolder = this.folder + "/widget/";
        this._widgetPaths = this._collect(targetFolder);
        return this._widgetPaths;
    },
    _collect: function(folder){
        var me = this;
        var widgetPath = [];
        var files = fs.readdirSync(folder);
        files.forEach(function(item, i) {
            if(item.indexOf(".") === 0){
                return;
            }
            var path = folder + "/" + item;
            var fileStatus = fs.statSync(path);

            if (fileStatus.isDirectory()){
                widgetPath = widgetPath.concat(me._collect(path));
            }

            //这里其实最好判断一下文件类型是xhtml
            else if ( fileStatus.isFile() ) {
                var data = fs.readFileSync(path, "utf8");
                widgetPath.push({
                    fileName: item,
                    path: path,
                    content: data
                });
            }
        });
        return widgetPath;
    }
});

module.exports = widgetController;