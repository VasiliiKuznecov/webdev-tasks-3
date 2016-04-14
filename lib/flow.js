'use strict';

module.exports.serial = function (functions, callback) {
    if (functions === undefined || callback === undefined) {
        callback(new Error('undefined args'), null);

        return;
    }

    if (!isFunctionsArray(functions)) {
        callback(new Error('not functions array'), null);

        return;
    }

    if (functions.length === 0) {
        callback(null, null);

        return;
    }

    var functionIndex = 0;
    var serialCallback = function (error, data) {
        functionIndex++;
        if (error || functionIndex === functions.length) {
            callback(error, error ? null : data);

            return;
        }
        functions[functionIndex](data, serialCallback);
    };

    functions[0](serialCallback);
};

module.exports.parallel = function (functions, callback) {
    if (functions === undefined || callback === undefined) {
        callback(new Error('undefined args'), null);

        return;
    }

    if (!isFunctionsArray(functions)) {
        callback(new Error('not functions array'), null);

        return;
    }

    if (functions.length === 0) {
        callback(null, null);

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

function isFunctionsArray (object) {
    if (!isArray(object)) {
        return false;
    }

    for (var i = 0; i < object.length; i++) {
        if (!(object[i] instanceof Function)) {
            return false;
        }
    }

    return true;
}

function isArray (object) {
    return (typeof object === 'object') && (object instanceof Array);
}


module.exports.map = function (values, func, callback) {
    if (values === undefined || func === undefined || callback === undefined) {
        callback(new Error('undefined args'), null);

        return;
    }

    if (!isArray(values)) {
        callback(new Error('values is not array'), null);

        return;
    }

    if (values.length === 0) {
        callback(null, null);

        return;
    }

    var functions = values.map(function (value) {
       return (callback) => {
           func(value, callback);
       };
    });

    module.exports.parallel(functions, callback);
};
