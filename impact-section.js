/* ============================================================
   IMPACT SCROLL — 画卷式 logic
   追加到 main.js 末尾。复用项目已加载的 d3 + scrollama。
   ============================================================ */
(function initImpactScroll() {
  const section = document.getElementById("impact-scroll");
  if (!section || typeof scrollama === "undefined") return;

  const panels = Array.from(section.querySelectorAll(".impact-panel"));
  const railFill = document.getElementById("impact-rail-fill");
  const total = panels.length;

  function activate(idx) {
    panels.forEach((p, i) => {
      p.classList.toggle("is-active", i === idx);
      p.classList.toggle("is-past", i < idx);
    });
    if (railFill) {
      const pct = total > 1 ? (idx / (total - 1)) * 100 : 0;
      railFill.style.height = pct + "%";
    }
  }

  const scroller = scrollama();
  scroller
    .setup({
      step: "#impact-scroll .impact-trigger",
      offset: 0.6,
      debug: false,
    })
    .onStepEnter((response) => {
      activate(+response.element.dataset.trigger);
    });
  window.addEventListener("resize", scroller.resize);

  activate(0);

  /* ---------- D3 icons ---------- */
  const W = 116, H = 92;
  const ink  = "#8f2f1b";   // --accent-dark
  const fill = "#fff3df";   // --heat-soft
  const red  = "#c4512c";   // --accent
  const blue = "#85b7eb";
  const CX = 58;            // 水平中心

  function sel(i) {
    return d3.select(`#impact-icon-${i}`)
      .attr("viewBox", `0 0 ${W} ${H}`)
      .attr("fill", "none");
  }
  function label(s, y, t, color, size) {
    s.append("text").attr("x", CX).attr("y", y).attr("text-anchor", "middle")
      .attr("fill", color || ink).attr("font-size", size || 11).attr("font-weight", 700)
      .attr("font-family", "system-ui").text(t);
  }
  function stick(s, x, y, color) {
    s.append("circle").attr("cx", x).attr("cy", y).attr("r", 6)
      .attr("fill", fill).attr("stroke", color || ink).attr("stroke-width", 1.5);
    [[x,y+6,x,y+22],[x,y+12,x-7,y+18],[x,y+12,x+7,y+18],
     [x,y+22,x-6,y+34],[x,y+22,x+6,y+34]].forEach(([x1,y1,x2,y2]) =>
      s.append("line").attr("x1",x1).attr("y1",y1).attr("x2",x2).attr("y2",y2)
        .attr("stroke", color || ink).attr("stroke-width",1.5).attr("stroke-linecap","round"));
  }

  // 0 · 开场：太阳 + 向下箭头
  ;(function () {
    const s = sel(0);
    s.append("circle").attr("cx", CX).attr("cy", 30).attr("r", 14)
      .attr("fill", "#f0997b").attr("stroke", red).attr("stroke-width", 1.8);
    [[0,-26],[0,26],[-26,0],[26,0],[-18,-18],[18,-18],[-18,18],[18,18]].forEach(([dx,dy]) =>
      s.append("line").attr("x1", CX+dx*0.78).attr("y1", 30+dy*0.78)
        .attr("x2", CX+dx*1.08).attr("y2", 30+dy*1.08)
        .attr("stroke", red).attr("stroke-width", 1.8).attr("stroke-linecap", "round"));
    s.append("path").attr("d", `M${CX} 60 L${CX} 78 M${CX-7} 71 L${CX} 78 L${CX+7} 71`)
      .attr("stroke", ink).attr("stroke-width", 1.8).attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round");
  })();

  // 1 · crowd (exposure)
  ;(function () {
    const s = sel(1);
    [CX-22, CX, CX+22].forEach((x) => stick(s, x, 30));
    s.append("circle").attr("cx", CX).attr("cy", 12).attr("r", 7)
      .attr("fill", "#f0997b").attr("stroke", red).attr("stroke-width", 1.4);
    label(s, 82, "days × people");
  })();

  // 2 · older adult + cane
  ;(function () {
    const s = sel(2), x = CX, y = 24;
    s.append("circle").attr("cx", x).attr("cy", y).attr("r", 9)
      .attr("fill", fill).attr("stroke", ink).attr("stroke-width", 1.5);
    [[x,y+9,x,y+34],[x,y+16,x-10,y+26],[x,y+16,x+10,y+26],
     [x,y+34,x-8,y+50],[x,y+34,x+8,y+50]].forEach(([x1,y1,x2,y2]) =>
      s.append("line").attr("x1",x1).attr("y1",y1).attr("x2",x2).attr("y2",y2)
        .attr("stroke",ink).attr("stroke-width",1.5).attr("stroke-linecap","round"));
    s.append("line").attr("x1",x+13).attr("y1",y+16).attr("x2",x+17).attr("y2",y+50)
      .attr("stroke",ink).attr("stroke-width",2).attr("stroke-linecap","round");
    label(s, 86, "65+");
  })();

  // 3 · worker + house
  ;(function () {
    const s = sel(3), x = CX-22, y = 26;
    s.append("path").attr("d",`M${x-9} ${y-4} q9 -12 18 0`)
      .attr("fill","#ef9f27").attr("stroke","#854f0b").attr("stroke-width",1.2);
    s.append("circle").attr("cx",x).attr("cy",y+2).attr("r",7)
      .attr("fill",fill).attr("stroke",ink).attr("stroke-width",1.5);
    [[x,y+9,x,y+32],[x,y+16,x-8,y+26],[x,y+16,x+8,y+24],
     [x,y+32,x-7,y+48],[x,y+32,x+7,y+48]].forEach(([x1,y1,x2,y2]) =>
      s.append("line").attr("x1",x1).attr("y1",y1).attr("x2",x2).attr("y2",y2)
        .attr("stroke",ink).attr("stroke-width",1.5).attr("stroke-linecap","round"));
    const hx = CX+24, hy = 44;
    s.append("rect").attr("x",hx-15).attr("y",hy-8).attr("width",30).attr("height",24)
      .attr("fill",fill).attr("stroke",ink).attr("stroke-width",1.2);
    s.append("path").attr("d",`M${hx-19} ${hy-8} L${hx} ${hy-25} L${hx+19} ${hy-8} Z`)
      .attr("fill","#f0997b").attr("stroke",ink).attr("stroke-width",1.2);
    s.append("text").attr("x",hx).attr("y",hy+30).attr("text-anchor","middle")
      .attr("fill",ink).attr("font-size",9).attr("font-weight",700)
      .attr("font-family","system-ui").text("no AC");
  })();

  // 4 · humid drop vs hot-dry waves
  ;(function () {
    const s = sel(4);
    s.append("path").attr("d",`M${CX-22} 18 q-8 16 0 24 q8 -8 0 -24`)
      .attr("fill",blue).attr("stroke","#185fa5").attr("stroke-width",1.5);
    s.append("text").attr("x",CX-22).attr("y",56).attr("text-anchor","middle")
      .attr("fill",ink).attr("font-size",9).attr("font-weight",700)
      .attr("font-family","system-ui").text("humid");
    [0,8,16].forEach((dy) =>
      s.append("path").attr("d",`M${CX+8} ${24+dy} q6 -5 12 0 q6 5 12 0`)
        .attr("stroke","#ef9f27").attr("stroke-width",1.5).attr("stroke-linecap","round"));
    s.append("text").attr("x",CX+20).attr("y",56).attr("text-anchor","middle")
      .attr("fill",ink).attr("font-size",9).attr("font-weight",700)
      .attr("font-family","system-ui").text("hot-dry");
    label(s, 78, "vs", "#888", 10);
  })();

  // 5 · moon (sleep)
  ;(function () {
    const s = sel(5);
    s.append("path").attr("d",`M${CX-15} 16 a20 20 0 1 0 28 -16 a16 16 0 0 1 -28 16 Z`)
      .attr("fill","#cecbf6").attr("stroke","#3c3489").attr("stroke-width",1.5);
    label(s, 62, "−14 min");
    label(s, 76, "per warm night", "#888", 9);
  })();

  // 6 · graduation cap (learning)
  ;(function () {
    const s = sel(6);
    s.append("path").attr("d",`M${CX-24} 30 L${CX} 16 L${CX+24} 30 L${CX} 44 Z`)
      .attr("fill","#9fe1cb").attr("stroke","#0f6e56").attr("stroke-width",1.5);
    s.append("line").attr("x1",CX+24).attr("y1",30).attr("x2",CX+24).attr("y2",46)
      .attr("stroke","#0f6e56").attr("stroke-width",1.5);
    label(s, 64, "−1%");
    label(s, 78, "per +0.56°C", "#888", 9);
  })();

  // 7 · dollar bill (cooling cost)
  ;(function () {
    const s = sel(7);
    s.append("rect").attr("x",CX-34).attr("y",14).attr("width",68).attr("height",38).attr("rx",4)
      .attr("fill","#fac775").attr("stroke","#854f0b").attr("stroke-width",1.5);
    s.append("text").attr("x",CX).attr("y",42).attr("text-anchor","middle")
      .attr("fill","#854f0b").attr("font-size",22).attr("font-weight",700)
      .attr("font-family","system-ui").text("$");
    label(s, 68, "+3%");
    label(s, 82, "electricity / summer", "#888", 9);
  })();

  // 8 · cross / ER
  ;(function () {
    const s = sel(8);
    s.append("rect").attr("x",CX-26).attr("y",10).attr("width",52).attr("height",52).attr("rx",9)
      .attr("fill","#f7c1c1").attr("stroke","#a32d2d").attr("stroke-width",1.5);
    s.append("line").attr("x1",CX).attr("y1",22).attr("x2",CX).attr("y2",50)
      .attr("stroke","#a32d2d").attr("stroke-width",4.5);
    s.append("line").attr("x1",CX-14).attr("y1",36).attr("x2",CX+14).attr("y2",36)
      .attr("stroke","#a32d2d").attr("stroke-width",4.5);
    label(s, 80, "more ER visits", ink, 10);
  })();
})();
