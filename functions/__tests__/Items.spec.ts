import { Items } from "../src/Items";
import * as admin from "firebase-admin";
import { Setting } from "../src/Setting";
import { Item } from "../src/Item";
import { advanceTo, clear } from "jest-date-mock";
admin.initializeApp();

describe("消耗品：一覧取得", () => {
    let db: FirebaseFirestore.Firestore;

    beforeEach(async () => {
        db = admin.firestore();
        await truncate(db);
    });

    it("全件取得", async () => {
        /* --------------------------------------
         *  セットアップ
         * -------------------------------------- */
        const userId = "testUserId";
        advanceTo(new Date("2020-05-01T10:20:30.000Z"));
        await db
            .collection(Setting.COLLECTION_NAME.USERS)
            .doc(userId)
            .set({
                Items: [
                    {
                        Id: 1,
                        Name: "消耗品1",
                        DeleteFlag: false,
                        LastBuyDate: admin.firestore.Timestamp.fromDate(
                            new Date()
                        ),
                        BuyInterval: 1,
                        CreatedAt: admin.firestore.Timestamp.fromDate(
                            new Date()
                        ),
                    },
                    {
                        Id: 2,
                        Name: "消耗品2",
                        DeleteFlag: true, // 削除済なので取得対象外
                        LastBuyDate: admin.firestore.Timestamp.fromDate(
                            new Date()
                        ),
                        BuyInterval: 1,
                        CreatedAt: admin.firestore.Timestamp.fromDate(
                            new Date()
                        ),
                    },
                ],
            });

        /* --------------------------------------
         *  呼び出し
         * -------------------------------------- */
        const items = new Items(db, userId);
        const data = await items.Get();

        /* --------------------------------------
         *  テスト
         * -------------------------------------- */
        expect(data).toEqual([
            {
                Id: 1,
                Name: "消耗品1",
                DeleteFlag: false,
                LastBuyDate: admin.firestore.Timestamp.fromDate(new Date()),
                BuyInterval: 1,
                CreatedAt: admin.firestore.Timestamp.fromDate(new Date()),
            },
        ]);
    });

    it("個別取得", async () => {
        /* --------------------------------------
         *  セットアップ
         * -------------------------------------- */
        const userId = "testUserId";
        advanceTo(new Date("2020-05-01T10:20:30.000Z"));
        await db
            .collection(Setting.COLLECTION_NAME.USERS)
            .doc(userId)
            .set({
                Items: [
                    {
                        Id: 1,
                        Name: "消耗品1",
                        DeleteFlag: false,
                        LastBuyDate: admin.firestore.Timestamp.fromDate(
                            new Date()
                        ),
                        BuyInterval: 1,
                        CreatedAt: admin.firestore.Timestamp.fromDate(
                            new Date()
                        ),
                    },
                    {
                        Id: 2,
                        Name: "消耗品2",
                        DeleteFlag: false,
                        LastBuyDate: admin.firestore.Timestamp.fromDate(
                            new Date()
                        ),
                        BuyInterval: 1,
                        CreatedAt: admin.firestore.Timestamp.fromDate(
                            new Date()
                        ),
                    },
                ],
            });

        /* --------------------------------------
         *  呼び出し
         * -------------------------------------- */
        const items = new Items(db, userId);
        const data = await items.Get(2);

        /* --------------------------------------
         *  テスト
         * -------------------------------------- */
        expect(data).toEqual([
            {
                Id: 2,
                Name: "消耗品2",
                DeleteFlag: false,
                LastBuyDate: admin.firestore.Timestamp.fromDate(new Date()),
                BuyInterval: 1,
                CreatedAt: admin.firestore.Timestamp.fromDate(new Date()),
            },
        ]);
    });

    it("一覧取得（0件）", async () => {
        /* --------------------------------------
         *  セットアップ
         * -------------------------------------- */
        const userId = "testUserId";
        await db.collection(Setting.COLLECTION_NAME.USERS).doc(userId).set({
            Items: [], // 消耗品0件
        });

        /* --------------------------------------
         *  呼び出し
         * -------------------------------------- */
        const items = new Items(db, userId);
        const data = await items.Get();

        /* --------------------------------------
         *  テスト
         * -------------------------------------- */
        expect(data).toEqual([]);
    });
});

