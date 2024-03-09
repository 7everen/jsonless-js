/*
 Copyright (c) 2024, Dmytro Lazarenko All Rights Reserved.
 Available via Apache License 2.0, see https://github.com/7everen/jsonless-js/blob/main/LICENSE for details.
 */
var miniExcludes = {
        "jsonless/README.md": 1,
        "jsonless/package": 1
    },
    isTestRe = /\/test\//;

var profile = {
    resourceTags: {
        test: function(filename, mid) {
            return isTestRe.test(filename);
        },

        miniExclude: function(filename, mid){
            return isTestRe.test(filename) || mid in miniExcludes;
        },

        amd: function(filename, mid){
            return /\.js$/.test(filename);
        }
    }
};