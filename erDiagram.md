erDiagram
    物件マスタ {
        string 物件ID PK "物件の一意識別子"
        string 物件名 "物件の名称"
    }

    部屋マスタ {
        string 部屋ID PK "部屋の一意識別子"
        string 物件ID FK "物件マスタの物件ID"
        string 部屋番号 "部屋の番号または名称"
    }


    検針データ {
        string 記録ID PK "検針記録の一意識別子"
        string 部屋ID FK "部屋マスタの部屋ID"
        datetime 検針日時 "検針を行った日時"
        number 今回の指示数 "今回検針したメーターの指示数"
        string 写真URL "撮影した写真のGoogle Drive URL"
        number 前回指示数 "前回の検針時のメーター指示数"
        number 今回使用量 "今回の指示数 - 前回指示数"
        string 警告フラグ "異常値の場合「警告あり」、それ以外「正常」"
    }

    設定値 {
        string 設定項目名 PK "設定の名称"
        string 設定値 "設定の値"
    }

    物件マスタ ||--o{ 部屋マスタ : "has"
    部屋マスタ ||--o{ 検針データ : "has"
