/*
 Copyright (c) 2024, Dmytro Lazarenko All Rights Reserved.
 Available via Apache License 2.0, see https://github.com/7everen/jsonless-js/blob/main/LICENSE for details.
 */
(function(define) {
    define([], function() {

        var encode = function(objOrArr, options) {
            let variantFields = options && options.variantFields;
            let variantFieldMap;
            if (variantFields) {
                variantFieldMap = new Map();
                for (let i = 0; i < variantFields.length; i++) {
                    variantFieldMap.set(variantFields[i], new Map());
                }
            }
            let allProps = new Map();
            let allPropGroups = [];
            let encodedObj = encodeSingle(objOrArr, allProps, allPropGroups, variantFieldMap);
            let allPropsArr = new Array(allProps.size);
            for (let [prop, index] of allProps.entries()) {
                allPropsArr[index] = prop;
            }
            if (variantFieldMap && variantFieldMap.size) {
                allPropsArr.push(variantFieldMap.size);
            }
            let signature = [allPropsArr];
            if (variantFields) {
                for (let i = 0; i < variantFields.length; i++) {
                    let map = variantFieldMap.get(variantFields[i]);
                    let variants = new Array(map.size);
                    for (let [value, index] of map.entries()) {
                        variants[index] = value;
                    }
                    variants.push(i);
                    signature.push(variants);
                }
            }
            for (const propGroup of allPropGroups) {
                signature.push(propGroup);
            }
            encodedObj.push(signature);
            return encodedObj;
        };

        function encodeSingle(objOrArr, allProps, allPropGroups, variantFieldMap) {
            let myPropGroup = [];
            let arr = [];
            if (objOrArr instanceof Array) {
                for (const element of objOrArr) {
                    if (typeof element === 'object') {
                        arr.push(encodeSingle(element, allProps, allPropGroups, variantFieldMap));
                    } else {
                        arr.push(element);
                    }
                }
                arr.push(0);
            } else {
                for (const prop in objOrArr) {
                    let index = allProps.get(prop);
                    if (index === undefined) {
                        index = allProps.size;
                        allProps.set(prop, index);
                    }
                    myPropGroup.push(index);
                    let value = objOrArr[prop];
                    if (typeof value === 'object') {
                        value = encodeSingle(value, allProps, allPropGroups, variantFieldMap);
                    }
                    if (variantFieldMap) {
                        let mapOfValueAndIndex = variantFieldMap.get(prop);
                        if (mapOfValueAndIndex && typeof value !== 'object') {
                            let index = mapOfValueAndIndex.get(value);
                            if (index === undefined) {
                                index = mapOfValueAndIndex.size;
                                mapOfValueAndIndex.set(value, index);
                            }
                            value = index;
                        }
                    }
                    arr.push(value);
                }
                let index = indexOfGroup(myPropGroup, allPropGroups);
                if (index === -1) {
                    index = allPropGroups.length;
                    allPropGroups.push(myPropGroup);
                }
                arr.push(index + 1);
            }
            return arr;
        }

        function indexOfGroup(myPropGroup, allPropGroups) {
            for (let i = 0; i < allPropGroups.length; i++) {
                const propGroup = allPropGroups[i];
                if (propGroup.length !== myPropGroup.length) continue;
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
            let signatureInOptions = options && options.signature;
            let len = signatureInOptions ? encoded.length : encoded.length - 1;
            let signature = signatureInOptions ? options.signature : encoded[encoded.length - 1];
            let pos = 0;
            let allProps = signature[pos];
            pos += 1;
            let lastSigElement = allProps[allProps.length - 1];
            let variantFieldMap;
            if (typeof lastSigElement === 'number') {
                allProps.pop();
                variantFieldMap = new Map();
                for (let i = pos; i < pos + lastSigElement; i++) {
                    let variants = signature[i];
                    let len = variants.length;
                    let fieldName = allProps[variants[len - 1]];
                    let valuesArr = new Array(len - 1);
                    for (let j = 0; j < len - 1; j++) {
                        valuesArr[j] = variants[j];
                    }
                    variantFieldMap.set(fieldName, valuesArr);
                }
                pos += lastSigElement;
            }
            let allPropGroups = [];
            for (let i = pos; i < signature.length; i++) {
                allPropGroups.push(signature[i]);
            }

            return decodeSingle(encoded, len, allProps, allPropGroups, variantFieldMap);
        };

        function decodeSingle(objOrArr, len, allProps, allPropGroups, variantFieldMap) {
            let groupIndex = objOrArr[len - 1];
            if(groupIndex) {
                // encoded object
                let obj = {};
                let propIndexes = allPropGroups[groupIndex - 1];
                for (let i = 0; i < len - 1; i++) {
                    let encodedValue = objOrArr[i];
                    let key = allProps[propIndexes[i]];
                    let value;
                    if (typeof encodedValue === 'object') {
                        value = decodeSingle(encodedValue, encodedValue.length, allProps, allPropGroups, variantFieldMap);
                    } else if (typeof encodedValue === 'number' && variantFieldMap){
                        let valuesArr = variantFieldMap.get(key);
                        if (valuesArr !== undefined) {
                            value = valuesArr[encodedValue];
                        } else {
                            value = encodedValue;
                        }
                    } else {
                        value = encodedValue;
                    }
                    obj[key] = value;
                }
                return obj;
            } else {
                let arr = [];
                for (let i = 0; i < len - 1; i++) {
                    let encodedValue = objOrArr[i];
                    let value;
                    if (typeof encodedValue === 'object') {
                        value = decodeSingle(encodedValue, encodedValue.length, allProps, allPropGroups, variantFieldMap);
                    } else {
                        value = encodedValue;
                    }
                    arr.push(value);
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