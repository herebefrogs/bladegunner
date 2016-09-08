var bg,
    bg_ctx,
    canvas,
    ctx,
    viewport,
    viewport_ctx,
    currentTime,
    lastTime,
    elapsedTime,
    requestId,
    entities = [],
    bullets = [],
    nb_androids,
    nb_bystanders,
    nb_retires,
    nb_casualties,
    hero_dead,
    hero,
    data = {
      tileset: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAABlklEQVR42s2XQU7EMAxFfRQ2CLEG5hZs4CLskVjNLTgBQlwChLgBV4AtJwg4HVeO5ydNOx4XS5ZS943760nchGhn6ZGSdTIWxuTg5/uer8WQBC83V0mPlzKJrkfm4fQWMhzXfCHo+WYzqTqMYUC8BkUyBfT69pGdx/atDmH0NWJkXCRilRayZbaJ5DctRnM9eYo340kqbgXVGC0IMbUq1phsOoiApbGlDKWf74R8LWaAphpaIEPS7M5f0gjweCnTaozCVBujnlxWtfy/kQyhVcNuJ3oUU0Aa1EvyUMbyNSZMkDS+LkE22cnFfXbUL6KYbHwDjefEpq57maE/fJ0l5KswOQCald5aRjIjZHeDKFEPYxsjYmxjhIL+RYXG/7BxEohkhlMAAtUkKxjDTeb5c+k3U8z+Gck8tHqOAisD3pfrXWNsMVhQrdSBjOuu0WXHuL17Sh5ODat2Y2ScTG8FrM8RJN8m+xnijVy3KBGEHjJHkDxYXAQcXVCteqtVSGJIkOsc8qiQi3nNIXdBHqvMTdCx+9Ac+wUmrkaWOYmdHgAAAABJRU5ErkJggg==',
      bg: {
        size: 9,
        sprites: [
          { x: 0, y: 27 },
          { x: 9, y: 27 }
        ]
      },
      bullet: {
        speed: 60,
        size: 5,
        sprites: [
          { x: 18, y: 27 },
          { x: 23, y: 27 }
        ]
      },
      hero: {
        speed: 30, // pixel per second
        size: 9,
        sprites: [
          {
            walk: [ {x: 0, y: 0}, {x: 9, y: 0}],
            shoot: [ {x: 18, y: 0}, {x: 27, y: 0}]
          }
        ]
      },
      bystander: {
        size: 9,
        speed: 20, // pixels per second
        sprites: [
          {
            walk: [ {x: 0, y: 18}, {x: 9, y: 18}]
          },
          {
            walk: [ {x: 0, y: 9}, {x: 9, y: 9}]
          }
        ]
      },
      android: {
        size: 9,
        speed: 25, // pixels per second
        sprites: [
          {
            walk: [ {x: 0, y: 9}, {x: 9, y: 9}],
            shoot: [ {x: 18, y: 9}, {x: 27, y: 9}]
          },
          {
            walk: [ {x: 0, y: 18}, {x: 9, y: 18}],
            shoot: [ {x: 18, y: 18}, {x: 27, y: 18}]
          }
        ]
      },
    }
    TITLE = 'BLADEGUNNER',
    FONT = '8px Courier',
    GREY = '#343635',
    WHITE = '#fff1e8',
    RED = '#ff004d',
    ANIM_INTERVAL = 0.25; // seconds between animation frames
    DIRECTION_UP = 1,
    DIRECTION_RIGHT = 2,
    DIRECTION_DOWN = 4,
    DIRECTION_LEFT = 8,
    MAX_ANDROIDS = 5,
    MIN_ANDROIDS = 1,
    MAX_BYSTANDERS = 50,
    MIN_BYSTANDERS = 25,
    DIRECTION_CHANGE_FREQ = 2; // seconds before next direction change
    DIRECTION_CHANGE_VAR = 1.5; // +/- seconds around next direction change
    HEIGHT = 153,
    WIDTH = 198;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max + 1 - min) + min);
}

