var bg,
    bg_ctx,
    canvas,
    ctx,
    viewport,
    viewport_ctx,
    scaleToFit,
    currentTime,
    lastTime,
    elapsedTime,
    requestId,
    entities = [],
    bullets = [],
    nb_androids = 0,
    nb_bystanders,
    nb_retires,
    nb_casualties,
    hero_dead,
    win = true,
    hero,
    data = {
      tileset: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC0AAAA2CAYAAABTCxDCAAACoklEQVR42t2awU3FMAyGOwoXhDgDbwsusAh3JE5swQQIsQQIsQErwJUJghzq4ufaid3kuRWVLKV5X9I/aWI3yRuG8UoPQ+I2sCuU+f5K3OaVfLzNbDVGEDwX/VeQVpKWMmm4nJi742uRgXzKu0U/Xe2qrY9kqqKhEjStokhGE6yKfnl9zwZp3jstDL2XGEy7hga2nFfEXyl/GJYpMZSz1FPq6Uk8bf04sbJx0RpDRUuM9jY0xtTTyCrp1rxFDBcpira0bmvML2RxQ5GMYYjkgqfPaaoE0kuZUnBBpjW4TBNCaH2KZkzeQ/IGo0dIUsMOzZiCC3M9vKLUgxF4kdmUaBI8mkSrwo/ObrMp/jSEMQeYsfAs7cmr3VsZU3DJP3yeJMlWY2q9nQsJDp8ug0IZy5jGiviqRHqYheHBRWJ4cHGJnl5PofW9mG49PT2ssEIOZUxDAwpJlZGJsccwbsYIgtAf1xifaCKUClP3KYQZv/cb58fgUmJcwUVqtdiLUYwxGvZcvcSsXO5vHlMPGyIveCD9TOTmEY3fElJoxgv8M1qzaEmIRzQIhZUMmiQ8BxQIJKMtFu4Vrb2FTfc05kmipavUANqQ1XqauyccMlQ4Z3DIuIT3GtOriO7hPUJFH9JPH2RM8xmtze5IxhTGtYpoZZGM6fsDC9GtWL5pHsmYehrGHe4Zs/3jRQxMLGT4q0eGCnfv5cFnIUYxrfWhjGVo0NALhq6O74O0MDRdYtyiobXSA+grlR5mYfCMpcS4t8XY9hTfsmpm+JiuMZ7Vy2ZXLmqeYKsxnvVh8RwkknGduZQO6yOZ/3m6BTfnu4sZAHlrMSbRubWlk6RGZtoWqzA+0UplFkH4amtMD9GicLpi0Y5+I5mq26P/OqBpT17t3srUgssPJQbtEa3j0uAAAAAASUVORK5CYII=',
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
        sounds: {
          hit: [3,,0.0136,,0.1785,0.4393,,-0.6046,,,,,,,,,,,1,,,0.0612,,0.5]
        },
        sprites: [
          {
            trace: [ {x: 18, y: 27 }, { x: 22, y: 31 } ]
          },
          {
            trace: [ {x: 27, y: 27 }, { x: 32, y: 31 } ]
          }
        ]
      },
      hero: {
        speed: 30, // pixel per second
        size: 9,
        sounds: {
          hit: [3,,0.0136,,0.1785,0.4393,,-0.6046,,,,,,,,,,,1,,,0.0612,,0.5],
          // TODO i don't like this gun sound
          shoot: [1,0.0321,0.279,,0.141,0.8295,0.0316,-0.667,0.0529,0.0565,,0.033,0.0096,0.7662,-0.5725,,-0.0479,0.0398,0.976,0.0089,,,-0.0338,0.5]
        },
        sprites: [
          // blue bullet
          {
            walk: [ {x: 0, y: 0}, {x: 9, y: 0}],
            shoot: [ {x: 18, y: 0}, {x: 27, y: 0}]
          }
        ]
      },
      bystander: {
        size: 9,
        speed: 20, // pixels per second
        sounds: {
          hit: [3,,0.0136,,0.1785,0.4393,,-0.6046,,,,,,,,,,,1,,,0.0612,,0.5]
        },
        sprites: [
          // yellow priest
          {
            walk: [ {x: 0, y: 18}, {x: 9, y: 18}]
          },
          // black trenchcoat
          {
            walk: [ {x: 0, y: 9}, {x: 9, y: 9}]
          },
          // blue uniform
          {
            walk: [ {x: 0, y: 36}, {x: 9, y: 36}]
          // },
          // // white coverall
          // {
          //   walk: [ {x: 0, y: 45}, {x: 9, y: 45}]
          }
        ]
      },
      android: {
        size: 9,
        speed: 25, // pixels per second
        sounds: {
          //hit: [0,,0.0274,0.0352,0.2127,0.3728,,0.4773,0.0388,,,,,0.441,0.0164,0.4501,,,1,,0.0247,,,0.5], // single blip
          hit: [0,,0.2246,,0.2099,0.458,,0.4934,,,,,,0.0222,,0.5192,,,1,,,,,0.5], // double blip
          // TODO i don't like this gun sound either
          shoot: [2,,0.1582,,0.2433,0.7687,0.0631,-0.4606,,,,,,0.1545,0.1034,,,,1,,,,,0.5]
        },
        sprites: [
          // black trenchcoat
          {
            walk: [ {x: 0, y: 9}, {x: 9, y: 9}],
            shoot: [ {x: 18, y: 9}, {x: 27, y: 9}]
          },
          // yellow priest
          {
            walk: [ {x: 0, y: 18}, {x: 9, y: 18}],
            shoot: [ {x: 18, y: 18}, {x: 27, y: 18}]
          },
          // blue uniform
          {
            walk: [ {x: 0, y: 36}, {x: 9, y: 36}],
            shoot: [ {x: 18, y: 36}, {x: 27, y: 36}]
          // },
          // // white coverall
          // {
          //   walk: [ {x: 0, y: 45}, {x: 9, y: 45}]
          //   shoot: [ {x: 18, y: 45}, {x: 27, y: 45}]
          }
        ]
      },
    }
    TITLE = 'BLADE GUNNER',
    FONT_SIZE = 8, // in pixels
    FONT_FAMILY = 'Courier',
    GREY = '#343635',
    WHITE = '#fff1e8',
    RED = '#ff004d',
    FRAME_INTERVAL = { // seconds between action animation frame
      walk: 0.2,
      shoot: 0.1,
      trace: 0.1
    },
    DIRECTION_UP = 1,
    DIRECTION_RIGHT = 2,
    DIRECTION_DOWN = 4,
    DIRECTION_LEFT = 8,
    MAX_BYSTANDERS = 50,
    MIN_BYSTANDERS = 25,
    DIRECTION_CHANGE_FREQ = 2, // seconds before next direction change
    DIRECTION_CHANGE_VAR = 1.5, // +/- seconds around next direction change
    GLITCH_CHANGE_FREQ = 10, // max seconds before next glitch mode change
    GLITCH_CHANGE_VAR = 5, // max seconds before next glitch mode change
    GLITCH_TRIGGER_DISTANCE = 40, // distance in pixels below which hero will make an android glitch
    SHOOT_FREQ = 0.25, // seconds between bullets for androids in glitch mode
    COLLISION_TOLERANCE = 2, // number of non-overlapping pixels in collision test
    HEIGHT = 153,
    WIDTH = 198;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max + 1 - min) + min);
}

