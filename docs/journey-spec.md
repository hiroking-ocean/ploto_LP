# 主要機能セクション「同じ1件が、画面ごとに違う姿で出てくる」実装仕様

対象: `ploto_LP` の `#features` セクション（現行の `.flow` を全面的に作り替える）
状態: 未実装。この文書が実装の唯一の根拠。
最終更新: 2026-08-03

---

## 0. これは何を見せるものか

**主張はひとつだけ。「同じ1件のタスクが、画面が変わると違う姿で出てくる」。**

「育つ」「情報が増える」はこの主張を伝えるための味付けであって、主役ではない。
迷ったら「見え方が変わること」を優先し、情報の増加は削ってよい。

現行セクションの見出し `features_title` は
「1件のタスクが、5つの画面を通って育っていく」で、主張が *育つ* 側に寄っている。
**この文言は 見え方 側へ書き直す**（→ §8）。

### 体験の流れ（1画面ぶん）

```
① 提示   画面のモックが正面に出る。その画面での主役タスクが光っている
② 解説   説明パネルが下から浮き上がる。モックは縮んで暗くなり、背景になる
③ 移動   主役タスクがカードとして剥がれ、次の画面へ飛びながら姿を変える
         到着したらフェードアウトし、次の画面の主役タスクが光って ① に戻る
```

これを ガント → カンバン → ノート → 優先度マトリクス → ホワイトボード の
5画面ぶん繰り返し、最後のホワイトボードは ③ を持たずに終わる。

---

## 1. 現行実装（作り替えの出発点）

| ファイル | 現状 | この作業での扱い |
|---|---|---|
| `template.html` | `#features` > `.section-header` + `.flow#task-flow`（左に sticky なタスクカード、右に5ステップ） | `.flow` を `.journey` に作り替え。**モックの中身（`.ui` 以下）はそのまま流用** |
| `styles.css` | `.flow*` / `.ui` `.gv` `.kv` `.nv` `.xv` `.wb` / `.uic` / `--u-*` | `.flow*` を `.journey*` へ。モックのCSSは無変更 |
| `app.js` | `DOMContentLoaded` 内の最終ブロック（`#task-flow`）約110行 | 全部差し替え |
| `locales/*.js` | 447キー ×5言語。`flow_*` `mock_*` `feature_*` | `flow_card_*` `flow_field_*` の去就は §8 |
| `build.js` | プリレンダ。`data-i18n` を innerHTML 注入 | **変更不要** |

### 触ってはいけないもの

- `.ui` 以下のモック5枚（`.gv` `.kv` `.nv` `.xv` `.wb` と `.uic` `--u-*`）。
  実画面を写したもので、検証済み。今回は「置き場所」だけを変える。
- ビュー5色 `--vc`（`styles.css:1315-1326`）。dataviz で検証済みの値。
  `[data-view='...']` と `[data-active='...']` の両方で効くようになっている。
- 既存の `data-i18n` キー。文言追加は5言語同時（`locales/{ja,en,de,fr,ko}.js`）。
  キー数は5ファイルで必ず一致させること（現在447）。

### 各モックの「主役タスク」がどこにいるか

飛ばす起点・着地点はこの要素の矩形を使う。

| 画面 | 主役タスクの要素 | 備考 |
|---|---|---|
| gantt | `.gv-row.is-sel`（表の行）と `.gv-lane.is-sel .gv-bar`（バー） | **DOM上は別の枝**。起点は行の矩形を使う |
| kanban | `.kv-col.c2 .uic.is-on` | 単一要素 |
| note | `.nv-node.is-on`（左ツリー）／本文は `.nv-doc` 全体 | 着地点は `.nv-doc` の上部 |
| matrix | `.uic.x1.is-on` | 単一要素 |
| whiteboard | `.wb-slot`（受け皿） | 現行の着地アニメで使っている |

実装では各モックにマーカー属性を足す:

```html
<div class="gv-row is-sel" data-journey-anchor="gantt">…
<div class="uic ac-blue is-on" data-journey-anchor="kanban">…
<div class="nv-doc" data-journey-anchor="note">…
<div class="uic x1 ac-blue is-on" data-journey-anchor="matrix">…
<div class="wb-slot" data-journey-anchor="whiteboard">…
```

---

## 2. 全体構造（DOM）

