const should = require('chai').should();
const sinon = require('sinon');
const flow = require('../lib/flow.js');

function getAsync(func) {
    return function () {
        var args = [].slice.call(arguments);
        setTimeout(function () {
            func.apply(null, args);
        }, 0);
    }
}

describe('flow.js', function () {
    describe('flow.serial()', function () {
        it('should call callback if functions array is empty', function () {
            var spy = sinon.spy();

            flow.serial([], spy);
            spy.calledOnce.should.be.true;
        });

        it('should call callback after last function', function (done) {
            var spy = sinon.spy(function () {
                spy.calledOnce.should.be.true;
                spy.calledAfter(spyFunc).should.be.true;
                done();
            });
            var func = getAsync(function (next) {
                next();
            });
            var spyFunc = sinon.spy(func);

            flow.serial([spyFunc], spy);
        });

        it('should call callback with result of last function', function (done) {
            var spy = sinon.spy(function () {
                spy.calledWithExactly(null, 'test').should.be.true;
                done();
            });
            var func = getAsync(function (next) {
                next(null, 'test');
            });

            flow.serial([func], spy);
        });

        it('should call callback with error if first function gets error', function (done) {
            var spy = sinon.spy(function () {
                spy.calledWithExactly('error', null).should.be.true;
                done();
            });
            var func1 = getAsync(function (next) {
                next('error', 'test');
            });
            var func2 = getAsync(function (data, next) {
                next(null, data);
            });

            flow.serial([
                func1,
                func2
            ], spy);
        });

        it('should not call second function if first function gets error', function (done) {
            var spy = sinon.spy();
            var func = getAsync(function (next) {
                next('error', 'test');
            });

            flow.serial([
                func,
                getAsync(spy)
            ], function() {
                spy.notCalled.should.be.true;
                done();
            });
        });

        it('should call second function if first funcion gets no error', function (done) {
            var func1 = getAsync(function (next) {
                next(null, 'test');
            });
            var func2 = getAsync(function (data, next) {
                next(null, data);
            });
            var spy = sinon.spy(func2);

            flow.serial([
                func1,
                spy
            ], function() {
                spy.calledOnce.should.be.true;
                done();
            });
        });

        it('should call second function with result of first funcion', function (done) {
            var func1 = getAsync(function (next) {
                next(null, 'test');
            });
            var func2 = getAsync(function (data, next) {
                next(null, data);
            });
            var spy = sinon.spy(func2);

            flow.serial([
                func1,
                spy
            ], function() {
                spy.calledWith('test').should.be.true;
                done();
            });
        });

        it('should call all functions', function (done) {
            var func1 = getAsync(function (next) {
                next(null, 'test1');
            });
            var func2 = getAsync(function (data, next) {
                next(null, 'test2');
            });
            var spy1 = sinon.spy(func1);
            var spy2 = sinon.spy(func2);

            flow.serial([
                spy1,
                spy2
            ], function () {
                spy1.calledOnce.should.be.true;
                spy2.calledOnce.should.be.true;
                done();
            });
        });

        it('should call second function after first', function (done) {
            var func1 = getAsync(function (next) {
                next(null, 'test1');
            });
            var func2 = getAsync(function (data, next) {
                next(null, 'test2');
            });
            var spy1 = sinon.spy(func1);
            var spy2 = sinon.spy(func2);

            flow.serial([
                spy1,
                spy2
            ], function () {
                spy2.calledAfter(spy1).should.be.true;
                done();
            });
        });
    });

    describe('flow.parallel()', function () {
        it('should call callback if functions array is empty', function () {
            var spy = sinon.spy();

            flow.parallel([], spy);
            spy.calledOnce.should.be.true;
        });

        it('should call callback after last function', function (done) {
            var spy = sinon.spy(function () {
                spy.calledOnce.should.be.true;
                done();
            });
            var func = getAsync(function (next) {
                next();
            });

            flow.parallel([func], spy);
        });

        it('should call all functions', function (done) {
            var func1 = getAsync(function (next) {
                next(null, 'test1');
            });
            var func2 = getAsync(function (next) {
                next(null, 'test2');
            });
            var spy1 = sinon.spy(func1);
            var spy2 = sinon.spy(func2);

            flow.parallel([
                spy1,
                spy2
            ], function () {
                spy1.calledOnce.should.be.true;
                spy2.calledOnce.should.be.true;
                done();
            });
        });

        it('should call callback with results array', function (done) {
            var spy = sinon.spy(function () {
                spy.calledWithExactly(null, ['test1', 'test2']).should.be.true;
                done();
            });
            var func1 = getAsync(function (next) {
                next(null, 'test1');
            });
            var func2 = getAsync(function (next) {
                next(null, 'test2');
            });

            flow.parallel([
                func1,
                func2
            ], spy);
        });

        it('should call callback with error if one of functions gets error', function (done) {
            var spy = sinon.spy(function () {
                spy.calledWithExactly('error', ['test1', null]).should.be.true;
                done();
            });
            var func1 = getAsync(function (next) {
                next(null, 'test1');
            });
            var func2 = getAsync(function (next) {
                next('error', 'test2');
            });

            flow.parallel([
                func1,
                func2
            ], spy);
        });

        it('should call all functions even if they get errors', function (done) {
            var func1 = getAsync(function (next) {
                next('error', 'test1');
            });
            var func2 = getAsync(function (next) {
                next('error', 'test2');
            });
            var spy1 = sinon.spy(func1);
            var spy2 = sinon.spy(func2);

            flow.parallel([
                spy1,
                spy2
            ], function () {
                spy1.calledOnce.should.be.true;
                spy2.calledOnce.should.be.true;
                done();
            });
        });
    });
    describe('flow.map()', function () {
        it('should call callback if values array is empty', function () {
            var spy = sinon.spy();
            var func = getAsync(function () {});

            flow.map([], func, spy);
            spy.calledOnce.should.be.true;
        });

        it('should call callback after last value', function (done) {
            var spy = sinon.spy(function () {
                spy.calledOnce.should.be.true;
                done();
            });
            var func = getAsync(function (value, next) {
                next(null, value);
            });

            flow.map([1, 2], func, spy);
        });

        it('should call callback with results array', function (done) {
            var spy = sinon.spy(function () {
                spy.calledWithExactly(null, [1, 2]).should.be.true;
                done();
            });
            var func = getAsync(function (value, next) {
                next(null, value);
            });

            flow.map([1, 2], func, spy);
        });

        it('should call callback with error if function gets error', function (done) {
            var spy = sinon.spy(function () {
                spy.calledWithExactly('error', [null, null]).should.be.true;
                done();
            });
            var func = getAsync(function (value, next) {
                next('error', value);
            });

            flow.map([1, 2], func, spy);
        });

        it('should call function for all values', function (done) {
            var func = getAsync(function (value, next) {
                next(null, value);
            });
            var spy = sinon.spy(func);

            flow.map([1, 2], spy, function () {
                spy.calledTwice.should.be.true;
                done();
            });
        });

        it('should call function for all values even if it gets errors', function (done) {
            var func = function (value, next) {
                next('error', value);
            }
            var spy = sinon.spy(func);

            flow.map([1, 2], getAsync(spy), function () {
                spy.calledTwice.should.be.true;
                done();
            });
        });
    });
});
