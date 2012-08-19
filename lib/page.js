var fs = require('fs');
var myUtil = require('./util.js');


var DEFAULT_FOLDER = "";
var pageController = function(config){
    this.module = DEFAULT_FOLDER
    this.folder = DEFAULT_FOLDER;
    this.output = DEFAULT_FOLDER;
    myUtil.extend(this, config);
};
myUtil.extend(pageController.prototype, {
    collect: function(){
        var targetFolder = this.folder;
        this._pages = this._collect(targetFolder);
        return this._pages;
    },
    _collect: function(folder){
        var me = this;
        var pages = [];
        var files = fs.readdirSync(folder);
        files.forEach(function(item, i) {
            if(item.indexOf(".") === 0){
                return;
            }
            var path = folder + "/" + item;
            var fileStatus = fs.statSync(path);

            if (fileStatus.isDirectory()){
                pages = pages.concat(me._collect(path));
            }

            //这里其实最好判断一下文件类型
            else if ( fileStatus.isFile() ) {

                //旅游特色
                if(path.indexOf("success") >= 0){
                    var data = fs.readFileSync(path, "utf8");
                    var fileName = item.replace("-success.xhtml", ".tpl");
                    path = path.replace("-success.xhtml", ".tpl");
                    path = path.replace(me.folder, me.output + "/" + me.module + "/page/" + me.module);
                    pages.push({
                        path: path,
                        content: data,
                        fileName : fileName,
                        page: true
                    });
                }
            }
        });
        return pages;
    }
});

module.exports = pageController;