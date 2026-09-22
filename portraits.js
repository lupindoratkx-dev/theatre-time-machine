/* 8 位人物共享像素网格：纯 SVG、无外部图片请求。 */
(function (T) {
  "use strict";
  const roles = {
    humanist: ["人文主义学者", "HUMANIST", "#ad9772", "#514d43", "#9eb39f", "book"],
    patron: ["演出赞助者", "PATRON", "#88615a", "#746149", "#d1bb87", "scroll"],
    designer: ["布景设计者", "SCENOGRAPHER", "#8d9b7d", "#675442", "#cfb88b", "tool"],
    manager: ["剧团组织者", "COMPANY", "#a9856c", "#514c45", "#abbd9e", "cap"],
    maker: ["演出执行者", "PERFORMANCE MAKER", "#8bab9a", "#514c45", "#c8bb95", "scroll"],
    priest: ["祭司", "PRIEST", "#c6b18b", "#675749", "#96aaa0", "wreath"],
    audience: ["观众", "SPECTATOR", "#8ea79b", "#594b44", "#a0b8b2", ""],
    actor: ["演员", "ACTOR", "#bc816b", "#4f4845", "#cab099", "mask"],
    chorus: ["歌队成员", "CHORUS", "#ab765f", "#5c5147", "#b5afa0", "wreath"],
    builder: ["工匠", "BUILDER", "#ae9571", "#746658", "#91a196", "tool"],
    engineer: ["罗马工程师", "ENGINEER", "#b89c79", "#615548", "#a6b8b3", "scroll"],
    cleric: ["教士", "CLERIC", "#787e79", "#74665a", "#b4b9a7", "book"],
    performer: ["巡演者", "PLAYER", "#a17e65", "#504b44", "#92b2a2", "cap"]
  };
  function portrait(id) {
    const r = roles[id] || roles.performer;
    const rect = (x,y,w,h,c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
    let s = rect(0,0,48,56,"#213331") + rect(3,3,42,50,"#2b413d");
    s += rect(4,49,40,7,"#162826") + rect(9,38,30,15,r[2]) + rect(6,44,36,9,r[2]);
    s += rect(20,31,9,10,"#b79472") + rect(16,15,18,17,"#d4b18b") + rect(13,20,4,8,"#c39d78");
    s += rect(32,20,4,8,"#b79371") + rect(17,12,15,6,r[3]) + rect(13,16,5,9,r[3]) + rect(29,16,6,4,r[3]);
    s += rect(19,22,2,2,"#413f37") + rect(28,22,2,2,"#413f37") + rect(24,24,2,4,"#b28d67");
    s += rect(21,30,7,1,"#846b52") + rect(13,39,5,14,r[4]) + rect(15,42,4,11,r[4]);
    if (r[5] === "wreath") s += [14,19,24,29].map((x,i)=>rect(x,14-i%2*2,4,3,"#a7b88c")).join("");
    if (r[5] === "mask") s += rect(31,38,10,12,"#d9caaa")+rect(33,42,2,2,"#695d4b")+rect(37,42,2,2,"#695d4b")+rect(35,47,3,1,"#695d4b");
    if (r[5] === "tool") s += rect(34,34,3,19,"#d1b58e")+rect(30,34,12,4,"#8fa29b");
    if (r[5] === "scroll") s += rect(30,39,10,12,"#dfceaa")+rect(28,38,14,3,"#c4b390")+rect(32,43,6,1,"#9f8f73");
    if (r[5] === "book") s += rect(29,38,12,14,"#795648")+rect(34,40,2,10,"#c7b68e")+rect(31,43,8,2,"#c7b68e");
    if (r[5] === "cap") s += rect(13,12,24,5,"#8c7661")+rect(17,8,14,5,"#8c7661");
    return `<svg viewBox="0 0 48 56" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" role="img" aria-label="${r[0]}像素肖像">${s}</svg>`;
  }
  T.Portraits = { roles, svg: portrait };
})(window.TTM);