function randomDirection() {
  return [DIRECTION_UP, DIRECTION_RIGHT, DIRECTION_DOWN, DIRECTION_LEFT][randomInt(0, 3)];
}

function createEntity(type, direction, x, y) {
  var size = data[type].size

  direction = direction !== undefined ? direction : randomDirection();
  x = x !== undefined ? x : randomInt(0, WIDTH - size);
  y = y !== undefined ? y : randomInt(0, HEIGHT - size);

  return {
    direction: direction,
    lastDirectionChange: 0,
    type: type,
    size: size,
    x: x,
    y: y
  };
}

function createHero() {
  return createEntity('hero', 0);
}

function createBullet(entity) {
  var direction = entity.direction ? entity.direction : DIRECTION_RIGHT;
  var bullet = createEntity('bullet', direction, entity.x, entity.y);

  // place bullet outside of entity bounding box (to avoid immediate entity kill)
  if (bullet.direction & DIRECTION_LEFT) { bullet.x -= bullet.size; }
  if (bullet.direction & DIRECTION_RIGHT) { bullet.x += entity.size; }
  if (bullet.direction & DIRECTION_UP) { bullet.y -= bullet.size; }
  if (bullet.direction & DIRECTION_DOWN) { bullet.y += entity.size; }
  // center bullet halfway along the sprite if no diagonal motion
  if (!(bullet.direction & DIRECTION_LEFT) && !(bullet.direction & DIRECTION_RIGHT)) { bullet.x += (entity.size - bullet.size) / 2; }
  if (!(bullet.direction & DIRECTION_UP) && !(bullet.direction & DIRECTION_DOWN)) { bullet.y += (entity.size - bullet.size) / 2; }
  return bullet;
}

function orientEntity(entity, elapsedTime) {
  if (entity.type === 'hero') {
    var direction = 0;
    if (entity.moveLeft && !entity.moveRight) { direction |= DIRECTION_LEFT; }
    if (entity.moveRight && !entity.moveLeft) { direction |= DIRECTION_RIGHT; }
    if (entity.moveUp && !entity.moveDown) { direction |= DIRECTION_UP; }
    if (entity.moveDown && !entity.moveUp) { direction |= DIRECTION_DOWN; }
    entity.direction = direction;
  } else {
    entity.lastDirectionChange += elapsedTime;
    if ((DIRECTION_CHANGE_FREQ + Math.random() * DIRECTION_CHANGE_VAR) < entity.lastDirectionChange) {
      entity.lastDirectionChange = 0;
      entity.direction = randomDirection();
    }
  }
}

function moveEntity(entity, elapsed) {
  var distance = data[entity.type].speed * elapsed;
  if (entity.direction & DIRECTION_RIGHT) { entity.x += distance; }
  // no else if, hero could be moving left and right (effectively immobile)
  if (entity.direction & DIRECTION_LEFT) { entity.x -= distance; }
  if (entity.direction & DIRECTION_UP) { entity.y -= distance; }
  // no else if, hero could be moving up and down (effectively immobile)
  if (entity.direction & DIRECTION_DOWN) { entity.y += distance; }
}

function containEntity(entity) {
  if (entity.x <= 0) {
    entity.x = 0;
    if (entity !== hero) {
      entity.direction = (entity.direction ^ DIRECTION_LEFT) | DIRECTION_RIGHT;
    }
  } else if (entity.x + entity.size >= WIDTH) {
    entity.x = WIDTH - entity.size;
    if (entity !== hero) {
      entity.direction = (entity.direction ^ DIRECTION_RIGHT) | DIRECTION_LEFT;
    }
  }
  // skip one tile vertically for score
  if (entity.y <= data.bg.size) {
    entity.y = data.bg.size;
    if (entity !== hero) {
      entity.direction = (entity.direction ^ DIRECTION_UP) | DIRECTION_DOWN;
    }
  } else if (entity.y >= HEIGHT - entity.size) {
    entity.y = HEIGHT - entity.size;
    if (entity !== hero) {
      entity.direction = (entity.direction ^ DIRECTION_DOWN) | DIRECTION_UP;
    }
  }
}

