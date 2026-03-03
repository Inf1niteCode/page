// ─── ANIMATED LINES (background canvas) ───────────────────────────────────────
(function () {
  const canvas = document.getElementById("linesCanvas");
  const ctx = canvas.getContext("2d");
  let W, H;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  const LINE_COUNT = 22;
  const lines = [];

  function randomLine() {
    const isHorizontal = Math.random() > 0.38;
    const speed = 0.18 + Math.random() * 0.38;
    const isAccent = Math.random() < (isHorizontal ? 0.1 : 0.08);
    const thickness = Math.random() < 0.15 ? 1.5 : 0.5;

    if (isHorizontal) {
      const y = Math.random() * H;
      const going = Math.random() > 0.5 ? 1 : -1;
      const len = 80 + Math.random() * 220;
      const x = going > 0 ? -len : W + len;
      const opacity = 0.04 + Math.random() * 0.13;
      return {
        isHorizontal: true,
        x,
        y,
        len,
        going,
        speed,
        opacity,
        thickness,
        isAccent,
      };
    } else {
      const x = Math.random() * W;
      const going = Math.random() > 0.5 ? 1 : -1;
      const len = 60 + Math.random() * 180;
      const y = going > 0 ? -len : H + len;
      const opacity = 0.04 + Math.random() * 0.1;
      return {
        isHorizontal: false,
        x,
        y,
        len,
        going,
        speed,
        opacity,
        thickness,
        isAccent,
      };
    }
  }

  // scatter initial positions so they don't all start from the same edge
  for (let i = 0; i < LINE_COUNT; i++) {
    const l = randomLine();
    if (l.isHorizontal) {
      l.x = Math.random() * (W + l.len * 2) - l.len;
      if (l.going < 0) l.x = W - l.x;
    } else {
      l.y = Math.random() * (H + l.len * 2) - l.len;
      if (l.going < 0) l.y = H - l.y;
    }
    lines.push(l);
  }

  function isOffScreen(l) {
    if (l.isHorizontal) return l.going > 0 ? l.x > W + l.len : l.x < -l.len;
    return l.going > 0 ? l.y > H + l.len : l.y < -l.len;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      const color = l.isAccent ? "#ff3c00" : "#f0ece4";

      ctx.save();
      ctx.globalAlpha = l.opacity;
      ctx.lineWidth = l.thickness;
      ctx.beginPath();

      if (l.isHorizontal) {
        const grad = ctx.createLinearGradient(l.x, 0, l.x + l.len * l.going, 0);
        grad.addColorStop(0, "transparent");
        grad.addColorStop(0.3, color);
        grad.addColorStop(0.7, color);
        grad.addColorStop(1, "transparent");
        ctx.strokeStyle = grad;
        ctx.moveTo(l.x, l.y);
        ctx.lineTo(l.x + l.len * l.going, l.y);
      } else {
        const grad = ctx.createLinearGradient(0, l.y, 0, l.y + l.len * l.going);
        grad.addColorStop(0, "transparent");
        grad.addColorStop(0.3, color);
        grad.addColorStop(0.7, color);
        grad.addColorStop(1, "transparent");
        ctx.strokeStyle = grad;
        ctx.moveTo(l.x, l.y);
        ctx.lineTo(l.x, l.y + l.len * l.going);
      }

      ctx.stroke();
      ctx.restore();

      // advance position
      if (l.isHorizontal) l.x += l.speed * l.going;
      else l.y += l.speed * l.going;

      // respawn when off-screen
      if (isOffScreen(l)) lines[i] = randomLine();
    }

    requestAnimationFrame(draw);
  }
  draw();
})();

// ─── CUSTOM CURSOR ─────────────────────────────────────────────────────────────
(function () {
  const cursor = document.getElementById("cursor");
  const ring = document.getElementById("cursorRing");
  let mx = 0,
    my = 0,
    rx = 0,
    ry = 0;

  document.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + "px";
    cursor.style.top = my + "px";
  });

  function animateRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + "px";
    ring.style.top = ry + "px";
    requestAnimationFrame(animateRing);
  }
  animateRing();

  document.querySelectorAll("a, button").forEach((el) => {
    el.addEventListener("mouseenter", () => {
      cursor.style.width = "6px";
      cursor.style.height = "6px";
      ring.style.width = "60px";
      ring.style.height = "60px";
    });
    el.addEventListener("mouseleave", () => {
      cursor.style.width = "12px";
      cursor.style.height = "12px";
      ring.style.width = "40px";
      ring.style.height = "40px";
    });
  });
})();

