import * as express from "express";
import * as admin from "firebase-admin";
import { Items, ItemDoc } from "./Items";
import { Item } from "./Item";
import * as moment from "moment";
import * as cors from "cors";
import { Setting } from "./Setting";
import { Discord } from "./Discord";
const app = express();

// JSON対応
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

/* --------------------------------------------------------
 *  Firebase初期化
 * -------------------------------------------------------- */
admin.initializeApp();

const db = admin.firestore();

/* --------------------------------------------------------
 *  API
 * -------------------------------------------------------- */
app.get("/", (req, res) => {
  const date = new Date();
  const hours = (date.getHours() % 12) + 1;
  res.send(`
  <!doctype html>
    <head>
      <title>Time</title>
      <link rel="stylesheet" href="/style.css">
      <script src="/script.js"></script>
    </head>
    <body>
      <p>In London, the clock strikes:
        <span id="bongs">${"BONG ".repeat(hours)}</span></p>
        <button onClick="refresh(this)">Refresh</button>
    </body>
  </html>
`);
});

app.get("/api", async (req, res) => {
  const idToken = req.header("Authorization");
  if (idToken) {
    await admin
      .auth()
      .verifyIdToken(idToken)
      .then(function (decodedToken) {
        console.log("認証成功");
        // let uid = decodedToken.uid;
        // db.collection("items")
        //     .doc(uid)
        //     .get()
        //     .then((snapshot) => {});
        res.status(200).json({ message: "NG" });
      })
      .catch(function (error) {
        console.error("==== 認証失敗 ====");
        console.error(error);
      });
  }
  res.status(403).send();
});

/**
 * 消耗品一覧
 */
app.get("/api/items/get", async (req, res) => {
  const idToken = req.header("Authorization");
  if (idToken) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const userId = decodedToken.uid;
      const items = new Items(db, userId);
      let allItems: Array<ItemDoc> = [];
      console.log("uid: ", userId);
      if (req.query.id) {
        // 個別取得
        const itemId = Number(req.query.id.toString());
        if (!Number.isNaN(itemId)) {
          allItems = await items.Get(itemId);
        } else {
          throw new Error("クエリパラメータ id が不正：" + req.query.id);
        }
      } else {
        // 全件取得
        allItems = await items.Get();
      }

      res.status(200).json(
        allItems.map((item) => {
          return {
            Id: item.Id,
            Name: item.Name,
            LastBuyDate: new Date(item.LastBuyDate.seconds * 1000),
            BuyInterval: item.BuyInterval,
            DeleteFlag: item.DeleteFlag,
            CreatedAt: new Date(item.CreatedAt.seconds * 1000),
            IsChecked: item.IsChecked,
            CategoryName: item.CategoryName
          };
        })
      );
    } catch (error) {
      // console.error(error);
      res.status(400).send();
    }
  }
  res.status(403).send();
});

/**
 * 消耗品削除
 */
app.get("/api/items/delete", async (req, res) => {
  const idToken = req.header("Authorization");
  if (idToken) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const userId = decodedToken.uid;
      const items = new Items(db, userId);
      if (req.query.id) {
        const itemId = Number(req.query.id.toString());
        if (!Number.isNaN(itemId)) {
          await items.Delete(itemId);
          res.status(200).json();
          return;
        }
      }
      throw new Error("クエリパラメータ id が不正：" + req.query.id);
    } catch (error) {
      // console.error(error);
      res.status(400).send();
    }
  }
  res.status(403).send();
});

/**
 * 消耗品追加
 */
app.post("/api/items/add", async (req, res) => {
  const idToken = req.header("Authorization");
  if (idToken) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const userId = decodedToken.uid;
      const items = new Items(db, userId);
      const addItems = req.body.Items;
      if (Array.isArray(addItems)) {
        if (addItems.every(isAddItem)) {
          const itemObjs = addItems.map(
            (item) =>
              new Item(
                item.Name,
                new Date(item.LastBuyDate),
                item.BuyInterval,
                -1, // IDは使用されない
                false,
                item.CategoryName,
              )
          );

          await items.Add(itemObjs);
          res.status(200).send();
          return;
        }
      }
      throw new Error(
        "追加クエリパラメータが不正：" + JSON.stringify(req.body)
      );
    } catch (error) {
      console.error(error);
      res.status(400).send();
    }
  }
  res.status(403).send();
});

/**
 * 消耗品更新
 */
app.post("/api/items/update", async (req, res) => {
  const idToken = req.header("Authorization");
  if (idToken) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const userId = decodedToken.uid;
      const items = new Items(db, userId);
      const updateItem = req.body;
      if (isUpdateItem(updateItem)) {
        await items.Update(
          new Item(
            updateItem.Name,
            new Date(updateItem.LastBuyDate),
            updateItem.BuyInterval,
            updateItem.Id,
            updateItem.IsChecked,
            updateItem.CategoryName
          )
        );

        res.status(200).send();
        return;
      }
      throw new Error(
        "更新クエリパラメータが不正：" + JSON.stringify(req.body)
      );
    } catch (error) {
      console.error(error);
      res.status(400).send();
    }
  }
  res.status(403).send();
});

