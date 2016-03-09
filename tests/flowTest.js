const should = require('chai').should();
const sinon = require('sinon');
const flow = require('../lib/flow.js')

describe('flow.js', function () {
    describe('flow.serial()', function () {
        it('should call callback if functions array is empty', function () {
            var spy = sinon.spy();
            flow.serial([], spy);
            spy.calledOnce.should.be.true;
        });
        it('should call callback after last function', function () {
            var spy = sinon.spy();
            flow.serial([function (next) {
                next();
            }], spy);
            spy.calledOnce.should.be.true;
        });
        it('should call callback with result of last function', function () {
            var spy = sinon.spy();
            flow.serial([function (next) {
                next(null, 'test');
            }], spy);
            spy.calledWithExactly(null, 'test').should.be.true;
        });
        it('should call callback with error if first function gets error', function () {
            var spy = sinon.spy();
            flow.serial([
                function (next) {
                    next('error', 'test');
                },
                function (data, next) {
                    next(null, data);
                }
            ], spy);
            spy.calledWithExactly('error', 'test').should.be.true;
        });
        it('should not call second function if first function gets error', function () {
            var spy = sinon.spy();
            flow.serial([
                function (next) {
                    next('error', 'test');
                },
                spy
            ], function() {});
            spy.notCalled.should.be.true;
        });
        it('should call second function if first funcion gets no error', function () {
            var spy = sinon.spy();
            flow.serial([
                function (next) {
                    next(null, 'test');
                },
                spy
            ], function() {});
            spy.calledOnce.should.be.true;
        });
        it('should call second function with result of first funcion', function () {
            var spy = sinon.spy();
            flow.serial([
                function (next) {
                    next(null, 'test');
                },
                spy
            ], function() {});
            spy.calledWith('test').should.be.true;
        });
        it('should call all functions', function () {
            var func1 = function (next) {
                next(null, 'test1');
            };
            var func2 = function (data, next) {
                next(null, 'test2');
            };
            var spy1 = sinon.spy(func1);
            var spy2 = sinon.spy(func2);
            flow.serial([
                spy1,
                spy2
            ], function () {});
            spy1.calledOnce.should.be.true;
            spy2.calledOnce.should.be.true;
        });

    });
    describe('flow.parallel()', function () {
        it('should call callback if functions array is empty', function () {
            var spy = sinon.spy();
            flow.parallel([], spy);
            spy.calledOnce.should.be.true;
        });
        it('should call callback after last function', function () {
            var spy = sinon.spy();
            flow.parallel([function (next) {
                next();
            }], spy);
            spy.calledOnce.should.be.true;
        });
        it('should call all functions', function () {
            var func1 = function (next) {
                next(null, 'test1');
            };
            var func2 = function (next) {
                next(null, 'test2');
            };
            var spy1 = sinon.spy(func1);
            var spy2 = sinon.spy(func2);
            flow.parallel([
                spy1,
                spy2
            ], function () {});
            spy1.calledOnce.should.be.true;
            spy2.calledOnce.should.be.true;
        });
        it('should call callback with results array', function () {
            var spy = sinon.spy();
            flow.parallel([
                function (next) {
                    next(null, 'test1');
                },
                function (next) {
                    next(null, 'test2');
                }
            ], spy);
            spy.calledWithExactly(null, ['test1', 'test2']).should.be.true;
        });
        it('should call callback with error if one of functions gets error', function () {
            var spy = sinon.spy();
            flow.parallel([
                function (next) {
                    next(null, 'test1');
                },
                function (next) {
                    next('error', 'test2');
                }
            ], spy);
            spy.calledWith('error').should.be.true;
        });
        it('should call all functions even if they get errors', function () {
            var func1 = function (next) {
                next('error', 'test1');
            };
            var func2 = function (next) {
                next('error', 'test2');
            };
            var spy1 = sinon.spy(func1);
            var spy2 = sinon.spy(func2);
            flow.parallel([
                spy1,
                spy2
            ], function () {});
            spy1.calledOnce.should.be.true;
            spy2.calledOnce.should.be.true;
        });
    });
    describe('flow.map()', function () {
        it('should call callback if values array is empty', function () {
            var spy = sinon.spy();
            flow.map([], function () {}, spy);
            spy.calledOnce.should.be.true;
        });
        it('should call callback after last value', function () {
            var spy = sinon.spy();
            flow.map([1, 2], function (value, next) {
                next(null, value);
            }, spy);
            spy.calledOnce.should.be.true;
        });
        it('should call callback with results array', function () {
            var spy = sinon.spy();
            flow.map([1, 2], function (value, next) {
                next(null, value);
            }, spy);
            spy.calledWithExactly(null, [1, 2]).should.be.true;
        });
        it('should call callback with error if function gets error', function () {
            var spy = sinon.spy();
            flow.map([1, 2], function (value, next) {
                next('error', value);
            }, spy);
            spy.calledWith('error').should.be.true;
        });
        it('should call function for all values', function () {
            var spy = sinon.spy();
            flow.map([1, 2], spy, function () {});
            spy.calledTwice.should.be.true;
        });
        it('should call function for all values even if it gets errors', function () {
            var func = function (value, next) {
                next('error', value);
            }
            var spy = sinon.spy(func);
            flow.map([1, 2], spy, function () {});
            spy.calledTwice.should.be.true;
        });
    });
});