// ─── MISC ──────────────────────────────────────────────────────────────────────
document.getElementById("year").textContent = new Date().getFullYear();

// ─── TYPEWRITER TYPESCRIPT CODE BACKGROUND ────────────────────────────────────
(function () {
  // VSCode Dark+ color palette
  const C = {
    keyword: "#569cd6", // blue    — const, function, interface, return, etc
    type: "#4ec9b0", // teal    — type names, generics
    string: "#ce9178", // orange  — string literals
    number: "#b5cea8", // green   — numbers
    comment: "#6a9955", // green   — comments
    fn: "#dcdcaa", // yellow  — function names
    param: "#9cdcfe", // light blue — parameters / variables
    punct: "#d4d4d4", // white   — brackets, commas, operators
    decorator: "#c586c0", // purple  — decorators, imports
    prop: "#9cdcfe", // light blue — object properties
  };

  // Token = { text, color }
  // Each "snippet" is an array of lines, each line is an array of tokens
  // Token = { text, color }
  // Каждый snippet — массив строк, каждая строка — массив токенов

  const SNIPPETS = [
    // ─────────────────────────────────────────────
    // Snippet 1 — GameManager (Cocos 3.x)
    // ─────────────────────────────────────────────
    [
      [
        { t: "import { ", c: C.keyword },
        { t: "_decorator", c: C.type },
        { t: ", ", c: C.punct },
        { t: "Component", c: C.type },
        { t: ", ", c: C.punct },
        { t: "Node", c: C.type },
        { t: ", ", c: C.punct },
        { t: "Label", c: C.type },
        { t: " } from ", c: C.punct },
        { t: '"cc"', c: C.string },
        { t: ";", c: C.punct },
      ],
      [
        { t: "const { ", c: C.keyword },
        { t: "ccclass", c: C.fn },
        { t: ", ", c: C.punct },
        { t: "property", c: C.fn },
        { t: " } = ", c: C.punct },
        { t: "_decorator", c: C.type },
        { t: ";", c: C.punct },
      ],
      [],
      [
        { t: "@", c: C.decorator },
        { t: "ccclass", c: C.fn },
        { t: '("GameManager")', c: C.string },
      ],
      [
        { t: "export class ", c: C.keyword },
        { t: "GameManager", c: C.type },
        { t: " extends ", c: C.keyword },
        { t: "Component", c: C.type },
        { t: " {", c: C.punct },
      ],
      [],
      [
        { t: "  @", c: C.decorator },
        { t: "property", c: C.fn },
        { t: "(", c: C.punct },
        { t: "Label", c: C.type },
        { t: ")", c: C.punct },
      ],
      [
        { t: "  timerLabel", c: C.param },
        { t: ": ", c: C.punct },
        { t: "Label", c: C.type },
        { t: " = null!;", c: C.punct },
      ],
      [],
      [
        { t: "  private ", c: C.keyword },
        { t: "timeLeft", c: C.param },
        { t: ": ", c: C.punct },
        { t: "number", c: C.keyword },
        { t: " = ", c: C.punct },
        { t: "60", c: C.number },
        { t: ";", c: C.punct },
      ],
      [],
      [
        { t: "  start()", c: C.fn },
        { t: " {", c: C.punct },
      ],
      [
        { t: "    this", c: C.keyword },
        { t: ".", c: C.punct },
        { t: "schedule", c: C.fn },
        { t: "(this.tickTimer, 1);", c: C.punct },
      ],
      [{ t: "  }", c: C.punct }],
      [],
      [
        { t: "  private ", c: C.keyword },
        { t: "tickTimer", c: C.fn },
        { t: "()", c: C.punct },
        { t: " {", c: C.punct },
      ],
      [
        { t: "    this", c: C.keyword },
        { t: ".timeLeft--;", c: C.punct },
      ],
      [
        { t: "    this", c: C.keyword },
        { t: ".timerLabel.string = ", c: C.punct },
        { t: "`⏱ ${this.timeLeft}`", c: C.string },
        { t: ";", c: C.punct },
      ],
      [{ t: "  }", c: C.punct }],
      [{ t: "}", c: C.punct }],
    ],

    // ─────────────────────────────────────────────
    // Snippet 2 — NodeMover
    // ─────────────────────────────────────────────
    [
      [
        { t: "import { ", c: C.keyword },
        { t: "_decorator", c: C.type },
        { t: ", Component, Node, Vec3, tween", c: C.type },
        { t: " } from ", c: C.punct },
        { t: '"cc"', c: C.string },
        { t: ";", c: C.punct },
      ],
      [{ t: "const { ccclass } = _decorator;", c: C.punct }],
      [],
      [
        { t: "@", c: C.decorator },
        { t: "ccclass", c: C.fn },
        { t: '("NodeMover")', c: C.string },
      ],
      [
        { t: "export class ", c: C.keyword },
        { t: "NodeMover", c: C.type },
        { t: " extends Component {", c: C.punct },
      ],
      [],
      [
        { t: "  moveTo", c: C.fn },
        { t: "(target: Vec3)", c: C.punct },
        { t: " {", c: C.punct },
      ],
      [
        { t: "    tween", c: C.fn },
        { t: "(this.node)", c: C.punct },
      ],
      [
        { t: "      .to", c: C.fn },
        { t: "(0.4, { position: target })", c: C.punct },
      ],
      [{ t: "      .start();", c: C.punct }],
      [{ t: "  }", c: C.punct }],
      [{ t: "}", c: C.punct }],
    ],

    // ─────────────────────────────────────────────
    // Snippet 3 — Scene Loader
    // ─────────────────────────────────────────────
    [
      [
        { t: "import { ", c: C.keyword },
        { t: "director", c: C.type },
        { t: " } from ", c: C.punct },
        { t: '"cc"', c: C.string },
        { t: ";", c: C.punct },
      ],
      [],
      [
        { t: "export function ", c: C.keyword },
        { t: "loadGameScene", c: C.fn },
        { t: "()", c: C.punct },
        { t: " {", c: C.punct },
      ],
      [
        { t: "  director", c: C.type },
        { t: ".", c: C.punct },
        { t: "loadScene", c: C.fn },
        { t: "(", c: C.punct },
        { t: '"GameScene"', c: C.string },
        { t: ");", c: C.punct },
      ],
      [{ t: "}", c: C.punct }],
    ],

    // ─────────────────────────────────────────────
    // Snippet 4 — ItemManager
    // ─────────────────────────────────────────────
    [
      [
        { t: "@", c: C.decorator },
        { t: "ccclass", c: C.fn },
        { t: '("ItemManager")', c: C.string },
      ],
      [
        { t: "export class ", c: C.keyword },
        { t: "ItemManager", c: C.type },
        { t: " extends Component {", c: C.punct },
      ],
      [],
      [
        { t: "  private ", c: C.keyword },
        { t: "items", c: C.param },
        { t: ": Node[] = [];", c: C.punct },
      ],
      [],
      [
        { t: "  addItem", c: C.fn },
        { t: "(node: Node)", c: C.punct },
        { t: " {", c: C.punct },
      ],
      [{ t: "    this.items.push(node);", c: C.punct }],
      [{ t: "  }", c: C.punct }],
      [],
      [
        { t: "  clear()", c: C.fn },
        { t: " {", c: C.punct },
      ],
      [{ t: "    this.items.forEach(n => n.destroy());", c: C.punct }],
      [{ t: "    this.items = [];", c: C.punct }],
      [{ t: "  }", c: C.punct }],
      [{ t: "}", c: C.punct }],
    ],

    // ─────────────────────────────────────────────
    // Snippet 5 — ButtonHandler + LocalStorage
    // ─────────────────────────────────────────────
    [
      [
        { t: "const ", c: C.keyword },
        { t: "SCORE_KEY", c: C.param },
        { t: " = ", c: C.punct },
        { t: '"score"', c: C.string },
        { t: ";", c: C.punct },
      ],
      [],
      [
        { t: "function ", c: C.keyword },
        { t: "saveScore", c: C.fn },
        { t: "(value: number)", c: C.punct },
        { t: " {", c: C.punct },
      ],
      [
        { t: "  localStorage", c: C.type },
        { t: ".setItem", c: C.fn },
        { t: "(SCORE_KEY, value.toString());", c: C.punct },
      ],
      [{ t: "}", c: C.punct }],
      [],
      [
        { t: "function ", c: C.keyword },
        { t: "loadScore", c: C.fn },
        { t: "(): number {", c: C.punct },
      ],
      [{ t: "  const v = localStorage.getItem(SCORE_KEY);", c: C.punct }],
      [{ t: "  return v ? parseInt(v) : 0;", c: C.punct }],
      [{ t: "}", c: C.punct }],
    ],
  ];

  const bg = document.getElementById("codeBackground");
  const COL_WIDTH = 340;
  const LINE_H = 20;
  const FONT = '12px "Space Mono", monospace';
  const GLOBAL_ALPHA = 0.13;

  // Figure out how many columns fit
  function colCount() {
    if (window.innerWidth < 480) return 1;
    if (window.innerWidth < 768) return 1;
    if (window.innerWidth < 1024) return 2;
    return Math.max(1, Math.floor(window.innerWidth / COL_WIDTH));
  }

  // One typing column
  class CodeColumn {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.canvas = document.createElement("canvas");
      this.canvas.style.cssText = `position:absolute;left:${x}px;top:${y}px;opacity:${GLOBAL_ALPHA};`;
      this.ctx = this.canvas.getContext("2d");
      bg.appendChild(this.canvas);

      this.snippetIdx = Math.floor(Math.random() * SNIPPETS.length);
      this.lineIdx = 0;
      this.charIdx = 0;
      this.rendered = []; // fully drawn lines (flat token arrays with x offsets)
      this.currentFlat = []; // tokens of current line, flat with char progress
      this.delay = Math.random() * 4000; // stagger start
      this.lastTick = 0;
      this.speed = 28 + Math.random() * 40; // chars/sec
      this.cursorBlink = 0;
      this.done = false;
      this.pauseAfter = 0;

      this._buildCurrentLine();
      this._resize();
    }

    get snippet() {
      return SNIPPETS[this.snippetIdx];
    }

    _resize() {
      const lines = this.snippet.length;
      this.canvas.width = COL_WIDTH;
      this.canvas.height = (lines + 1) * LINE_H + 10;
    }

    _buildCurrentLine() {
      const line = this.snippet[this.lineIdx] || [];
      // Flatten tokens into characters with color
      this.currentFlat = [];
      for (const tok of line) {
        for (const ch of tok.t) {
          this.currentFlat.push({ ch, color: tok.c });
        }
      }
      this.charIdx = 0;
    }

    tick(now) {
      if (now < this.delay) return;
      if (this.pauseAfter > now) return;

      const elapsed = now - this.lastTick;
      const charsToAdd = Math.floor(elapsed / (1000 / this.speed));
      if (charsToAdd < 1) return;

      this.lastTick = now;
      this.charIdx = Math.min(
        this.charIdx + charsToAdd,
        this.currentFlat.length,
      );

      if (this.charIdx >= this.currentFlat.length) {
        // line done — commit it
        this.rendered.push([...this.currentFlat]);
        this.lineIdx++;
        if (this.lineIdx >= this.snippet.length) {
          // snippet done — pause then restart with next snippet
          this.pauseAfter = now + 2000 + Math.random() * 2000;
          this.snippetIdx = (this.snippetIdx + 1) % SNIPPETS.length;
          this.lineIdx = 0;
          this.rendered = [];
          this._resize();
        }
        this._buildCurrentLine();
      }

      this._draw(now);
    }

    _draw(now) {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.font = FONT;

      // draw committed lines
      for (let li = 0; li < this.rendered.length; li++) {
        let cx = 0;
        for (const { ch, color } of this.rendered[li]) {
          ctx.fillStyle = color;
          ctx.fillText(ch, cx, (li + 1) * LINE_H);
          cx += ctx.measureText(ch).width;
        }
      }

      // draw current typing line
      const ly = (this.rendered.length + 1) * LINE_H;
      let cx = 0;
      for (let i = 0; i < this.charIdx; i++) {
        const { ch, color } = this.currentFlat[i];
        ctx.fillStyle = color;
        ctx.fillText(ch, cx, ly);
        cx += ctx.measureText(ch).width;
      }

      // blinking cursor
      if (Math.floor(now / 530) % 2 === 0) {
        ctx.fillStyle = "#aeafad";
        ctx.fillRect(cx, ly - LINE_H + 3, 7, LINE_H - 1);
      }
    }
  }

  // Init columns
  let columns = [];

  function initColumns() {
    // clear old
    columns.forEach((c) => c.canvas.remove());
    columns = [];

    const n = colCount();
    const totalW = window.innerWidth;
    const spacing = totalW / n;

    for (let i = 0; i < n; i++) {
      const x = i * spacing + spacing * 0.1;
      const y = 60 + Math.random() * 200;
      columns.push(new CodeColumn(x, y));
    }
  }

  initColumns();
  window.addEventListener("resize", initColumns);

  // Animation loop
  function loop(now) {
    for (const col of columns) col.tick(now);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