describe("消耗品：削除", () => {
    let db: FirebaseFirestore.Firestore;

    beforeEach(async () => {
        db = admin.firestore();
        await truncate(db);
    });

    it("削除", async () => {
        /* --------------------------------------
         *  セットアップ
         * -------------------------------------- */
        const userId = "testUserId";
        advanceTo(new Date("2020-05-01T10:20:30.000Z"));
        await db
            .collection(Setting.COLLECTION_NAME.USERS)
            .doc(userId)
            .set({
                Items: [
                    {
                        Id: 1,
                        Name: "消耗品1",
                        DeleteFlag: false,
                        LastBuyDate: admin.firestore.Timestamp.fromDate(
                            new Date()
                        ),
                        BuyInterval: 1,
                        CreatedAt: admin.firestore.Timestamp.fromDate(
                            new Date()
                        ),
                    },
                    {
                        Id: 2,
                        Name: "消耗品2",
                        DeleteFlag: false, // 削除対象
                        LastBuyDate: admin.firestore.Timestamp.fromDate(
                            new Date()
                        ),
                        BuyInterval: 1,
                        CreatedAt: admin.firestore.Timestamp.fromDate(
                            new Date()
                        ),
                    },
                ],
            });

        /* --------------------------------------
         *  呼び出し
         * -------------------------------------- */
        const items = new Items(db, userId);
        await items.Delete(2);

        /* --------------------------------------
         *  テスト
         * -------------------------------------- */
        const docRef = await db
            .collection(Setting.COLLECTION_NAME.USERS)
            .doc(userId)
            .get();
        const result = docRef.data();
        if (result !== undefined) {
            expect(result.Items).toEqual([
                {
                    Id: 1,
                    Name: "消耗品1",
                    DeleteFlag: false,
                    LastBuyDate: admin.firestore.Timestamp.fromDate(new Date()),
                    BuyInterval: 1,
                    CreatedAt: admin.firestore.Timestamp.fromDate(new Date()),
                },
                {
                    Id: 2,
                    Name: "消耗品2",
                    DeleteFlag: true, // 削除対象
                    LastBuyDate: admin.firestore.Timestamp.fromDate(new Date()),
                    BuyInterval: 1,
                    CreatedAt: admin.firestore.Timestamp.fromDate(new Date()),
                },
            ]);
        } else {
            fail();
        }
    });

    it("削除（ID不一致）", async () => {
        /* --------------------------------------
         *  セットアップ
         * -------------------------------------- */
        const userId = "testUserId";
        advanceTo(new Date("2020-05-01T10:20:30.000Z"));
        await db
            .collection(Setting.COLLECTION_NAME.USERS)
            .doc(userId)
            .set({
                Items: [
                    {
                        Id: 1,
                        Name: "消耗品1",
                        DeleteFlag: false,
                        LastBuyDate: admin.firestore.Timestamp.fromDate(
                            new Date()
                        ),
                        BuyInterval: 1,
                        CreatedAt: admin.firestore.Timestamp.fromDate(
                            new Date()
                        ),
                    },
                    {
                        Id: 2,
                        Name: "消耗品2",
                        DeleteFlag: false,
                        LastBuyDate: admin.firestore.Timestamp.fromDate(
                            new Date()
                        ),
                        BuyInterval: 1,
                        CreatedAt: admin.firestore.Timestamp.fromDate(
                            new Date()
                        ),
                    },
                ],
            });

        /* --------------------------------------
         *  呼び出し
         * -------------------------------------- */
        const items = new Items(db, userId);
        await items.Delete(9999);

        /* --------------------------------------
         *  テスト
         * -------------------------------------- */
        const docRef = await db
            .collection(Setting.COLLECTION_NAME.USERS)
            .doc(userId)
            .get();
        const result = docRef.data();
        if (result !== undefined) {
            expect(result.Items).toEqual([
                {
                    Id: 1,
                    Name: "消耗品1",
                    DeleteFlag: false, // 削除されない
                    LastBuyDate: admin.firestore.Timestamp.fromDate(new Date()),
                    BuyInterval: 1,
                    CreatedAt: admin.firestore.Timestamp.fromDate(new Date()),
                },
                {
                    Id: 2,
                    Name: "消耗品2",
                    DeleteFlag: false, // 削除されない
                    LastBuyDate: admin.firestore.Timestamp.fromDate(new Date()),
                    BuyInterval: 1,
                    CreatedAt: admin.firestore.Timestamp.fromDate(new Date()),
                },
            ]);
        } else {
            fail();
        }
    });
});

