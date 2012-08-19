/**
 * Created with JetBrains PhpStorm.
 * User: Administrator
 * Date: 12-8-15
 * Time: 下午9:47
 * To change this template use File | Settings | File Templates.
 */

var fs = require("fs");
var querystring = require('querystring');
var http = require('http');
var myUtil = require("./util.js");

var builder = {
    init: function(config){
        myUtil.extend(this, config);
    },
    _translate: function(fileContent, callback){

        var post_domain = 'wangcheng.fe.baidu.com';
        var post_port = 80;
        var post_path = '/FirekylinTranslate/TranslateAction.php';

        var post_data = querystring.stringify({
            'widget': "force",
            'code' : fileContent
        });

        var post_options = {
            host: post_domain,
            port: post_port,
            path: post_path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': post_data.length
            }
        };

        var targetContent = "";
        var post_req = http.request(post_options, function(res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                targetContent += chunk;

            });
            res.on("end", function(){
                if(/fissuccess/.test(targetContent)){
                    callback(targetContent.replace("fissuccess:",""));
                }
            });
        });

        // write parameters to post body
        post_req.write(post_data);
        post_req.end();
    },

    translate: function(widgetInfos, callback){
        var me = this;
        console.log("开始翻译模板");
        var count = 0;
        widgetInfos.forEach(function(item, i){
            var widgetContent = item.content;
            var dir;

            //处理页面
            if(item.page) {

                dir = item.path;
                console.log(dir);

            }

            //处理widget
            else {
                var widgetName = item.fileName.replace(".xhtml", "");
                dir = me.output + "/" + me.module + "/widget/" + me.module + "/" + widgetName
                    + "/" + widgetName +".tpl";
            }
            me._translate(widgetContent, function(smartyContent){
                if(item.page){
                    console.log(dir);
                }
                myUtil.writeFile(dir, smartyContent);
                count++;
                if(count == widgetInfos.length){
                    console.log("翻译模板结束");
                    callback();
                }
            });
        });
    }
};

module.exports = builder;