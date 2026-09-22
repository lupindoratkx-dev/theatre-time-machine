/* 八位虚构合成角色。SVG 随代码加载，无字体、图片或 CDN 请求。 */
(function(T){
  'use strict';
  const people={
    lorenzo:{name:'洛伦佐',en:'Lorenzo',role:'人文学者',color:'#768b83',hair:'#65564d',skin:'#d5b08a',item:'book',trait:'相信古典文本，也愿意让排练检验想法。'},
    isabella:{name:'伊莎贝拉',en:'Isabella',role:'宫廷赞助者',color:'#754c59',hair:'#3c3434',skin:'#dbb795',item:'letter',trait:'关心宾客、预算和眼前真正看到的效果。'},
    matteo:{name:'马泰奥',en:'Matteo',role:'舞台设计师',color:'#4f7777',hair:'#544238',skin:'#c49a7b',item:'ruler',trait:'爱画漂亮的街道，也得承认图纸会出错。'},
    luca:{name:'卢卡',en:'Luca',role:'演员',color:'#ab795e',hair:'#705039',skin:'#dab28b',item:'mask',trait:'用身体检验空间，总能指出设计的小麻烦。'},
    thomas:{name:'托马斯',en:'Thomas',role:'剧团经理',color:'#6e6355',hair:'#534333',skin:'#c7a383',item:'ledger',trait:'始终拿着账本，先问明天在哪里演。'},
    will:{name:'威尔',en:'Will',role:'演员',color:'#916456',hair:'#4a3930',skin:'#d2ac88',item:'mask',trait:'喜欢接住观众的目光和意外插话。'},
    agnes:{name:'艾格妮丝',en:'Agnes',role:'旅馆主人',color:'#6c8179',hair:'#6a584d',skin:'#dfb99c',item:'keys',trait:'肯帮忙，但院子还要接待客人。'},
    edmund:{name:'埃德蒙',en:'Edmund',role:'剧作家／提词人',color:'#65687d',hair:'#443b36',skin:'#c9aa90',item:'script',trait:'相信一句台词能把观众带到另一个地方。'}
  };
  const expressions={neutral:'平静',problem:'困惑',positive:'欣喜'};
  function svg(id,expression='neutral'){
    const p=people[id]||people.lorenzo, e=expressions[expression]?expression:'neutral';
    const woman=['isabella','agnes'].includes(id), beard=['thomas','edmund'].includes(id);
    const brow=e==='problem'?'M27 30l8 -3M43 27l8 3':e==='positive'?'M27 28q4 -3 8 0M43 28q4 -3 8 0':'M27 28h8M43 28h8';
    const mouth=e==='positive'?'M33 43q6 7 12 0':e==='problem'?'M34 46q5 -5 10 0':'M35 44h8';
    const item={book:'<path d="M12 62l15 -3 12 4v22l-12 -4 -15 3z" fill="#d9ceaa"/><path d="M27 60v21" stroke="#8d8069"/>',letter:'<path d="M14 66l23 -4 4 17 -23 4z" fill="#e5d7b7"/><circle cx="28" cy="73" r="3" fill="#9c6556"/>',ruler:'<path d="M15 78l24 -16v16z" fill="none" stroke="#dbb47a" stroke-width="3"/>',mask:'<path d="M15 64q11 -6 20 0v10q-10 16 -20 0z" fill="#dcc7a2"/><path d="M19 70h4m5 0h4m-9 5q3 4 6 0" stroke="#5f594f" fill="none"/>',ledger:'<rect x="14" y="62" width="24" height="23" rx="2" fill="#95764e"/><path d="M18 63v21m5 -16h11m-11 5h11m-11 5h7" stroke="#e1cda5"/>',keys:'<g stroke="#d5bb84" fill="none" stroke-width="2"><circle cx="24" cy="68" r="5"/><path d="M24 73v12h5m-3 -3h4m-3 -10l8 10 3 -2"/></g>',script:'<path d="M15 63h24v21H15q5 -5 0 -7z" fill="#e1d3b1"/><path d="M21 68h12m-12 5h12m-12 5h8" stroke="#88795e"/>'}[p.item];
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 96" role="img" aria-label="${p.name}，${expressions[e]}"><rect width="80" height="96" rx="5" fill="#20332f"/><circle cx="40" cy="36" r="28" fill="${p.color}" opacity=".15"/><path d="M12 96V73q1 -15 21 -17h14q21 2 21 17v23" fill="${p.color}"/><path d="M32 51v11l8 8 8 -8V51" fill="${p.skin}"/><path d="M30 56l10 11 -9 10 -7 -17m26 -4l-10 11 9 10 7 -17" fill="#e4d6b9"/><path d="M22 42V24q1 -18 18 -18 19 0 20 18v${woman?'33':'18'}" fill="${p.hair}"/><path d="M24 24q16 -9 32 0v17q-2 16 -16 17 -14 -1 -16 -17z" fill="${p.skin}"/><path d="M22 26q3 -20 17 -17 17 -1 20 17l-11 -8 -5 5 -4 -8 -8 10z" fill="${p.hair}"/>${id==='agnes'?'<path d="M19 25q-1 -23 22 -22 19 1 20 23L50 16H29z" fill="#d9cfba"/>':''}${id==='isabella'?'<path d="M23 17q17 -14 34 0" stroke="#d6b876" stroke-width="3" fill="none"/><circle cx="21" cy="42" r="2" fill="#d6b876"/><circle cx="59" cy="42" r="2" fill="#d6b876"/>':''}${id==='matteo'?'<path d="M19 16q21 -21 42 0v6H19z" fill="#3d4e4d"/>':''}<path d="${brow}" stroke="${p.hair}" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="31" cy="34" r="1.7" fill="#2d302d"/><circle cx="47" cy="34" r="1.7" fill="#2d302d"/><path d="M40 35l-2 6h4" stroke="#9d775f" fill="none"/>${beard?`<path d="M26 43l5 8 9 7 9 -7 5 -8 -5 3 -9 3 -9 -3z" fill="${p.hair}"/>`:''}<path d="${mouth}" stroke="#754e43" stroke-width="1.8" fill="none" stroke-linecap="round"/>${item}<path d="M13 85q-5 -14 6 -12l8 4 -2 8z" fill="${p.skin}"/>${e==='problem'?`<path d="M57 70l-1 -16 4 -10 4 2 -2 12 5 14z" fill="${p.skin}"/>`:`<path d="M57 80l-7 -4 -3 6 13 5 7 -6 -4 -7z" fill="${p.skin}"/>`}<path d="M40 70v26" stroke="#112b2844" stroke-width="2"/></svg>`;
  }
  T.Characters={people,expressions,svg};
})(window.TTM);