**マークアップは「モック → 説明」が縦に並ぶだけの素直な形にする。**
sticky も飛ぶカードも、JS が `data-enhanced` を立てたときだけ効かせる。
こうしておくと JS 無効・`prefers-reduced-motion`・狭い画面のときに、
**現在の LP とほぼ同じ、実績のある縦並びレイアウト**へ自動的に落ちる。

```html
<section class="features-section" id="features">
  <div class="container">
    <div class="section-header">…（現状維持）…</div>

    <div class="journey" id="task-journey">
      <ol class="journey-steps">

        <li class="journey-step" data-view="gantt" data-step="1">
          <div class="journey-screen">
            <div class="ui" aria-hidden="true">…既存のガントモックそのまま…</div>
          </div>
          <div class="journey-panel">
            <span class="journey-index"></span>            <!-- CSSカウンタ -->
            <h3  class="journey-title" data-i18n="feature_gantt_title">…</h3>
            <p   class="journey-lead"  data-i18n="feature_gantt_lead">…</p>
            <ul  class="journey-points">…要点3点…</ul>
            <a href="#" data-manual-link="gantt" data-i18n="manual_guide_more">…</a>
          </div>
        </li>

        …kanban / note / matrix / whiteboard も同じ形…

      </ol>
    </div>
  </div>
</section>
```

JS が初期化時に、**`.journey` の直下へ1個だけ**オーバーレイを作る:

```html
<div class="journey-flyer" id="journey-flyer" aria-hidden="true">
  <div class="jf-plate"></div>                     <!-- 箱だけ。角丸・枠・影 -->
  <div class="jf-face" data-face="gantt">…</div>   <!-- 中身。5枚 -->
  <div class="jf-face" data-face="kanban">…</div>
  <div class="jf-face" data-face="note">…</div>
  <div class="jf-face" data-face="matrix">…</div>
  <div class="jf-face" data-face="whiteboard">…</div>
</div>
```

`.journey-flyer` は `position: fixed`（ビューポート座標で動かすため）、
`pointer-events: none`、`z-index` はヘッダー(80px, z-index 高)より下、パネルより上。

> **注意**: `position: fixed` は `transform` / `filter` / `will-change: transform` を持つ
> 祖先があると、その祖先を基準にしてしまう。`.journey-flyer` は `.journey` 直下に置き、
> `.journey` とその祖先には transform 系を **絶対に付けない**。
> （`.journey-screen` には transform を掛けるが、flyer はその中に入れない）

### 顔（`.jf-face`）の中身

5枚とも「その画面でのタスクの姿」。**既存モックの部品クラスをそのまま使う**ので、
新規CSSはほぼ要らない。

| face | 使う既存クラス | 中身（累積した情報） |
|---|---|---|
| `gantt` | `.gv-row` 相当を自前で組む | 名前 ＋ 期間（8/1 - 8/6） |
| `kanban` | `.uic.ac-blue` + `.uic-pill` `.uic-t` `.uic-tags` `.uic-foot` | ＋ 工程（実装）、タグ |
| `note` | `.nv-doc` の縮小版（パンくず・タイトル・メタ・本文2行） | ＋ メモ（07-09 レビュー指摘を反映） |
| `matrix` | `.uic` + `.uic-score` `.uic-prog` | ＋ 優先度（スコア75 / 象限I） |
| `whiteboard` | `.wb-card` | ＋ 担当・進捗 |

顔ごとに**自然な大きさ**が違う（これが「形が変わる」の実体）。目安:

```
gantt        520 × 34    横長の行
kanban       228 × 132   縦のカード
note         440 × 210   ページ
matrix       190 × 150   カード
whiteboard   228 × 78    盤面のカード
```

実寸は言語で変わるので **JSが実測する**（§4）。上の数値はCSSの初期値の目安。

---

## 3. スクロールの割り当て

- 1画面あたり **120vh**。5画面で 600vh。
- `.journey-step { min-height: 120vh }`。
- モック `.journey-screen` は `position: sticky; top: calc(80px + 1.5rem)`。
  （ヘッダーが 80px 固定）
- 説明 `.journey-panel` は通常フロー。`margin-top: 44vh` で、モックの下から
  スクロールに合わせて上がってくる。

`.journey-step` 内の進行度 `p ∈ [0,1]` は次で求める:

```js
const r = step.getBoundingClientRect();
const p = clamp((-r.top) / (r.height - innerHeight * 0.35), 0, 1);
```

だいたい `p` と各段の対応:

