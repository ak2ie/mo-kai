/**
 * 消耗品
 */
export class Item {
    set Name(name: string) {
        if (name.length == 0) {
            throw new Error("名前が空です");
        } else {
            this._name = name;
        }
    }
    get Name() {
        return this._name;
    }

    set LatBuyDate(value: Date) {
        this._lastBuyDate = value;
    }

    get LastBuyDate() {
        return this._lastBuyDate;
    }

    set Id(value: number) {
        this._id = value;
    }

    get Id() {
        return this._id;
    }

    set BuyInterval(value: number) {
        if (value <= 0) {
            throw new Error("購入間隔が0以下です: " + value);
        }
        this._buyInterval = value;
    }

    get BuyInterval() {
        return this._buyInterval;
    }

    /**
     *
     * @param _name 名前
     */
    constructor(
        private _name: string,
        private _lastBuyDate: Date,
        private _buyInterval: number,
        private _id: number
    ) {}
}
