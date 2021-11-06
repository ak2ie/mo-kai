import * as app from "../src/App";
import * as request from "supertest";
import axios from "axios";
import * as admin from "firebase-admin";
import { Setting } from "../src/Setting";
import { advanceTo, clear } from "jest-date-mock";

describe("API", () => {
  const db: FirebaseFirestore.Firestore = admin.firestore();

  beforeEach(async () => {
    await truncate(db);
  });

  afterEach(() => {
    // clear();
  });

  it("test", async () => {
    const idToken = await getIdTokenFromCustomToken();
    const response = await request(app)
      .get("/api")
      .set("Authorization", idToken);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "NG" });
  });

  describe("一覧取得", () => {
    it("一覧取得", async () => {
      /* --------------------------------------
       *  セットアップ
       * -------------------------------------- */
      const mockDate = new Date("2020-05-01T01:02:03Z");

      const idToken = await getIdTokenFromCustomToken();
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const userId = decodedToken.uid;

      await db
        .collection(Setting.COLLECTION_NAME.USERS)
        .doc(userId)
        .set({
          Items: [
            {
              Id: 1,
              Name: "消耗品1",
              DeleteFlag: false,
              LastBuyDate: admin.firestore.Timestamp.fromDate(mockDate),
              BuyInterval: 1,
              CreatedAt: admin.firestore.Timestamp.fromDate(mockDate),
              IsChecked: false
            },
            {
              Id: 2,
              Name: "消耗品2",
              DeleteFlag: true, // 削除済なので取得対象外
              LastBuyDate: admin.firestore.Timestamp.fromDate(mockDate),
              BuyInterval: 1,
              CreatedAt: admin.firestore.Timestamp.fromDate(mockDate),
              IsChecked: false
            },
          ],
        });
      /* --------------------------------------
       *  呼び出し
       * -------------------------------------- */
      const response = await request(app)
        .get("/api/items/get")
        .set("Authorization", idToken);

      /* --------------------------------------
       *  テスト
       * -------------------------------------- */
      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        {
          Id: 1,
          Name: "消耗品1",
          DeleteFlag: false,
          LastBuyDate: mockDate.toISOString(),
          BuyInterval: 1,
          CreatedAt: mockDate.toISOString(),
          IsChecked: false
        },
      ]);
    });

    it("個別取得", async () => {
      /* --------------------------------------
       *  セットアップ
       * -------------------------------------- */
      const mockDate = new Date("2020-05-01T01:02:03Z");

      const idToken = await getIdTokenFromCustomToken();
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const userId = decodedToken.uid;

      await db
        .collection(Setting.COLLECTION_NAME.USERS)
        .doc(userId)
        .set({
          Items: [
            {
              Id: 1,
              Name: "消耗品1",
              DeleteFlag: false,
              LastBuyDate: admin.firestore.Timestamp.fromDate(mockDate),
              BuyInterval: 1,
              CreatedAt: admin.firestore.Timestamp.fromDate(mockDate),
              IsChecked: false,
            },
            // 取得対象
            {
              Id: 2,
              Name: "消耗品2",
              DeleteFlag: false,
              LastBuyDate: admin.firestore.Timestamp.fromDate(mockDate),
              BuyInterval: 2,
              CreatedAt: admin.firestore.Timestamp.fromDate(mockDate),
              IsChecked: true,
            },
          ],
        });
      /* --------------------------------------
       *  呼び出し
       * -------------------------------------- */
      const response = await request(app)
        .get("/api/items/get?id=2") // 取得対象をパラメータで指定
        .set("Authorization", idToken);

      /* --------------------------------------
       *  テスト
       * -------------------------------------- */
      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        {
          Id: 2,
          Name: "消耗品2",
          DeleteFlag: false,
          LastBuyDate: mockDate.toISOString(),
          BuyInterval: 2,
          CreatedAt: mockDate.toISOString(),
          IsChecked: true,
        },
      ]);
    });
    it("異常（パラメータidが数字でない）", async () => {
      /* --------------------------------------
       *  セットアップ
       * -------------------------------------- */
      const idToken = await getIdTokenFromCustomToken();

      /* --------------------------------------
       *  呼び出し
       * -------------------------------------- */
      const response = await request(app)
        .get("/api/items/get?id=2XX") // idパラメータが数字でない
        .set("Authorization", idToken);

      /* --------------------------------------
       *  テスト
       * -------------------------------------- */
      // APIレスポンス
      expect(response.status).toBe(400);
    });
  });

  describe("削除", () => {
    const db: FirebaseFirestore.Firestore = admin.firestore();

    beforeEach(async () => {
      await truncate(db);
    });
    it("正常", async () => {
      /* --------------------------------------
       *  セットアップ
       * -------------------------------------- */
      const mockDate = new Date("2020-05-01T01:02:03Z");

      const idToken = await getIdTokenFromCustomToken();
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const userId = decodedToken.uid;

      await db
        .collection(Setting.COLLECTION_NAME.USERS)
        .doc(userId)
        .set({
          Items: [
            {
              Id: 1,
              Name: "消耗品1",
              DeleteFlag: false,
              LastBuyDate: admin.firestore.Timestamp.fromDate(mockDate),
              BuyInterval: 1,
              CreatedAt: admin.firestore.Timestamp.fromDate(mockDate),
              IsChecked: false,
            },
            {
              Id: 2,
              Name: "消耗品2",
              DeleteFlag: true,
              LastBuyDate: admin.firestore.Timestamp.fromDate(mockDate),
              BuyInterval: 1,
              CreatedAt: admin.firestore.Timestamp.fromDate(mockDate),
              IsChecked: true,
            },
          ],
        });
      /* --------------------------------------
       *  呼び出し
       * -------------------------------------- */
      const response = await request(app)
        .get("/api/items/delete?id=2")
        .set("Authorization", idToken);

      /* --------------------------------------
       *  テスト
       * -------------------------------------- */
      // APIレスポンス
      expect(response.status).toBe(200);
      // DB 論理削除の確認
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
            LastBuyDate: admin.firestore.Timestamp.fromDate(mockDate),
            BuyInterval: 1,
            CreatedAt: admin.firestore.Timestamp.fromDate(mockDate),
            IsChecked: false,
          },
          {
            Id: 2,
            Name: "消耗品2",
            DeleteFlag: true, // 論理削除
            LastBuyDate: admin.firestore.Timestamp.fromDate(mockDate),
            BuyInterval: 1,
            CreatedAt: admin.firestore.Timestamp.fromDate(mockDate),
            IsChecked: true,
          },
        ]);
      }
    });

    it("異常（パラメータなし）", async () => {
      /* --------------------------------------
       *  セットアップ
       * -------------------------------------- */
      const idToken = await getIdTokenFromCustomToken();

      /* --------------------------------------
       *  呼び出し
       * -------------------------------------- */
      const response = await request(app)
        .get("/api/items/delete") // idパラメータなし
        .set("Authorization", idToken);

      /* --------------------------------------
       *  テスト
       * -------------------------------------- */
      // APIレスポンス
      expect(response.status).toBe(400);
    });

    it("異常（パラメータidが数字でない）", async () => {
      /* --------------------------------------
       *  セットアップ
       * -------------------------------------- */
      const idToken = await getIdTokenFromCustomToken();

      /* --------------------------------------
       *  呼び出し
       * -------------------------------------- */
      const response = await request(app)
        .get("/api/items/delete?id=2XX") // パラメータidが数字でない
        .set("Authorization", idToken);

      /* --------------------------------------
       *  テスト
       * -------------------------------------- */
      // APIレスポンス
      expect(response.status).toBe(400);
    });
  });

  describe("追加", () => {
    const db: FirebaseFirestore.Firestore = admin.firestore();

    beforeEach(async () => {
      await truncate(db);
    });

    afterEach(() => {
      clear();
    });

    it("正常", async () => {
      /* --------------------------------------
       *  セットアップ
       * -------------------------------------- */
      const mockDate = new Date("2020-05-01T01:02:03Z");
      const now = new Date();
      advanceTo(now); // 作成日時チェックのため日付固定。現実の時刻と差異が大きいとエラー（トークン認証が原因）
      const idToken = await getIdTokenFromCustomToken();
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const userId = decodedToken.uid;

      await db
        .collection(Setting.COLLECTION_NAME.USERS)
        .doc(userId)
        .set({
          Items: [
            {
              Id: 1,
              Name: "消耗品1",
              DeleteFlag: false,
              LastBuyDate: admin.firestore.Timestamp.fromDate(mockDate),
              BuyInterval: 1,
              CreatedAt: admin.firestore.Timestamp.fromDate(mockDate),
              IsChecked: false,
            },
          ],
        });
      /* --------------------------------------
       *  呼び出し
       * -------------------------------------- */
      const requestJson = {
        Items: [
          {
            Name: "消耗品2",
            LastBuyDate: new Date("2020-04-20T01:02:03Z").toISOString(),
            BuyInterval: 2,
          },
        ],
      };
      const response = await request(app)
        .post("/api/items/add")
        .send(requestJson)
        .set("Authorization", idToken)
        .set("Content-Type", "application/json");

      /* --------------------------------------
       *  テスト
       * -------------------------------------- */
      // APIレスポンス
      expect(response.status).toBe(200);
      // DB 論理削除の確認
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
            LastBuyDate: admin.firestore.Timestamp.fromDate(mockDate),
            BuyInterval: 1,
            CreatedAt: admin.firestore.Timestamp.fromDate(mockDate),
            IsChecked: false,
          },
          {
            Id: 2,
            Name: "消耗品2",
            DeleteFlag: false,
            LastBuyDate: admin.firestore.Timestamp.fromDate(
              new Date(requestJson.Items[0].LastBuyDate) // パラメータで指定した日時
            ),
            BuyInterval: 2,
            CreatedAt: admin.firestore.Timestamp.fromDate(
              new Date() // 実行日時
            ),
            IsChecked: false, // 初期値
          },
        ]);
      }
    });

    it("異常（パラメータなし）", async () => {
      /* --------------------------------------
       *  セットアップ
       * -------------------------------------- */
      const idToken = await getIdTokenFromCustomToken();

      /* --------------------------------------
       *  呼び出し
       * -------------------------------------- */
      const response = await request(app)
        .post("/api/items/add") // idパラメータなし
        .set("Authorization", idToken)
        .set("Contet-Type", "application/json");

      /* --------------------------------------
       *  テスト
       * -------------------------------------- */
      // APIレスポンス
      expect(response.status).toBe(400);
    });
  });

  describe("更新", () => {
    const db: FirebaseFirestore.Firestore = admin.firestore();

    beforeEach(async () => {
      await truncate(db);
    });

    it("正常", async () => {
      /* --------------------------------------
       *  セットアップ
       * -------------------------------------- */
      const mockDate = new Date("2020-05-01T01:02:03Z");
      const idToken = await getIdTokenFromCustomToken();
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const userId = decodedToken.uid;

      await db
        .collection(Setting.COLLECTION_NAME.USERS)
        .doc(userId)
        .set({
          Items: [
            {
              Id: 1,
              Name: "消耗品1",
              DeleteFlag: false,
              LastBuyDate: admin.firestore.Timestamp.fromDate(mockDate),
              BuyInterval: 1,
              CreatedAt: admin.firestore.Timestamp.fromDate(mockDate),
              IsChecked: false,
            },
            {
              Id: 2,
              Name: "消耗品2",
              DeleteFlag: false,
              LastBuyDate: admin.firestore.Timestamp.fromDate(mockDate),
              BuyInterval: 1,
              CreatedAt: admin.firestore.Timestamp.fromDate(mockDate),
              IsChecked: false,
            },
          ],
        });
      /* --------------------------------------
       *  呼び出し
       * -------------------------------------- */
      const requestJson = {
        Id: 2,
        Name: "消耗品2更新",
        LastBuyDate: new Date("2020-04-20T01:02:03Z").toISOString(),
        BuyInterval: 3,
        IsChecked: true,
      };
      const response = await request(app)
        .post("/api/items/update?id=2")
        .send(requestJson)
        .set("Authorization", idToken)
        .set("Content-Type", "application/json");

      /* --------------------------------------
       *  テスト
       * -------------------------------------- */
      // APIレスポンス
      expect(response.status).toBe(200);
      // DB 更新の確認
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
            LastBuyDate: admin.firestore.Timestamp.fromDate(mockDate),
            BuyInterval: 1,
            CreatedAt: admin.firestore.Timestamp.fromDate(mockDate),
            IsChecked: false,
          },
          {
            Id: 2,
            Name: "消耗品2更新",
            DeleteFlag: false,
            LastBuyDate: admin.firestore.Timestamp.fromDate(
              new Date(requestJson.LastBuyDate) // パラメータで指定した日時
            ),
            BuyInterval: requestJson.BuyInterval,
            CreatedAt: admin.firestore.Timestamp.fromDate(mockDate),
            IsChecked: true,
          },
        ]);
      }
    });

    it("異常（パラメータなし）", async () => {
      /* --------------------------------------
       *  セットアップ
       * -------------------------------------- */
      const idToken = await getIdTokenFromCustomToken();

      /* --------------------------------------
       *  呼び出し
       * -------------------------------------- */
      const response = await request(app)
        .post("/api/items/update?id=2") // idパラメータなし
        .set("Authorization", idToken)
        .set("Contet-Type", "application/json");

      /* --------------------------------------
       *  テスト
       * -------------------------------------- */
      // APIレスポンス
      expect(response.status).toBe(400);
    });
  });

  describe("ユーザー情報取得", () => {
    const db: FirebaseFirestore.Firestore = admin.firestore();

    beforeEach(async () => {
      await truncate(db);
    });

    it("正常（新規）", async () => {
      /* --------------------------------------
       *  セットアップ
       * -------------------------------------- */
      const idToken = await getIdTokenFromCustomToken();
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const userId = decodedToken.uid;
      // ユーザーのドキュメントが存在
      await db.collection(Setting.COLLECTION_NAME.USERS).doc(userId).set({
        Items: [],
      });

      /* --------------------------------------
       *  呼び出し
       * -------------------------------------- */
      const response = await request(app)
        .get("/api/user/get")
        .set("Authorization", idToken);

      /* --------------------------------------
       *  テスト
       * -------------------------------------- */
      // APIレスポンス
      expect(response.status).toBe(200);

      expect(response.body).toEqual({
        isNew: false,
      });
    });

    it("正常（新規）", async () => {
      /* --------------------------------------
       *  セットアップ
       * -------------------------------------- */
      const idToken = await getIdTokenFromCustomToken();
      // DBにユーザーのドキュメントは存在しない

      /* --------------------------------------
       *  呼び出し
       * -------------------------------------- */
      const response = await request(app)
        .get("/api/user/get")
        .set("Authorization", idToken);

      /* --------------------------------------
       *  テスト
       * -------------------------------------- */
      // APIレスポンス
      expect(response.status).toBe(200);

      expect(response.body).toEqual({
        isNew: true,
      });
    });
  });

  describe("ユーザー情報作成", () => {
    const db: FirebaseFirestore.Firestore = admin.firestore();

    beforeEach(async () => {
      await truncate(db);
    });

    it("正常", async () => {
      /* --------------------------------------
       *  セットアップ
       * -------------------------------------- */
      const idToken = await getIdTokenFromCustomToken();
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const userId = decodedToken.uid;

      /* --------------------------------------
       *  呼び出し
       * -------------------------------------- */
      const response = await request(app)
        .post("/api/user/add")
        .send({ userId: "test-userid" })
        .set("Authorization", idToken);

      /* --------------------------------------
       *  テスト
       * -------------------------------------- */
      // APIレスポンス
      expect(response.status).toBe(200);

      // DB にユーザー情報が追加されること
      const docRef = await db
        .collection(Setting.COLLECTION_NAME.USERS)
        .doc(userId)
        .get();
      const result = docRef.data();
      if (result !== undefined) {
        expect(result.TwitterId).toBe("test-userid"); // twitter IDが設定される
        expect(result.Items).toEqual([]);
      }
    });

    it("正常（作成済）", async () => {
      /* --------------------------------------
       *  セットアップ
       * -------------------------------------- */
      const mockDate = new Date();
      const idToken = await getIdTokenFromCustomToken();
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const userId = decodedToken.uid;
      // ユーザーのドキュメントが存在
      await db
        .collection(Setting.COLLECTION_NAME.USERS)
        .doc(userId)
        .set({
          TwitterId: "test",
          Items: [
            {
              Id: 1,
              Name: "消耗品1",
              DeleteFlag: false,
              LastBuyDate: admin.firestore.Timestamp.fromDate(mockDate),
              BuyInterval: 1,
              CreatedAt: admin.firestore.Timestamp.fromDate(mockDate),
            },
          ],
        });

      /* --------------------------------------
       *  呼び出し
       * -------------------------------------- */
      const response = await request(app)
        .post("/api/user/add")
        .send({ userId: "test" })
        .set("Authorization", idToken);

      /* --------------------------------------
       *  テスト
       * -------------------------------------- */
      // APIレスポンス
      expect(response.status).toBe(200);

      // DB が変更されないこと
      const docRef = await db
        .collection(Setting.COLLECTION_NAME.USERS)
        .doc(userId)
        .get();
      const result = docRef.data();
      if (result !== undefined) {
        expect(result.TwitterId).toBe("test");
        expect(result.Items).toEqual([
          {
            Id: 1,
            Name: "消耗品1",
            DeleteFlag: false,
            LastBuyDate: admin.firestore.Timestamp.fromDate(mockDate),
            BuyInterval: 1,
            CreatedAt: admin.firestore.Timestamp.fromDate(mockDate),
          },
        ]);
      }
    });
  });

  describe("ユーザー情報削除", () => {
    const db: FirebaseFirestore.Firestore = admin.firestore();

    beforeEach(async () => {
      await truncate(db);
    });

    afterEach(() => {
      clear();
    });

    it("正常", async () => {
      /* --------------------------------------
       *  セットアップ
       * -------------------------------------- */
      const mockDate = new Date();
      const idToken = await getIdTokenFromCustomToken();
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const userId = decodedToken.uid;
      advanceTo(new Date());
      // ユーザーのドキュメントが存在
      await db
        .collection(Setting.COLLECTION_NAME.USERS)
        .doc(userId)
        .set({
          TwitterId: "test",
          Items: [
            {
              Id: 1,
              Name: "消耗品1",
              DeleteFlag: false,
              LastBuyDate: admin.firestore.Timestamp.fromDate(mockDate),
              BuyInterval: 1,
              CreatedAt: admin.firestore.Timestamp.fromDate(mockDate),
            },
          ],
        });

      /* --------------------------------------
       *  呼び出し
       * -------------------------------------- */
      const response = await request(app)
        .get("/api/user/delete")
        .set("Authorization", idToken);

      /* --------------------------------------
       *  テスト
       * -------------------------------------- */
      // APIレスポンス
      expect(response.status).toBe(200);

      // DBからユーザー情報が削除されること
      const availableRef = await db
        .collection(Setting.COLLECTION_NAME.USERS)
        .doc(userId)
        .get();
      const deletedRef = await db
        .collection(Setting.COLLECTION_NAME.DELETED_USERS)
        .where("TwitterId", "==", "test")
        .get();
      if (!deletedRef.empty) {
        expect(availableRef.exists).toBe(false); // ユーザー情報削除済
        // 移動済ユーザー情報
        const deletedUserData = deletedRef.docs[0].data();
        expect(deletedUserData.TwitterId).toBe("test");
        expect(deletedUserData.Items[0].Id).toBe(1);
        expect(deletedUserData.DeletedAt).toEqual(
          admin.firestore.Timestamp.fromDate(new Date())
        );
      } else {
        fail();
      }
    });
  });
});

async function getIdTokenFromCustomToken() {
  const customToken = await admin.auth().createCustomToken("hogehoge");
  const url = `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyCustomToken?key=AIzaSyDYGGao-s1B83fagkgCtv-0FVY0XjX5b5Q`;
  const data = {
    token: customToken,
    returnSecureToken: true,
  };

  const response = await axios.post(url, data);
  return response.data.idToken;
}

async function truncate(db: FirebaseFirestore.Firestore) {
  const batch = db.batch();
  const collectionRef = await db
    .collection(Setting.COLLECTION_NAME.USERS)
    .get();
  collectionRef.forEach((doc) => {
    batch.delete(doc.ref);
  });

  const collectionDeletedRef = await db
    .collection(Setting.COLLECTION_NAME.DELETED_USERS)
    .get();
  collectionDeletedRef.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
}