function containBullet(bullet) {
  // bullet out of screen?
  return bullet.x <= 0 || bullet.x + bullet.size >= WIDTH
         || bullet.y <= data.bg.size || bullet.y >= HEIGHT - bullet.size;
}

function collideEntity(bullet) {
  // cache some collision math
  var bullet_up = bullet.y + bullet.size;
  var bullet_right = bullet.x + bullet.size;

  for (var n in entities) {
    var entity = entities[n];
    // bullet hit entity?
    if (bullet_up > entity.y && bullet.x < entity.x + entity.size
        && bullet.y < entity.y + entity.size && bullet_right > entity.x) {
      return n;
    }
  }
}

function updateScore(entity) {
  if (entity.type === 'bystander') { nb_casualties++ }
  if (entity.type === 'android') { nb_retires++; }
  if (entity.type === 'hero') { hero_dead = true; }
}

function checkEndGame() {
  if (hero_dead || nb_bystanders === nb_casualties) {
    endGame(false);
  } else if (nb_retires === nb_androids) {
    endGame(true);
  }
}

function endGame(win) {
  cancelAnimationFrame(requestId);
  requestId = undefined;

  removeEventListener('keydown', keyPressed);
  removeEventListener('keyup', keyReleased);

  addEventListener('keydown', newGame);

  requestAnimationFrame(function() {
    ctx.fillStyle = GREY;
    ctx.fillRect(0, data.bg.size, WIDTH, HEIGHT - data.bg.size);
    ctx.fillStyle = WHITE;
    var text = 'You ' + (win ? 'win!' : 'loose!');
    ctx.fillText(text, (WIDTH - ctx.measureText(text).width) / 2, HEIGHT / 2);
    text = 'Press ENTER to play again';
    ctx.fillText(text, (WIDTH - ctx.measureText(text).width) / 2, HEIGHT * 2 / 3);
    blit();
  });
}

function renderEntity(entity) {
  var sprite = data[entity.type].sprites[0];
  if (entity.type !== 'bullet') {
    sprite = sprite[entity.shoot ? 'shoot' : 'walk'][0];
  }
  ctx.drawImage(data.tileset, Math.floor(sprite.x), Math.floor(sprite.y), entity.size, entity.size,
                              Math.floor(entity.x), Math.floor(entity.y), entity.size, entity.size);
}

function renderScore() {
  ctx.fillStyle = GREY;
  ctx.fillRect(0, 0, WIDTH, data.bg.size);
  ctx.fillStyle = RED;
  ctx.fillText(TITLE, 0, 0);
  ctx.fillStyle = WHITE;
  ctx.fillText('kills: ' + nb_retires, WIDTH / 3, 0);
  var casualties = 'casulaties: ' + nb_casualties;
  ctx.fillText(casualties, WIDTH - ctx.measureText(casualties).width, 0);
}

function createBackground() {
  var size = data.bg.size;
  for (var x = 0; x < WIDTH; x += size) {
    // skip one tile vertically for score
    for (var y = size; y < HEIGHT; y += size) {
      var sprite = data.bg.sprites[randomInt(1, 10) > 9 ? 1 : 0];
      bg_ctx.drawImage(data.tileset, sprite.x, sprite.y, size, size, x, y, size, size);
    }
  }
}

function resize() {
  var scaleToFit = Math.min(window.innerWidth / WIDTH, window.innerHeight / HEIGHT);
  viewport.width = WIDTH * scaleToFit;
  viewport.height = HEIGHT * scaleToFit;

  // disable smoothing on scaling
  viewport_ctx.mozImageSmoothingEnabled = false;
  viewport_ctx.webkitImageSmoothingEnabled = false;
  viewport_ctx.msImageSmoothingEnabled = false;
  viewport_ctx.imageSmoothingEnabled = false;
};

