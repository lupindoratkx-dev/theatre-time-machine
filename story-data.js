/* V3 故事配置：先问题、再空间变化、最后命名。修改文案不必修改引擎。 */
(function (T) {
  "use strict";
  const camera = (target, distance = 27, yaw = -.36, pitch = .72) => ({ target, distance, yaw, pitch });
  const states = [
    { id: "ritual", name: "一片空地", chapter: "序幕 · 演出尚未有家", era: "祭仪空间 · 情境模拟", world: "ritual", camera: camera([0, .5, 0], 23) },
    { id: "orchestra", name: "共同的中心", chapter: "Ⅰ · 古希腊", era: "古希腊 · 跨时期教学示意", world: "orchestra", camera: camera([0, .5, 0], 22) },
    { id: "theatron", name: "看得见的坡地", chapter: "Ⅰ · 古希腊", era: "先看观看关系，再看建筑", world: "seats", camera: camera([0, 1, 0], 24) },
    { id: "skene", name: "表演背后的房间", chapter: "Ⅰ · 古希腊", era: "景屋形制随时期而变化", world: "skene", camera: camera([0, 1, -1], 24, .38) },
    { id: "actorstage", name: "歌队与演员", chapter: "Ⅰ · 古希腊", era: "景屋前的表演地带 · 非统一高台复原", world: "actorstage", camera: camera([0, 1, -.5], 24) },
    { id: "stone", name: "一座持久的剧场", chapter: "Ⅰ · 古希腊", era: "成熟形态示意 · 并非一日建成", world: "stone", camera: camera([0, 1.1, 0], 26, -.48) },
    { id: "roman", name: "自己造一座山", chapter: "Ⅱ · 罗马", era: "人工支承结构 · 剖切示意", world: "roman", camera: camera([0, 1.3, 0], 24, 1.85, .46) },
    { id: "scaenae", name: "建筑成为背景", chapter: "Ⅱ · 罗马", era: "多层舞台立面 · 装饰与权力展示", world: "scaenae", camera: camera([0, 1.6, -.8], 26, -.24, .58) },
    { id: "amphitheatre", name: "围绕中央场地", chapter: "Ⅱ · 同期类型比较", era: "并行建筑类型；不是半圆剧场的改建过程", world: "amphitheatre", camera: camera([0, .9, 0], 28, -.28, .91) },
    { id: "transition", name: "另一处表演现场", chapter: "Ⅲ · 中世纪", era: "跨越数世纪、切换地点；表演从未整体消失", world: "transition", camera: camera([26, 1, -2.5], 20, .16, .72) },
    { id: "church", name: "在礼仪中行动", chapter: "Ⅲ · 中世纪", era: "礼仪中的戏剧性表达 · 一种历史实践", world: "church", camera: camera([26, 1.1, -3], 18, .10, .70) },
    { id: "mansion", name: "多个地点，同时在场", chapter: "Ⅲ · 中世纪", era: "并置场景示意 · 不代表所有地区", world: "mansion", camera: camera([26, .9, -1.6], 21, -.20) },
    { id: "square", name: "走向公共空间", chapter: "Ⅲ · 中世纪", era: "教堂、广场与街道实践长期并存", world: "square", camera: camera([26, 1, 1], 25, -.36) },
    { id: "city", name: "城市加入演出", chapter: "Ⅲ · 中世纪", era: "行会、市民与宗教节庆共同组织", world: "city", camera: camera([26, 1, 1], 33, -.40, .94) },
    { id: "wagon", name: "演出开始旅行", chapter: "Ⅲ · 中世纪", era: "以约克式站点巡演为参照 · 机构动作经简化", world: "wagon", camera: camera([26, 1, 1], 33, -.38, .85) }
  ];
  const choices = (...items) => items.map(([text, effect, consequence]) => ({ text, effect, consequence, adopt: effect === "adopt" }));
  const decisions = [
    {
      id: "dance", from: 0, to: 1, speaker: "priest", title: "歌舞该在哪里发生？",
      problem: "祭仪开始了，歌队与围观者混在一起。请为共同的歌舞留出一处清楚的空间。",
      choices: choices(
        ["沿祭坛排成一条长队", "line", "队伍拉长了，首尾难以共同围绕祭坛行动。试试一个更集中的区域。"],
        ["留出中心，让歌队围绕祭坛", "adopt", "歌队有了共同的中心，观众退到边缘。"],
        ["让观众也站进歌队中", "mix", "参与者增多了，但观看边界变得模糊，歌队的移动也受到阻挡。"]),
      discovery: { en: "ORCHESTRA", zh: "歌队区", text: "歌队歌舞的区域称为 Orchestra。本模型借圆形说明集体表演关系，早期剧场的平面并非都呈圆形。" },
      clip: "chorus", focus: [0, .4, 0]
    },
    {
      id: "sight", from: 1, to: 2, speaker: "audience", title: "后排看不到了",
      problem: "来看演出的人更多了，前面的人挡住了我。怎样让后排也看清中心？",
      choices: choices(
        ["向后扩大平地上的人群", "crowded", "人群变深，后排的视线仍穿过前排身体。空间增大并不等于更容易看见。"],
        ["把所有人分散到更远处", "far", "遮挡减轻了，但人离表演也更远了；舞台上的细节更难辨认。"],
        ["借坡地逐层抬高观众", "adopt", "观看位置逐层升高，观众共享中心，却拥有不同的视线。"]),
      discovery: { en: "THEATRON", zh: "观看的地方 · 观众席", text: "Theatron 指观看的地方；阶梯式观众席组织了大量观众的视线。坡地利用与座席形式在不同地点、时期各不相同。" },
      clip: "seating", focus: [0, 2.5, 5.5], viewpoints: [{ label: "坐到高处看看", eye: [0, 3.3, 6.1], target: [0, .65, -.6] }]
    },
    {
      id: "change", from: 2, to: 3, speaker: "actor", title: "我需要暂时离开视线",
      problem: "下一段表演要换一个角色。服装和道具需要安放，也需要一处能出入的遮蔽空间。",
      choices: choices(
        ["在表演后方搭一间木屋", "adopt", "木柱、墙面与屋顶依次出现，演员有了可以进入的后方空间。"],
        ["拉起一面临时遮布", "screen", "遮布能挡住一部分视线，但侧面仍敞开，道具也缺少安放的地方。"],
        ["就在观众面前换装", "openchange", "公开换装也可以成为表演手法；此刻的隐藏出入与道具存放需求仍未解决。"]),
      discovery: { en: "SKENE", zh: "景屋", text: "Skene 位于表演区后方，可供出入、准备并构成表演背景。这里的木构搭建与换装动画是功能示意，并非某座遗址的复原。" },
      clip: "costume", focus: [0, 1.9, -4.6]
    },
    {
      id: "acting", from: 3, to: 4, speaker: "chorus", title: "给对话留一个位置",
      problem: "演员的对话越来越重要，我们仍要继续歌舞。怎样组织两种表演，彼此都看得见？",
      choices: choices(
        ["让演员始终站在歌队中心", "overlap", "演员被歌队围住，两种行动争用同一位置；对话与集体移动需要协调。"],
        ["在景屋前划出表演地带", "adopt", "演员靠近景屋，歌队保留中心区域，表演开始形成层次。"],
        ["把演员安排到场地最外侧", "separate", "冲突少了，但演员远离了歌队和主要观看方向，场面被拆散。"]),
      discovery: { en: "ACTING AREA", zh: "景屋前的表演区", text: "景屋前的表演空间强化了演员与背景的联系。后来的 Proskenion 形制与舞台高度有历史变化，不能反推为所有古典时期剧场共有的高台。" },
      clip: "acting", focus: [0, .4, -3.1]
    },
    {
      id: "stone", from: 4, to: 5, speaker: "builder", title: "让每年的演出有个家",
      problem: "临时设施需要反复维护，城邦希望持续组织演出。怎样把观看、出入和表演固定下来？",
      choices: choices(
        ["继续修补现有的木构", "repair", "修补能延长使用，但构件仍需周期性更换。永久设施是另一种长期投入。"],
        ["逐步改为石质永久设施", "adopt", "木色逐步变成石色，座席、通道和景屋形成稳定的空间组织。"],
        ["每次在新的空地重新搭建", "camp", "可移动的安排很灵活，但每次都要重新组织人群和入口。"]),
      discovery: { en: "THE GREEK THEATRE", zh: "成熟的希腊剧场形态", text: "歌队区、观众席、景屋和侧面入场通道共同组织演出。动画压缩了长期、分地区的变化，并不表示这些部分按同一顺序发明。" },
      clip: "orbit", focus: [0, 1, 0], labels: true
    },
    {
      id: "support", from: 5, to: 6, speaker: "engineer", title: "这里没有合适的山坡",
      problem: "来到罗马世界，我们要在城里的平地修建大型剧场。座席下面由什么来支承？",
      choices: choices(
        ["用拱券与支承结构托起座席", "adopt", "山体退去，拱券与结构层显露出来。我们用建筑组织出一座人工的山。"],
        ["仍把观众集中在地面", "flat", "平地可以容纳人群，但没有获得分层座席的观看条件。"],
        ["先搭一组临时木架", "timber", "木架也是历史上可行的临时方案；这里要实现的是长期使用的城市剧场。"]),
      discovery: { en: "WE BUILT THE HILL.", zh: "人工支承的观众席", text: "罗马剧场可用拱券等结构支承看台，减轻对天然坡地的依赖。并非所有罗马剧场都脱离山坡，内部通道也组织着观众的分流。" },
      clip: "support", focus: [-5, 1.1, 3], viewpoints: [{ label: "近看拱券结构", eye: [11,3.8,11], target: [4.5,1.4,4.5] }]
    },
    {
      id: "facade", from: 6, to: 7, speaker: "engineer", title: "背景也要成为公共建筑",
      problem: "演出需要醒目的永久背景，也要展示城市的地位。景屋前方可以如何组织？",
      choices: choices(
        ["挂起一整幅彩绘幕布", "cloth", "幕布能呈现图像，却没有形成可供出入、展示雕像的永久建筑立面。"],
        ["搭一堵低矮的背景墙", "lowwall", "低墙划出了边界；城市期望的门洞、柱式与层次仍然有限。"],
        ["逐层加入门洞、柱式与壁龛", "adopt", "底层入口、柱列与上层檐口依次生长，建筑立面成为演出的背景。"]),
      discovery: { en: "SCAENAE FRONS", zh: "舞台建筑立面", text: "Scaenae frons 是罗马剧场舞台建筑的装饰性正立面。门洞、柱式和雕像等构成背景，也参与公共权力与身份的展示。" },
      clip: "facade", focus: [0, 3.2, -4.7]
    },
    {
      id: "arena", from: 7, to: 8, speaker: "audience", title: "比较另一种公共娱乐",
      problem: "这次观看的是中央场地上的竞技与展示。请比较：观众怎样围绕活动场地？",
      choices: choices(
        ["在中央场地四周组织看台", "adopt", "切换到另一种同期建筑类型：中央场地被连续看台包围。"],
        ["在场地中央加高背景墙", "frontal", "背景墙分割了中央活动场地，也挡住另一侧观众的视线。"],
        ["仍只开放一侧观看", "half", "活动仍可被观看，但还没有形成围绕场地的完整观看关系。"]),
      discovery: { en: "AMPHITHEATRE", zh: "圆形竞技场 · 并行类型", text: "Amphitheatre 以看台环绕中央竞技场地，常见平面为椭圆形。它与半圆形剧场用途、谱系有别，这次切换是类型比较，不是剧场被改造成竞技场。" },
      clip: "arena", focus: [0, .2, 0]
    },
    {
      id: "liturgy", from: 9, to: 10, speaker: "cleric", title: "让礼仪中的故事发生",
      problem: "来到中世纪的一处礼仪空间。怎样用人物的问答和行动，让复活故事中的探访可以被看见？",
      choices: choices(
        ["只由一人在原地诵读", "read", "诵读自有礼仪作用，但探访者与应答者之间还没有形成可见的行动关系。"],
        ["分角色问答，并走向象征地点", "adopt", "人物走向象征的墓所并相互应答，仪式空间同时承载戏剧性行动。"],
        ["陈列一组说明图像", "pictures", "图像可以传达故事；人物之间的行动与应答，则提供了另一种表达。"]),
      discovery: { en: "LITURGICAL PERFORMANCE", zh: "礼仪中的戏剧性表达", text: "礼仪中存在借角色、歌唱、对话与行动表达宗教故事的实践。这不是“为文盲发明戏剧”的单一起源，也不是所有中世纪演出的共同起点。" },
      clip: "liturgy", focus: [26, 1.1, -4]
    },
    {
      id: "places", from: 10, to: 11, speaker: "performer", title: "一个场地，几个世界",
      problem: "故事要经过天堂、耶路撒冷与地狱。可以让这些象征地点同时留在观众面前吗？",
      choices: choices(
        ["并置小景屋，共用中间的表演地带", "adopt", "几个地点同时出现，演员通过移动，让观众知道此刻身处哪一处。"],
        ["每次搬走上一块背景", "switch", "更换背景能够转换地点，但观众需要等待每次搬运与重置。"],
        ["把各个地点搬到很远处", "disperse", "距离拉大了，演员与观众需要长距离移动，难以保持一个共享场地。"]),
      discovery: { en: "MANSION + PLATEA", zh: "象征景屋与共同表演场地", text: "Mansion 可指代表特定地点的小型景屋，Platea 则是可承载行动的共同地带。并置空间依靠表演约定转换地点，不追求单一写实透视。" },
      clip: "places", focus: [26, .8, -1.5]
    },
    {
      id: "public", from: 11, to: 12, speaker: "cleric", title: "让更多市民参与",
      problem: "节庆的组织者与观众扩大了，行会和市民也想加入。还可以在哪里安排公共演出？",
      choices: choices(
        ["限制入场，继续分批演出", "limit", "分批观看可以保留室内形式；城中更广泛的共同节庆还有别的空间选择。"],
        ["在教堂内部继续挤入场景", "indoors", "更多小景屋进入室内，通行与聚集的空间相互挤占。"],
        ["利用门前广场，并联系城市街道", "adopt", "镜头沿门口来到广场，市民与城市建筑加入观看关系。"]),
      discovery: { en: "PUBLIC PERFORMANCE SPACE", zh: "公共演出空间", text: "教堂、广场与街道上的演出实践长期并存，组织方式因地区而异。这段移动用来比较空间条件，不代表戏剧因室内拥挤而必然走向城市。" },
      clip: "public", focus: [26, .6, 1]
    },
    {
      id: "tour", from: 13, to: 14, speaker: "performer", title: "把同一段故事带去下一站",
      problem: "几个街区的观众都在等候。怎样重复演出，又减少每次重新搭台的工作？",
      choices: choices(
        ["把景物逐件抬到下一处", "carry", "演员搬运起零散景物，移动可行，但每站都需要重新组合。"],
        ["把景物和表演设施放上车台", "adopt", "车轮与平台出现。现在由你选择站点，把演出带到等待的人群面前。"],
        ["留在广场，等待所有人赶来", "wait", "固定演出场也可以成立；远处街区的人群仍需来到这里，而不是演出去找他们。"]),
      discovery: { en: "PAGEANT WAGON", zh: "流动演出车", text: "以中世纪约克的实践为例，行会演出车在城市站点依次停演、重复同一段故事。车台和展开机构仅作互动示意，不代表全部中世纪演出形式。" },
      clip: "wagon", focus: [21, .9, 2]
    }
  ];
  T.STORY = {
    version: 3, storageKey: "theatre-time-machine-v3-story", states, decisions,
    opening: ["如果这里还没有剧场……", "你会怎样，让一场演出发生？"],
    timeline: [
      [0, "Ritual", "祭仪"], [1, "Orchestra", "歌队区"], [2, "Theatron", "观众席"],
      [3, "Skene", "景屋"], [5, "Stone", "石质剧场"], [6, "Rome", "罗马"],
      [10, "Church", "教堂"], [13, "City", "城市"]
    ],
    stations: [{ name: "西街", x: 21 }, { name: "市集", x: 26 }, { name: "东街", x: 31 }],
    sources: [
      ["The Met · 希腊剧场形态与年代", "https://www.metmuseum.org/essays/theater-in-ancient-greece"],
      ["The Met · 罗马剧场与竞技场", "https://www.metmuseum.org/essays/theater-and-amphitheater-in-the-roman-world"],
      ["ORB · 中世纪戏剧的单线演化误区", "https://the-orb.arlima.net/non_spec/missteps/ch5.html"],
      ["多伦多大学 PLS / CRRS · 约克演出车", "https://www.yorkplays.ca/learn"],
      ["Early Theatre · 约克演出车的朝向与高度研究", "https://earlytheatre.org/article/view/591/654"]
    ]
  };
})(window.TTM);
