/**
 * Created with JetBrains PhpStorm.
 * User: Administrator
 * Date: 12-8-9
 * Time: 下午6:51
 * To change this template use File | Settings | File Templates.
 */

var fs = require("fs");


var util = {
    extend : function (target, source) {
        var name;
        for (name in source) {
            if (source.hasOwnProperty(name)) {
                target[name] = source[name];
            }
        }
    },
    filter : function(array, fn){
        var result = [];
        array.forEach(function(item){
            if(fn(item)){
                result.push(item);
            }
        });
        return result;
    },
    writeFile: function(path, content){
        var paths = path.split("/");
        var dir = [];
        var i = 0;
        while(i != paths.length){
            dir.push(paths[i]);
            var dirPath = dir.join("/");
            if(i == paths.length - 1){
                fs.writeFileSync(dirPath, content);
            }
            else if(!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath);
            }
            i++;
        }
    }
};

module.exports = util;