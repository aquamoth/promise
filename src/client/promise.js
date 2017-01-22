/*jshint -W069 */
define(["require", "exports"], function (require, exports) {
    "use strict";
    var Promise = (function () {
        function Promise(executor) {
            var _this = this;
            if (typeof executor !== "function")
                throw Error("executor missing");
            this._state = PromiseState.Pending;
            try {
                executor(function (value) { return _this.onFulfilled(value); }, function (reason) { return _this.onRejected(reason); });
            }
            catch (exception) {
                this.onRejected();
            }
        }
        Object.defineProperty(Promise.prototype, "state", {
            get: function () {
                return this._state;
            },
            enumerable: true,
            configurable: true
        });
        Promise.prototype.then = function (fulfilledExecutor, rejectedExecutor) {
            var _this = this;
            var promise = new Promise(function (resolve, rejectThenFn) {
                _this._then = {
                    fulfilledExecutor: fulfilledExecutor,
                    resolve: resolve,
                    rejectedExecutor: rejectedExecutor,
                    reject: rejectThenFn
                };
            });
            if (this.state === PromiseState.Fulfilled)
                this.fulfillThenPromise();
            else if (this.state === PromiseState.Rejected)
                this.rejectThenPromise();
            return promise;
        };
        Promise.prototype.onFulfilled = function (value) {
            if (this._state !== PromiseState.Pending) {
                this._state = PromiseState.Rejected;
                return;
            }
            this._state = PromiseState.Fulfilled;
            this._fulfilledValue = value;
            if (!this._then)
                return;
            this.fulfillThenPromise();
        };
        Promise.prototype.onRejected = function (reason) {
            if (this._state !== PromiseState.Pending)
                throw Error("Trying to reject a settled Promise!");
            this._state = PromiseState.Rejected;
            this._rejectReason = reason;
            if (!this._then)
                return;
            this.rejectThenPromise();
        };
        Promise.prototype.fulfillThenPromise = function () {
            //        try {
            var isFunction = typeof this._then.fulfilledExecutor === "function";
            if (isFunction) {
                var value = this._then.fulfilledExecutor(this._fulfilledValue);
                this._then.resolve(value);
            }
            else {
                this._then.resolve(this._fulfilledValue);
            }
            //        }
            //        catch (exception) {
            //            throw Error("onFulfilled exception handling not implemented");
            //            //console.error('onFulfilled then fn got exception', exception);
            //            //let reason = this._then.onRejected();
            //            //this._then.rejected(reason);
            //        }
        };
        Promise.prototype.rejectThenPromise = function () {
            //        try {
            if (typeof this._then.rejectedExecutor === "function") {
                var value = this._then.rejectedExecutor(this._rejectReason);
                this._then.resolve(value);
            }
            else {
                this._then.reject(this._rejectReason);
            }
            //        }
            //        catch (exception) {
            //            throw Error("onFulfilled exception handling not implemented");
            //            //console.error('onFulfilled then fn got exception', exception);
            //            //let reason = this._then.onRejected();
            //            //this._then.rejected(reason);
            //        }
        };
        Promise.all = function () {
            var promises = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                promises[_i] = arguments[_i];
            }
            if (promises.length === 0)
                return Promise.resolve([]);
            var allPromise = new Promise(function (resolve, reject) {
                var values = [];
                promises.forEach(function (promise) {
                    return promise.then(function (value) {
                        values.push(value);
                        if (values.length === promises.length) {
                            resolve(values);
                        }
                    }, function (reason) {
                        if (allPromise.state === PromiseState.Pending)
                            reject(reason);
                    });
                });
            });
            return allPromise;
        };
        Promise.race = function () {
            var promises = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                promises[_i] = arguments[_i];
            }
            if (promises.length === 0)
                throw Error("Promise.race() requires at least one Promise");
            return new Promise(function (resolve, reject) {
                var isSettled = false;
                promises.forEach(function (promise) {
                    return promise.then(function (value) {
                        if (!isSettled) {
                            isSettled = true;
                            resolve(value);
                        }
                    }, function (reason) {
                        if (!isSettled) {
                            isSettled = true;
                            reject(reason);
                        }
                    });
                });
            });
        };
        Promise.resolve = function (value) {
            return new Promise(function (success, reject) {
                setTimeout(function () { return success(value); }, 0);
            });
        };
        Promise.reject = function (reason) {
            return new Promise(function (success, reject) {
                setTimeout(function () { return reject(reason); }, 0);
            });
        };
        return Promise;
    }());
    exports.Promise = Promise;
    var PromiseState;
    (function (PromiseState) {
        PromiseState[PromiseState["Pending"] = 0] = "Pending";
        PromiseState[PromiseState["Fulfilled"] = 1] = "Fulfilled";
        PromiseState[PromiseState["Rejected"] = 2] = "Rejected";
    })(PromiseState = exports.PromiseState || (exports.PromiseState = {}));
});
