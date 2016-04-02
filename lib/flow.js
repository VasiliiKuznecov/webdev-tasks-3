'use strict';

module.exports.serial = function (functions, callback) {
    if (functions.length === 0) {
        callback(new Error('empty functions'), null);
        return;
    }
    var functionIndex = 0;
    var serialCallback = function (error, data) {
        functionIndex++;
        if (error || functionIndex === functions.length) {
            callback(error, error? null : data);
            return;
        }
        functions[functionIndex](data, serialCallback);
    };
    functions[0](serialCallback);
};

module.exports.parallel = function (functions, callback) {
    if (functions.length === 0) {
        callback(new Error('empty functions'), null);
        return;
    }
    var functionsCount = 0;
    var errorAll = null;
    var resultArray = [];
    var parallelCallback = function (error, data) {
        errorAll = error;
        resultArray[functionsCount] = error? null : data;
        functionsCount++;
        if (functionsCount === functions.length) {
            callback(errorAll, resultArray);
        }
    };
    functions.forEach(function (func) {
        func(parallelCallback);
    });
};


module.exports.map = function (values, func, callback) {
    if (values.length === 0) {
        callback(new Error('empty values'), null);
        return;
    }
    var functionsCount = 0;
    var errorAll = null;
    var resultArray = [];
    var parallelCallback = function (error, data) {
        errorAll = error;
        resultArray[functionsCount] = error? null : data;
        functionsCount++;
        if (functionsCount === values.length) {
            callback(errorAll, resultArray);
        }
    };
    values.forEach(function (value) {
        func(value, parallelCallback);
    });
};
