/* 时代模型入口配置：修改名称、颜色、简介与总览镜头。 */
window.TTM=window.TTM||{};
window.TTM.DATA={
  "title": "剧场时间机器",
  "subtitle": "5分钟穿越西方舞台剧场史",
  "storageKey": "theatre-time-machine-v2",
  "periods": [
    {
      "id": "greek",
      "name": "古希腊",
      "en": "Ancient Greece",
      "color": "#8edacb",
      "date": "古典晚期—希腊化时期 · 形态示意",
      "keyword": "山坡 · 歌队 · 公共观看",
      "intro": "沿着层层看台，找到歌队、演员和观众各自的位置。",
      "note": "不同时期剧场形态的教学综合示意，非某一遗址的精确复原。",
      "camera": {
        "yaw": -0.24,
        "pitch": 0.62,
        "distance": 25.5,
        "target": [
          0,
          1,
          -0.3
        ]
      }
    },
    {
      "id": "rome",
      "name": "古罗马",
      "en": "Ancient Rome",
      "color": "#c7ab82",
      "date": "帝国时期剧场 · 类型示意",
      "keyword": "支承结构 · 建筑立面",
      "note": "看台的人工支承与多层舞台立面为教学示意，非单座遗址的复原。",
      "camera": {
        "target": [
          0,
          1.6,
          -0.8
        ],
        "distance": 26,
        "yaw": -0.24,
        "pitch": 0.58
      }
    },
    {
      "id": "medieval",
      "name": "中世纪",
      "en": "Medieval Theatre",
      "color": "#8edacb",
      "date": "14—16世纪 · 英格兰城市演出示意",
      "keyword": "演出车 · 行会 · 城市",
      "intro": "一辆演出车，把同一段故事带到城市的不同站点。",
      "note": "参照英格兰城市演出车；中世纪同时存在礼仪空间、固定台位等多种实践。",
      "camera": {
        "yaw": -0.28,
        "pitch": 0.5,
        "distance": 25,
        "target": [
          0,
          1.25,
          0.1
        ]
      }
    },
    {
      "id": "renaissance",
      "name": "文艺复兴",
      "en": "Renaissance Italy",
      "color": "#8edacb",
      "date": "16世纪 · 意大利透视舞台示意",
      "keyword": "透视 · 景片 · 理想视点",
      "intro": "看似很深的街道，藏在几层逐渐缩小的景片之间。",
      "note": "透视景片与框景边界的综合示意，非单座剧场的精确复原。",
      "camera": {
        "yaw": 0.63,
        "pitch": 0.66,
        "distance": 25,
        "target": [
          0,
          1,
          -1
        ]
      }
    },
    {
      "id": "elizabeth",
      "name": "伊丽莎白时期",
      "en": "Elizabethan Theatre",
      "color": "#8edacb",
      "date": "约1600年 · 环球式公共剧场示意",
      "keyword": "伸出舞台 · 庭院 · 三面观看",
      "intro": "站到舞台旁边，感受演员与观众共享的交流空间。",
      "note": "环球式公共剧场示意，前侧局部剖开便于观察；非 1599 年原建筑的精确复原。",
      "camera": {
        "yaw": 0,
        "pitch": 0.82,
        "distance": 22,
        "target": [
          0,
          0.9,
          -0.7
        ]
      }
    }
  ]
};
