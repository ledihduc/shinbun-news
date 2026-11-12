import { editorialContent } from './editorial-content.js';
import { dailyNews20261113 } from './daily-news-2026-11-13.js';
import { dailyTech20261113 } from './daily-tech-2026-11-13.js';
import { dailyNews20261112 } from './daily-news-2026-11-12.js';
import { dailyTech20261112 } from './daily-tech-2026-11-12.js';
import { dailyNews20261110 } from './daily-news-2026-11-10.js';
import { startupNews20261110 } from './startup-news-2026-11-10.js';
import { dailyNews20261109 } from './daily-news-2026-11-09.js';
import { dailyTech20261109 } from './daily-tech-2026-11-09.js';

export const categories = [
  { slug: 'ai', name: 'AI・生成AI', short: 'AI', description: '生成AIとAIエージェントを、実務で安全に生かすための知識と事例を届けます。' },
  { slug: 'dx', name: 'DX', short: 'DX', description: 'データとデジタル技術を、現場の変化と事業成果につなげるヒントを解説します。' },
  { slug: 'security', name: 'セキュリティ', short: 'セキュリティ', description: '変化する脅威に備え、組織と情報を守るための考え方を基礎から整理します。' },
  { slug: 'cloud', name: 'クラウド', short: 'クラウド', description: 'クラウドの設計、運用、コスト最適化を、実践的な視点で読み解きます。' },
  { slug: 'manufacturing', name: '製造・ロボティクス', short: '製造', description: '製造現場のデータ活用と自動化を、働く人の視点から考えます。' },
  { slug: 'business', name: '経済・ビジネス', short: '経済', description: '企業戦略、雇用、市場、消費の変化を、一次情報とデータから読み解きます。' },
  { slug: 'society', name: '社会・暮らし', short: '社会', description: '教育、働き方、防災、旅、住まいなど、暮らしに関わる変化を公表資料から読み解きます。' }
];

const commonAuthor = '新聞・ニュース編集部';

