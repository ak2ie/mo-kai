import * as admin from "firebase-admin";
/** --------------------------------------------------------
 *  全ユーザーの消耗品データに"CategoryName"フィールドを追加する
 * 
 *  実行形式：../node_modules/.bin/tsc add_field_CategoryName.ts && export GOOGLE_APPLICATION_CREDENTIALS=****.json && firebase use mo-kai && node add_field_CategoryName.js
 * -------------------------------------------------------- */
(async () => {
  admin.initializeApp();
  const db = admin.firestore();

  // ユーザーのスナップショット取得
  const userSnapshot = await db.collection("Users").get();

  // 各ユーザーを順に処理
  userSnapshot.forEach(async (userDoc) => {
    const userItems = userDoc.data();

    userItems["Items"].forEach(item => {
      // 各ユーザーの全消耗品に"CategoryName"フィールドを追加
      item["CategoryName"] = null;
    });
    console.log(userItems);

    await userDoc.ref.set(userItems);
  });
})();