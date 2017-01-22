/*jshint -W069 */

export class Promise<returnType> {
    private _state: PromiseState;
    private _then: PromiseThen;
    private _fulfilledValue: returnType;
    private _rejectReason: any;

    constructor(executor: PromiseExecutor<returnType>) {
        if (typeof executor !== "function")
            throw Error("executor missing");

        this._state = PromiseState.Pending;

        try {
            executor(value => this.onFulfilled(value), (reason?) => this.onRejected(reason));
        }
        catch (exception) {
            this.onRejected();
        }
    }

    get state() {
        return this._state;
    }

    public then<T>(fulfilledExecutor: PromiseResolved<returnType>, rejectedExecutor?: PromiseRejected): Promise<T> {
        let promise = new Promise<T>((resolve: Function, rejectThenFn: Function) => {
            this._then = {
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
    }

    private onFulfilled(value: returnType) {
        if (this._state !== PromiseState.Pending) {
            this._state = PromiseState.Rejected;
            return;
        }

        this._state = PromiseState.Fulfilled;
        this._fulfilledValue = value;

        if (!this._then)
            return;

        this.fulfillThenPromise();
    }

    private onRejected(reason?: any) {
        if (this._state !== PromiseState.Pending)
            throw Error("Trying to reject a settled Promise!");

        this._state = PromiseState.Rejected;
        this._rejectReason = reason;

        if (!this._then)
            return;

        this.rejectThenPromise();
    }

    private fulfillThenPromise() {
//        try {
        let isFunction = typeof this._then.fulfilledExecutor === "function";
        if (isFunction) {
            let value = this._then.fulfilledExecutor(this._fulfilledValue);
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
    }

    private rejectThenPromise() {
//        try {
        if (typeof this._then.rejectedExecutor === "function") {
            let value = this._then.rejectedExecutor(this._rejectReason);
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
    }


    static all<returnType>(...promises: Promise<returnType>[]): Promise<returnType[]> {
        if (promises.length === 0)
            return Promise.resolve<returnType[]>([]);

        let allPromise = new Promise<returnType[]>((resolve, reject) => {
            let values: returnType[] = [];
            promises.forEach(promise => {
                return promise.then((value) => {
                    values.push(value);
                    if (values.length === promises.length) {
                        resolve(values);
                    }
                }, (reason) => {
                    if (allPromise.state === PromiseState.Pending)
                        reject(reason);
                });
            });
        });
        return allPromise;
    }

    static race<returnType>(...promises: Promise<returnType>[]): Promise<returnType> {
        if (promises.length === 0)
            throw Error("Promise.race() requires at least one Promise");

        return new Promise<returnType>((resolve, reject) => {

            let isSettled = false;
            promises.forEach(promise => {
                return promise.then((value) => {
                    if (!isSettled) {
                        isSettled = true;
                        resolve(value);
                    }
                }, (reason) => {
                    if (!isSettled) {
                        isSettled = true;
                        reject(reason);
                    }
                });
            });
        });
    }

    static resolve<T>(value: T) {
        return new Promise<T>((success, reject) => {
            setTimeout(() => success(value), 0);
        });
    }

    static reject<T>(reason?: any) {
        return new Promise<T>((success, reject) => {
            setTimeout(() => reject(reason), 0);
        });
    }
}

export enum PromiseState {
    Pending,
    Fulfilled,
    Rejected
}

type PromiseThen = {
    fulfilledExecutor: Function;
    resolve: Function;
    rejectedExecutor: Function;
    reject: Function;
}

type PromiseResolved<T> = (value: T) => void;
type PromiseRejected = (reason?: any) => void;
type PromiseExecutor<T> = (resolve: PromiseResolved<T>, reject: PromiseRejected) => void;
