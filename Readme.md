fis-parser
============================

fis-parser专门为百度旅游fis迁移所使用，从火麒麟到FIS模块的翻译工具。

简单用法
--------

```javascript
    var FisController = require("./lib/fis.js");

    var fisController = new FisController({
        module: "notes",   //模块名
        folder: "D:\/svn\/notes\/notes", //模块模板目录，非根目录，根目录下一级
        output: "./output" //翻译后的文件目录，先简单支持，如果事先存在会报错，指定一个要创建目录
    });

    fisController.start();
