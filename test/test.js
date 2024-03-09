/*
 Copyright (c) 2024, Dmytro Lazarenko All Rights Reserved.
 Available via Apache License 2.0, see https://github.com/7everen/jsonless-js/blob/main/LICENSE for details.
 */
'use strict';

describe('jsonless', function() {

    var assert = require('assert'),
        expect = require('expect.js'),
        jsonless = require('../main.js');

    var object1 = {
        "gid": "0022300759",
        "htm": {
            "Assists": 7,
            "AssistsTurnoverRatio": 2.33333333333333,
            "BlocksReceived": 1
        },
        "players": {
            "201143": {
                "Assists": [1,2,3,4],
                "AssistsTurnoverRatio": 0,
                "BlocksReceived": 1
            },
            "201567": {
                "Assists": 2,
                "AssistsTurnoverRatio": 0,
                "BlocksReceived": 3
            }
        }
    };

    var object1Encoded = [
        "0022300759",
        [7,2.33333333333333,1,"$0"],
        [
            [[1,2,3,4],0,1,"$0"],
            [2,0,3,"$0"],
            "$1"
        ],
        "$2",
        [
        "gid$htm$Assists$AssistsTurnoverRatio$BlocksReceived$players$201143$201567",
            "2$3$4",
            "6$7",
            "0$1$5"
        ]
    ];

    var object2Encoded = [
        "0022300759",
        "$0",
        ["gid","0"]
    ];

    var object1EncodedWithoutSignature = [
        "0022300759",
        [7,2.33333333333333,1,"$0"],
        [
            [[1,2,3,4],0,1,"$0"],
            [2,0,3,"$0"],
            "$1"
        ],
        "$2"
    ];

    var object1EncodedSignature = [
        "gid$htm$Assists$AssistsTurnoverRatio$BlocksReceived$players$201143$201567",
        "2$3$4",
        "6$7",
        "0$1$5"
    ];

    var object2 = {
        "gid": "0022300759"
    };

    //var options = {"symbol": "$"};

    describe('encode', function() {

        it('encode object1', function() {
            expect(jsonless.encode(object1)).to.eql(object1Encoded);
        });

        it('get encoded object1 without signature', function() {
            expect(jsonless.withoutSignature(object1Encoded)).to.eql(object1EncodedWithoutSignature);
        });

        it('get signature of encoded object1', function() {
            expect(jsonless.getSignature(object1Encoded)).to.eql(object1EncodedSignature);
        });

        it('encode object2', function() {
            expect(jsonless.encode(object2)).to.eql(object2Encoded);
        });

    });

    describe('decode', function() {

        it('decode object1', function() {
            expect(jsonless.decode(object1Encoded)).to.eql(object1);
        });

        it('decode object1 with signature in options', function() {
            var options = {"signature": object1EncodedSignature};
            expect(jsonless.decode(object1EncodedWithoutSignature, options)).to.eql(object1);
        });

        it('decode object2', function() {
            expect(jsonless.decode(object2Encoded)).to.eql(object2);
        });

    });

});