| p | 状態 |
|---|---|
| 0.00 – 0.22 | ① 提示。モックは等倍、主役タスクが光る |
| 0.22 – 0.55 | ② 解説。パネルが上がりきり、モックは `scale(.86) translateY(-3vh) opacity(.42) blur(1px)` |
| 0.55 – 1.00 | ③ 移動。flyer が剥がれて画面についてくる（§4） |

②のモックの後退は **CSSクラス `.is-back` のトランジション**でよい（`p > 0.22` で付ける）。
毎フレーム値を書かない。書くのは flyer だけ。

**ただし ③ の着地だけは `p` で駆動しない。**
着地は「次のモックが画面の中央あたりに来たとき」に起きるべきもので、
これはステップの進行度ではなく**次のアンカーのビューポート内の位置**で決まる（§4.2）。

---

## 4. 飛ぶカード（flyer）

### 4.1 生存区間

flyer は **移動中だけ存在する**。停まっているときは見えない。
「モックに融合するときはフェードアウトで消す」方針なので、
**着地点と顔の大きさをぴったり合わせる必要はない**。ここが実装上いちばん楽になる点。

ステップ `i`（0始まり、最後の 4 = whiteboard は移動しない）で、
flyer は **剥がれる → 画面についてくる → 次のモックに収まる** の3段で動く。

```
剥がれ  a = clamp((p - 0.55) / 0.14, 0, 1)          ステップ進行度で駆動
収まり  s = clamp((HOLD_Y - anchorCenterY(i+1)) / (HOLD_Y - LAND_Y), 0, 1)
                                                     次のアンカーの位置で駆動
```

- `HOLD_Y = innerHeight * 0.78` … 次のアンカーがここまで上がってきたら収まり始める
- `LAND_Y = innerHeight * 0.50` … 画面のだいたい中央。ここで収まりきる

| 段 | 条件 | flyer |
|---|---|---|
| 剥がれ | `a` が 0→1 | 起点のアンカー上でフェードインし、保持点へ移動する |
| 追従 | `a=1` かつ `s=0` | 保持点にとどまる。ページだけがスクロールするので「ついてくる」ように見える |
| 収まり | `s` が 0→1 | 保持点から次のアンカーへ移動しながら顔を入れ替える |
| 消える | `s > 0.88` | フェードアウト。`s=1` で `display:none` |

顔の入れ替えは**収まりの区間で**行う（`s` 0.15→0.45 で face `i` を消し、
0.35→0.70 で face `i+1` を出す）。次のモックに近づきながら姿が変わる、という順序。

`s = 1` になった時点で画面 `i+1` の主役タスクを光らせる（`.is-arrived`）。

### 4.2 位置

`.journey-flyer { position: fixed; left: 0; top: 0; }` とし、
**transform だけで動かす**（left/top を毎フレーム書かない）。

**保持点（HOLD）**: ビューポート内の固定座標。
`x = 説明パネルと重ならない側`、`y = innerHeight * 0.34`。
ここに居座るあいだ、ページだけが動くので「タスクが追従してくる」ように見える。

```js
const HOLD = { x: holdX(), y: innerHeight * 0.34 };

// 起点・終点とも毎フレーム測り直す。両方の画面が sticky で動き続けるため、
// 一度測った値を使い回してはいけない。
const from = center(anchor[i].getBoundingClientRect());
const to   = center(anchor[i + 1].getBoundingClientRect());

let cx, cy;
if (s > 0) {                       // 収まり
  const e = ease(s);
  cx = lerp(HOLD.x, to.x, e);
  cy = lerp(HOLD.y, to.y, e);
} else {                           // 剥がれ → 追従
  const e = ease(a);
  cx = lerp(from.x, HOLD.x, e);
  cy = lerp(from.y, HOLD.y, e);
}
flyer.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
```

`holdX()` はデスクトップでは**コンテナの左寄り**（説明パネルを右寄せにする場合）。
パネルを下から出す構成にしたなら中央でよい。実物を見て決める。

> この作りだと flyer は **常にビューポート内**にいる。
> 起点→終点を直接補間すると、次のモックがまだ画面外の間はカードが
> 画面外へ出てしまうが、保持点を挟むことでそれが起きない。

### 4.3 形（plate の変形）

「形が変わる」は **plate（箱だけの要素）の width/height を補間**して作る。
文字は plate の上に乗る別レイヤー（`.jf-face`）で、**自分の自然な大きさのまま**
中央でクロスフェードする。plate ごと scale すると文字まで潰れるので、しない。