function randomDirection() {
  return [DIRECTION_UP, DIRECTION_RIGHT, DIRECTION_DOWN, DIRECTION_LEFT][randomInt(0, 3)];
}

function distanceBetween(entity, hero) {
  return Math.sqrt(Math.pow(entity.x - hero.x, 2) + Math.pow(entity.y - hero.y, 2));
}

function createEntity(type, direction, x, y, variant) {
  var size = data[type].size

  if (direction === undefined) { direction = randomDirection(); }
  if (x === undefined) { x = randomInt(0, WIDTH - size); }
  if (y === undefined) { y = randomInt(0, HEIGHT - size); }
  if (variant === undefined) { variant = randomInt(0, data[type].sprites.length - 1); }

  return {
    action: 'walk',
    direction: direction, // for motion
    lastDirection: direction ? direction : DIRECTION_RIGHT, // for shooting
    frame: 0,
    lastFrame: 0,
    lastOrient: 0,
    lastGlitch: 0,
    lastBullet: 0,
    type: type,
    variant: variant,
    size: size,
    x: x,
    y: y
  };
}

function createHero() {
  return createEntity('hero', 0);
}

function createAndroid() {
  var android = createEntity('android');
  // ensure android doesn't start right next to hero, which would make it glitch immediately
  while (distanceBetween(android, hero) < GLITCH_TRIGGER_DISTANCE * 1.5) {
    android.x = randomInt(0, WIDTH - android.size);
    android.y = randomInt(0, HEIGHT - android.size);
  }
  return android;
}

