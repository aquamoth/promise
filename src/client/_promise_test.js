// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global define, describe, it, expect, beforeEach, mocha, console */
"use strict";

define(function (require, exports) {
    var P = require("./promise");

    expect.toThrow = function (fn) {
        var exception;
        try {
            fn();
        }
        catch (ex) {
            exception = ex;
        }
        expect(exception).to.not.be(undefined);
    };

    describe("PromiseState enum", function () {
        it("has state Pending", function () {
            expect(P.PromiseState.Pending).to.equal(0);
        });
        it("has state Fulfilled", function () {
            expect(P.PromiseState.Fulfilled).to.equal(1);
        });
        it("has state Rejected", function () {
            expect(P.PromiseState.Rejected).to.equal(2);
        });
    });

    describe("Promise class", function () {

        it("requires Promise module", function () {
            expect(P.Promise).to.be.a('function');
        });

        it("requires an executor when created", function () {
            expect.toThrow(function () {
                var promise = new P.Promise();
            });
        });

        it("runs executor once when constructed", function () {
            var isCalled = 0;
            var promise = new P.Promise(function () {
                isCalled++;
            });

            expect(isCalled).to.equal(1);
        });

        it("starts in a pending state", function () {
            var promise = new P.Promise(function () { });
            expect(promise.state).to.be(P.PromiseState.Pending);
        });

        it("becomes Fulfilled when executor completes successfully", function () {
            var promise = new P.Promise(function (success) { success(); });
            expect(promise.state).to.be(P.PromiseState.Fulfilled);
        });

        it("becomes Rejected when executor fails", function () {
            var promise = new P.Promise(function (success, reject) { reject(); });
            expect(promise.state).to.be(P.PromiseState.Rejected);
        });

        it("becomes Rejected without reason if executor throws", function () {
            var promise = new P.Promise(function () { throw ""; });
            expect(promise.state).to.be(P.PromiseState.Rejected);
        });

        it("becomes Rejected without reason if settled multiple times", function () {
            var promise = new P.Promise(function (success) {
                success();
                success();
            });
            expect(promise.state).to.be(P.PromiseState.Rejected);
        });

        describe("Fulfilled", function () {
            it("sync calls then() immediately", function (done) {
                var promise = new P.Promise(function (success) {
                    success(5);
                });

                promise.then(function (value) {
                    expect(value).to.be(5);
                    done();
                });
            });

            it("async calls then() when settled", function (done) {
                var promise = new P.Promise(function (success) {
                    setTimeout(function () {
                        success(15);
                    }, 0);
                });

                promise.then(function (value) {
                    expect(promise.state).to.be(P.PromiseState.Fulfilled);
                    expect(value).to.be(15);
                    done();
                });
            });

            it("chains then() handlers", function (done) {
                var promise = new P.Promise(function (success) {
                    success(31);
                }).then(function (value) {
                    return "message";
                }).then(function (value) {
                    expect(value).to.be("message");
                    done();
                });
            });

            it("settles then() with previous value if handler is not a function", function (done) {
                var promise = new P.Promise(function (success) {
                    success(42);
                }).then().then(function (value) {
                    expect(value).to.be(42);
                    done();
                });
            });
        });

        describe("Rejected", function () {
            it("sync calls then() immediately", function (done) {
                var promise = new P.Promise(function (success, reject) {
                    reject("message");
                });

                promise.then(function (value) {
                    expect(true).to.be(false);
                }, function (reason) {
                    expect(reason).to.be("message");
                    done();
                });
            });

            it("async calls then() when settled", function (done) {
                var promise = new P.Promise(function (success, reject) {
                    setTimeout(function () {
                        reject("async message");
                    }, 0);
                });

                promise.then(function (value) {
                    expect(true).to.be(false);
                }, function (reason) {
                    expect(promise.state).to.be(P.PromiseState.Rejected);
                    expect(reason).to.be("async message");
                    done();
                });
            });

            it("chains then() handlers", function (done) {
                var promise = new P.Promise(function (success, reject) {
                    reject("reason 1");
                }).then(function (value) {
                    expect(true).to.be(false);
                }, function (reason) {
                    return 62;
                }).then(function (value) {
                    expect(value).to.be(62);
                    done();
                });
            });

            it("rejects then() with previous reason if handler is not a function", function (done) {
                var promise = new P.Promise(function (success, reject) {
                    reject("my reason");
                }).then().then(function (value) {
                    expect(true).to.be(false);
                }, function (reason) {
                    expect(reason).to.be("my reason");
                    done();
                });
            });
        });

        describe("static functions", function () {
            it("creates a pre-resolved Promise", function (done) {
                P.Promise.resolve().then(function () {
                    done();
                });
            });

            it("creates a pre-rejected Promise", function (done) {
                P.Promise.reject().then(undefined, function () {
                    done();
                });
            });
        });

        describe("static all()", function () {
            it("settles empty list immediately", function (done) {
                P.Promise.all().then(function (values) {
                    expect(values).to.eql([]);
                    done();
                });
            });

            it("waits for all promises to settle", function (done) {
                var p1 = P.Promise.resolve(1);
                var p2 = P.Promise.resolve(2);

                P.Promise.all(p1, p2).then(function (values) {
                    expect(values).to.eql([1, 2]);
                    done();
                });
            });

            it("rejects with the first reason if any promise rejects", function (done) {
                var p1 = P.Promise.reject("reason 1");
                var p2 = P.Promise.reject("reason 2");

                P.Promise.all(p1, p2).then(undefined, function (reason) {
                    expect(reason).to.be("reason 1");
                    done();
                });
            });
        });

        describe("static race()", function () {
            it("requires at least one promise", function (done) {
                expect.toThrow(function () {
                    P.Promise.race();
                });
                done();
            });

            it("settles when first promise settles", function (done) {
                var p1 = new P.Promise(function (success) {
                    setTimeout(function () { success(1); }, 1000);
                });
                var p2 = P.Promise.resolve(2);

                P.Promise.race(p1, p2).then(function (value) {
                    expect(value).to.eql(2);
                    //TODO: Should write test to ensure promise is only settled once here
                    done();
                });
            });

            it("rejects with the first reason if any promise rejects", function (done) {
                var p1 = new P.Promise(function (success, reject) {
                    setTimeout(function () { reject("reason 1"); }, 1000);
                });
                var p2 = P.Promise.reject("reason 2");

                P.Promise.race(p1, p2).then(undefined, function (reason) {
                    expect(reason).to.be("reason 2");
                    done();
                });
            });
        });


    });
});