```js
const w = lerp(size[i].w, size[i + 1].w, e);
const h = lerp(size[i].h, size[i + 1].h, e);
plate.style.width  = w + 'px';
plate.style.height = h + 'px';
```

`size[i]` は初期化時に各 face を一度だけ実測（`offsetWidth` / `offsetHeight`）して持つ。
言語で変わるので必ず実測。`resize` で取り直す。

plate は `position:absolute; left:50%; top:50%; transform: translate(-50%,-50%)`。
face も同じ配置。plate が背景・角丸・枠・影を持ち、face は背景透明。

> width/height の変更はレイアウトを起こすが、flyer は `position: fixed` で
> ページから切り離されているため、影響はカード自身の中だけ。実測上問題ない。
> 念のため `.journey-flyer { contain: layout paint }` を付ける。

### 4.4 情報が足されるところ

「飛んでいる間に情報が付加される」形でよい（承認済み）。
face `i+1` に新しい行（工程 / メモ / 優先度）が含まれているので、
**その行だけ** face のフェードインより 0.08 遅らせて出すと「足された」ように見える。

```css
.jf-face .jf-new { transition: opacity .25s ease .12s, transform .25s ease .12s; }
.journey-flyer:not(.is-swapped) .jf-face .jf-new { opacity: 0; transform: translateY(4px); }
```

やり過ぎないこと。主役は形が変わることであって、行が増えることではない。

---

## 5. 主役タスクを光らせる

各画面で「これが同じ1件だ」と分かるように、モック側のアンカーに印を付ける。

```css
.journey-step.is-current [data-journey-anchor] {
  box-shadow: 0 0 0 2px var(--vc), 0 0 0 6px color-mix(in srgb, var(--vc) 22%, transparent);
}
```

- `--vc` はその画面の色（既存）。`.journey-step[data-view]` に効いている。
- ③の移動が始まったら起点側の印を消す（`opacity` を落とす程度でよい。
  要素そのものは消さない ＝ モックが欠けて見えるのを避ける）。
- 到着したら終点側に印を付ける。

**モックの中の主役タスクは消さない。** flyer はその上に重なって飛び去るだけで、
着地時はフェードアウトして「元からそこにいた」ものに溶ける。

---

## 6. 縮退（ここを外すと壊れる）

`data-enhanced` を立てる条件:

```js
const wide  = matchMedia('(min-width: 901px)');
const still = matchMedia('(prefers-reduced-motion: reduce)');
const on = wide.matches && !still.matches;
```

| 条件 | 見え方 |
|---|---|
| JS 無効 | 縦並び。モック → 説明 → モック → 説明 …（現行LPと同じ） |
| `reduce` | 同上。sticky も flyer も無し |
| 幅 ≤900px | 同上。`min-height: 120vh` も外す |
| 有効 | 本仕様の体験 |

CSSは**縦並びを既定**とし、`.journey[data-enhanced]` の中でだけ sticky と
`min-height: 120vh` を効かせる。`matchMedia` の `change` を購読して切り替える。

### 幅の下限で必ず確認すること

`.ui` は5つのタブが折り返さないため、**中身の最小幅が列幅を超える**。
`.journey-steps` と `.journey-step` に `min-width: 0`、
`.ui` に `min-width: 0; max-width: 100%` を必ず入れる。
入れないとページごと横スクロールする（過去に実際に起きた）。

確認は「`document.documentElement.scrollWidth <= innerWidth` が
400 / 560 / 760 / 900 / 1400px で成立すること」。

---

## 7. パフォーマンス

- スクロールハンドラは `requestAnimationFrame` で合流させる（現行は素のままだが、
  今回は毎フレーム矩形を2つ読んで transform と width/height を書くので必要）。
- 1フレームでやること: **読み（rect ×2）→ 計算 → 書き（transform, width, height, opacity）**。
  読みと書きを交互にしない。
- flyer が非活性のとき（どのステップも③に入っていない）は `display: none` にして
  一切測らない。
- `.journey-flyer { will-change: transform }` は活性時だけ付け、離れたら外す。

---

## 8. 文言（`locales/*.js`、5言語同時）

### 書き直すもの

- `features_title` … 「育っていく」から **見え方が変わる**主張へ。
  例（ja）: 「同じ1件のタスクが、画面ごとに違う姿で出てくる」
- `features_subtitle` … 上に合わせる。
  例（ja）: 「登録するのは1件。工程表では1本のバー、カンバンでは1枚のカード、
  ノートでは1ページ。同じデータを、その画面にとって自然な形で見せています。」