function playSound(type, sound) {
  var player = new Audio();
  player.src = jsfxr(data[type].sounds[sound]);
  player.play();
}

function createBullet(entity) {
  var bullet = createEntity('bullet', entity.lastDirection, entity.x, entity.y, entity.type === 'hero' ? 0 : 1);
  bullet.action = 'trace';

  // place bullet outside of entity bounding box (to avoid immediate entity kill)
  if (bullet.lastDirection & DIRECTION_LEFT) { bullet.x -= bullet.size; }
  if (bullet.lastDirection & DIRECTION_RIGHT) { bullet.x += entity.size; }
  if (bullet.lastDirection & DIRECTION_UP) { bullet.y -= bullet.size; }
  if (bullet.lastDirection & DIRECTION_DOWN) { bullet.y += entity.size; }
  // center bullet halfway along the sprite if no diagonal motion
  if (!(bullet.lastDirection & DIRECTION_LEFT) && !(bullet.lastDirection & DIRECTION_RIGHT)) { bullet.x += (entity.size - bullet.size) / 2; }
  if (!(bullet.lastDirection & DIRECTION_UP) && !(bullet.lastDirection & DIRECTION_DOWN)) { bullet.y += (entity.size - bullet.size) / 2; }
  return bullet;
}

function orientEntity(entity, elapsed) {
  if (entity.type === 'hero') {
    var direction = 0;
    if (entity.moveLeft && !entity.moveRight) { direction |= DIRECTION_LEFT; }
    if (entity.moveRight && !entity.moveLeft) { direction |= DIRECTION_RIGHT; }
    if (entity.moveUp && !entity.moveDown) { direction |= DIRECTION_UP; }
    if (entity.moveDown && !entity.moveUp) { direction |= DIRECTION_DOWN; }
    entity.lastDirection = direction ? direction : entity.lastDirection;
    entity.direction = direction;
  } else {
    if ((DIRECTION_CHANGE_FREQ + Math.random() * DIRECTION_CHANGE_VAR) < (entity.lastOrient += elapsed)) {
      entity.lastOrient = 0;
      // TODO allow for diagonal move (but avoid immobility)
      entity.direction = randomDirection();
      entity.lastDirection = entity.direction;
    }
  }
}

function getSprites(entity) {
  return data[entity.type].sprites[entity.variant][entity.action];
}

function frameEntity(entity, elapsed) {
  if ((entity.lastFrame += elapsed) > FRAME_INTERVAL[entity.action]) {
    entity.lastFrame = 0;
    entity.frame = ++entity.frame % getSprites(entity).length;
  }
}

function glitchEntity(entity, elapsed) {
  if (entity.type === 'android') {
    // hero too close to android in disguise or it's time for android to glitch anyway
    if ((!entity.glitch && distanceBetween(entity, hero) < GLITCH_TRIGGER_DISTANCE)
        || ((GLITCH_CHANGE_FREQ + Math.random() * GLITCH_CHANGE_VAR) < (entity.lastGlitch += elapsed))) {
      entity.lastGlitch = 0;
      entity.glitch = !entity.glitch;
      entity.action = entity.glitch ? 'shoot' : 'walk';
    }
  }

  if (entity.glitch) {
    if ((entity.lastBullet += elapsed) > SHOOT_FREQ) {
       entity.lastBullet = 0;
       entity.createBullet = true;
    }
  }

  // TODO should the hero be subject to the glitch too?
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
      entity.lastDirection = entity.direction;
    }
  } else if (entity.x + entity.size >= WIDTH) {
    entity.x = WIDTH - entity.size;
    if (entity !== hero) {
      entity.direction = (entity.direction ^ DIRECTION_RIGHT) | DIRECTION_LEFT;
      entity.lastDirection = entity.direction;
    }
  }
  // skip one tile vertically for score
  if (entity.y <= data.bg.size) {
    entity.y = data.bg.size;
    if (entity !== hero) {
      entity.direction = (entity.direction ^ DIRECTION_UP) | DIRECTION_DOWN;
      entity.lastDirection = entity.direction;
    }
  } else if (entity.y >= HEIGHT - entity.size) {
    entity.y = HEIGHT - entity.size;
    if (entity !== hero) {
      entity.direction = (entity.direction ^ DIRECTION_DOWN) | DIRECTION_UP;
      entity.lastDirection = entity.direction;
    }
  }
}

