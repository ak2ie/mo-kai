import { Setting } from "./Setting";
import { Item } from "./Item";
import admin = require("firebase-admin");

export class Items {
    /**
     * Firestoreオブジェクト
     */
    // private db: FirebaseFirestore.Firestore;

    /**
     * ユーザーID
     */
    private set userId(value: string) {
        if (value.length == 0) {
            throw new Error("ユーザーIDが空文字です");
        }
        this._userId = value;
    }

    private get userId() {
        return this._userId;
    }

    /**
     * コンストラクタ
     * @param db Firestoreオブジェクト
     * @param userId ユーザーID
     */
    constructor(
        private _db: FirebaseFirestore.Firestore,
        private _userId: string
    ) {
        this.userId = this.userId;
        this.userId = _userId;
    }

    /**
     * 消耗品を取得する
     * @param id 取得対象の消耗品ID（未指定なら全件）
     * @returns 消耗品の配列（0件なら空配列）
     */
    public async Get(id: number = -1): Promise<Array<ItemDoc>> {
        const userRef = await this._db
            .collection(Setting.COLLECTION_NAME.USERS)
            .doc(this.userId)
            .get();
        const itemsDoc = userRef.data();
        let res: Array<ItemDoc> = [];
        if (userRef.exists) {
            if (itemsDoc !== undefined) {
                let items = itemsDoc[Setting.DOC_NAME.ITEMS];
                if (id !== -1) {
                    items = items.filter((item: ItemDoc) => {
                        return item.Id === id;
                    });
                }
                if (this.isItems(items)) {
                    items.forEach((item) => {
                        if (!item.DeleteFlag) {
                            res.push({
                                Id: item.Id,
                                Name: item.Name,
                                BuyInterval: item.BuyInterval,
                                CreatedAt: item.CreatedAt,
                                DeleteFlag: item.DeleteFlag,
                                LastBuyDate: item.LastBuyDate,
                            });
                        }
                    });
                }
            }
        }
        return res;
    }

    /**
     * 消耗品を追加する
     * @param items 追加する消耗品
     */
    public async Add(items: Array<Item>) {
        // ドキュメント取得
        const userRef = this._db
            .collection(Setting.COLLECTION_NAME.USERS)
            .doc(this.userId);

        // MAX(消耗品Id)を取得
        const userSnapshot = await userRef.get();
        const itemsDoc = userSnapshot.data();
        let maxId = 0;
        if (userSnapshot.exists) {
            if (itemsDoc !== undefined) {
                const itemsDB = itemsDoc[Setting.DOC_NAME.ITEMS];
                if (this.isItems(itemsDB)) {
                    maxId = itemsDB.reduce(
                        (accumulator, currentValue, _currentIndex, _array) => {
                            return accumulator.Id > currentValue.Id
                                ? accumulator
                                : currentValue;
                        }
                    ).Id;
                }
            }
        }

        // 追加
        const batch = this._db.batch();
        items.map((item) => {
            batch.update(userRef, {
                Items: admin.firestore.FieldValue.arrayUnion({
                    Id: ++maxId,
                    Name: item.Name,
                    BuyInterval: item.BuyInterval,
                    DeleteFlag: false,
                    LastBuyDate: item.LastBuyDate,
                    CreatedAt: admin.firestore.Timestamp.now(),
                }),
            });
        });

        await batch.commit();
    }

    /**
     * 消耗品を更新
     * @param item 更新後の消耗品
     */
    public async Update(item: Item): Promise<void> {
        // ドキュメント取得
        const userRef = this._db
            .collection(Setting.COLLECTION_NAME.USERS)
            .doc(this.userId);

        // Id取得
        const userSnapshot = await userRef.get();
        const itemsDoc = userSnapshot.data();
        let updatedItems: Array<ItemDoc> = [];
        if (userSnapshot.exists) {
            if (itemsDoc !== undefined) {
                const items = itemsDoc[Setting.DOC_NAME.ITEMS];
                if (this.isItems(items)) {
                    updatedItems = items.map((itemData) => {
                        if (itemData.Id === item.Id) {
                            return {
                                Id: itemData.Id,
                                Name: item.Name,
                                LastBuyDate: admin.firestore.Timestamp.fromDate(
                                    item.LastBuyDate
                                ),
                                BuyInterval: item.BuyInterval,
                                CreatedAt: itemData.CreatedAt,
                                DeleteFlag: itemData.DeleteFlag,
                            };
                        }
                        return itemData;
                    });
                }
            }
        }

        // 追加
        await userRef.update({
            Items: updatedItems,
        });
    }

    /**
     * 消耗品を論理削除
     * @param id 削除対象の消耗品ID
     */
    public async Delete(id: Number): Promise<void> {
        let userRef = await this._db
            .collection(Setting.COLLECTION_NAME.USERS)
            .doc(this.userId)
            .get();
        const itemsDoc = userRef.data();
        if (userRef.exists) {
            if (itemsDoc !== undefined) {
                const items = itemsDoc[Setting.DOC_NAME.ITEMS];
                if (this.isItems(items)) {
                    items.forEach((item) => {
                        if (item.Id === id) {
                            item.DeleteFlag = true;
                        }
                    });

                    // 削除
                    await this._db
                        .collection(Setting.COLLECTION_NAME.USERS)
                        .doc(this.userId)
                        .update({
                            Items: items,
                        });
                }
            }
        }
    }

    private isItems(value: any): value is Array<ItemDoc> {
        let res = false;
        if (Array.isArray(value) && value.length > 0) {
            res = value.every((item) => {
                return (
                    "Name" in item &&
                    "Id" in item &&
                    "LastBuyDate" in item &&
                    "BuyInterval" in item &&
                    "CreatedAt" in item &&
                    "DeleteFlag" in item
                );
            });
        }
        return res;
    }
}

/**
 * Firestore：消耗品
 */
export interface ItemDoc {
    /**
     * 名前
     */
    Name: string;
    /**
     * ID
     */
    Id: number;
    /**
     * 前回購入日
     */
    LastBuyDate: admin.firestore.Timestamp;
    /**
     * 購入間隔（単位：月）
     */
    BuyInterval: number;
    /**
     * データ作成日時
     */
    CreatedAt: admin.firestore.Timestamp;
    /**
     * 削除フラグ（1：削除）
     */
    DeleteFlag: boolean;
}
