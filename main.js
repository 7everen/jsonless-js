/*
 Copyright (c) 2024, Dmytro Lazarenko All Rights Reserved.
 Available via Apache License 2.0, see https://github.com/7everen/jsonless-js/blob/main/LICENSE for details.
 */
(function(define) {
    define([], function() {

        var SYMBOL = "$";

        var encode = function(objOrArr, options) {
            let symbol = options && options.symbol ? options.symbol : SYMBOL;
            let allProps = [];
            let allPropGroups = [];
            let encodedObj = encodeSingle(objOrArr, allProps, allPropGroups);
            let signature = [allProps.join(symbol)];
            for (const propGroup of allPropGroups) {
                signature.push(propGroup.join(symbol));
            }
            encodedObj.push(signature);
            return encodedObj;
        };

        function encodeSingle(objOrArr, allProps, allPropGroups) {
            let isObj = typeof objOrArr === 'object';
            let myPropGroup = [];
            let arr = [];
            if (isObj) {
                if (objOrArr instanceof Array) {
                    for (const element of objOrArr) {
                        let value = encodeSingle(element, allProps, allPropGroups);
                        arr.push(value);
                    }
                } else {
                    for (const prop in objOrArr) {
                        let index = allProps.indexOf(prop);
                        if (index === -1) {
                            index = allProps.length;
                            allProps.push(prop);
                        }
                        myPropGroup.push(index);
                        let value = encodeSingle(objOrArr[prop], allProps, allPropGroups);
                        arr.push(value);
                    }
                    let index = indexOfGroup(myPropGroup, allPropGroups);
                    if (index === -1) {
                        index = allPropGroups.length;
                        allPropGroups.push(myPropGroup);
                    }
                    arr.push("$" + index);
                }
            } else {
                return objOrArr;
            }
            return arr;
        }

        function indexOfGroup(myPropGroup, allPropGroups) {
            for (let i = 0; i < allPropGroups.length; i++) {
                const propGroup = allPropGroups[i];
                if (propGroup.length === myPropGroup.length) {
                    let y = 0;
                    for (; y < myPropGroup.length; y++) {
                        if (myPropGroup[y] !== propGroup[y]) {
                            break;
                        }
                    }
                    if (y === myPropGroup.length) {
                        return i;
                    }
                }
            }
            return -1;
        }

        var withoutSignature = function(encoded) {
            let arr = [];
            for (let i = 0; i < encoded.length - 1; i++) {
                arr.push(encoded[i]);
            }
            return arr;
        }

        var getSignature = function(encoded) {
            return encoded[encoded.length - 1];
        }

        var decode = function(encoded, options) {
            let symbol = options && options.symbol ? options.symbol : SYMBOL;
            let signatureInOptions = options && options.signature;
            let len = signatureInOptions ? encoded.length : encoded.length - 1;
            let signature = signatureInOptions ? options.signature : encoded[encoded.length - 1];
            let allProps = signature[0].split(symbol);
            let allPropGroups = [];
            for (let i = 1; i < signature.length; i++) {
                allPropGroups.push(signature[i].split(symbol));
            }
            let decodedObj = decodeSingle(encoded, len, allProps, allPropGroups, symbol);
            return decodedObj;
        };

        function decodeSingle(objOrArr, len, allProps, allPropGroups, symbol) {
            let lastElement = objOrArr[len - 1];
            if(typeof lastElement === 'string' && lastElement.startsWith(symbol)) {
                // encoded object
                let obj = {};
                let groupIndex = parseInt(lastElement.substring(1));
                let propIndexes = allPropGroups[groupIndex];
                for (let i = 0; i < len - 1; i++) {
                    let encodedValue = objOrArr[i];
                    let value;
                    if (typeof encodedValue === 'object') {
                        value = decodeSingle(encodedValue, encodedValue.length, allProps, allPropGroups, symbol);
                    } else {
                        value = encodedValue;
                    }
                    let key = allProps[propIndexes[i]];
                    obj[key] = value;
                }
                return obj;
            } else {
                let arr = [];
                for (let i = 0; i < len; i++) {
                    arr.push(objOrArr[i]);
                }
                return arr;
            }
        }
        
        return {
            encode : encode,
            withoutSignature: withoutSignature,
            getSignature: getSignature,
            decode : decode
        };
    });
})( typeof define == 'undefined' || !define.amd ? function(deps, factory) {
    var jsonless = factory();
    if ( typeof exports != 'undefined')
        for (var key in jsonless)
            exports[key] = jsonless[key];
    else
        window.jsonless = jsonless;
} : define);