function containBullet(bullet) {
  // bullet out of screen?
  return bullet.x <= 0 || bullet.x + bullet.size >= WIDTH
         || bullet.y <= data.bg.size || bullet.y >= HEIGHT - bullet.size;
}

function collideEntity(bullet, entities) {
  // cache some collision math
  for (var n in entities) {
    var entity = entities[n];
    // bullet mostly within entity?
    if (bullet !== entity
       && bullet.x + COLLISION_TOLERANCE >= entity.x
       && bullet.x + bullet.size - COLLISION_TOLERANCE <= entity.x + entity.size
       && bullet.y + COLLISION_TOLERANCE >= entity.y
       && bullet.y + bullet.size - COLLISION_TOLERANCE <= entity.y + entity.size) {
      return n;
    }
  }
}

function updateScore(entity) {
  if (entity.type === 'bystander') { nb_casualties++ }
  if (entity.type === 'android') { nb_retires++; }
  if (entity.type === 'hero') { hero_dead = true; }
  playSound(entity.type, 'hit');
}

function checkEndGame() {
  if (hero_dead || nb_bystanders === nb_casualties) {
    win = false;
    endGame();
  } else if (nb_retires === nb_androids) {
    win = true;
    endGame();
  }
}

function endGame() {
  cancelAnimationFrame(requestId);
  requestId = undefined;

  removeEventListener('keydown', keyPressed);
  removeEventListener('keyup', keyReleased);

  addEventListener('keydown', newGame);
  addEventListener('resize', renderEndGame);

  renderEndGame();
}


function renderEndGame() {
  requestAnimationFrame(function() {
    viewport_ctx.fillStyle = GREY;
    viewport_ctx.fillRect(0, 0, viewport.width, viewport.height);
    viewport_ctx.fillStyle = RED;
    viewport_ctx.fillText(TITLE, 0, 0);
    viewport_ctx.fillStyle = WHITE;
    var text = hero_dead ? 'Oh no, you died!'
               : nb_casualties === nb_bystanders ? 'Oh no, all civilians died!'
               : 'You retired ' + nb_androids + ' glitchy android' + (nb_androids > 1 ? 's' : '');
    viewport_ctx.fillText(text, (viewport.width - viewport_ctx.measureText(text).width) / 2, viewport.height / 3);
    text = 'Press ENTER to play again' + (win ? 'st' : '');
    viewport_ctx.fillText(text, (viewport.width - viewport_ctx.measureText(text).width) / 2, viewport.height * 2 / 3);
    if (win) {
      var font_size = Math.floor(FONT_SIZE * scaleToFit * 1.2);
      text = 'with ' + nb_casualties + ' casualt' + (nb_casualties > 1 ? 'ies' : 'y') + '!';
      viewport_ctx.fillText(text, (viewport.width - viewport_ctx.measureText(text).width) / 2, viewport.height / 3 + font_size);
      text = 'one more android';
      viewport_ctx.fillText(text, (viewport.width - viewport_ctx.measureText(text).width) / 2, viewport.height * 2 / 3 + font_size);
    }
  });
}

