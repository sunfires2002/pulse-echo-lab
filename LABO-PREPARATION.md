# LABO独立化：構成と公開手順

## 基点と範囲

- 保存元：`codex/pc-lab-goal-log` / `5d5789ec345afbcfd504eca112290a7325a81c9c`
- 正式版の比較対象：main / `dfffaab5ac05d0d2307d5ee900aaa58713c4a3cf`
- 独立化作業：`codex/lab-independent-stage1`（既存の準備差分を継続）

正式版main、保存元LABブランチ、本番Supabaseの設定・データは変更しない。新リポジトリは承認後に作成する。

## 保持する機能

- 16:9動画の大画面表示、PULSE・ECHO・ECHO+・REACTの自由配置、移動・リサイズ・透明度
- 合体・分離、配置保存・復元、動画だけ表示、名前設定、ローカル投稿・削除、音声入力の既存コード
- 24pxの新2採用済みアイコン、MATCH LOG仮データ4行、ROOMの未表示アイコン素材
- 秒単位シーク、再生つまみ、Chart.js時間軸による時間座標、分単位の反応集計と秒表示
- 再生・停止・時間表示、LABのYouTube controls=0実験
- 端末プレビュー、画面情報、戦術モードとその描画・レビュー処理

MATCH LOGは保存元と同じ仮データ。実際の得点検出やGOALフラグ、外部ツールへの送信は実装しない。音声入力はブラウザーの対応状況に依存し、端末プレビューは実機を再現するものではない。

## 正式版の公開後修正から取り込んだ部分

| 修正 | LABOでの扱い |
| --- | --- |
| Fire TV mode=tv起動 | プレビュー端末判定を残し、TV専用の読込経路を追加 |
| TVホームとmode=tv往復 | 相対URLのままLABO内のホーム・試合へ移動 |
| 視聴ページの試合結果非表示 | スコアDOMをVSに置換。サンプルホームのスコアは維持 |
| 戦術開始時の動画待ち | 動画APIの準備前にseekToを呼び出さない保護をLABO側に追加 |
| 自由配置UI統一 | 保存元の名称・アイコン・つまみを保持。合体案内と標準配置の幅下限を反映 |

mainのファイルでLAB全体を置き換えない。特にLAB時間軸、preview_device、MATCH LOGを維持する。

## データと接続

`data.js`は保存済み動画IDを含むサンプル2件、`lab-sample-events.js`は合成反応36件／動画区分を初回だけ作る。試合Bの前後半は表示検証のため同じ動画を共用する。
`config.js`は空の接続情報で凍結。Supabase SDKとcreateClient呼出しを配布しない。視聴／ホームのデータクライアントはnull固定。CSPのconnect-srcでSupabaseを許可しない。YouTubeとその再生関連ドメインは許可する。
既存の条件分岐にリモート処理の記述は残るが、リモートクライアントを生成する経路はない。将来の接続変更には設定だけでなく明示的な実装変更が必要。

LABOのブラウザーストレージは全て `PULSE_LAB_STORAGE` を通す。旧配置とメニューを読むのは移行時だけ。旧キーへ書き込む処理はない。別ドメインでは旧設定を直接読めないためJSONで移す。

## 配布構成

- `tools/lab-manifest.json`：Pages用ファイルとリポジトリ用ファイルの許可リスト
- `tools/prepare-pages.py`：Pages用出力（既存出力を上書きしない）
- `tools/prepare-repository.py`：新リポジトリ用のソース（Git履歴を含めない）
- `tools/audit-bundle.py`：不要ファイル、リモートクライアント、認証情報らしい文字列の検査

管理画面、本番バックアップ、Supabaseスキーマ、本番維持用workflow、旧リリース用テストは配布しない。将来のGOAL、PRISM CUT、ROOMはLABOのソース内で別の実験モジュールとして追加し、データ保存はLABO名前空間を使う。正式版のURL・保存・データクライアントへ接続しない。

## 承認後に必要な作業（今回未実施）

1. `sunfires2002/pulse-echo-lab` を新規作成。公開範囲を確認する。
2. prepare-repositoryの出力を新リポジトリの初期ソースとして登録する。pulse-echo-pilotのremoteやmainは操作しない。
3. Settings → Pages → Sourceを **GitHub Actions** に設定する。ブランチルートをそのまま公開しない。
4. workflowの対象リポジトリ名とGitHub Pages environmentの承認設定を確認する。
5. Actions → Publish standalone LAB → Run workflowを手動実行する。
6. build/deploy成功後 `https://sunfires2002.github.io/pulse-echo-lab/` を確認する。
7. 公開サイトで主要実験、配置移行、Supabase接続ゼロを再検証する。実機・音声・リモコンは別途確認する。

Supabase用のGitHub Secretsや管理者キーは不要。workflowは対象名のリポジトリで手動実行された場合のみ公開し、pulse-echo-pilotでは実行をスキップする。リポジトリ名が変わる場合は条件を更新する。

## 今回の検証と限界

ローカルの `/pulse-echo-lab/` パスで実YouTube再生を確認する。GitHub PagesそのもののURL・Actions実行・本番との同一オリジン上の移行は公開後に確認する。移行のローカル検証は検証専用ブラウザに旧設定を用意して実行し、利用者のブラウザの保存情報には触れない。

公開workflowの構成はGitHub公式「Using custom workflows with GitHub Pages」に合わせ、checkout v6 / configure-pages v5 / upload-pages-artifact v4 / deploy-pages v4を使用する。Actions自体の実行検証は公開承認後に行う。

### ローカル検証結果

- 1280×720 / 2500×928 のChromeで実YouTubeの再生、83秒へのクリックシーク、147秒へのつまみドラッグを確認。
- 時間軸0秒〜動画長1641秒、1分目の点30秒、反応集計の分単位を確認。
- 自由配置移動・リサイズ・保存・JSON書出し／読込み・再読み込み復元を確認。
- 合体→再読み込み復元→分離、端末プレビュー、戦術モード開始／終了と駒生成、試合A→BでLABモード保持、TVホーム往復を確認。
- MATCH LOG仮データ4行と5見出しアイコン（主要4種類＋MATCH LOG）を確認。
- ローカル投稿・削除を実行し、SupabaseへのHTTP要求とWebSocket接続は両サイズとも0件。ブラウザーのページエラーも0件。
- 保存移行の単体検証で、一度だけのコピー、旧キーへの書込みなし、名前／投稿者IDをコピーしない、不正JSON拒否、部分失敗時の復元を確認。
- 旧配置が重なっている場合はその重なりも保持する。ドラッグは見えているつまみ部分から行える。自動リセットはしない。
- ソース選別と公開物の監査を通過。管理画面・本番データバックアップ・スキーマ・本番用workflow・Git履歴は新リポジトリ用出力に含まれない。

実機Safari・Android・Fire TV、実マイク入力、長時間連続利用、GitHub Pages上の再生とActions実行、正式版と同じオリジンでの配置移行は未検証。現在のサンプルは端末内保存なので別端末間で投稿は共有しない。