- `flow_closing_note` … 現行のままで趣旨は合う。要確認。

### 去就を決めるもの

| キー | 扱い |
|---|---|
| `flow_card_hint`（スクロールすると…） | 左の追従カードが無くなるので**削除**。 |
| `flow_field_period_label` / `_value` | flyer の gantt face で使う → **残す** |
| `flow_field_process_label` / `_value` | kanban face → 残す |
| `flow_field_memo_label` / `_value` | note face → 残す |
| `flow_field_priority_label` / `_value` | matrix face → 残す |
| `flow_task_name` | 全 face で使う → 残す |
| `flow_free_note_label` | パネルの無料枠注記 → 残す |

**削除・追加のあと、5ファイルのキー数が一致していること／
`template.html` の `data-i18n` に未定義キーが無いことを必ず検査する。**

---

## 9. 受け入れ条件

1. `npm run build` が通り、5言語 × (LP + マニュアル6ページ) が生成される
2. ロケール5ファイルのキー数が一致。テンプレートの `data-i18n` に未定義ゼロ
3. JS を切っても、5画面ぶんのモックと説明が上から順に全部読める
4. `prefers-reduced-motion: reduce` で sticky も flyer も動かない
5. 400 / 560 / 760 / 900 / 1400px で横スクロールが出ない
6. ダーク / ライト両方でモックが成立する（モックは元々テーマ非追随なので枠と影だけ確認）
7. ドイツ語（最長）で face とパネルが崩れない
8. 各パネルの「マニュアルを読む」が
   ja は `/ploto_LP/manual/{feature}.html`、他言語は `/ploto_LP/{lang}/manual/{feature}.html`
9. 実ブラウザで通しスクロールし、5画面ぶん「提示 → 解説 → 移動」が
   上下どちらの向きでも破綻しないこと

---

## 10. 判断待ち / 積み残し

### 実装後に実物を見て決める（先に決めない）

1. **ガントの起点**
   主役タスクは「表の行」と「タイムラインのバー」の2箇所にまたがっていて、
   DOM上は別の枝にある。まず **行のほう** を起点にして組み、
   動かしてみてからバー起点に変えるか決める。
   どちらでも動くように、`data-journey-anchor` を付け替えるだけで
   切り替わる作りにしておくこと。

2. **ノートの顔の大きさ**
   ページの形（440×210 目安）は他の顔の2倍以上ある。
   カンバンのカード（228×132）からの変形が大きすぎて、
   「形が変わる」ではなく「別物に入れ替わった」に見えるおそれがある。
   まず丸ごとのページで組み、見てから**上半分だけに切り詰める**か決める。

3. **保持点の x 座標**（§4.2 の `holdX()`）
   説明パネルを右寄せにするか下から出すかで変わる。実物を見て決める。

### 決定済み

4. **見出しの文言** … §8 のとおり `features_title` / `features_subtitle` を
   「見え方が変わる」側へ書き直す。**決定済み。実装に含める。**

5. **移動中にカードが画面外へ出る問題** … §4.2 の保持点で解決済み。
   起点→終点を直接補間せず、いったんビューポート内の保持点へ寄せて
   そこに居座らせる。次のモックが上がってきてから収まりに入るので、
   カードは常に画面内にいる。**追加の対処は不要。**

### あとで考える

6. **セクションが縦に長くなる**（600vh）
   `#download` までの距離が今より約1.5画面ぶん伸びる。
   **できてから実物を見て判断する。** 詰めるなら②解説の滞留を削って
   100vh/画面まで下げられる（`.journey-step { min-height }` の1箇所）。

---

## 11. 作業順（推奨）

1. `template.html`: `.flow` → `.journey` の**縦並びだけ**に作り替える（sticky も flyer も無し）。
   この時点で JS 無効時の見た目が完成し、以降の縮退の正解になる
2. `locales`: §8 の文言差し替え。5言語・キー数一致を検査
3. `styles.css`: `.journey*` の縦並びCSS → その後 `[data-enhanced]` の sticky と `.is-back`
4. `app.js`: ステップ進行度 `p` と `.is-current` / `.is-back` の付け外しまで。**まだ飛ばさない**
5. flyer のマークアップ生成と5つの face、実測、フェードイン／アウト
6. 移動と変形の補間
7. §9 の受け入れ条件を上から順に確認
