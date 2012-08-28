/**
 * Created with JetBrains PhpStorm.
 * User: Administrator
 * Date: 12-8-13
 * Time: 下午1:00
 * To change this template use File | Settings | File Templates.
 */

var fs = require('fs');
var myUtil = require('./util.js');

var DEFAULT_FOLDER = "";
var imgController = function(config){
    this.module = DEFAULT_FOLDER
    this.folder = DEFAULT_FOLDER;
    this.output = DEFAULT_FOLDER;
    myUtil.extend(this, config);
    this.collect();
};
myUtil.extend(imgController.prototype, {
    collect: function(){
        var targetFolder = this.folder + "/static/img"
        this._imgInfo = this._collect(targetFolder);
        return this._imgInfo;
    },
    _collect: function(folder){
        var me = this;
        var imgs = [];
        var files = fs.readdirSync(folder);
        files.forEach(function(item, i) {
            if(item.indexOf(".") === 0){
                return;
            }
            var path = folder + "/" + item;
            var fileStatus = fs.statSync(path);

            if (fileStatus.isDirectory()){
                imgs = imgs.concat(me._collect(path));
            }

            //这里其实最好判断一下文件类型是css
            else if ( fileStatus.isFile() ) {
                var data = fs.readFileSync(path);
                var imgPath = path.replace(me.folder, "/" + me.module);

                imgs.push({
                    path: imgPath,
                    data: data,
                    picName : item
                });
            }
        });
        return imgs;
    },
    /*
     *
     path: path,
     content: data,
     classes: classes
     * **/
    addwidgetDepends: function(widgetInfo){
        var  me = this;
        var path = widgetInfo.path;
        var cssFile, cssContent, widgetContent;

        widgetContent = widgetInfo.content;
        var isPage = (path.indexOf(".tpl") >= 0);
        if(isPage){
            var pageName = widgetInfo.fileName.replace(".tpl", "");
            cssFile = me.output + "/" + me.module + "/static/" + me.module + "/" + pageName + "/"
                + pageName + ".css";
        }
        else {
            var widgetName = widgetInfo.fileName.replace(".xhtml", "");
            var dir = me.output + "/" + me.module + "/widget/" + me.module + "/" + widgetName;
            cssFile = dir + "/" + widgetName + ".css";
        }
        if(fs.existsSync(cssFile)){
            cssContent = fs.readFileSync(cssFile, "utf8");
        }
        this._imgInfo.forEach(function(imgInfo){
            var imgPath = imgInfo.path;
            if(widgetContent.indexOf(imgPath) >= 0
                || (cssContent && cssContent.indexOf(imgPath) >= 0)){
                if(!imgInfo.widgetDepends){
                    imgInfo.widgetDepends = [];
                }
                imgInfo.widgetDepends.push(path);
            }
        });
    },
    createImgForce: function(){
       var imgsInfo = this._imgInfo;
        var me = this;
        imgsInfo.forEach(function(imgInfo){
            imgInfo.widgetDepends && imgInfo.widgetDepends.forEach(function(path){
                var imgFolderPath;
                var isPage = path.indexOf(".tpl") >= 0;
                if(!isPage) {
                    var widgetName = (path.split('/').pop()).replace(".xhtml", "");
                    imgFolderPath = me.output + "/" + me.module + "/widget/" + me.module + "/" + widgetName + "/img/";
                }
                else {
                    var pageName = (path.split('/').pop()).replace(".tpl", "");

                    imgFolderPath = me.output + "/" + me.module + "/static/" + me.module + "/" + pageName + "/img/";
                }
                myUtil.writeFile(imgFolderPath + imgInfo.picName, imgInfo.data);
            });
        });
    },
    createImg: function(){
        var usedInSingle = myUtil.filter(this._imgInfo, function(imgInfo){
            return imgInfo.widgetDepends && imgInfo.widgetDepends.length == 1;
        });

        this._createImgUsedInSingle(usedInSingle);
        var usedInMulti = myUtil.filter(this._imgInfo, function(imgInfo){
            return imgInfo.widgetDepends && imgInfo.widgetDepends.length > 1;
        });

        this._createImgUsedInMulti(usedInMulti);

        var noneUsed = myUtil.filter(this._imgInfo, function(imgInfo){
            return !imgInfo.widgetDepends;
        });

        this._createImgNoneUsed(noneUsed);
    },
    _createImgUsedInSingle: function(usedInSingle){
        var me = this;
        usedInSingle.forEach(function(imgInfo){
            var path = imgInfo.widgetDepends[0], imgFolderPath;
            var isPage = path.indexOf(".tpl") >= 0;
            if(!isPage) {
                var widgetName = (path.split('/').pop()).replace(".xhtml", "");
                imgFolderPath = me.output + "/" + me.module + "/widget/" + me.module + "/" + widgetName + "/img/";
            }
            else {
                var pageName = (path.split('/').pop()).replace(".tpl", "");

                imgFolderPath = me.output + "/" + me.module + "/static/" + me.module + "/" + pageName + "/img/";
            }
            myUtil.writeFile(imgFolderPath + imgInfo.picName, imgInfo.data);
        });
    },
    _createImgUsedInMulti: function(usedInMulti){
        var me = this;
        usedInMulti.forEach(function(imgInfo){
            var imgFolderPath = me.output + "/" + me.module + "/static/" + me.module + "/ui/img/";
            myUtil.writeFile(imgFolderPath + imgInfo.picName, imgInfo.data);
        });
    },
    _createImgNoneUsed: function(noneUsed){
        var me = this;
        noneUsed.forEach(function(imgInfo){
            var imgFolderPath = me.output + "/" + me.module + "/static/" + me.module + "/ui/img/none-used/";
            myUtil.writeFile(imgFolderPath + imgInfo.picName, imgInfo.data);
        });
    },
    replace: function(widgetInfo){
        var  me = this;
        var widgetName = widgetInfo.fileName.replace(".xhtml", "");
        var dir = me.output + "/" + me.module + "/widget/" + me.module + "/" + widgetName;
        var cssContent, widgetContent;
        var cssFile;
        var widgetFile;
        if(widgetInfo.page){
            widgetFile = widgetInfo.path;
            var path = widgetInfo.path;
            var pageName = (path.split("/").pop()).replace(".tpl", "");
            cssFile = path.replace("page", "static").replace(".tpl", "") + "/" + pageName + ".css";
        }
        else{
            widgetFile = dir + "/" + widgetName + ".tpl";
            cssFile = dir + "/" + widgetName + ".css";
        }
        if(fs.existsSync(cssFile)){
            cssContent = fs.readFileSync(cssFile, "utf8");
        }
        if(fs.existsSync(widgetFile)){
            widgetContent = fs.readFileSync(widgetFile, "utf8");
        }
        this._imgInfo.forEach(function(imgInfo){
            var imgPath = imgInfo.path;
            var replaceImgPath = "./img/" + imgPath.split("/").pop();
            var commonImgPath = "/static/" + me.module + "/" + "ui" + "/" + "img/" + imgPath.split("/").pop();
            if(!widgetContent){
                console.log(widgetFile);
            }
            if(widgetContent && widgetContent.indexOf(imgPath) >= 0
                || (cssContent && cssContent.indexOf(imgPath) >= 0)){
                var replace = function(content){
                    if(imgInfo.widgetDepends && imgInfo.widgetDepends.length == 1){

                        //图片和widget,css一对一的情况
                        while(content.indexOf(imgPath) >= 0){
                            content = content.replace(imgPath, replaceImgPath);
                        }
                    }
                    else if(imgInfo.widgetDepends && imgInfo.widgetDepends.length > 1){

                        //图片和widget,css一对多的情况
                        while(content.indexOf(imgPath) >= 0){
                            content = content.replace(imgPath, commonImgPath);
                        }
                    }
                    else {
                        //由于之前的检查，这个分支基本无意义。
                    }
                    return content;
                };

                if(cssContent){
                    cssContent = replace(cssContent);
                    fs.writeFileSync(cssFile, cssContent);
                }

                if(widgetContent){
                    widgetContent = replace(widgetContent);
                    fs.writeFileSync(widgetFile, widgetContent);
                }
            }
        });
    }

});

module.exports = imgController;