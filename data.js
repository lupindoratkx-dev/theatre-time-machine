window.TTM = window.TTM || {};

window.TTM.DATA = {
  title: "剧场时间机器",
  subtitle: "5分钟穿越西方舞台剧场史",
  storageKey: "theatre-time-machine-v1",

  periods: [
    {
      id: "greek",
      name: "古希腊",
      en: "Ancient Greece",
      color: "#8edacb",
      date: "古典晚期—希腊化时期 · 形态示意",
      keyword: "山坡 · 歌队 · 公共观看",
      intro: "沿着层层看台，找到歌队、演员和观众各自的位置。",
      note: "教学综合模型。石质看台、圆形歌队区与较高前舞台体现不同时期的发展，具体年代与遗址形态各有差异。",
      takeaway: "剧场形态把观众、歌队与演员组织在同一个露天空间。",
      transfer: "主持人面对扇形观众时，可通过转身、目光和声音兼顾不同方向。",
      camera: {
        yaw: .45,
        pitch: .87,
        distance: 25,
        target: [0, 1, 0]
      },
      tasks: ["mission", "quiz", "anomaly"],

      hotspots: [
        {
          id: "theatron",
          name: "观众席",
          en: "Theatron",
          pos: [0, 2.7, 6],
          group: "theatron",
          text: "层层抬高的席位组织集体观看。这里用石质阶梯示意成熟形态；更早期的观看空间与材料有所不同。",
          tip: "观察席位抬高后，后排如何获得观看空间。"
        },
        {
          id: "orchestra",
          name: "歌队区",
          en: "Orchestra",
          pos: [0, .28, 0],
          group: "orchestra",
          text: "歌队进行歌唱、舞蹈和集体行动的区域。本模型采用圆形示意；古希腊各地、各时期的形态存在差异。",
          tip: "把歌队想成共同参与叙事的一组表演者。"
        },
        {
          id: "skene",
          name: "景屋",
          en: "Skene",
          pos: [0, 2.7, -4.6],
          group: "skene",
          text: "位于歌队区后方的建筑，为演员候场、更衣和出入提供空间，也构成演出的背景。",
          tip: "一扇门可以连接可见的表演与被遮蔽的准备。"
        },
        {
          id: "parodos",
          name: "侧向入场通道",
          en: "Parodos",
          pos: [-4.6, .3, -2.5],
          group: "parodos",
          text: "歌队区两侧、景屋与观众席之间的通道。歌队可由此进入，观众也可经相关通道到达席位。",
          tip: "本关标出其中一侧；另一侧具有对应关系。"
        },
        {
          id: "proskenion",
          name: "景屋前舞台",
          en: "Proskenion",
          pos: [0, 1.2, -3.25],
          group: "proskenion",
          text: "景屋前方的舞台构造。希腊化时期出现较高且较明确的形式；前5世纪演员表演区的高度与形制仍需结合具体证据讨论。",
          tip: "这里展示发展中的一种形态，不同年代请分开理解。"
        }
      ],

      missions: [
        {
          target: "orchestra",
          question: "开演前，歌队应在哪里集合？",
          success: "歌队进入歌队区。歌唱、舞蹈与集体行动有了共同空间。"
        },
        {
          target: "skene",
          question: "演员准备更衣，应前往哪里？",
          success: "景屋组织了候场与更衣，也成为演出的背景。"
        },
        {
          target: "parodos",
          question: "歌队要从侧面进入，应走哪条通道？",
          success: "侧向入场通道把剧场外部与歌队区连接起来。"
        }
      ],

      quiz: [
        {
          q: "这座示意剧场主要形成怎样的观看关系？",
          choices: [
            "观众在三面封闭房间中看屏幕",
            "阶梯席位围向歌队区与表演区",
            "所有观众都在景屋后方"
          ],
          answer: 1,
          why: "弧形阶梯席位把观看方向汇向歌队区及其后的表演空间。"
        },
        {
          q: "能否把图中较高的前舞台，直接视为前5世纪所有希腊剧场的统一形态？",
          choices: [
            "可以，各地始终完全相同",
            "只要是石头建造就可以",
            "应区分年代、遗址及证据"
          ],
          answer: 2,
          why: "古希腊剧场持续改建。成熟的前舞台构造尤其需要联系希腊化时期。"
        }
      ],

      anomaly: [
        {
          name: "技术条件",
          text: "LED 成像依靠电力、半导体与信号系统，属于现代设备。古希腊露天演出主要利用日光。"
        },
        {
          name: "空间结构",
          text: "本实验把屏幕放在歌队区中央，切开了连续的行动空间。歌队的队形与路线会受到影响。"
        },
        {
          name: "观演关系",
          text: "红线示意部分观众望向表演区的视线被屏幕截断。屏幕的位置、尺寸都会改变观看体验。"
        },
        {
          name: "历史环境",
          text: "本关讨论古代场景中设备的时代归属。今天在古迹中进行现代演出，可另行评估设备与空间的关系。"
        }
      ],

      sources: [
        [
          "The Met · Theater in Ancient Greece",
          "https://www.metmuseum.org/essays/theater-in-ancient-greece"
        ],
        [
          "Ancient Theatre Archive · Skene",
          "https://ancienttheatrearchive.com/glossary-term/skene-σκηνή/"
        ],
        [
          "Ancient Theatre Archive · Proskenion",
          "https://ancienttheatrearchive.com/glossary-term/proskenion-προσκήνιον/"
        ]
      ]
    },

    {
      id: "medieval",
      name: "中世纪",
      en: "Medieval Theatre",
      color: "#e3bd83",
      date: "14—16世纪 · 英格兰城市演出示意",
      keyword: "演出车 · 行会 · 城市",
      intro: "一辆演出车，把同一段故事带到城市的不同站点。",
      note: "以约克演出车传统为参照。三站路线是教学简化；欧洲中世纪还存在教堂演出、固定台位等多种实践。",
      takeaway: "城市街道和停演站也能构成剧场，空间随组织方式而改变。",
      transfer: "行进式主持应同时考虑停留位置、聚集的观众与下一段动线。",
      camera: {
        yaw: .5,
        pitch: .78,
        distance: 24,
        target: [0, 1, 0]
      },
      tasks: ["micro"],

      hotspots: [
        {
          id: "wagon",
          name: "流动演出车",
          en: "Pageant wagon",
          pos: [0, 1.2, 1],
          group: "wagon",
          text: "演出平台随车辆移动，在约定站点停下演出。同一段戏可以面对不同地点的观众重复呈现。",
          tip: "进入微互动，完成三站巡演。"
        },
        {
          id: "guild",
          name: "行会组织",
          en: "Craft guild",
          pos: [0, 2.7, 1],
          group: "wagon",
          text: "约克的不同手工业行会参与制作与演出各段故事。演出连接宗教节庆与城市共同体。",
          tip: "车上的旗帜用于示意承担演出的群体。"
        },
        {
          id: "station",
          name: "城市演出站",
          en: "Performance station",
          pos: [3, .3, 1],
          group: "stations",
          text: "观众在指定位置观看，演出车到站停演。图中三处浅色圆环表示教学用站点。",
          tip: "本模型的三站数量与排列为操作简化。"
        },
        {
          id: "church",
          name: "宗教与城市",
          en: "Sacred and civic",
          pos: [-4, 4, -3.5],
          group: "church",
          text: "圣经叙事可以在城市街道中呈现。教堂在模型中提示宗教背景，实际演出组织还涉及城市与行会。",
          tip: "宗教叙事和城市公共空间可以同时存在。"
        }
      ],

      micro: {
        title: "让演出车完成巡演",
        text: "按顺序选择 1、2、3 号站。每到一站，观察车辆与观众的相对位置。",
        question: "这条路线说明了什么？",
        choices: [
          "同一场景可在多个站点重复演出",
          "中世纪所有演出都只在车上进行",
          "全城只有一个固定观众席"
        ],
        answer: 0,
        why: "演出车通过移动与停演，把城市中的多个地点组织为观看空间。"
      },

      sources: [
        [
          "PLS / 多伦多大学 CRRS · York Plays 2025",
          "https://www.yorkplays.ca/"
        ]
      ]
    },

    {
      id: "renaissance",
      name: "文艺复兴",
      en: "Renaissance Italy",
      color: "#a9c7a5",
      date: "16世纪 · 意大利透视舞台示意",
      keyword: "透视 · 景片 · 理想视点",
      intro: "看似很深的街道，藏在几层逐渐缩小的景片之间。",
      note: "借鉴文艺复兴透视布景原理的简化实验。王公视角为教学名称；实际剧场中的座位安排与最佳视点需结合案例。",
      takeaway: "空间幻觉由景片、尺度和观看位置共同形成。",
      transfer: "为固定镜头设计背景时，可先确定主要观看点，再校正景物关系。",
      camera: {
        yaw: .55,
        pitch: .7,
        distance: 24,
        target: [0, 1, -1]
      },
      tasks: ["micro"],

      hotspots: [
        {
          id: "flats",
          name: "层叠景片",
          en: "Scenic flats",
          pos: [-2.9, 2.7, -1.3],
          group: "flats",
          text: "几层薄景片组成城市立面。侧面观看，可以发现它们之间的真实间隔与有限厚度。",
          tip: "从斜侧面观察，景物的“深度”会露出构造。"
        },
        {
          id: "scale",
          name: "尺度递减",
          en: "Forced perspective",
          pos: [1.6, 1.7, -5],
          group: "flats",
          text: "越靠后的建筑单元越小，配合趋向远处的街道边界，强化纵深感。",
          tip: "模型中的远处建筑实际尺寸也在缩小。"
        },
        {
          id: "point",
          name: "理想观看点",
          en: "Ideal viewpoint",
          pos: [0, 1.5, 5.8],
          group: "seat",
          text: "从设计预设的位置观看，景物关系更接近预期构图。离开这一位置，重叠与比例关系会改变。",
          tip: "进入微互动，比较中央与侧面。"
        },
        {
          id: "court",
          name: "宫廷演出空间",
          en: "Court setting",
          pos: [4.5, 2.6, 0],
          group: "court",
          text: "本关把透视布景置于宫廷演出语境。预设观看位置让舞台设计与座位安排产生联系。",
          tip: "示意场景用于讲原理，未对应某座建筑的测绘复原。"
        }
      ],

      views: [
        {
          id: "center",
          name: "王公视角",
          eye: [0, 1.6, 6.6],
          target: [0, 1.55, -3.5]
        },
        {
          id: "side",
          name: "侧面视角",
          eye: [5, 1.8, 4.6],
          target: [0, 1.6, -3.5]
        }
      ],

      micro: {
        title: "寻找街道的理想视点",
        text: "依次体验两个视点，留意街道的对称、重叠与景片侧边。",
        question: "哪一位置更接近这组布景的预设构图？",
        choices: [
          "所有位置看到的图像完全一致",
          "中央的王公视角",
          "越接近景片背面越理想"
        ],
        answer: 1,
        why: "这组布景围绕中央视点组织。侧看时，景片的间隔与侧边更加明显。"
      },

      sources: [
        [
          "Nordic Theatre Studies · The Power of Illusion",
          "https://tidsskrift.dk/nts/article/download/24303/21303/56248"
        ]
      ]
    },

    {
      id: "elizabeth",
      name: "伊丽莎白时期",
      en: "Elizabethan Theatre",
      color: "#dcb09a",
      date: "约1600年 · 环球式公共剧场示意",
      keyword: "伸出舞台 · 庭院 · 三面观看",
      intro: "站到舞台旁边，感受演员与观众共享的交流空间。",
      note: "环球式公共剧场教学模型，前侧局部剖开便于观察。现今伦敦环球剧场是重建建筑；同期公共剧场形制也有差异。",
      takeaway: "伸向庭院的舞台让演员同时面对多个方向的观众。",
      transfer: "主持人的正面会随交流对象变化，侧方观众也需要被纳入表达。",
      camera: {
        yaw: .45,
        pitch: .83,
        distance: 23,
        target: [0, 1.5, 0]
      },
      tasks: ["micro"],

      hotspots: [
        {
          id: "thrust",
          name: "伸出式舞台",
          en: "Thrust stage",
          pos: [0, 1.2, -.4],
          group: "thrust",
          text: "平台向庭院伸出，观众可从三面围近。演员需要顾及前方与两侧的观看。",
          tip: "试着从舞台侧面看同一个演员。"
        },
        {
          id: "yard",
          name: "庭院站席",
          en: "Yard",
          pos: [0, .7, 3],
          group: "yard",
          text: "露天庭院容纳站立观看的观众。与演员的距离、视线高度和身体姿态共同影响体验。",
          tip: "前侧墙体在本模型中作剖切处理。"
        },
        {
          id: "galleries",
          name: "多层楼廊",
          en: "Galleries",
          pos: [-5, 3.4, .6],
          group: "galleries",
          text: "庭院周围的楼廊提供分层观看位置。从楼廊看舞台，角度与遮挡关系都会变化。",
          tip: "楼层更高，也意味着俯视角度更大。"
        },
        {
          id: "heavens",
          name: "舞台顶棚",
          en: "Heavens",
          pos: [0, 4.5, -2.1],
          group: "heavens",
          text: "顶棚覆盖舞台的一部分，由柱子支撑。庭院保持露天，顶棚和立柱也会影响部分席位的视线。",
          tip: "舞台有顶棚与庭院露天可以同时成立。"
        }
      ],

      views: [
        {
          id: "front",
          name: "庭院正前",
          eye: [0, 1.5, 3.6],
          target: [0, 1.4, -1.9]
        },
        {
          id: "side",
          name: "舞台侧面",
          eye: [3.8, 1.5, .1],
          target: [0, 1.4, -1.9]
        },
        {
          id: "upper",
          name: "楼廊位置",
          eye: [-4.5, 3.5, 1],
          target: [0, 1.5, -1.9]
        }
      ],

      micro: {
        title: "换个位置看演员",
        text: "体验三个观众位置，再判断演员应怎样组织交流方向。",
        question: "演员或主持人应如何回应这个空间？",
        choices: [
          "始终只朝一个固定正面",
          "只与楼廊观众交流",
          "兼顾前方与两侧观众"
        ],
        answer: 2,
        why: "伸出式舞台形成多个交流方向，转身、站位与目光需要共同组织。"
      },

      sources: [
        [
          "Shakespeare’s Globe · Staging Macbeth",
          "https://www.shakespearesglobe.com/learn/schools-and-teachers/secondary-schools/playing-shakespeare-with-deutsche-bank/macbeth-playing-shakespeare/staging-macbeth/"
        ]
      ]
    }
  ]
};