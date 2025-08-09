# Salesforce LWC - Contact Image Binder

取引先責任者（Contact）に関連付けたファイル（画像）を選択して、  
数式項目に画像を表示するための Lightning Web Component (LWC) と Apex コントローラです。

## 機能概要

- Contact レコードにアップロード済みのファイル一覧を取得
- ユーザーがファイルを選択し、指定の項目（例：`ImageDocId__c`）に Document Id を保存
- 数式項目（例：`Image__c`）で画像を表示可能
- 「紐づけ解除」ボタンで項目を空にして解除

## 対応オブジェクト / 項目例

- **対象オブジェクト**: Contact
- **カスタム項目**
  - `ImageDocId__c` (Text 18) … ファイルの Document Id を保持
  - `Image__c` (Formula(Text)) … `ImageDocId__c` を参照して画像を表示

## セットアップ手順

1. 本リポジトリをクローンまたは SFDX で Salesforce 環境にデプロイ
2. `ImageDocId__c` と `Image__c` を Contact オブジェクトに作成
3. Lightning アクションを作成  
   - 種別: Lightning Web Component  
   - コンポーネント: `c:jContactImageBinder`
4. ページレイアウトにアクションを追加
5. 動作確認

## 使用方法

1. Contact レコードにファイルをアップロード
2. アクションボタンからモーダルを開く
3. ファイルを選択して「紐づけ」ボタンを押す
4. 数式項目に画像が表示される
