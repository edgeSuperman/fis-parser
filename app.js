/**
 * Created with JetBrains PhpStorm.
 * User: Administrator
 * Date: 12-8-10
 * Time: 上午10:30
 * To change this template use File | Settings | File Templates.
 */

var FisController = require("./lib/fis.js");

var fisController = new FisController({
    module: "notes",
    folder: "D:\/svn\/notes\/notes",
    output: "./output"
});

fisController.start();