const baseArticles = [
  {
    id: 'a01', slug: 'ai-agent-data-and-permissions', title: 'AIエージェント導入前に整理したいデータと権限',
    description: 'AIエージェントを業務に組み込む前に、利用データの範囲、アクセス権限、判断の境界をどう設計するかを整理します。',
    category: 'ai', type: '技術解説', tags: ['AIエージェント', 'データ活用', 'ガバナンス'], image: '/assets/data-center.jpg',
    publishedAt: '2026-10-25', updatedAt: '2026-10-25', author: commonAuthor, readTime: 7, featured: true, popular: 1,
    points: ['利用できるデータを目的別に棚卸しする', '権限は最小化し、操作ログを残す', '人が判断する境界を先に決める'],
    sections: [
      { heading: '最初に「できること」を狭く定義する', body: ['AIエージェントは、情報を探すだけでなく複数の手続きをまたいで処理できます。だからこそ、導入時は対象業務を広げすぎず、入力・判断・実行の範囲を明文化することが重要です。', 'たとえば社内規程の検索から始め、回答根拠が示せることを確認してから申請処理へ進むと、評価と改善のサイクルを作りやすくなります。'] },
      { heading: 'データと権限を同じ表で管理する', body: ['データの所在、更新責任者、機密区分、利用目的を一覧にし、エージェントが参照できる範囲と操作できる範囲を分けます。読み取り権限と更新権限を一括で与えないことが基本です。'], list: ['公開範囲と保持期間を確認する', '個人情報や機密情報を分類する', 'サービスアカウントの権限を定期的に見直す'] },
      { heading: '人が介入する設計を残す', body: ['金額の確定、外部への送信、顧客情報の更新など、影響が大きい操作は承認を挟みます。失敗を前提に、停止方法と復旧手順まで運用設計に含めることが、本番利用への近道です。'] }
    ]
  },
  {
    id: 'a02', slug: 'generative-ai-from-poc-to-production', title: '生成AIの業務導入、PoCから本番運用へ進むための5つの視点',
    description: '試行で終わらせず、現場で継続利用される仕組みに育てるための評価指標と運用設計を解説します。',
    category: 'ai', type: '導入事例', tags: ['生成AI', 'PoC', '業務改革'], image: '/assets/laptop-office.jpg',
    publishedAt: '2026-10-24', author: commonAuthor, readTime: 6, featured: true, popular: 2,
    points: ['利用頻度より業務成果を見る', '品質を測れる基準を用意する', '現場の改善提案を運用に戻す'],
    sections: [
      { heading: 'PoCの成功条件を業務の言葉で決める', body: ['回答の見栄えだけでは、本番移行の判断はできません。作業時間、確認回数、差し戻し率など、現場が理解できる指標に置き換えます。'] },
      { heading: '品質とコストを一緒に測る', body: ['モデルの精度、応答時間、利用コストは相互に影響します。すべてを最大化するのではなく、業務ごとに許容範囲を決めることが大切です。'], list: ['正解例と失敗例を蓄積する', '人による確認時間もコストに含める', '利用量が増えた場合を試算する'] },
      { heading: '改善できる運用を作る', body: ['問い合わせ窓口、プロンプトや参照データの変更手順、利用停止の基準を決めます。現場のフィードバックが改善担当へ届く短い経路が、継続利用を支えます。'] }
    ]
  },
  {
    id: 'a03', slug: 'rag-internal-search-design', title: 'RAGの基本と、社内検索を使いやすくする設計',
    description: '社内ナレッジを生成AIで扱うRAGの仕組みと、検索品質を左右する文書整備の要点を紹介します。',
    category: 'ai', type: '技術解説', tags: ['RAG', '生成AI', '社内検索'], image: '/assets/data-center.jpg',
    publishedAt: '2026-10-23', author: commonAuthor, readTime: 8, popular: 3,
    points: ['検索と生成を分けて評価する', '文書の更新日と責任者を持つ', '根拠への導線を必ず表示する'],
    sections: [
      { heading: 'RAGは検索品質が土台になる', body: ['RAGは、質問に関連する資料を探し、その内容をもとに回答を生成する仕組みです。回答の自然さだけでなく、必要な資料を正しく見つけられるかを先に評価します。'] },
      { heading: '文書を検索しやすい単位に整える', body: ['長い文書を機械的に分割するだけでは、前提が失われることがあります。見出し、対象部署、有効期間などの情報を付け、意味のまとまりを保ちます。'] },
      { heading: '答えより根拠に戻れる体験を', body: ['回答には参照した文書名と該当箇所を示し、利用者が原文を確認できるようにします。不確かな場合に回答しない選択肢も、信頼性の一部です。'] }
    ]
  },
  {
    id: 'a04', slug: 'ai-data-management-basics', title: 'AI活用に必要なデータ管理とは',
    description: '収集・整理・権限・品質。AIの効果を支えるデータ管理を、現場で始めやすい順序で整理します。',
    category: 'ai', type: '技術解説', tags: ['データ活用', 'AI', 'データ品質'], image: '/assets/analytics-team.jpg',
    publishedAt: '2026-10-21', author: commonAuthor, readTime: 7, popular: 4,
    points: ['重要データから小さく始める', '品質の責任者を決める', '使われ方を継続して観測する'],
    sections: [
      { heading: '量よりも目的との適合を見る', body: ['大量のデータがあっても、業務目的に合わなければ価値は生まれません。まず意思決定に必要な項目を特定し、欠損や表記ゆれを確認します。'] },
      { heading: '更新され続ける仕組みにする', body: ['一度のクレンジングで終わらせず、データが作られる入口で品質を保つ設計が必要です。入力ルールと責任範囲を現場と一緒に決めます。'] },
      { heading: '利用履歴を改善につなげる', body: ['どのデータが参照され、どこで判断に迷ったかを記録します。利用実態を見ながら優先順位を変えることで、管理負荷を抑えられます。'] }
    ]
  },
  {
    id: 'a05', slug: 'choosing-ai-tools-for-work', title: '業務に合ったAIツールの選び方',
    description: '多様なAIツールから、自社の業務、セキュリティ、運用体制に合うものを選ぶための比較軸を示します。',
    category: 'ai', type: '技術解説', tags: ['AIツール', '選定', 'ガバナンス'], image: '/assets/laptop-office.jpg',
    publishedAt: '2026-10-20', author: commonAuthor, readTime: 8,
    points: ['機能表より利用場面を比べる', 'データの扱いを契約前に確認する', '移行しやすさを評価に含める'],
    sections: [
      { heading: '利用シーンから要件を作る', body: ['多機能な製品が最適とは限りません。誰が、どの情報を使い、何を完了したいのかを具体化すると、必要な機能が見えてきます。'] },
      { heading: '管理機能と契約条件を確認する', body: ['入力データの学習利用、保存地域、ログ管理、退職者のアカウント停止など、運用時に必要な条件を確認します。'] },
      { heading: '小規模な比較で使い勝手を見る', body: ['同じ業務を複数ツールで試し、結果だけでなく修正のしやすさや利用者の負担を比べます。評価記録は次の選定にも活用できます。'] }
    ]
  },
  {
    id: 'a06', slug: 'measuring-ai-introduction', title: 'AI導入の効果をどう測るか',
    description: '効率化だけに偏らず、品質、リスク、学習効果まで含めたAI導入の評価方法を考えます。',
    category: 'ai', type: '導入事例', tags: ['AI', '効果測定', 'KPI'], image: '/assets/factory-robot.jpg',
    publishedAt: '2026-10-18', author: commonAuthor, readTime: 7,
    points: ['導入前の状態を記録する', '定量と定性を組み合わせる', '評価結果から停止も判断する'],
    sections: [
      { heading: '比較できる基準線を作る', body: ['導入前の処理時間、誤り、問い合わせ件数を測っておくと、変化を説明しやすくなります。繁忙期など条件の違いにも注意します。'] },
      { heading: '見えにくい効果を拾う', body: ['担当者の心理的負担、ナレッジ共有、顧客対応の一貫性は数字だけでは捉えにくいため、短いインタビューを組み合わせます。'] },
      { heading: '継続条件を決める', body: ['改善が見られない場合に、対象業務を変えるのか、データを見直すのか、停止するのかを判断できる期限と責任者を設定します。'] }
    ]
  },
  {
    id: 'a07', slug: 'manufacturing-dx-data-to-improvement', title: '製造現場のDX、データを業務改善につなげる',
    description: '設備データを集めるだけで終わらせず、現場の判断と改善活動につなげる進め方を紹介します。',
    category: 'manufacturing', type: '導入事例', tags: ['製造DX', 'IoT', '業務改善'], image: '/assets/factory-robot.jpg',
    publishedAt: '2026-10-17', author: commonAuthor, readTime: 9, featured: true,
    points: ['課題から必要データを逆算する', '現場の判断を可視化する', '改善の小さな成功を共有する'],
    sections: [
      { heading: 'センサー導入を目的にしない', body: ['設備の停止、品質のばらつき、段取り時間など、改善したい現象を先に決めます。必要な精度と収集頻度は目的によって変わります。'] },
      { heading: '現場の知識をデータに重ねる', body: ['数値の変化には、材料、気温、作業手順など複数の理由があります。作業者の気づきを記録し、データと照らして仮説を立てます。'] },
      { heading: '毎日の確認に組み込む', body: ['ダッシュボードを作るだけでなく、朝会や引き継ぎで何を見るかを決めます。判断と行動までつながって初めて、データは改善の道具になります。'] }
    ]
  },
  {
    id: 'a08', slug: 'robot-safety-first-design', title: '協働ロボット導入で見落とせない安全設計',
    description: '人とロボットが同じ空間で働くために、工程、動線、教育をどう見直すかを基礎から解説します。',
    category: 'manufacturing', type: '技術解説', tags: ['協働ロボット', '安全', '自動化'], image: '/assets/factory-robot.jpg',
    publishedAt: '2026-10-15', author: commonAuthor, readTime: 8, popular: 5,
    points: ['工程全体でリスクを評価する', '例外作業を洗い出す', '運用開始後も変更を記録する'],
    sections: [
      { heading: '正常時だけでなく例外時を見る', body: ['詰まりの除去、清掃、保守など、人が設備へ近づく場面を洗い出します。頻度が低くても影響が大きい作業は優先して対策します。'] },
      { heading: '動線と役割を再設計する', body: ['ロボットの速度制御だけでなく、材料の置き場所、通路、作業者の視界を含めて工程を見直します。'] },
      { heading: '教育を更新し続ける', body: ['担当者変更や工程変更に合わせ、手順書と教育内容を更新します。ヒヤリハットを共有できる雰囲気も安全設計の一部です。'] }
    ]
  },
  {
    id: 'a09', slug: 'predictive-maintenance-small-start', title: '予知保全を小さく始めるデータ設計',
    description: 'すべての設備を対象にせず、停止影響の大きい工程から予知保全を始める方法をまとめます。',
    category: 'manufacturing', type: '技術解説', tags: ['予知保全', 'データ分析', 'IoT'], image: '/assets/analytics-team.jpg',
    publishedAt: '2026-10-12', author: commonAuthor, readTime: 7,
    points: ['停止影響で対象を選ぶ', '故障だけでなく兆候を記録する', '保全担当者の判断を生かす'],
    sections: [
      { heading: '対象設備を絞る', body: ['故障頻度だけでなく、停止したときの生産影響、部品調達時間、安全への影響から優先順位を決めます。'] },
      { heading: '正常データを蓄積する', body: ['故障データは少ないため、正常時の振動、温度、電流の変化を継続して記録し、普段との違いを捉えます。'] },
      { heading: '現場で使える通知にする', body: ['検知精度だけでなく、通知を受けた担当者が何を確認し、どう判断するかまで設計します。誤報への対応も記録し改善します。'] }
    ]
  },
  {
    id: 'a10', slug: 'zero-trust-basics', title: 'ゼロトラストの基本を整理する',
    description: '境界防御との違いから、認証、端末、ログを段階的に整える実践のポイントまでを解説します。',
    category: 'security', type: '技術解説', tags: ['ゼロトラスト', '認証', 'セキュリティ'], image: '/assets/security-ops.jpg',
    publishedAt: '2026-10-11', author: commonAuthor, readTime: 8, featured: true,
    points: ['毎回のアクセスを検証する', 'IDと端末の状態を組み合わせる', '一度に全面刷新しない'],
    sections: [
      { heading: '場所ではなくアクセスを確認する', body: ['社内ネットワークにいるだけで信頼せず、誰が、どの端末から、何へアクセスするかを継続的に確認する考え方です。'] },
      { heading: 'ID管理を起点にする', body: ['多要素認証、退職者アカウントの停止、特権権限の棚卸しなど、基本的なID管理が土台になります。'], list: ['重要サービスから多要素認証を適用する', '共有アカウントを減らす', '管理者権限の利用を記録する'] },
      { heading: '段階的に適用範囲を広げる', body: ['重要データを扱う業務から始め、利用者への影響と運用負荷を確認します。検知ルールは業務変化に合わせて調整します。'] }
    ]
  },
  {
    id: 'a11', slug: 'incident-first-hour', title: 'セキュリティ事故、最初の1時間に確認すること',
    description: '混乱しやすい初動で、被害拡大を防ぎながら事実を保全するための確認順序を整理します。',
    category: 'security', type: 'ニュース', tags: ['インシデント対応', '初動', 'BCP'], image: '/assets/security-ops.jpg',
    publishedAt: '2026-10-09', author: commonAuthor, readTime: 6,
    points: ['事実と推測を分ける', '証拠を保全して影響を抑える', '連絡窓口を一本化する'],
    sections: [
      { heading: '時刻と事実を記録する', body: ['検知時刻、発見者、対象端末、最初に見えた症状を記録します。急いで操作すると証拠が失われるため、手順に従います。'] },
      { heading: '影響範囲を限定する', body: ['必要に応じて端末やアカウントを隔離しますが、電源断など影響の大きい操作は担当者と判断します。'] },
      { heading: '伝える内容を揃える', body: ['社内外への連絡では、判明した事実、未確認事項、次の更新予定を分けます。推測を広げないことが信頼を守ります。'] }
    ]
  },
  {
    id: 'a12', slug: 'saas-account-inventory', title: '増え続けるSaaSアカウントをどう棚卸しするか',
    description: '部門ごとに増えたSaaSを可視化し、不要アカウントと過剰権限を減らす実務手順を紹介します。',
    category: 'security', type: '技術解説', tags: ['SaaS', 'ID管理', '棚卸し'], image: '/assets/cloud-team.jpg',
    publishedAt: '2026-10-07', author: commonAuthor, readTime: 7,
    points: ['契約と利用実態を照合する', '退職・異動フローと連携する', '例外の期限を決める'],
    sections: [
      { heading: 'まず利用サービスを見つける', body: ['経費、SSO、ブラウザ利用状況など複数の情報からサービスを洗い出します。管理部門が把握していない利用も責めずに確認します。'] },
      { heading: '利用者と権限を確認する', body: ['最終利用日、所属、管理者権限を照合し、不要なアカウントを停止します。停止前に業務データの引き継ぎを確認します。'] },
      { heading: '棚卸しを定例化する', body: ['四半期ごとなど頻度を決め、異動や退職時には自動で確認タスクが発生する流れを作ります。'] }
    ]
  },
  {
    id: 'a13', slug: 'cloud-cost-first-step', title: 'クラウドコストを見直すための最初の一歩',
    description: '請求額の削減だけでなく、誰が何のために使っているかを見える化する基本手順を紹介します。',
    category: 'cloud', type: '技術解説', tags: ['クラウド', 'コスト最適化', 'FinOps'], image: '/assets/cloud-team.jpg',
    publishedAt: '2026-10-05', author: commonAuthor, readTime: 7, featured: true,
    points: ['用途が分かるタグを付ける', '未使用資源を定期確認する', '開発速度とのバランスを見る'],
    sections: [
      { heading: '請求をチームと用途に分ける', body: ['総額だけを見ても改善点は見えません。サービス、環境、担当チーム、プロジェクトで分類し、増減の理由を説明できる状態にします。'] },
      { heading: '止められるものから確認する', body: ['未接続のディスク、古いスナップショット、夜間に使わない検証環境など、影響を確認しやすい対象から改善します。'] },
      { heading: 'コストを設計判断に戻す', body: ['月次レポートで終わらせず、設計レビューや開発計画にコスト情報を組み込みます。削減額だけでなく、運用負荷も評価します。'] }
    ]
  },
  {
    id: 'a14', slug: 'multi-cloud-operation-rules', title: 'マルチクラウド運用で先に決めたい共通ルール',
    description: '複数クラウドを安全に運用するため、ID、ログ、命名、責任分界の共通ルールを整理します。',
    category: 'cloud', type: '技術解説', tags: ['マルチクラウド', '運用', 'ガバナンス'], image: '/assets/data-center.jpg',
    publishedAt: '2026-10-03', author: commonAuthor, readTime: 8,
    points: ['共通化する範囲を限定する', 'ログの保存方針を揃える', '例外申請を簡潔にする'],
    sections: [
      { heading: 'すべてを同じにしない', body: ['各クラウドの強みを生かしつつ、ID、監査ログ、データ分類など事故時に必要な基準を共通化します。'] },
      { heading: '責任分界をサービス単位で示す', body: ['基盤チーム、開発チーム、クラウド事業者の責任を表にし、障害時の連絡先と判断者を明確にします。'] },
      { heading: '例外を追跡できるようにする', body: ['標準から外れる構成には理由、期限、代替策を記録します。例外を禁止するだけでは、見えない運用が増えてしまいます。'] }
    ]
  },
  {
    id: 'a15', slug: 'backup-restore-rehearsal', title: 'バックアップは「戻せるか」で評価する',
    description: '取得できている安心から一歩進み、復旧時間と手順を確認するリストア訓練の進め方を解説します。',
    category: 'cloud', type: '導入事例', tags: ['バックアップ', '復旧', 'BCP'], image: '/assets/data-center.jpg',
    publishedAt: '2026-10-01', author: commonAuthor, readTime: 6,
    points: ['復旧目標を業務と合意する', '別環境で定期的に戻す', '手順の詰まりを記録する'],
    sections: [
      { heading: 'データごとに目標を決める', body: ['何時間前までの状態へ戻すか、何時間で業務を再開するかを、データの重要度に応じて決めます。'] },
      { heading: '本番に影響しない形で試す', body: ['隔離した環境へ復元し、アプリケーションから読み取れるところまで確認します。暗号鍵や依存サービスも対象です。'] },
      { heading: '訓練結果を手順へ戻す', body: ['権限不足、担当者不在、想定外の待ち時間などを記録し、次回までに担当と期限を決めて改善します。'] }
    ]
  },
  {
    id: 'a16', slug: 'dx-workflow-observation', title: 'DXの出発点は、業務フローを観察すること',
    description: 'ツール導入の前に、現場の判断、待ち時間、二重入力を捉える業務観察の方法を紹介します。',
    category: 'dx', type: '技術解説', tags: ['DX', '業務改革', 'プロセス'], image: '/assets/analytics-team.jpg',
    publishedAt: '2026-09-29', author: commonAuthor, readTime: 7, featured: true,
    points: ['担当者の工夫を観察する', '待ち時間もフローに含める', '例外処理を先に理解する'],
    sections: [
      { heading: '手順書と実際の違いを見る', body: ['現場では、状況に応じた判断や補助的な表が使われています。まず仕事を見せてもらい、なぜその工夫が必要かを聞きます。'] },
      { heading: '情報の受け渡しを追う', body: ['入力と出力だけでなく、確認待ち、転記、差し戻しを記録します。部署をまたぐ境界に改善の余地が見つかることがあります。'] },
      { heading: '小さな変化を試す', body: ['全体を一度に変えず、一つの申請や一つのチームで改善を試します。現場の負担と効果を確かめてから広げます。'] }
    ]
  },
  {
    id: 'a17', slug: 'primary-sources-for-tech-news', title: '技術ニュースを読み解く、一次情報の確かめ方',
    description: '発表資料や技術文書へ戻り、見出しだけでは分からない条件と対象範囲を確認する方法をまとめます。',
    category: 'dx', type: 'ニュース', tags: ['情報収集', '一次情報', 'リテラシー'], image: '/assets/laptop-office.jpg',
    publishedAt: '2026-09-27', author: commonAuthor, readTime: 6,
    points: ['発表主体と更新日を見る', '適用条件と除外条件を探す', '複数の資料を照合する'],
    sections: [
      { heading: '見出しから原文へ戻る', body: ['ニュースの要約は入口です。製品発表なら公式文書、技術仕様なら原典へ進み、対象地域、提供時期、前提条件を確認します。'] },
      { heading: '数字の母集団を確認する', body: ['割合や改善率には、対象人数、比較期間、測定方法があります。本文や注記まで読み、異なる条件の数字を並べないようにします。'] },
      { heading: '不明点を残して共有する', body: ['確認できたことと未確認のことを分けます。早さを優先して断定するより、更新できるメモとして共有する方が実務に役立ちます。'] }
    ]
  },
  {
    id: 'a18', slug: 'dashboard-that-drives-action', title: '行動につながるダッシュボードの作り方',
    description: '指標を並べるだけでなく、異常に気づき、次の行動を選べるダッシュボード設計を考えます。',
    category: 'dx', type: '技術解説', tags: ['データ可視化', 'KPI', '業務改善'], image: '/assets/analytics-team.jpg',
    publishedAt: '2026-09-25', author: commonAuthor, readTime: 7,
    points: ['利用者と判断場面を決める', '比較できる基準を置く', '指標から行動へ導く'],
    sections: [
      { heading: '誰のための画面かを決める', body: ['経営、部門長、現場担当では、見る頻度と必要な粒度が異なります。一つの画面にすべてを詰め込まないことが大切です。'] },
      { heading: '数字に文脈を与える', body: ['前週、目標、通常範囲と比較できるようにし、変化の理由を確認できる詳細への導線を用意します。'] },
      { heading: '会議と運用に組み込む', body: ['どの指標がどの状態なら誰が確認するかを決めます。使われない指標は定期的に減らし、判断に集中できる画面を保ちます。'] }
    ]
  },
  {
    id: 'a19', slug: 'data-governance-first-role', title: 'データガバナンス、最初に決める役割とは',
    description: '大きな組織図を作る前に、データの意味、品質、利用判断を担う役割を明確にします。',
    category: 'dx', type: '技術解説', tags: ['データガバナンス', '組織', 'データ活用'], image: '/assets/cloud-team.jpg',
    publishedAt: '2026-09-22', author: commonAuthor, readTime: 8,
    points: ['データの意味を決める人を置く', '品質問題の連絡先を明確にする', '利用可否の判断期限を決める'],
    sections: [
      { heading: '所有ではなく責任を定義する', body: ['データを囲い込む担当ではなく、意味を説明し、品質を保ち、適切な利用を助ける役割として定義します。'] },
      { heading: '現場と専門部門をつなぐ', body: ['業務を知る担当者、データ基盤担当、法務・セキュリティが短時間で相談できる経路を作ります。'] },
      { heading: '判断の記録を残す', body: ['利用を認めた条件や見送った理由を記録すると、似た相談へ一貫して対応でき、ルール改善にも使えます。'] }
    ]
  },
  {
    id: 'a20', slug: 'meeting-automation-boundaries', title: '会議業務を自動化するときの境界線',
    description: '文字起こし、要約、タスク抽出を安全に使いながら、人が担う合意形成を守る設計を考えます。',
    category: 'dx', type: '導入事例', tags: ['業務自動化', '生成AI', '会議'], image: '/assets/cloud-team.jpg',
    publishedAt: '2026-09-19', author: commonAuthor, readTime: 6,
    points: ['記録の対象を参加者へ伝える', '決定事項は人が確認する', '保存期間と共有範囲を決める'],
    sections: [
      { heading: '自動化する作業を分ける', body: ['文字起こし、要点の候補、タスク案の作成は自動化しやすい一方、合意の有無や発言意図は人が確認します。'] },
      { heading: '参加者の安心を設計する', body: ['記録方法、利用目的、保存期間、削除依頼の窓口を事前に伝えます。機密性が高い会議では利用しない判断も必要です。'] },
      { heading: '公式記録へ反映する手順を作る', body: ['自動生成された内容をそのまま確定せず、担当者が確認してから議事録やタスク管理へ反映します。'] }
    ]
  },
  {
    id: 'a21', slug: 'climate-adaptation-investment-gap', title: '気象災害の経済損失に備える「適応投資」',
    description: '極端気象が事業と社会基盤へ与える影響を踏まえ、企業が進めるべき気候適応投資の優先順位を整理します。',
    category: 'business', type: 'ニュース解説', tags: ['気候変動', '適応投資', '事業継続'], image: '/assets/cloud-team.jpg',
    publishedAt: '2026-11-08', author: commonAuthor, readTime: 8, featured: true, popular: 1,
    points: ['損失額だけでなく事業停止時間を把握する', '拠点と供給網の弱点から投資を決める', '残るリスクと復旧計画を継続して更新する'],
    sections: [
      { heading: '気候リスクを経営課題として捉える', body: ['極端気象は設備や物流、人員配置へ連鎖的な影響を及ぼします。', '企業は災害後の復旧だけでなく、被害を小さくする投資を平時から検討する必要があります。'] },
      { heading: '重要業務から弱点を見つける', body: ['拠点、電力、水、通信、主要取引先への依存を整理します。', '一律の対策ではなく、停止影響が大きい業務から優先順位を付けます。'] },
      { heading: '投資効果を停止時間で測る', body: ['防水や冷却、代替輸送、早期警戒など複数の選択肢を比べます。', '損失回避額だけでなく復旧時間や従業員の安全も評価対象にします。'] }
    ]
  },
  {
    id: 'a22', slug: 'softbank-abb-robotics-china-review', title: 'ソフトバンクGのABBロボティクス買収、中国審査で不透明に',
    description: '中国当局から買収禁止の通知を受けたABBロボティクス案件について、確認済みの事実と今後の論点を整理します。',
    category: 'manufacturing', type: 'ニュース', tags: ['SoftBank Group', 'ABB Robotics', 'フィジカルAI'], image: '/assets/factory-robot.jpg',
    publishedAt: '2026-11-08', author: commonAuthor, readTime: 7, featured: true, popular: 2,
    points: ['中国事業の買収禁止は会社開示で確認済み', '取引全体の変更や中止は現時点で未確定', '地域別の規制審査が大型M&Aの設計を左右する'],
    sections: [
      { heading: '中国当局が買収禁止を通知', body: ['ソフトバンクグループは中国事業の買収を禁止する通知を受けたと公表しました。', '両社は取引への対応を協議しているものの、具体策は公表していません。'] },
      { heading: '買収はフィジカルAI戦略の一部', body: ['当初の買収額は53億7500万ドルで、規制当局の承認が前提でした。', 'ABBの販売網とロボット技術をAI関連投資へ結び付ける狙いがあります。'] },
      { heading: '次の開示で確認すべきこと', body: ['取引範囲、価格、完了時期、資金計画への影響が焦点になります。', '未公表の再編案を確定情報として扱わない注意が必要です。'] }
    ]
  },
  {
    id: 'a23', slug: 'weekly-market-ai-stocks-oil', title: '今週の市場、AI関連株と原油価格をどう見るか',
    description: '株価指数と原油市場の公表データを基に、今週の日本株を読むうえで確認したい変動要因を整理します。',
    category: 'business', type: 'ニュース解説', tags: ['日本株', '原油価格', 'AI関連株'], image: '/assets/analytics-team.jpg',
    publishedAt: '2026-11-08', author: commonAuthor, readTime: 8, featured: true, popular: 3,
    points: ['指数全体と業種別の動きを分けて見る', '原油高の影響は企業ごとに異なる', '予測ではなく公表データの変化を追う'],
    sections: [
      { heading: '反発の有無より市場の広がりを見る', body: ['指数の上昇だけで底入れを判断するのは早計です。', '売買代金や上昇銘柄数、業種別の動きを合わせて確認します。'] },
      { heading: 'AI関連株は期待と業績を分ける', body: ['テーマへの期待だけでなく受注、投資負担、利益率を確認します。', '決算や会社計画の修正が評価を変える可能性があります。'] },
      { heading: '原油高はコストと需要の両面で効く', body: ['エネルギー企業には追い風でも、運輸や素材には負担となり得ます。', '為替や価格転嫁の進み方も企業ごとの差を生みます。'] }
    ]
  },
  {
    id: 'a24', slug: 'aichi-graduate-hiring-wages', title: '愛知の新卒採用、初任給上昇だけでは決まらない競争力',
    description: '愛知県の新卒初任給と求人倍率の公表データから、企業が採用競争で見直すべき条件と情報発信を考えます。',
    category: 'business', type: 'ニュース解説', tags: ['新卒採用', '初任給', '愛知県'], image: '/assets/laptop-office.jpg',
    publishedAt: '2026-11-08', author: commonAuthor, readTime: 8, popular: 4,
    points: ['初任給は職種と産業で差がある', '採用条件は勤務地と成長機会を含めて伝える', '内定後の理解不足を減らす接点を作る'],
    sections: [
      { heading: '公表データで初任給の基準を確認する', body: ['愛知労働局の統計は新卒者の実際の賃金データを集計しています。', '企業は同業種だけでなく学生が比較する他業種も確認する必要があります。'] },
      { heading: '勤務地は生活設計と一緒に評価される', body: ['本社所在地だけでなく配属、転勤、働き方を具体的に伝えます。', '住宅費や通勤、キャリア形成の説明が入社後の認識差を減らします。'] },
      { heading: '採用広報を一度の説明会で終わらせない', body: ['職場見学や社員との対話で実際の仕事を見せます。', '良い面だけでなく忙しさや育成方法も説明することが信頼につながります。'] }
    ]
  },
  {
    id: 'a25', slug: 'chicken-burger-competition-japan', title: '外食の「チキン競争」本格化、マクドナルドとKFCが定番を刷新',
    description: '大手外食2社が相次いでチキンバーガーを刷新した背景を、商品戦略、価格、利用場面の広がりから読み解きます。',
    category: 'business', type: 'ニュース解説', tags: ['外食産業', '商品戦略', 'チキンバーガー'], image: '/assets/chicken-burger-competition.png',
    publishedAt: '2026-11-08', author: commonAuthor, readTime: 8, featured: true, popular: 5,
    points: ['両社が同じ10月に定番商品を刷新した', '一時的な限定品ではなく日常需要を狙う', '商品単体だけでなく価格帯と利用場面が競争軸になる'],
    sections: [
      { heading: '定番メニューでチキンを強化', body: ['マクドナルドとKFCは相次いで新しいチキン商品を全国展開しました。', '限定商品の話題づくりとは異なり、継続販売する定番の強化です。'] },
      { heading: '同じ鶏もも肉でも設計は異なる', body: ['衣、ソース、調理方法、品ぞろえで各社の特徴を出しています。', '消費者は味だけでなく食べ応えや選びやすさも比較します。'] },
      { heading: '競争は昼食と軽食へ広がる', body: ['セット、単品、サイドメニューを組み合わせて利用場面を増やします。', '定番化の成否は再購入と店舗運用の安定性に左右されます。'] }
    ]
  },
  {
    id: 'a26', slug: 'alliances-defense-cost-sharing', title: '軍事同盟は防衛コストをどう分けるのか',
    description: 'NATOとSIPRIの公表資料から、集団防衛が抑止力と負担分担を生む仕組み、その限界を整理します。',
    category: 'security', type: 'ニュース解説', tags: ['軍事同盟', 'NATO', '防衛費'], image: '/assets/security-ops.jpg',
    publishedAt: '2026-11-08', author: commonAuthor, readTime: 10, featured: true, popular: 6,
    points: ['同盟は装備、情報、補給を共同で使う枠組みになる', '負担分担は支出額だけでなく能力と即応性で測る', '大国にも同盟を維持する政治・経済コストがある'],
    sections: [
      { heading: '集団防衛が持つ基本的な仕組み', body: ['同盟国への攻撃を自国への攻撃とみなす約束は、相手の計算を難しくします。', '一方で支援の内容は条約と各国の判断に左右され、約束だけで能力が生まれるわけではありません。'] },
      { heading: '共同化できる費用と各国が負う費用', body: ['早期警戒、通信、演習、標準化は共同化の効果が出やすい分野です。', '兵員、装備、備蓄、輸送力は各国が継続して整える必要があります。'] },
      { heading: '負担分担を支出比率だけで見ない', body: ['GDP比は比較しやすい一方、調達効率や即応性をそのまま示しません。', '不足する能力を埋められるかという成果の確認が欠かせません。'] }
    ]
  },
  {
    id: 'a27', slug: 'british-boarding-schools-japan', title: '英国系ボーディングスクール、日本で広がる選択肢',
    description: '年1000万円を超える学費の学校もある英国系ボーディングスクールについて、需要と課題を公式情報から整理します。',
    category: 'society', type: 'ニュース解説', tags: ['国際教育', 'ボーディングスクール', '学費'], image: '/assets/british-boarding-schools-japan-16x9.webp',
    images: { wide: '/assets/british-boarding-schools-japan-16x9.webp', landscape: '/assets/british-boarding-schools-japan-4x3.webp', square: '/assets/british-boarding-schools-japan-1x1.webp' },
    publishedAt: '2026-11-08', author: commonAuthor, readTime: 10, featured: true, popular: 7,
    points: ['授業料には寮費を含む場合がある', '海外校の名称だけで教育内容は判断できない', '地域との接点と卒業後の進路確認が重要になる'],
    sections: [
      { heading: '日本に広がる全寮制の国際教育', body: ['英国系学校の日本進出により、海外へ移住せず全寮制教育を選べるようになりました。', '国内外の家庭が比較する市場となり、学校ごとの対象年齢や課程は異なります。'] },
      { heading: '学費は何を含むのか', body: ['授業料、寮費、食費、課外活動、旅行費を分けて確認します。', '入学金や保証金を含めた総額で家計負担を判断する必要があります。'] },
      { heading: '学校名より認定と進路を見る', body: ['認定、査察、教員体制、卒業資格を公式資料で確かめます。', '日本の大学や海外大学へ進む際の出願条件も早めに確認します。'] }
    ]
  },
  {
    id: 'a28', slug: 'credit-saison-india-adb-financing', title: 'クレディセゾン、インドで5億ドル調達',
    description: 'ADBを含む6行が参加するCredit Saison Indiaの大型協調融資について、資金使途と成長戦略を読み解きます。',
    category: 'business', type: 'ニュース', tags: ['クレディセゾン', 'ADB', 'インド金融'], image: '/assets/analytics-team.jpg',
    publishedAt: '2026-11-08', author: commonAuthor, readTime: 9, popular: 8,
    points: ['インド子会社として過去最大の5億ドルを調達する', 'ADBが初めて協調融資へ参加する', '中小零細企業と個人への金融アクセス拡大が焦点になる'],
    sections: [
      { heading: '過去最大の対外商業借り入れ', body: ['Credit Saison Indiaは多通貨の協調融資契約を結びました。', '国際金融機関と民間銀行を組み合わせた資金調達です。'] },
      { heading: '成長を支える資金と審査基準', body: ['融資拡大には資本だけでなく審査と回収の品質が必要です。', 'ADBの参加は環境・社会面の管理強化にもつながります。'] },
      { heading: '次に確認する経営指標', body: ['債権残高だけでなく延滞率、調達費用、利益を確認します。', '他地域への展開はインドの経験を再現できるかが焦点です。'] }
    ]
  },
  {
    id: 'a29', slug: 'berkshire-record-share-buyback-2026', title: 'バークシャー、自社株買い過去最大規模',
    description: '2026年7〜9月期に約96億ドルを投じたバークシャーの自社株買いを、手元資金と投資判断から読み解きます。',
    category: 'business', type: 'ニュース解説', tags: ['Berkshire Hathaway', '自社株買い', '手元資金'], image: '/assets/cloud-team.jpg',
    publishedAt: '2026-11-08', author: commonAuthor, readTime: 9, popular: 9,
    points: ['7〜9月期の取得額は約96億ドルだった', '9カ月累計の取得額は144億ドルに達した', '買い戻しは割安判断と十分な流動性が条件になる'],
    sections: [
      { heading: '7〜9月に買い戻しを拡大', body: ['四半期報告書は月別の取得株数と平均価格を開示しています。', '株主資本の自己株式増加額から四半期の規模を確認できます。'] },
      { heading: '自社株買いの判断基準', body: ['経営陣が本源的価値を下回ると判断する価格で取得します。', '現金等が300億ドルを下回る買い戻しは行わない方針です。'] },
      { heading: '大きな現金余力をどう読むか', body: ['現金は投資機会と保険事業の安全性を支えます。', '自社株買いだけで将来の投資方針を断定することはできません。'] }
    ]
  },
  {
    id: 'a30', slug: 'public-sector-engineer-shortage-japan', title: '自治体の技術職不足、インフラ維持をどう支えるか',
    description: '土木・建築の技術職員が少ない自治体の実態と、中途採用、共同採用、広域支援による人材確保策を整理します。',
    category: 'society', type: 'ニュース解説', tags: ['地方自治体', '技術職', 'インフラ'], image: '/assets/public-engineer-shortage-16x9.webp',
    images: { wide: '/assets/public-engineer-shortage-16x9.webp', landscape: '/assets/public-engineer-shortage-4x3.webp', square: '/assets/public-engineer-shortage-1x1.webp' },
    publishedAt: '2026-11-08', author: commonAuthor, readTime: 10, popular: 10,
    points: ['技術職員5人以下の市区町村が約半数を占める', '採用数だけでなく経験の継承が課題になる', '都道府県と市町村の共同確保が現実的な選択肢になる'],
    sections: [
      { heading: '少人数でインフラを支える自治体', body: ['道路、橋、水道、公共施設の維持には継続した技術判断が必要です。', '担当者が少ない地域では発注管理と災害対応が同じ人へ集中します。'] },
      { heading: '中途採用を増やすだけでは足りない', body: ['民間経験者が力を発揮できる職務と待遇を明示します。', '採用後の権限、研修、資格支援まで設計する必要があります。'] },
      { heading: '共同採用と広域支援を組み合わせる', body: ['単独自治体で確保が難しい専門性は広域で共有できます。', '外部委託を使う場合も発注者側の判断能力は残さなければなりません。'] }
    ]
  },
  {
    id: 'a31', slug: 'kai-senior-onsen-subscription', title: '70歳以上限定「界の定期券」、12泊の旅を商品化',
    description: '星野リゾートの温泉旅館サブスクリプションが、シニアの旅行需要と宿泊施設の稼働をどう結ぶのかを解説します。',
    category: 'society', type: 'ニュース解説', tags: ['シニア旅行', '温泉旅館', 'サブスクリプション'], image: '/assets/senior-onsen-subscription-16x9.webp',
    images: { wide: '/assets/senior-onsen-subscription-16x9.webp', landscape: '/assets/senior-onsen-subscription-4x3.webp', square: '/assets/senior-onsen-subscription-1x1.webp' },
    publishedAt: '2026-11-08', author: commonAuthor, readTime: 9,
    points: ['70歳以上を対象に年間12泊を販売する', '23施設から選び長期滞在にも使える', '定額化は旅行の計画負担を下げる狙いがある'],
    sections: [
      { heading: '宿泊を一泊ずつ買わない仕組み', body: ['年間の宿泊回数を先にまとめて購入する商品です。', '利用者は対象施設と期間の条件内で旅程を組みます。'] },
      { heading: '価格だけでは測れない利用価値', body: ['食事込みの料金と予約方法、同行者条件を確認します。', '何泊使えるかではなく実際に予約できる日程が重要です。'] },
      { heading: 'シニア旅行を継続需要へ変える', body: ['定期的な旅行は生活の目標と外出機会を作ります。', '事業者には需要平準化と再訪を促す効果が期待されます。'] }
    ]
  },
  {
    id: 'a32', slug: 'shizuoka-aichi-earthquake-november-2026', title: '静岡県西部でM5.7、愛知県知多市で震度5強',
    description: '11月8日未明に発生した地震について、気象庁が確認した震源、震度、津波、今後の注意点をまとめます。',
    category: 'society', type: 'ニュース', tags: ['地震', '愛知県', '静岡県'], image: '/assets/shizuoka-aichi-earthquake-16x9.webp',
    images: { wide: '/assets/shizuoka-aichi-earthquake-16x9.webp', landscape: '/assets/shizuoka-aichi-earthquake-4x3.webp', square: '/assets/shizuoka-aichi-earthquake-1x1.webp' },
    publishedAt: '2026-11-08', author: commonAuthor, readTime: 7, featured: true,
    points: ['震源は静岡県西部、暫定マグニチュード5.7', '愛知県知多市で最大震度5強を観測した', '津波の心配はなく、1週間程度は同程度の揺れに注意する'],
    sections: [
      { heading: '8日午前1時4分に発生', body: ['気象庁が発表した暫定値を基に地震の概要を整理します。', '震源の深さは41キロで、広い範囲で揺れを観測しました。'] },
      { heading: '津波の心配はない', body: ['気象庁はこの地震による津波の心配はないとしています。', '落石や崖崩れの危険性が高まる地域では雨にも注意が必要です。'] },
      { heading: '今後1週間の備え', body: ['特に2〜3日程度は規模の大きい地震が起きる場合があります。', '家具、避難経路、公式情報の入手先を確認します。'] }
    ]
  },
  {
    id: 'a33', slug: 'government-housing-renovation-japan', title: '老朽化する国家公務員宿舎、改修と使用料の課題',
    description: '築年数の進んだ国家公務員宿舎について、若手が求める設備、改修方針、使用料調整の考え方を整理します。',
    category: 'society', type: 'ニュース解説', tags: ['国家公務員宿舎', '住宅政策', '人材確保'], image: '/assets/government-housing-renovation-16x9.webp',
    images: { wide: '/assets/government-housing-renovation-16x9.webp', landscape: '/assets/government-housing-renovation-4x3.webp', square: '/assets/government-housing-renovation-1x1.webp' },
    publishedAt: '2026-11-08', author: commonAuthor, readTime: 9,
    points: ['築50年を超える宿舎も使われている', '独立洗面台や独立トイレへの需要が確認されている', '改修後の居住性と使用料の公平性を両立する必要がある'],
    sections: [
      { heading: '宿舎の役割と老朽化', body: ['公務員宿舎は緊急対応や転勤を支える業務基盤でもあります。', '新規建設の抑制が続き、古い仕様の住戸が残っています。'] },
      { heading: '入居者が求める設備', body: ['調査では独立洗面台や浴室、独立トイレへの要望が示されました。', '豪華さではなく現在の生活に必要な最低水準が問われています。'] },
      { heading: '改修費と使用料の公平性', body: ['改修した住戸と未改修住戸の差を使用料へどう反映するかが課題です。', '採用と定着への効果も含めて投資を評価する必要があります。'] }
    ]
  }
];

const revisedBaseArticles = baseArticles.map((article) => {
  const revision = editorialContent[article.slug];
  if (!revision) throw new Error(`Missing editorial revision for article: ${article.slug}`);

  return {
    ...article,
    ...revision,
    updatedAt: '2026-11-08',
    author: commonAuthor
  };
});

export const articles = [
  ...dailyNews20261113,
  ...dailyTech20261113,
  ...dailyNews20261112,
  ...dailyTech20261112,
  ...startupNews20261110,
  ...dailyNews20261110,
  ...dailyTech20261109.map((article) => ({ ...article, author: commonAuthor })),
  ...dailyNews20261109.map((article) => ({ ...article, author: commonAuthor })),
  ...revisedBaseArticles
];
