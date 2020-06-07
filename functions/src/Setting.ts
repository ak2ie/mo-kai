export class Setting {
  /**
   * Firestore コレクション名
   */
  static COLLECTION_NAME = {
    /**
     * ユーザー情報
     */
    USERS: "Users",
    /**
     * ユーザー情報（削除済）
     */
    DELETED_USERS: "DeletedUsers",
  };

  static DOC_NAME = {
    ITEMS: "Items",
  };
}
