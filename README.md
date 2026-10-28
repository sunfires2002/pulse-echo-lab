# PULSE ECHO LABO

独立したPC実験環境。公開済みの `pulse-echo-pilot` とは別に管理する。

- 初期データ：保存元LABにあった動画IDを使ったサンプル試合2件、仮反応36件／動画区分。
- 投稿・削除・プロフィール・配置は `pulse_echo_lab_v1:` で始まる端末内保存のみ。
- 本番Supabaseへの接続はしない。SDKと認証情報を配布せず、データクライアントは `null` 固定。
- YouTube・Chart.jsの取得にはインターネット接続が必要。オフライン動画再生環境ではない。
- 新リポジトリとGitHub Pagesはまだ作成・公開していない。

## 起動

`python3 tools/prepare-pages.py NEW_OUTPUT_DIR` で新しいフォルダに公開ファイルを出力し、その親をHTTPで配信する。
GitHub Pagesに近いパスで確認する場合は、出力先を `.../pages/pulse-echo-lab` として `.../pages` を配信する。
ホームからサンプル試合を選ぶと `match.html?id=...&mode=lab` が開く。

## 配置の移行

初回だけ、同じオリジンに旧レイアウト／メニューキーがあればLABO用キーへコピーする。元データは削除・変更しない。既にLABO用データがある場合は優先し、各キーの移行記録がある場合は再コピーしない。

PCメニューの「配置を書き出す」でJSON保存。「配置JSONを読み込む」で別ブラウザ・別ドメインへ移行できる。ファイルはレイアウトとメニュー位置だけで、名前・投稿者IDや反応データを含めない。
同一GitHubアカウントのプロジェクトPagesはオリジンが共通なので、URLのパスだけで保存が分離されると考えないこと。

## 検証

NodeとPlaywright（Chromeを利用可能な環境）が必要。

```sh
node tests/lab-storage.cjs
LAB_TEST_URL=http://127.0.0.1:8012/pulse-echo-lab/ LAB_EVIDENCE_DIR=/absolute/path/evidence node tests/lab-independent.cjs
```

ブラウザーテストはlocalhost限定。本番Supabaseへの全HTTP要求とWebSocket接続を監視する。再生・シークは実YouTubeを使い、実マイクやFire TVリモコンは対象外。

## 新リポジトリへ渡すファイル

`python3 tools/prepare-repository.py NEW_SOURCE_DIR` で選別済みのソースを出力する。
`python3 tools/audit-bundle.py NEW_SOURCE_DIR` で監査する。
この出力だけを新リポジトリへ入れる。元リポジトリ全体やGit履歴はコピーしない。
公開方法・保持機能・差分は [LABO-PREPARATION.md](LABO-PREPARATION.md) を参照。