describe("消耗品：追加", () => {
    let db: FirebaseFirestore.Firestore;

    beforeEach(async () => {
        db = admin.firestore();
        await truncate(db);
    });

    afterEach(() => {
        clear();
    });

    it("追加（1件）", async () => {
        /* --------------------------------------
         *  セットアップ
         * -------------------------------------- */
        // 作成日時チェックのため時刻固定
        const freezeTime = new Date("2020-05-01T10:20:30.000Z");
        advanceTo(freezeTime);
        // 既存データ
        const userId = "testUserId";
        const dummyTimestamp = new Date("2020-04-15T12:23:30Z");
        await db
            .collection(Setting.COLLECTION_NAME.USERS)
            .doc(userId)
            .set({
                Items: [
                    {
                        Id: 1,
                        Name: "消耗品1",
                        DeleteFlag: false,
                        LastBuyDate: admin.firestore.Timestamp.fromDate(
                            dummyTimestamp
                        ),
                        BuyInterval: 1,
                        CreatedAt: admin.firestore.Timestamp.fromDate(
                            dummyTimestamp
                        ),
                    },
                ],
            });

        /* --------------------------------------
         *  呼び出し
         * -------------------------------------- */
        const items = new Items(db, userId);
        const lastBuyDate = new Date("2020-04-20T12:34:56Z");
        await items.Add([new Item("消耗品2", lastBuyDate, 2, -1)]);

        /* --------------------------------------
         *  テスト
         * -------------------------------------- */
        const docRef = await db
            .collection(Setting.COLLECTION_NAME.USERS)
            .doc(userId)
            .get();
        const result = docRef.data();
        if (result !== undefined) {
            expect(result.Items).toEqual([
                {
                    Id: 1,
                    Name: "消耗品1",
                    DeleteFlag: false,
                    LastBuyDate: admin.firestore.Timestamp.fromDate(
                        dummyTimestamp
                    ),
                    BuyInterval: 1,
                    CreatedAt: admin.firestore.Timestamp.fromDate(
                        dummyTimestamp
                    ),
                },
                {
                    Id: 2, // 採番
                    Name: "消耗品2", // 指定した名前
                    DeleteFlag: false,
                    LastBuyDate: admin.firestore.Timestamp.fromDate(
                        lastBuyDate // 引数で指定
                    ),
                    BuyInterval: 2,
                    CreatedAt: admin.firestore.Timestamp.fromDate(freezeTime), // 現在時刻
                },
            ]);
        } else {
            fail();
        }
    });

    it("追加（複数）", async () => {
        /* --------------------------------------
         *  セットアップ
         * -------------------------------------- */
        // 作成日時チェックのため時刻固定
        const freezeTime = new Date("2020-05-01T10:20:30.000Z");
        advanceTo(freezeTime);
        // 既存データ
        const userId = "testUserId";
        const dummyTimestamp = new Date("2020-04-15T12:23:30Z");
        await db
            .collection(Setting.COLLECTION_NAME.USERS)
            .doc(userId)
            .set({
                Items: [
                    {
                        Id: 1,
                        Name: "消耗品1",
                        DeleteFlag: false,
                        LastBuyDate: admin.firestore.Timestamp.fromDate(
                            dummyTimestamp
                        ),
                        BuyInterval: 1,
                        CreatedAt: admin.firestore.Timestamp.fromDate(
                            dummyTimestamp
                        ),
                    },
                ],
            });

        /* --------------------------------------
         *  呼び出し
         * -------------------------------------- */
        const items = new Items(db, userId);
        const lastBuyDate = new Date("2020-04-20T12:34:56Z");
        const lastBuyDate2 = new Date("2020-05-11T09:55:00Z");
        await items.Add([
            new Item("消耗品2", lastBuyDate, 2, -1),
            new Item("消耗品3", lastBuyDate2, 5, -1),
        ]);

        /* --------------------------------------
         *  テスト
         * -------------------------------------- */
        const docRef = await db
            .collection(Setting.COLLECTION_NAME.USERS)
            .doc(userId)
            .get();
        const result = docRef.data();
        if (result !== undefined) {
            expect(result.Items).toEqual([
                {
                    Id: 1,
                    Name: "消耗品1",
                    DeleteFlag: false,
                    LastBuyDate: admin.firestore.Timestamp.fromDate(
                        dummyTimestamp
                    ),
                    BuyInterval: 1,
                    CreatedAt: admin.firestore.Timestamp.fromDate(
                        dummyTimestamp
                    ),
                },
                {
                    Id: 2, // 採番
                    Name: "消耗品2", // 指定した名前
                    DeleteFlag: false,
                    LastBuyDate: admin.firestore.Timestamp.fromDate(
                        lastBuyDate // 引数で指定
                    ),
                    BuyInterval: 2,
                    CreatedAt: admin.firestore.Timestamp.fromDate(freezeTime), // 現在時刻
                },
                {
                    Id: 3, // 採番
                    Name: "消耗品3", // 指定した名前
                    DeleteFlag: false,
                    LastBuyDate: admin.firestore.Timestamp.fromDate(
                        lastBuyDate2 // 引数で指定
                    ),
                    BuyInterval: 5,
                    CreatedAt: admin.firestore.Timestamp.fromDate(freezeTime), // 現在時刻
                },
            ]);
        } else {
            fail();
        }
    });

    it("初回", async () => {
        /* --------------------------------------
         *  セットアップ
         * -------------------------------------- */
        // 作成日時チェックのため時刻固定
        const freezeTime = new Date("2020-05-01T10:20:30.000Z");
        advanceTo(freezeTime);
        // 既存データ
        const userId = "testUserId";
        await db.collection(Setting.COLLECTION_NAME.USERS).doc(userId).set({
            Items: [], // 実行前は0件
        });

        /* --------------------------------------
         *  呼び出し
         * -------------------------------------- */
        const items = new Items(db, userId);
        const lastBuyDate = new Date("2020-04-20T12:34:56Z");
        await items.Add([new Item("消耗品1", lastBuyDate, 2, -1)]);

        /* --------------------------------------
         *  テスト
         * -------------------------------------- */
        const docRef = await db
            .collection(Setting.COLLECTION_NAME.USERS)
            .doc(userId)
            .get();
        const result = docRef.data();
        if (result !== undefined) {
            expect(result.Items).toEqual([
                {
                    Id: 1, // 採番
                    Name: "消耗品1", // 指定した名前
                    DeleteFlag: false,
                    LastBuyDate: admin.firestore.Timestamp.fromDate(
                        lastBuyDate // 引数で指定
                    ),
                    BuyInterval: 2,
                    CreatedAt: admin.firestore.Timestamp.fromDate(freezeTime), // 現在時刻
                },
            ]);
        } else {
            fail();
        }
    });
});