function newGame(keyEvent) {
  if (keyEvent.which == 13) {
    startGame();
  }
};

function keyPressed(keyEvent) {
  if (keyEvent.which == 32) {
    hero.shoot = true;
    hero.createBullet = true;
  }
  if (keyEvent.which == 37) { hero.moveLeft = true; }
  if (keyEvent.which == 38) { hero.moveUp = true; }
  if (keyEvent.which == 39) { hero.moveRight = true; }
  if (keyEvent.which == 40) { hero.moveDown = true; }
}

function keyReleased(keyEvent) {
  if (keyEvent.which == 32) { hero.shoot = false; }
  if (keyEvent.which == 37) { hero.moveLeft = false; }
  if (keyEvent.which == 38) { hero.moveUp = false; }
  if (keyEvent.which == 39) { hero.moveRight = false; }
  if (keyEvent.which == 40) { hero.moveDown = false; }
}

function startGame() {
  removeEventListener('keydown', newGame);

  createBackground();

  nb_retires = 0;
  nb_casualties = 0;
  hero_dead = false;

  entities = [];
  bullets = [];

  // hero
  entities.push(hero = createHero());
  // glitchy androids
  nb_androids = randomInt(MIN_ANDROIDS, MAX_ANDROIDS);
  for (var n = nb_androids; n > 0; n--) {
    entities.push(createEntity('android'));
  }
  // bystanders
  nb_bystanders = randomInt(MIN_BYSTANDERS, MAX_BYSTANDERS);
  for (var n = nb_bystanders; n > 0; n--) {
    entities.push(createEntity('bystander'));
  }

  addEventListener('keydown', keyPressed);
  addEventListener('keyup', keyReleased);

  lastTime = Date.now();
  requestId = requestAnimationFrame(loop);
}

// Game loop
function init() {
  document.title = TITLE;

  // visible canvas, in window dimensions
  viewport = document.querySelector('canvas');
  viewport_ctx = viewport.getContext('2d');

  resize();
  addEventListener('resize', resize);

  // backbuffer canvas, in game dimensions
  canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  ctx = canvas.getContext('2d');
  ctx.font = FONT;
  ctx.textBaseline = 'top';

  bg = document.createElement('canvas')
  bg.width = WIDTH;
  bg.height = HEIGHT;
  bg_ctx = bg.getContext('2d');

  // load base64 encoded tileset
  var img = new Image();
  img.src = data.tileset;
  data.tileset = img;

  startGame();
};

function loop() {
  currentTime = Date.now();
  update((currentTime - lastTime) / 1000);
  render();
  lastTime = currentTime;
  if (requestId) {
    requestId = requestAnimationFrame(loop);
  }
};

function update(elapsedTime) {
  entities.forEach(function(entity) {
    orientEntity(entity, elapsedTime);
    moveEntity(entity, elapsedTime);
    containEntity(entity);

    if (entity.createBullet) {
      entity.createBullet = false;
      bullets.push(createBullet(entity));
    }
  });

  bullets.forEach(function(bullet, i) {
    moveEntity(bullet, elapsedTime);

    var n;
    if (containBullet(bullet) || (n = collideEntity(bullet))) {
      bullets.splice(i, 1);
      if (n !== undefined) {
        updateScore(entities.splice(n, 1)[0]);
      }
    };
  });

  checkEndGame();
};

function blit() {
  // copy backbuffer onto visible canvas, scaling them to screen dimensions
  viewport_ctx.drawImage(canvas, 0, 0, WIDTH, HEIGHT,
                                 0, 0, viewport.width, viewport.height);
}

function render() {
  ctx.drawImage(bg, 0, 0);

  entities.forEach(renderEntity);
  bullets.forEach(renderEntity);
  renderScore();

  blit();
};

addEventListener('load', init);