function renderGameTitle() {
  requestAnimationFrame(function() {
    viewport_ctx.fillStyle = GREY;
    viewport_ctx.fillRect(0, 0, viewport.width, viewport.height);

    var font_size = Math.floor(3 * FONT_SIZE * scaleToFit);
    viewport_ctx.font = font_size + 'px ' + FONT_FAMILY;
    viewport_ctx.fillStyle = RED;
    viewport_ctx.fillText(TITLE, (viewport.width - viewport_ctx.measureText(TITLE).width) / 2, 0);

    viewport_ctx.font = Math.floor(FONT_SIZE * scaleToFit) + 'px ' + FONT_FAMILY;
    viewport_ctx.fillStyle = WHITE;
    var line_height = Math.floor(1.2 * FONT_SIZE * scaleToFit);
    var text = 'Retire glitchy androids';
    viewport_ctx.fillText(text, (viewport.width - viewport_ctx.measureText(text).width) / 2, viewport.height / 3 - line_height);
    text = 'before they inflict casualties.';
    viewport_ctx.fillText(text, (viewport.width - viewport_ctx.measureText(text).width) / 2, viewport.height / 3);
    text = 'Avoid casualties yourself.';
    viewport_ctx.fillText(text, (viewport.width - viewport_ctx.measureText(text).width) / 2, viewport.height / 3 + line_height);
    viewport_ctx.drawImage(data.tileset, data.hero.sprites[0].walk[0].x, data.hero.sprites[0].walk[0].y, data.hero.size, data.hero.size,
                                         0, viewport.height / 3 - line_height / 2, data.hero.size * scaleToFit * 1.5, data.hero.size * scaleToFit * 1.5);
    viewport_ctx.drawImage(data.flippedTileset, data.android.sprites[0].shoot[0].x, data.android.sprites[0].shoot[0].y, data.android.size, data.android.size,
                                         viewport.width - data.android.size * scaleToFit * 2, viewport.height / 3 - line_height * 1.5, data.android.size * scaleToFit * 1.5, data.android.size * scaleToFit * 1.5);
    viewport_ctx.drawImage(data.flippedTileset, data.android.sprites[1].shoot[0].x, data.android.sprites[1].shoot[0].y, data.android.size, data.android.size,
                                         viewport.width - data.android.size * scaleToFit * 1.5, viewport.height / 3 + line_height * 0.5, data.android.size * scaleToFit * 1.5, data.android.size * scaleToFit * 1.5);

    text = 'Move: arrow keys     Shoot: space bar';
    viewport_ctx.fillText(text, (viewport.width - viewport_ctx.measureText(text).width) / 2, viewport.height * 2 / 3 - line_height);

    text = 'Press ENTER to start';
    viewport_ctx.fillText(text, (viewport.width - viewport_ctx.measureText(text).width) / 2, viewport.height - 3 * line_height);

    viewport_ctx.font = Math.floor(FONT_SIZE * scaleToFit / 2) + 'px ' + FONT_FAMILY;
    text = 'Created by Jerome Lecomte for JS13KGAMES 2016';
    viewport_ctx.fillText(text, (viewport.width - viewport_ctx.measureText(text).width) / 2, viewport.height - line_height * 2 / 3);

    // restore font
    viewport_ctx.font = Math.floor(FONT_SIZE * scaleToFit) + 'px ' + FONT_FAMILY;
  });
}

function renderEntity(entity) {
  var sprite = getSprites(entity)[(entity.type === 'hero') && (entity.direction === 0) ? 0 : entity.frame];
  var tileset = (entity.type !== 'bullet' && (entity.lastDirection & DIRECTION_LEFT)) ? data.flippedTileset : data.tileset;
  ctx.drawImage(tileset, Math.floor(sprite.x), Math.floor(sprite.y), entity.size, entity.size,
                         Math.floor(entity.x), Math.floor(entity.y), entity.size, entity.size);

}

