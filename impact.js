/* ============================================================
   IMPACT SECTION  ·  D3 sketch stepper  (requires D3 v7)
   逻辑链: exposure -> 谁被暴露(人群/老人/弱势) -> 身体如何受害(湿热)
            -> 日常后果(睡眠/学习 -> 电费 -> 急诊)
   ============================================================ */
(function () {
  const W = 680, H = 420;
  const svg = d3.select("#impact-canvas")
    .attr("viewBox", `0 0 ${W} ${H}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  // ---- 步骤数据 ----
  const STEPS = [
    { eyebrow: "From exposure to impact", title: "Tap the sun to begin",
      body: "Follow the heat from the climate data into daily life." },
    { eyebrow: "1 · Exposure", title: "Exposure-days = hot days \u00d7 people",
      body: "Every extra 35\u00b0C+ day reaches more people. That is the link between the climate map and human impact." },
    { eyebrow: "2 · Who is exposed", title: "The crowd is everyone",
      body: "But heat does not land evenly. Some groups carry far more of the burden than others." },
    { eyebrow: "3 · Older adults", title: "Age 65+ are most at risk",
      body: "Aging bodies cool themselves less well, often alongside chronic illness. Older adults die from heat at higher rates than any other group." },
    { eyebrow: "4 · Can\u2019t escape the heat", title: "Outdoor workers \u00b7 low income",
      body: "Construction, farming and delivery mean long hours in the sun. Low-income homes often lack air conditioning." },
    { eyebrow: "5 · How heat harms the body", title: "Sweat is our cooling system",
      body: "We cool down by evaporating sweat. Humid air blocks evaporation, so heat gets trapped \u2014 the most dangerous kind." },
    { eyebrow: "6 · Sleep & learning", title: "Hot nights, hot classrooms",
      body: "Nights above 30\u00b0C cut sleep by ~14 min. A hotter school year without AC lowers learning by ~1%." },
    { eyebrow: "7 · Cooling costs", title: "The AC bill climbs",
      body: "More hot days mean more cooling. Forecasts expect summer household electricity use to rise by ~3%." },
    { eyebrow: "8 · Emergency rooms", title: "More ER visits",
      body: "Heat pushes up emergency visits \u2014 not only heatstroke, but injuries, mental health and more \u2014 straining health systems." },
  ];

  // ---- 持久图层 ----
  const gGround = svg.append("g");
  gGround.append("path").attr("class", "sk-line")
    .attr("d", "M40 360 Q 340 372 640 360");

  const gSun    = svg.append("g").style("cursor", "pointer");
  const gThermo = svg.append("g").attr("opacity", 0);
  const gCrowd  = svg.append("g").attr("opacity", 0);
  const gVuln   = svg.append("g").attr("opacity", 0);
  const gBody   = svg.append("g").attr("opacity", 0);
  const gDaily  = svg.append("g").attr("opacity", 0);

  // ---- 太阳 ----
  gSun.append("circle").attr("cx", 340).attr("cy", 120).attr("r", 40)
    .attr("fill", "#f0997b").attr("stroke", "#993c1d").attr("stroke-width", 2);
  const rayPts = [[0,-65,0,-85],[0,65,0,85],[-65,0,-85,0],[65,0,85,0],
                  [-46,-46,-60,-60],[46,-46,60,-60],[-46,46,-60,60],[46,46,60,60]];
  gSun.selectAll(".ray").data(rayPts).join("line")
    .attr("x1", d => 340 + d[0]).attr("y1", d => 120 + d[1])
    .attr("x2", d => 340 + d[2]).attr("y2", d => 120 + d[3])
    .attr("stroke", "#d85a30").attr("stroke-width", 3).attr("stroke-linecap", "round");
  gSun.append("path").attr("class", "sk-ink").attr("d", "M325 128 Q330 122 335 128");
  gSun.append("path").attr("class", "sk-ink").attr("d", "M345 128 Q350 122 355 128");
  const tapHint = gSun.append("text").attr("class", "sk-tap")
    .attr("x", 340).attr("y", 178).attr("text-anchor", "middle").text("tap me");

  // 太阳呼吸动画(仅 step 0)
  function pulse() {
    tapHint.transition().duration(800).attr("opacity", .3)
      .transition().duration(800).attr("opacity", 1)
      .on("end", () => { if (current === 0) pulse(); });
  }

  // ---- 温度计 ----
  gThermo.append("rect").attr("x", 140).attr("y", 70).attr("width", 22).attr("height", 150)
    .attr("rx", 11).attr("fill", "#fff").attr("stroke", "#993c1d").attr("stroke-width", 2);
  gThermo.append("circle").attr("cx", 151).attr("cy", 232).attr("r", 20)
    .attr("fill", "#e24b4a").attr("stroke", "#993c1d").attr("stroke-width", 2);
  gThermo.append("rect").attr("x", 145).attr("y", 150).attr("width", 12).attr("height", 82)
    .attr("rx", 6).attr("fill", "#e24b4a");
  gThermo.append("text").attr("class", "sk-cap-t").attr("x", 172).attr("y", 100).text("35\u00b0C+");

  // ---- 人群 ----
  function drawPerson(g, x, y, s, color) {
    const p = g.append("g").attr("transform", `translate(${x},${y}) scale(${s})`);
    p.append("circle").attr("r", 6).attr("fill", color)
      .attr("stroke", "#712b13").attr("stroke-width", 1.2);
    [[0,6,0,26],[0,12,-9,20],[0,12,9,20],[0,26,-7,40],[0,26,7,40]].forEach(d =>
      p.append("line").attr("x1", d[0]).attr("y1", d[1]).attr("x2", d[2]).attr("y2", d[3])
        .attr("stroke", "#712b13").attr("stroke-width", 1.6).attr("stroke-linecap", "round"));
    return p;
  }
  const COLS = 11, ROWS = 4;
  const crowd = [];
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      const x = 120 + c * 44, y = 200 + r * 38;
      const p = drawPerson(gCrowd, x, y, 0.7, c % 4 === 0 ? "#e24b4a" : "#f0997b");
      p.datum({ idx: r * COLS + c, vulnerable: c % 4 === 0 });
      crowd.push(p);
    }

  // ---- 身体(出汗) ----
  gBody.append("circle").attr("cx", 340).attr("cy", 240).attr("r", 26)
    .attr("fill", "#faece7").attr("stroke", "#993c1d").attr("stroke-width", 2);
  [[340,266,340,320],[340,280,312,302],[340,280,368,302],[340,320,320,348],[340,320,360,348]]
    .forEach(d => gBody.append("line").attr("x1", d[0]).attr("y1", d[1])
      .attr("x2", d[2]).attr("y2", d[3]).attr("stroke", "#993c1d")
      .attr("stroke-width", 2).attr("stroke-linecap", "round"));
  [[315,224],[366,228],[340,206]].forEach(d =>
    gBody.append("path").attr("transform", `translate(${d[0]},${d[1]}) scale(1.6)`)
      .attr("d", "M0 0 q-5 9 0 14 q5 -5 0 -14")
      .attr("fill", "#85b7eb").attr("stroke", "#185fa5").attr("stroke-width", 1));

  // ---- 通用: 字幕卡 ----
  function caption(g, x, y, line1, line2) {
    const box = g.append("g");
    box.append("rect").attr("x", x).attr("y", y).attr("width", 250).attr("height", 78)
      .attr("rx", 10).attr("fill", "#fff").attr("stroke", "#993c1d").attr("stroke-width", 1.5);
    box.append("text").attr("class", "sk-cap-t").attr("x", x + 16).attr("y", y + 30).text(line1);
    box.append("text").attr("class", "sk-cap-b").attr("x", x + 16).attr("y", y + 54).text(line2);
  }

  // ---- 弱势群体: 拄拐老人 ----
  function drawElder(g, x, y) {
    const e = g.append("g");
    e.append("circle").attr("cx", x).attr("cy", y).attr("r", 9)
      .attr("fill", "#e24b4a").attr("stroke", "#712b13").attr("stroke-width", 1.5);
    [[x,y+9,x,y+38],[x,y+18,x-12,y+30],[x,y+18,x+12,y+26],
     [x,y+38,x-9,y+56],[x,y+38,x+9,y+56]].forEach(d =>
      e.append("line").attr("x1", d[0]).attr("y1", d[1]).attr("x2", d[2]).attr("y2", d[3])
        .attr("stroke", "#712b13").attr("stroke-width", 2).attr("stroke-linecap", "round"));
    e.append("line").attr("x1", x + 14).attr("y1", y + 14).attr("x2", x + 18).attr("y2", y + 56)
      .attr("stroke", "#993c1d").attr("stroke-width", 2);
  }

  // ---- 弱势群体: 戴安全帽的户外工人 ----
  function drawWorker(g, x, y) {
    const w = g.append("g");
    w.append("path").attr("d", `M${x-12} ${y-6} q12 -16 24 0`)
      .attr("fill", "#ef9f27").attr("stroke", "#854f0b").attr("stroke-width", 1.5);
    w.append("circle").attr("cx", x).attr("cy", y + 4).attr("r", 9)
      .attr("fill", "#faece7").attr("stroke", "#712b13").attr("stroke-width", 1.5);
    [[x,y+13,x,y+44],[x,y+22,x-14,y+30],[x,y+22,x+14,y+18],
     [x,y+44,x-10,y+64],[x,y+44,x+10,y+64]].forEach(d =>
      w.append("line").attr("x1", d[0]).attr("y1", d[1]).attr("x2", d[2]).attr("y2", d[3])
        .attr("stroke", "#712b13").attr("stroke-width", 2).attr("stroke-linecap", "round"));
  }

  // ---- 弱势群体: 无空调小屋 ----
  function drawHouse(g, x, y) {
    const h = g.append("g");
    h.append("rect").attr("x", x - 30).attr("y", y - 20).attr("width", 60).attr("height", 44)
      .attr("fill", "#faece7").attr("stroke", "#712b13").attr("stroke-width", 1.5);
    h.append("path").attr("d", `M${x-36} ${y-20} L${x} ${y-48} L${x+36} ${y-20} Z`)
      .attr("fill", "#f0997b").attr("stroke", "#712b13").attr("stroke-width", 1.5);
    h.append("rect").attr("x", x - 8).attr("y", y - 2).attr("width", 16).attr("height", 26)
      .attr("fill", "#993c1d");
    h.append("text").attr("class", "sk-label").attr("x", x).attr("y", y - 54)
      .attr("text-anchor", "middle").text("no AC");
  }

  // ---- 日常后果图标 ----
  function dailyIcon(g, type, x, y, label) {
    const n = g.append("g");
    const tag = t => n.append("text").attr("class", "sk-label")
      .attr("x", x).attr("y", y + 48).attr("text-anchor", "middle").text(t);
    if (type === "moon") {
      n.append("path").attr("d", `M${x-14} ${y} a16 16 0 1 0 22 -14 a13 13 0 0 1 -22 14 Z`)
        .attr("fill", "#cecbf6").attr("stroke", "#3c3489").attr("stroke-width", 1.5);
    } else if (type === "school") {
      n.append("path").attr("d", `M${x-22} ${y-6} L${x} ${y-18} L${x+22} ${y-6} L${x} ${y+6} Z`)
        .attr("fill", "#9fe1cb").attr("stroke", "#0f6e56").attr("stroke-width", 1.5);
      n.append("line").attr("x1", x + 22).attr("y1", y - 6).attr("x2", x + 22).attr("y2", y + 8)
        .attr("stroke", "#0f6e56").attr("stroke-width", 1.5);
    } else if (type === "bill") {
      n.append("rect").attr("x", x - 18).attr("y", y - 22).attr("width", 36).attr("height", 44)
        .attr("rx", 3).attr("fill", "#fac775").attr("stroke", "#854f0b").attr("stroke-width", 1.5);
      [-10, -2].forEach(dy => n.append("line").attr("x1", x - 10).attr("y1", y + dy)
        .attr("x2", x + 10).attr("y2", y + dy).attr("stroke", "#854f0b").attr("stroke-width", 1.5));
      n.append("text").attr("x", x).attr("y", y + 16).attr("text-anchor", "middle")
        .attr("fill", "#854f0b").attr("font-weight", 700).attr("font-size", 13).text("$");
    } else if (type === "er") {
      n.append("rect").attr("x", x - 22).attr("y", y - 22).attr("width", 44).attr("height", 44)
        .attr("rx", 6).attr("fill", "#f7c1c1").attr("stroke", "#a32d2d").attr("stroke-width", 1.5);
      n.append("line").attr("x1", x).attr("y1", y - 12).attr("x2", x).attr("y2", y + 12)
        .attr("stroke", "#a32d2d").attr("stroke-width", 3.5);
      n.append("line").attr("x1", x - 12).attr("y1", y).attr("x2", x + 12).attr("y2", y)
        .attr("stroke", "#a32d2d").attr("stroke-width", 3.5);
    }
    tag(label);
  }

  // ---- 渲染某一步 ----
  let current = 0;
  function fade(g, on) { g.transition().duration(350).attr("opacity", on ? 1 : 0); }

  function render(i) {
    current = i;
    const s = STEPS[i];

    // 文字卡
    d3.select("#impact-step-eyebrow").text(s.eyebrow);
    d3.select("#impact-step-title").text(s.title);
    d3.select("#impact-step-body").text(s.body);

    // dots
    d3.selectAll(".impact-dot").classed("is-active", (d, k) => k === i);

    // 重置临时图层
    gVuln.selectAll("*").remove();
    gDaily.selectAll("*").remove();

    // 太阳提示只在 step0
    tapHint.interrupt().attr("opacity", i === 0 ? 1 : 0);
    gSun.style("cursor", i === 0 ? "pointer" : "default");

    fade(gThermo, i >= 1 && i <= 4);
    fade(gCrowd,  i >= 1 && i <= 4);
    fade(gBody,   i === 5);
    fade(gDaily,  i >= 6);
    fade(gVuln,   i === 3 || i === 4);

    // 人群透明度
    crowd.forEach(p => {
      const d = p.datum();
      let op = 1;
      if (i === 3) op = d.vulnerable ? 1 : 0.18;   // 高亮老人
      if (i === 4) op = 0.18;                        // 退到背景
      p.transition().duration(350).attr("opacity", i >= 1 && i <= 4 ? op : 0);
    });

    if (i === 3) [[190,250],[300,288],[410,250]].forEach(c => drawElder(gVuln, c[0], c[1]));
    if (i === 4) { drawWorker(gVuln, 210, 250); drawHouse(gVuln, 450, 300); }

    if (i === 6) { dailyIcon(gDaily, "moon", 230, 250, "sleep \u221214 min");
                   dailyIcon(gDaily, "school", 430, 250, "learning \u22121%"); }
    if (i === 7) dailyIcon(gDaily, "bill", 340, 250, "electricity +3%");
    if (i === 8) dailyIcon(gDaily, "er", 340, 250, "more ER visits");
  }

  // ---- dots ----
  const dotSel = d3.select("#impact-dots").selectAll(".impact-dot")
    .data(STEPS).join("span").attr("class", "impact-dot")
    .on("click", (e, d) => render(STEPS.indexOf(d)));

  // ---- 导航 ----
  function next() { if (current < STEPS.length - 1) render(current + 1); }
  function prev() { if (current > 0) render(current - 1); }
  gSun.on("click", () => { if (current === 0) next(); });
  d3.select("#impact-next").on("click", next);
  d3.select("#impact-prev").on("click", prev);

  render(0);
  pulse();
})();