/**
 * カテゴリーリスト取得
 */
app.get("/api/category/get", async (req, res) => {
  const idToken = req.header("Authorization");
  if (idToken) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const userId = decodedToken.uid;

      const items = new Items(db, userId);
      const categories = await items.GetCategories();

      res.status(200).json({
        categories
      });
      return;
    } catch (error) {
      console.error(error);
      res.status(400).send();
    }
  }
  res.status(403).send();
});

/**
 * ユーザー情報取得
 */
app.get("/api/user/get", async (req, res) => {
  const idToken = req.header("Authorization");
  if (idToken) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const userId = decodedToken.uid;
      const snapshot = await db
        .collection(Setting.COLLECTION_NAME.USERS)
        .doc(userId)
        .get();
      if (snapshot.exists) {
        res.status(200).json({ isNew: false });
      } else {
        res.status(200).json({ isNew: true });
      }
    } catch (error) {
      console.error(error);
      res.status(400).send();
    }
  }
  res.status(403).send();
});

/**
 * ユーザー情報追加
 */
app.post("/api/user/add", async (req, res) => {
  const idToken = req.header("Authorization");
  if (idToken) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const uid = decodedToken.uid;
      const userId = req.body.userId;
      if (userId) {
        const snapshot = await db
          .collection(Setting.COLLECTION_NAME.USERS)
          .doc(uid)
          .get();
        if (!snapshot.exists) {
          const userRef = db.collection(Setting.COLLECTION_NAME.USERS).doc(uid);
          await userRef.set({
            TwitterId: userId,
            Items: [],
          });
        }
        await Discord.SendMessage();
        res.status(200).send();
      } else {
        throw new Error("ユーザーIDが未設定");
      }
    } catch (error) {
      console.error(error);
      res.status(400).send();
    }
  }
  res.status(403).send();
});

/**
 * ユーザー情報削除
 */
app.get("/api/user/delete", async (req, res) => {
  const idToken = req.header("Authorization");
  if (idToken) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const uid = decodedToken.uid;
      const snapshot = await db
        .collection(Setting.COLLECTION_NAME.USERS)
        .doc(uid)
        .get();
      if (snapshot.exists) {
        const userData = snapshot.data();
        if (userData !== undefined) {
          // ユーザー情報移動
          const deletedDoc = await db
            .collection(Setting.COLLECTION_NAME.DELETED_USERS)
            .add(userData);
          await deletedDoc.set({ DeletedAt: new Date() }, { merge: true });
          // ユーザー情報削除
          await db.collection(Setting.COLLECTION_NAME.USERS).doc(uid).delete();
        }
      }
      res.status(200).send();
    } catch (error) {
      console.error(error);
      res.status(400).send();
    }
  }
  res.status(403).send();
});

const isUpdateItem = (value: any): value is UpdateItem => {
  if (value) {
    // キーの存在＆設定確認
    if (
      "Id" in value &&
      "Name" in value &&
      "BuyInterval" in value &&
      "LastBuyDate" in value &&
      "IsChecked" in value &&
      "CategoryName" in value
    ) {
      // 数値の型確認
      const numberParsedId = Number(value.Id);
      const numberParsedBuyInterval = Number(value.BuyInterval);
      if (
        !Number.isNaN(numberParsedId) &&
        !Number.isNaN(numberParsedBuyInterval)
      ) {
        // データの要件確認
        if (
          numberParsedId > 0 &&
          numberParsedBuyInterval > 0 &&
          moment(
            value.LastBuyDate,
            "YYYY-MM-DDThh:mm:ssZ",
            false // YYYY-MM-DDThh:mm:ss.000Z と認識されるので、曖昧な形式とする
          ).isValid()
        ) {
          return true;
        }
      }
    }
  }
  return false;
};

/**
 * 更新用の消耗品
 */
interface UpdateItem {
  /**
   * ID
   */
  Id: number;
  /**
   * 品名
   */
  Name: string;
  /**
   * 前回購入日
   */
  LastBuyDate: string;
  /**
   * 購入間隔
   */
  BuyInterval: number;
  /**
   * チェック有無
   */
  IsChecked: boolean;
  /**
   * カテゴリー
   */
  CategoryName: string;
}

const isAddItem = (value: any): value is AddItem => {
  const checkItem = value;
  // チェックを通すため、追加時の未設定項目を適当に設定
  checkItem.Id = 1;
  checkItem.IsChecked = false;
  return isUpdateItem(checkItem);
};

/**
 * 追加時の消耗品（IDは未設定）
 */
interface AddItem {
  /**
   * 品名
   */
  Name: string;
  /**
   * 前回購入日
   */
  LastBuyDate: string;
  /**
   * 購入間隔
   */
  BuyInterval: number;
  /**
   * カテゴリー
   */
  CategoryName: string;
}

app.post("/test", (req, res) => {
  res.status(200).json({ message: "OK" });
});

module.exports = app;