describe("消耗品：更新", () => {
    let db: FirebaseFirestore.Firestore;

    beforeEach(async () => {
        db = admin.firestore();
        await truncate(db);
    });

    it("更新", async () => {
        /* --------------------------------------
         *  セットアップ
         * -------------------------------------- */
        // 既存データ
        const userId = "testUserId";
        const dummyTimestamp = new Date("2020-04-15T12:23:30Z");
        await db
            .collection(Setting.COLLECTION_NAME.USERS)
            .doc(userId)
            .set({
                Items: [
                    {
                        Id: 1,
                        Name: "消耗品1",
                        DeleteFlag: false,
                        LastBuyDate: admin.firestore.Timestamp.fromDate(
                            dummyTimestamp
                        ),
                        BuyInterval: 1,
                        CreatedAt: admin.firestore.Timestamp.fromDate(
                            dummyTimestamp
                        ),
                    },
                    {
                        Id: 2,
                        Name: "消耗品2",
                        DeleteFlag: false,
                        LastBuyDate: admin.firestore.Timestamp.fromDate(
                            dummyTimestamp
                        ),
                        BuyInterval: 2,
                        CreatedAt: admin.firestore.Timestamp.fromDate(
                            dummyTimestamp
                        ),
                    },
                ],
            });

        /* --------------------------------------
         *  呼び出し
         * -------------------------------------- */
        const items = new Items(db, userId);
        const lastBuyDate = new Date("2020-04-20T12:34:56Z");
        await items.Update(new Item("消耗品2:更新", lastBuyDate, 4, 2));

        /* --------------------------------------
         *  テスト
         * -------------------------------------- */
        const docRef = await db
            .collection(Setting.COLLECTION_NAME.USERS)
            .doc(userId)
            .get();
        const result = docRef.data();
        if (result !== undefined) {
            expect(result.Items).toEqual([
                {
                    Id: 1,
                    Name: "消耗品1",
                    DeleteFlag: false,
                    LastBuyDate: admin.firestore.Timestamp.fromDate(
                        dummyTimestamp
                    ),
                    BuyInterval: 1,
                    CreatedAt: admin.firestore.Timestamp.fromDate(
                        dummyTimestamp
                    ),
                },
                {
                    Id: 2,
                    Name: "消耗品2:更新", // 更新
                    DeleteFlag: false,
                    LastBuyDate: admin.firestore.Timestamp.fromDate(
                        lastBuyDate // 更新
                    ),
                    BuyInterval: 4, // 更新
                    CreatedAt: admin.firestore.Timestamp.fromDate(
                        dummyTimestamp
                    ),
                },
            ]);
        } else {
            fail();
        }
    });
});

async function truncate(db: FirebaseFirestore.Firestore) {
    const batch = db.batch();
    const collectionRef = await db
        .collection(Setting.COLLECTION_NAME.USERS)
        .get();
    collectionRef.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();
}
