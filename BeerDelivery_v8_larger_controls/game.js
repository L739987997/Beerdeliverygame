
    const canvas = document.querySelector("#canvas");
    const ctx = canvas.getContext("2d");
    const statusText = document.querySelector("#statusText");
    const detailText = document.querySelector("#detailText");
    const scoreText = document.querySelector("#scoreText");
    const startScreen = document.querySelector("#startScreen");
    const levelScreen = document.querySelector("#levelScreen");
    const resultScreen = document.querySelector("#resultScreen");
    const resultTitle = document.querySelector("#resultTitle");
    const resultText = document.querySelector("#resultText");
    const startBtn = document.querySelector("#startBtn");
    const levelEyebrow = document.querySelector("#levelEyebrow");
    const levelTitle = document.querySelector("#levelTitle");
    const levelMessage = document.querySelector("#levelMessage");
    const levelStartBtn = document.querySelector("#levelStartBtn");
    const restartBtn = document.querySelector("#restartBtn");
    const touchUp = document.querySelector("#touchUp");
    const touchDown = document.querySelector("#touchDown");
    const touchBeer = document.querySelector("#touchBeer");
    const touchRestart = document.querySelector("#touchRestart");

    const sprites = loadImage("assets/sprites/beer_sprites.png");
    const spriteRects = {
      playerIdle: { x: 45, y: 71, w: 84, h: 155 },
      playerServe: { x: 914, y: 70, w: 91, h: 156 },
      playerCatch: { x: 1253, y: 70, w: 72, h: 156 },
      beer: { x: 38, y: 819, w: 96, h: 117 },
      empty: { x: 502, y: 831, w: 92, h: 107 },
      broken: { x: 986, y: 847, w: 138, h: 82 },
      customers: [
        { walk: { x: 43, y: 317, w: 95, h: 160 }, wait: { x: 171, y: 316, w: 95, h: 160 }, drink: { x: 171, y: 316, w: 95, h: 160 }, returnMug: { x: 277, y: 317, w: 91, h: 159 } },
        { walk: { x: 414, y: 322, w: 99, h: 154 }, wait: { x: 529, y: 322, w: 100, h: 154 }, drink: { x: 628, y: 321, w: 110, h: 155 }, returnMug: { x: 529, y: 322, w: 100, h: 154 } },
        { walk: { x: 782, y: 317, w: 97, h: 159 }, wait: { x: 899, y: 316, w: 98, h: 160 }, drink: { x: 899, y: 316, w: 98, h: 160 }, returnMug: { x: 1006, y: 318, w: 96, h: 158 } },
        { walk: { x: 1158, y: 322, w: 99, h: 154 }, wait: { x: 1158, y: 322, w: 99, h: 154 }, drink: { x: 1251, y: 322, w: 106, h: 154 }, returnMug: { x: 1377, y: 324, w: 107, h: 152 } },
        { walk: { x: 43, y: 561, w: 96, h: 160 }, wait: { x: 151, y: 561, w: 99, h: 160 }, drink: { x: 151, y: 561, w: 99, h: 160 }, returnMug: { x: 265, y: 563, w: 100, h: 158 } },
        { walk: { x: 414, y: 562, w: 98, h: 159 }, wait: { x: 523, y: 562, w: 100, h: 159 }, drink: { x: 523, y: 562, w: 100, h: 159 }, returnMug: { x: 637, y: 565, w: 101, h: 156 } },
        { walk: { x: 782, y: 558, w: 102, h: 163 }, wait: { x: 900, y: 558, w: 102, h: 163 }, drink: { x: 1010, y: 559, w: 104, h: 162 }, returnMug: { x: 900, y: 558, w: 102, h: 163 } },
        { walk: { x: 1258, y: 564, w: 102, h: 157 }, wait: { x: 1258, y: 564, w: 102, h: 157 }, drink: { x: 1258, y: 564, w: 102, h: 157 }, returnMug: { x: 1379, y: 566, w: 110, h: 155 } }
      ]
    };

    const rowLayouts = {
      3: [210, 370, 530],
      4: [168, 300, 432, 564],
      5: [150, 255, 360, 465, 570]
    };
    const bartenderX = 215;
    const serviceLineX = 318;
    const backWallX = 1272;
    const tableStartX = 330;
    const tableEndX = canvas.width;
    const spawnX = 1218;
    const levelConfigs = Array.from({ length: 50 }, (_, levelIndex) => {
      const difficulty = Math.pow(1.05, levelIndex);
      return {
        count: Math.min(54, 5 + Math.floor(levelIndex * 0.95)),
        speed: Math.min(86, 12.8 * difficulty),
        spawnInterval: Math.max(0.58, 1.52 / difficulty),
        rows: levelIndex < 3 ? 3 : levelIndex < 8 ? 4 : 5,
        returnsMugs: levelIndex >= 3,
        returnChance: levelIndex >= 3
          ? Math.min(0.75, 0.35 + (levelIndex - 3) * 0.01)
          : 0,
        beerSpeed: Math.min(1450, 405 * Math.pow(1.025, levelIndex)),
        mugSpeed: levelIndex >= 3
          ? Math.min(850, 300 * Math.pow(1.025, levelIndex - 3))
          : 0
      };
    });
    const keys = new Set();

    let state = "ready";
    let currentLevel = 0;
    let selectedRow = 1;
    let lives = 5;
    let rows = rowLayouts[levelConfigs[0].rows].slice();
    let playerY = rows[selectedRow];
    let beers = [];
    let empties = [];
    let customers = [];
    let customerQueue = [];
    let particles = [];
    let levelTime = 0;
    let lastTime = 0;
    let shake = 0;

    function loadImage(src) {
      const image = new Image();
      image.ready = false;
      image.onload = () => {
        image.ready = true;
        window.__spriteLoaded = true;
        draw();
      };
      image.onerror = () => {
        image.ready = false;
        window.__spriteLoaded = false;
      };
      image.src = src;
      return image;
    }

    function drawSprite(rect, x, y, w, h, flip = false) {
      if (!sprites.ready) return false;
      ctx.save();
      if (flip) {
        ctx.translate(x + w, y);
        ctx.scale(-1, 1);
        ctx.drawImage(sprites, rect.x, rect.y, rect.w, rect.h, 0, 0, w, h);
      } else {
        ctx.drawImage(sprites, rect.x, rect.y, rect.w, rect.h, x, y, w, h);
      }
      ctx.restore();
      return true;
    }

    function resetGame() {
      currentLevel = 0;
      lives = 5;
      rows = rowLayouts[levelConfigs[0].rows].slice();
      selectedRow = Math.floor(rows.length / 2);
      playerY = rows[selectedRow];
      beers = [];
      empties = [];
      customers = [];
      customerQueue = [];
      particles = [];
      startScreen.classList.add("hidden");
      levelScreen.classList.add("hidden");
      resultScreen.classList.add("hidden");
      showLevelIntro(currentLevel);
    }

    function startLevel(levelIndex) {
      const previousRow = selectedRow;
      rows = rowLayouts[levelConfigs[levelIndex].rows].slice();
      selectedRow = Math.max(0, Math.min(rows.length - 1, previousRow));
      beers = [];
      empties = [];
      particles = [];
      levelTime = 0;
      resultScreen.classList.add("hidden");
      customerQueue = buildCustomers(levelIndex);
      customers = [];
      statusText.textContent = `Level ${levelIndex + 1}: keep every row covered.`;
      updateDetail();
    }

    function levelInstructions(levelIndex) {
      const levelNumber = levelIndex + 1;
      if (levelNumber === 1) {
        return "Deliver beer to customers.\nIf a customer reaches the left side,\nyou lose 1 life.";
      }
      if (levelNumber === 2) {
        return "More customers are arriving.\nStay alert.";
      }
      if (levelNumber === 3) {
        return "Customers move faster.";
      }
      if (levelNumber === 4) {
        return "Some customers will now return empty mugs.\nCatch the empty mugs before they fall.\nMissing a mug costs 1 life.";
      }
      return levelConfigs[levelIndex].returnsMugs
        ? "Deliver every beer and catch every returned mug."
        : "Deliver beer before customers reach the left side.";
    }

    function showLevelIntro(levelIndex) {
      state = "level-intro";
      levelEyebrow.textContent = `LEVEL ${levelIndex + 1}`;
      levelTitle.textContent = `Level ${levelIndex + 1}`;
      levelMessage.textContent = levelInstructions(levelIndex);
      levelStartBtn.textContent = `Start Level ${levelIndex + 1}`;
      levelScreen.classList.remove("hidden");
      updateDetail();
    }

    function beginCurrentLevel() {
      if (state !== "level-intro") return;
      levelScreen.classList.add("hidden");
      state = "playing";
      startLevel(currentLevel);
      lastTime = performance.now();
      requestAnimationFrame(loop);
    }

    function buildCustomers(levelIndex) {
      const cfg = levelConfigs[levelIndex];
      const rowCounts = new Array(rows.length).fill(0);
      const built = [];
      for (let i = 0; i < cfg.count; i += 1) {
        const row = (i * 2 + levelIndex) % rows.length;
        const slot = rowCounts[row];
        rowCounts[row] += 1;
        const stagger = cfg.spawnInterval;
        const rowOffset = ((row * 0.31 + slot * 0.17 + levelIndex * 0.13) % 0.85);
        const depth = levelIndex >= 4 && slot >= 2 ? (slot - 1) % 3 : 0;
        built.push({
          row,
          slot,
          x: spawnX + ((row + slot) % 3) * 24,
          y: rows[row],
          mood: (slot * 0.47) + row,
          depth,
          speed: cfg.speed * (0.86 + ((slot + row) % 4) * 0.08),
          drinksNeeded: 1,
          returnsMug: cfg.returnsMugs && Math.random() < cfg.returnChance,
          drinkingTimer: 0,
          pendingReturn: false,
          waitingForMug: false,
          caught: false,
          spawnAt: i * stagger + rowOffset
        });
      }
      return built.sort((a, b) => a.spawnAt - b.spawnAt);
    }

    function updateDetail() {
      detailText.textContent = `Level ${currentLevel + 1}`;
      scoreText.textContent = "♥".repeat(Math.max(0, lives));
      syncDebugState();
    }

    function syncDebugState() {
      document.body.dataset.level = String(currentLevel + 1);
      document.body.dataset.lives = String(lives);
      document.body.dataset.rows = String(rows.length);
      document.body.dataset.customersLeft = String(customers.filter((customer) => !customer.caught).length + customerQueue.length);
      document.body.dataset.beers = String(beers.length);
      document.body.dataset.empties = String(empties.length);
      document.body.dataset.state = state;
    }

    function finish(win, message) {
      state = win ? "won" : "lost";
      resultTitle.textContent = win ? "You Won" : "You lose!";
      resultText.textContent = message;
      statusText.textContent = win ? "Closed Out" : "Spilled";
      detailText.textContent = win ? "Complete" : "Missed delivery";
      resultScreen.classList.remove("hidden");
    }

    function loseLife(message) {
      lives -= 1;
      shake = 10;
      updateDetail();
      statusText.textContent = message;
      if (lives <= 0) {
        finish(false, message);
      }
      syncDebugState();
    }

    function completeLevel() {
      if (currentLevel >= levelConfigs.length - 1) {
        finish(true, "You survived all 50 levels of Beer Delivery.");
        return;
      }

      state = "level-clear";
      statusText.textContent = `Level ${currentLevel + 1} clear. Next round pouring...`;
      window.setTimeout(() => {
        if (state !== "level-clear") return;
        currentLevel += 1;
        showLevelIntro(currentLevel);
      }, 1100);
    }

    function deliverBeer() {
      if (state !== "playing") return;
      beers.push({
        row: selectedRow,
        x: bartenderX + 84,
        y: rows[selectedRow] + 6,
        vx: levelConfigs[currentLevel].beerSpeed,
        spin: 0
      });
    }

    function switchRow(delta) {
      if (state !== "playing") return;
      selectedRow = Math.max(0, Math.min(rows.length - 1, selectedRow + delta));
    }

    function burst(x, y, color, count) {
      for (let i = 0; i < count; i += 1) {
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 230,
          vy: -80 - Math.random() * 160,
          life: 0.65 + Math.random() * 0.4,
          color
        });
      }
    }

    function loop(now) {
      if (state === "playing") {
        const dt = Math.min(0.033, (now - lastTime) / 1000 || 0);
        lastTime = now;
        update(dt);
        requestAnimationFrame(loop);
      }
      draw();
      syncDebugState();
    }

    function update(dt) {
      shake = Math.max(0, shake - dt * 20);
      levelTime += dt;
      const targetPlayerY = rows[selectedRow];
      const playerDelta = targetPlayerY - playerY;
      const playerStep = Math.sign(playerDelta) * Math.min(Math.abs(playerDelta), 980 * dt);
      playerY += playerStep;

      while (customerQueue.length && customerQueue[0].spawnAt <= levelTime) {
        customers.push(customerQueue.shift());
      }

      for (const customer of customers) {
        customer.mood += dt * 2.2;
        if (customer.drinkingTimer > 0) {
          customer.drinkingTimer -= dt;
          if (customer.drinkingTimer <= 0) {
            if (customer.pendingReturn) {
              customer.pendingReturn = false;
              customer.caught = true;
              empties.push({
                row: customer.row,
                x: customer.x - 22,
                y: customer.y + 6,
                vx: -levelConfigs[currentLevel].mugSpeed,
                spin: 0,
                customer
              });
            } else {
              customer.caught = true;
            }
            checkLevelComplete();
          }
          continue;
        }

        if (!customer.caught && !customer.waitingForMug) {
          customer.x -= customer.speed * dt;
          if (customer.x < serviceLineX) {
            customer.caught = true;
            loseLife("A customer reached the left side.");
            if (state !== "playing") return;
          }
        }
      }

      for (const beer of beers) {
        beer.x += beer.vx * dt;
        beer.spin += dt * 8;
      }

      for (let i = beers.length - 1; i >= 0; i -= 1) {
        const beer = beers[i];
        const target = customers
          .filter((customer) => !customer.caught && !customer.waitingForMug && customer.drinkingTimer <= 0 && customer.row === beer.row && beer.x >= customer.x - 44)
          .sort((a, b) => a.x - b.x)[0];
        if (target && beer.x <= target.x + 46) {
          beers.splice(i, 1);
          target.drinksNeeded -= 1;
          if (target.returnsMug) {
            target.drinkingTimer = 0.35;
            target.pendingReturn = true;
          } else {
            target.drinkingTimer = 0;
            target.pendingReturn = false;
            target.caught = true;
          }
          checkLevelComplete();
          continue;
        }

        if (beer.x > backWallX) {
          beers.splice(i, 1);
          loseLife("A full beer hit the back wall.");
          if (state !== "playing") return;
        }
      }

      for (const mug of empties) {
        mug.x += mug.vx * dt;
        mug.spin -= dt * 9;
      }

      for (let i = empties.length - 1; i >= 0; i -= 1) {
        const mug = empties[i];
        const bartenderOnRow = Math.abs(playerY - rows[mug.row]) < 38;
        if (mug.x <= bartenderX + 58 && mug.x >= bartenderX - 30 && bartenderOnRow) {
          empties.splice(i, 1);
          burst(bartenderX + 32, mug.y - 12, "#fff7df", 14);
          checkLevelComplete();
          continue;
        }

        if (mug.x < 55) {
          empties.splice(i, 1);
          loseLife("An empty mug slipped past the bartender.");
          if (state !== "playing") return;
        }
      }

      for (const particle of particles) {
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        particle.vy += 420 * dt;
        particle.life -= dt;
      }
      particles = particles.filter((particle) => particle.life > 0);
      checkLevelComplete();
    }

    function checkLevelComplete() {
      if (state === "playing" && customerQueue.length === 0 && customers.every((customer) => customer.caught) && beers.length === 0 && empties.length === 0) {
        completeLevel();
      }
    }

    function draw() {
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (shake > 0) {
        ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
      }
      drawPub();
      drawRows();
      drawPlayer();
      const visibleCustomers = customers
        .filter((customer) => !customer.caught)
        .sort((a, b) => a.row - b.row || b.x - a.x || a.depth - b.depth);
      for (const customer of visibleCustomers) {
        if (!customer.caught) drawCustomer(customer);
      }
      for (const beer of beers) {
        drawBeer(beer);
      }
      for (const mug of empties) {
        drawEmptyMug(mug);
      }
      for (const particle of particles) {
        ctx.globalAlpha = Math.max(0, particle.life);
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    function drawPub() {
      ctx.fillStyle = "#27150f";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#633d32";
      ctx.fillRect(0, 0, canvas.width, 102);
      ctx.strokeStyle = "rgba(45, 28, 20, 0.55)";
      ctx.lineWidth = 2;
      for (let y = 20; y < 102; y += 19) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      for (let y = 0; y < 102; y += 38) {
        for (let x = (y / 38) % 2 ? 72 : 0; x < canvas.width; x += 120) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + 19);
          ctx.stroke();
        }
      }

      ctx.fillStyle = "#342923";
      ctx.fillRect(0, 600, canvas.width, 70);
      ctx.fillStyle = "rgba(0, 0, 0, 0.32)";
      ctx.fillRect(0, 598, canvas.width, 4);
      ctx.strokeStyle = "rgba(20, 15, 13, 0.5)";
      for (let x = 0; x < canvas.width; x += 86) {
        ctx.fillStyle = x % 172 === 0 ? "#3f3029" : "#2c211d";
        ctx.fillRect(x, 600, 86, 70);
        ctx.beginPath();
        ctx.moveTo(x, 600);
        ctx.lineTo(x, 670);
        ctx.stroke();
      }

    }

    function drawRows() {
      for (let i = 0; i < rows.length; i += 1) {
        const y = rows[i];
        ctx.fillStyle = "#a3653c";
        roundRect(tableStartX, y + 7, tableEndX - tableStartX, 22, 0);
        ctx.fill();
        ctx.fillStyle = "#704424";
        roundRect(tableStartX, y + 27, tableEndX - tableStartX, 64, 0);
        ctx.fill();

        ctx.fillStyle = "#3f2413";
        for (let x = tableStartX + 34; x < tableEndX - 42; x += 92) {
          ctx.fillRect(x, y + 42, 51, 12);
        }
      }
    }

    function drawDoor(x, y) {
      ctx.fillStyle = "#3b1d10";
      ctx.fillRect(x - 14, y - 12, 86, 108);
      ctx.fillStyle = "#090706";
      ctx.fillRect(x, y, 58, 84);
      ctx.strokeStyle = "#6f3b1e";
      ctx.lineWidth = 7;
      ctx.strokeRect(x, y, 58, 84);
      ctx.fillStyle = "#f2c05d";
      ctx.beginPath();
      ctx.arc(x + 47, y + 42, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawPlayer() {
      const y = playerY;
      const playerRect = empties.some((mug) => mug.row === selectedRow && mug.x < bartenderX + 260)
        ? spriteRects.playerCatch
        : spriteRects.playerServe;
      if (drawSprite(playerRect, bartenderX - 48, y - 76, 136, 174)) {
        return;
      }

      ctx.save();
      ctx.translate(bartenderX, y - 44);
      ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
      ctx.beginPath();
      ctx.ellipse(4, 106, 56, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#f2c09a";
      ctx.beginPath();
      ctx.arc(0, 12, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#b86b36";
      ctx.beginPath();
      ctx.arc(0, 1, 31, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#102437";
      ctx.fillRect(-9, 9, 10, 8);
      ctx.fillRect(12, 9, 10, 8);
      ctx.fillStyle = "#7a3928";
      ctx.fillRect(-5, 25, 24, 5);

      ctx.fillStyle = "#fff3df";
      roundRect(-40, 42, 80, 70, 14);
      ctx.fill();
      ctx.strokeStyle = "#f2c09a";
      ctx.lineWidth = 11;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(24, 55);
      ctx.lineTo(78, 70);
      ctx.stroke();
      ctx.fillStyle = "#7f5034";
      ctx.fillRect(-26, 108, 18, 62);
      ctx.fillRect(12, 108, 18, 62);
      ctx.fillStyle = "#333";
      ctx.fillRect(-36, 164, 36, 13);
      ctx.fillRect(8, 164, 36, 13);

      ctx.fillStyle = "#f5bd3b";
      roundRect(72, 56, 42, 31, 7);
      ctx.fill();
      ctx.fillStyle = "#fff6d4";
      roundRect(72, 50, 42, 10, 6);
      ctx.fill();
      ctx.restore();
    }

    function drawCustomer(customer) {
      const y = customer.y;
      const scale = 1.14 - customer.depth * 0.04;
      const colors = ["#2e8b56", "#b33a2e", "#315f9e", "#d6b63d"];
      const customerSet = spriteRects.customers[(customer.slot + customer.row * 3 + currentLevel) % spriteRects.customers.length];
      const rect = customer.drinkingTimer > 0
        ? customerSet.drink
        : customer.waitingForMug
          ? customerSet.returnMug
          : customer.x > tableEndX - 80
            ? customerSet.walk
            : customerSet.wait;
      if (drawSprite(rect, customer.x - 54 * scale, y - 112 * scale, 108 * scale, 150 * scale)) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
        ctx.beginPath();
        ctx.ellipse(customer.x, y + 36, 48 * scale, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        return;
      }

      ctx.save();
      ctx.translate(customer.x, y);
      ctx.scale(scale, scale);
      ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
      ctx.beginPath();
      ctx.ellipse(0, 44, 52, 13, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(29, 15, 10, 0.48)";
      ctx.lineWidth = 5;
      roundRect(-38, -39, 76, 84, 16);
      ctx.stroke();

      ctx.fillStyle = "#f1bd96";
      ctx.beginPath();
      ctx.arc(0, -63, 29, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#404040";
      ctx.beginPath();
      ctx.arc(0, -80, 29, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(-20, -67, 10, 9);
      ctx.fillRect(2, -67, 10, 9);
      ctx.fillStyle = "#1f2c33";
      ctx.fillRect(-19, -64, 5, 5);
      ctx.fillRect(4, -64, 5, 5);
      ctx.fillStyle = "#e3a47b";
      ctx.beginPath();
      ctx.moveTo(-25, -58);
      ctx.lineTo(-42, -52);
      ctx.lineTo(-25, -46);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#6a3225";
      ctx.fillRect(-18, -47, 22, 5);

      ctx.fillStyle = colors[(customer.row + customer.slot) % colors.length];
      roundRect(-34, -36, 68, 76, 14);
      ctx.fill();

      ctx.strokeStyle = "#f1bd96";
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-30, -8);
      ctx.lineTo(-72, -13);
      ctx.stroke();
      ctx.restore();
    }

    function drawBeer(beer) {
      if (drawSprite(spriteRects.beer, beer.x - 27, beer.y - 34, 58, 70)) {
        return;
      }

      ctx.save();
      ctx.translate(beer.x, beer.y);
      ctx.rotate(Math.sin(beer.spin) * 0.08);
      ctx.fillStyle = "#f7c344";
      roundRect(-25, -15, 50, 30, 7);
      ctx.fill();
      ctx.fillStyle = "#fff7df";
      roundRect(-27, -20, 54, 11, 7);
      ctx.fill();
      ctx.strokeStyle = "#f8ead0";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(29, 0, 12, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.fillRect(-16, -6, 8, 14);
      ctx.restore();
    }

    function drawEmptyMug(mug) {
      if (drawSprite(spriteRects.empty, mug.x - 23, mug.y - 30, 52, 60)) {
        return;
      }

      ctx.save();
      ctx.translate(mug.x, mug.y);
      ctx.rotate(Math.sin(mug.spin) * 0.12);
      ctx.strokeStyle = "#d9e1dc";
      ctx.lineWidth = 5;
      roundRect(-20, -14, 39, 28, 6);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(23, 0, 10, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
      ctx.fillRect(-10, -7, 6, 14);
      ctx.restore();
    }

    function drawWallSign(x, y, w, h, label) {
      ctx.fillStyle = "#23354c";
      roundRect(x, y, w, h, 3);
      ctx.fill();
      ctx.fillStyle = "#dfe7e1";
      roundRect(x + 8, y + 8, w - 16, h - 16, 2);
      ctx.fill();
      ctx.fillStyle = "#274364";
      ctx.font = "900 18px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(label, x + w / 2, y + h / 2 + 6);
      ctx.textAlign = "left";
    }

    function drawDartboard(x, y, r) {
      for (let i = 0; i < 12; i += 1) {
        ctx.fillStyle = i % 2 ? "#dfd2c0" : "#46251e";
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.arc(x, y, r, (i * Math.PI) / 6, ((i + 1) * Math.PI) / 6);
        ctx.closePath();
        ctx.fill();
      }
      ctx.strokeStyle = "#2a1c18";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#b33329";
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fill();
    }

    function roundRect(x, y, w, h, r) {
      const radius = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + w - radius, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
      ctx.lineTo(x + w, y + h - radius);
      ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
      ctx.lineTo(x + radius, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
    }

    window.addEventListener("keydown", (event) => {
      if (["ArrowUp", "ArrowDown", "Space"].includes(event.code)) {
        event.preventDefault();
      }
      if (keys.has(event.code)) return;
      keys.add(event.code);

      if (event.code === "ArrowUp") switchRow(-1);
      if (event.code === "ArrowDown") switchRow(1);
      if (event.code === "Space") {
        if (state === "ready") resetGame();
        else if (state === "level-intro") beginCurrentLevel();
        else if (state === "playing") deliverBeer();
        else resetGame();
      }
      if (event.code === "KeyR") resetGame();
    });

    window.addEventListener("keyup", (event) => {
      keys.delete(event.code);
    });

    startBtn.addEventListener("click", resetGame);
    levelStartBtn.addEventListener("click", beginCurrentLevel);
    restartBtn.addEventListener("click", resetGame);

    function bindTouchControl(button, action) {
      button.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        action();
      });
    }

    bindTouchControl(touchUp, () => switchRow(-1));
    bindTouchControl(touchDown, () => switchRow(1));
    bindTouchControl(touchBeer, () => {
      if (state === "ready") resetGame();
      else if (state === "level-intro") beginCurrentLevel();
      else if (state === "playing") deliverBeer();
    });
    bindTouchControl(touchRestart, resetGame);

    window.__beerDebug = {
      state: () => ({
        state,
        currentLevel: currentLevel + 1,
        lives,
        rowCount: rows.length,
        customersLeft: customers.filter((customer) => !customer.caught).length + customerQueue.length,
        activeCustomers: customers.filter((customer) => !customer.caught).length,
        queuedCustomers: customerQueue.length,
        beers: beers.length,
        empties: empties.length,
        selectedRow,
        playerY: Math.round(playerY),
        returnsMugs: levelConfigs[currentLevel].returnsMugs,
        returnChance: levelConfigs[currentLevel].returnChance
      }),
      jumpToLevel: (levelNumber) => {
        currentLevel = Math.max(0, Math.min(levelConfigs.length - 1, levelNumber - 1));
        state = "playing";
        startLevel(currentLevel);
      },
      showLevelIntro: (levelNumber) => {
        currentLevel = Math.max(0, Math.min(levelConfigs.length - 1, levelNumber - 1));
        showLevelIntro(currentLevel);
        return {
          title: levelTitle.textContent,
          message: levelMessage.textContent,
          button: levelStartBtn.textContent
        };
      },
      forceBackWallBeer: () => {
        beers.push({ row: selectedRow, x: backWallX + 5, y: rows[selectedRow] - 22, vx: 0, spin: 0 });
        update(0.016);
      },
      forceCustomerPass: () => {
        const customer = customers.find((item) => !item.caught && !item.waitingForMug);
        if (!customer) return null;
        customer.x = serviceLineX - 1;
        update(0.016);
        return {
          state,
          lives,
          message: resultText.textContent
        };
      },
      forceBeerCatch: () => {
        const customer = customers.find((item) => !item.caught && !item.waitingForMug);
        if (!customer) return null;
        selectedRow = customer.row;
        beers.push({ row: customer.row, x: customer.x, y: customer.y - 22, vx: 0, spin: 0 });
        update(0.016);
        return {
          drinkingTimer: customer.drinkingTimer,
          caught: customer.caught,
          empties: empties.length
        };
      }
    };

    draw();
  