function renderScore(canvas, context) {
  context.fillStyle = GREY;
  context.fillRect(0, 0, canvas.width, data.bg.size * scaleToFit);
  context.fillStyle = RED;
  context.fillText(TITLE, 0, 0);
  context.fillStyle = WHITE;
  context.fillText('android' + (nb_androids > 1 ? 's' : '') + ': ' + nb_retires + '/' + nb_androids, canvas.width / 3, 0);
  var casualties = 'casulaties: ' + nb_casualties;
  context.fillText(casualties, canvas.width - context.measureText(casualties).width, 0);
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
  scaleToFit = Math.min(window.innerWidth / WIDTH, window.innerHeight / HEIGHT);
  viewport.width = WIDTH * scaleToFit;
  viewport.height = HEIGHT * scaleToFit;

  // disable smoothing on scaling
  viewport_ctx.mozImageSmoothingEnabled = false;
  viewport_ctx.webkitImageSmoothingEnabled = false;
  viewport_ctx.msImageSmoothingEnabled = false;
  viewport_ctx.imageSmoothingEnabled = false;

  viewport_ctx.font = Math.floor(FONT_SIZE * scaleToFit) + 'px ' + FONT_FAMILY;
  viewport_ctx.textBaseline = 'top';
};

function newGame(keyEvent) {
  if (keyEvent.which == 13) {
    startGame();
  }
};

function keyPressed(keyEvent) {
  if (keyEvent.which == 32) {
    hero.action = 'shoot';
    hero.createBullet = true;
  }
  if (keyEvent.which == 37) { hero.moveLeft = true; }
  if (keyEvent.which == 38) { hero.moveUp = true; }
  if (keyEvent.which == 39) { hero.moveRight = true; }
  if (keyEvent.which == 40) { hero.moveDown = true; }
}

function keyReleased(keyEvent) {
  if (keyEvent.which == 32) { hero.action = 'walk'; }
  if (keyEvent.which == 37) { hero.moveLeft = false; }
  if (keyEvent.which == 38) { hero.moveUp = false; }
  if (keyEvent.which == 39) { hero.moveRight = false; }
  if (keyEvent.which == 40) { hero.moveDown = false; }
}

function startGame() {
  removeEventListener('keydown', newGame);
  removeEventListener('resize', renderGameTitle);
  removeEventListener('resize', renderEndGame);

  createBackground();

  if (win) {
    nb_androids++;
  }
  nb_retires = 0;
  nb_casualties = 0;
  hero_dead = false;

  entities = [];
  bullets = [];

  // hero
  entities.push(hero = createHero());
  // glitchy androids
  for (var n = nb_androids; n > 0; n--) {
    entities.push(createAndroid());
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

  bg = document.createElement('canvas')
  bg.width = WIDTH;
  bg.height = HEIGHT;
  bg_ctx = bg.getContext('2d');

  // load base64 encoded tileset
  var img = new Image();
  img.addEventListener('load', function() {
    data.tileset = img;
    data.flippedTileset = flipTileset(data.tileset);
    renderGameTitle();
    addEventListener('keydown', newGame);
    addEventListener('resize', renderGameTitle);
  });
  img.src = data.tileset;
};

function flipTileset(img) {
  var flipped = document.createElement('canvas');
  flipped.width = img.width;
  flipped.height = img.height;
  var ctx = flipped.getContext('2d');
  var size = img.width / 5;
  for (var n = 1; n <= 5; n++) {
    ctx.setTransform(-1, 0, 0, 1, n * size, 0);
    ctx.drawImage(img, (n-1) * size, 0, size, img.height, 0, 0, size, img.height)
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  return flipped;
}

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
    glitchEntity(entity, elapsedTime);
    orientEntity(entity, elapsedTime);
    moveEntity(entity, elapsedTime);
    frameEntity(entity, elapsedTime);
    containEntity(entity);

    if (entity.createBullet) {
      entity.createBullet = false;
      bullets.push(createBullet(entity));
      playSound(entity.type, 'shoot');
    }
  });

  bullets.forEach(function(bullet, i) {
    frameEntity(bullet, elapsedTime);
    moveEntity(bullet, elapsedTime);

    var e, b;
    if (containBullet(bullet)
        || (e = collideEntity(bullet, entities))
        || (b = collideEntity(bullet, bullets))) {
      if (e !== undefined) {
        updateScore(entities.splice(e, 1)[0]);
      } else if (b !== undefined) {
        bullets.splice(b, 1);
      }
      bullets.splice(i, 1);
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

  blit();

  renderScore(viewport, viewport_ctx);
};

addEventListener('load', init);
