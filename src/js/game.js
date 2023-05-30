var bg,
    bg_ctx,
    bg_variant = 0,
    canvas,
    ctx,
    viewport,
    viewport_ctx,
    currentTime,
    lastTime,
    elapsedTime,
    running,
    requestId,
    entities = [],
    bullets = [],
    nb_androids = 0,
    nb_bystanders,
    nb_retires,
    nb_casualties,
    win = true,
    hero,
    data = {
      alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:./,!abcdefghijklnopqrstuvxyzmw',
      charset: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKQAAAAMCAYAAADs+hbCAAABuklEQVR42u2YWQ7CMAxEe0HufwV+OUGBj0pViD1v7BTxQaSqzdIszni8bNur7I/7/n7O30dd9Z/rsyf6//ge28Y1K3s793XPR8+oZOPWyblm+49kTOZ31p/dWVaisR/tqwRIhXMVIMl4V9CR4MmFr5RnBgQq+0zOGYjUfF8DpLo0ChoFIApIOt9VgCSsTNajFkOxvLpYl/0ysCoFrIIxBWTHRBKtjOa/ymRT4Stloeu47gw5PwGswz7E1JN+12Rn+/h5k+2wbweQikkyNqAMRwGZgSHaa+WyVwHSMdmEzS2TXWUByi4UxFXnWwU+jrNf8c2IQlJFpG5FxF70PNkZMsBSJXBB/S8/XPbtth/P2Kbqqi3qG78rbVG9HA25jiqOqsT8yoxcDoC/Bn9Z46D5cf1CFbnSC1d+U9Wcun5vtJ/KW7kwadQsGLLCZjN2jNq668zGoItXEV0nleICkTjuK98IGCBVo/KWJbkDIDgmtws+ujY22QowVIA0BVGdP2PICiMpxajuj8ilA3iX7ToMqf53FAQz5OpUj5PLqoynyeQO4DrpEppBIICfnk0EKGP7yqAmApNqU2x9Lk8ISaG1Im4NsAAAAABJRU5ErkJggg==',
      tileset: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD8AAAAtCAYAAAAZQbNPAAACrUlEQVR42uWaMU7FMAyGcxFGhBA7t2Dh3YWRhWM8NjYQl4CBhYMwsHCCoJS6/BjbcfLS0pQnWS3lq2M7SeM6DWH8xbsQuQT2W5T5eItcwhy/wYDX+1/yZ4zgOHf+6GwXSTS/ro93kUR3/tsANCbWMjFcTAxvGK8jX+J8cvj0MU4iBWDQn+wYRQ3Aw+V5tjeWZBbr+WQMiWbQkozmuGfOW4HAgIjOPz2/DJLOtQDVMPi3xNC5t9c5h1MBA8AZmgpTALAnuEF8qHKj6R6LQc6jx+p5DEJT58demoQ7rzHovMRoo0NjFu154pTzQ69VMdxZ7xpfPOe90d4q8wV5lp8eGc8USjemOUNK0nktYyU5xFhJTis9rtFBIkQx9sq4Vw3+9B6f4FEKUC+MN1nSli8x0n/JCLzIbNJ5SIYOcl4NALwsSOtxV4z7HQETBClZqLlWq6dVW+5kKb6fREm6Z3K9P9wkJAxYXloFsy/U45nzpIhXaSSDPAxPTiSGJycuPftCPTnnp+FiRHE1zN6vp8x5o6LaJeMa8ukmSRk8OH4wjJtNj+AYrec5psx5MBQNU+vswpO1uR7JuTHJsZjiJEeKIN9I6I0pLYTOUc2ZswKUbSub5Nxc3calBN/ANMnpIJuJlY5YMdYkoKJaY7zOoYGHBKfE+VwQg2VUjfPWdTzWBKe05622qpy3RoXUoGWodV+rntfaqnbe+7/aY+uel47/oue1jtn8nLfa2PTTPtdBq1znw9I/3MTXNvR7ZFzpraYIlfXIuPJ7ugm3kPnHBz0yrp5PlU/aM2f751VMKicRw4ciMWg432Nrpcf1Okt1by2KXTKeIY9fNSWhpy6via+BwXOLKXY+RU1qAIeY1BgyrfRoDH3LYzHFlRy23cO3gFbDSN/hWUxJNWfzlRx+7RPzuoEXEcnwxgAAAABJRU5ErkJggg==',
      bg: {
        size: 9,
        sprites: [
          // big/small square tile
          { x: 0, y: 27 },
          { x: 9, y: 27 },
          // concentric square tile
          { x: 18, y: 27 },
          { x: 27, y: 27 },
          // parkay square tile
          { x: 36, y: 27 },
          { x: 45, y: 27 },
          // aztec tile
          { x: 54, y: 27 }
        ]
      },
      bullet: {
        speed: 60,
        size: 5,
        sounds: {
          hit: jsfxr([3,,0.0136,,0.1785,0.4393,,-0.6046,,,,,,,,,,,1,,,0.0612,,0.5])
        },
        sprites: [
          {
            die: [ {x: 45, y: 4 } ],
            trace: [ {x: 45, y: 0 }, { x: 49, y: 4 } ]
          },
          {
            die: [ {x: 54, y: 4 } ],
            trace: [ {x: 54, y: 0 }, { x: 58, y: 4 } ]
          }
        ]
      },
      hero: {
        speed: 30, // pixel per second
        size: 9,
        sounds: {
          hit: jsfxr([3,,0.0136,,0.1785,0.4393,,-0.6046,,,,,,,,,,,1,,,0.0612,,0.5]),
          shoot: jsfxr([0,0.0884,0.2499,0.2723,0.0302,0.6613,0.0938,-0.4487,0.0524,,0.1258,0.0024,0.1201,0.5236,-0.5139,0.1173,-0.0779,0.0559,1,0.1089,,0.0461,-0.1133,0.5])
        },
        sprites: [
          // blue bullet
          {
            die: [ {x: 36, y: 0} ],
            walk: [ {x: 0, y: 0}, {x: 9, y: 0}],
            shoot: [ {x: 18, y: 0}, {x: 27, y: 0}]
          }
        ]
      },
      bystander: {
        size: 9,
        speed: 20, // pixels per second
        sounds: {
          hit: jsfxr([3,,0.0136,,0.1785,0.4393,,-0.6046,,,,,,,,,,,1,,,0.0612,,0.5])
        },
        sprites: [
          // yellow priest
          {
            die: [ {x: 54, y: 18} ],
            walk: [ {x: 0, y: 18}, {x: 9, y: 18}]
          },
          // black trenchcoat
          {
            die: [ {x: 54, y: 9} ],
            walk: [ {x: 0, y: 9}, {x: 9, y: 9}]
          },
          // blue uniform
          {
            die: [ {x: 54, y: 36} ],
            walk: [ {x: 0, y: 36}, {x: 9, y: 36}]
          // },
          // // white coverall
          // {
          //   die: [ {x: 54, y: 46} ],
          //   walk: [ {x: 0, y: 45}, {x: 9, y: 45}]
          }
        ]
      },
      android: {
        size: 9,
        speed: 25, // pixels per second
        sounds: {
          hit: jsfxr([0,,0.2246,,0.2099,0.458,,0.4934,,,,,,0.0222,,0.5192,,,1,,,,,0.5]), // double blip
          shoot: jsfxr([2,,0.1582,,0.2433,0.7687,0.0631,-0.4606,,,,,,0.1545,0.1034,,,,1,,,,,0.5])
        },
        sprites: [
          // black trenchcoat
          {
            die: [ {x: 54, y: 9} ],
            walk: [ {x: 18, y: 9}, {x: 27, y: 9}],
            shoot: [ {x: 36, y: 9}, {x: 45, y: 9}]
          },
          // yellow priest
          {
            die: [ {x: 54, y: 18} ],
            walk: [ {x: 18, y: 18}, {x: 27, y: 18}],
            shoot: [ {x: 36, y: 18}, {x: 45, y: 18}]
          },
          // blue uniform
          {
            die: [ {x: 54, y: 36} ],
            walk: [ {x: 18, y: 36}, {x: 27, y: 36}],
            shoot: [ {x: 36, y: 36}, {x: 45, y: 36}]
          // },
          // // white coverall
          // {
          //   die: [ {x: 54, y: 45} ],
          //   walk: [ {x: 18, y: 45}, {x: 27, y: 45}]
          //   shoot: [ {x: 36, y: 45}, {x: 45, y: 45}]
          }
        ]
      },
    }
    TITLE = 'BLADE GUNNER',
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
    COLLISION_TOLERANCE = 3, // number of non-overlapping pixels in collision test
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
  return createEntity('hero', 0, WIDTH / 2, HEIGHT / 2);
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
  var player = new Audio(data[type].sounds[sound]);
  player.addEventListener('canplay', function() {
    this.play();
  })
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
}

function shootEntity(entity, elapsed) {
  if (entity.action === 'shoot') {
    if ((entity.lastBullet += elapsed) > SHOOT_FREQ) {
       entity.lastBullet = 0;
       entity.createBullet = true;
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

function hitEntity(bullet, entities) {
  // cache some collision math
  for (var n in entities) {
    var entity = entities[n];
    // bullet mostly within entity?
    if (bullet !== entity
       && bullet.x + COLLISION_TOLERANCE >= entity.x
       // -1 because most sprites are 8x9 and don't use the 9th column
       && bullet.x + bullet.size - COLLISION_TOLERANCE - 1 <= entity.x + entity.size
       && bullet.y + COLLISION_TOLERANCE >= entity.y
       && bullet.y + bullet.size - COLLISION_TOLERANCE <= entity.y + entity.size) {
      return entity;
    }
  }
}

function updateScore(entity) {
  if (entity.type === 'bystander') { nb_casualties++ }
  if (entity.type === 'android') { nb_retires++; }
  if (entity.type === 'hero') { hero.dead = true; }
}

function checkEndGame() {
  if (hero.dead || nb_bystanders === nb_casualties) {
    win = false;
    endGame();
  } else if (nb_retires === nb_androids) {
    win = true;
    bg_variant = (bg_variant + 1) % 4;
    endGame();
  }
}

function endGame() {
  gtag('event', (win ? 'all androids retired' : (hero.dead ? 'player died' : 'all bystanders died')), {
    'event_category': 'bladegunner|level:' + nb_androids,
    'event_label': 'casualties:' + nb_casualties
  })
  cancelAnimationFrame(requestId);

  removeEventListener('keydown', keyPressed);
  removeEventListener('keyup', keyReleased);
  document.removeEventListener('visibilitychange', changeVisibility);

  addEventListener('keydown', newGame);
  addEventListener('resize', renderEndGame);

  renderEndGame();
}


function renderEndGame(/* uglify optim */ text) {
  requestAnimationFrame(function() {
    ctx.fillStyle = GREY;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    renderTitle(0, 2);

    ctx.fillStyle = WHITE;
    text = measureText(hero.dead ? 'Oh no, you died!' :
                       nb_casualties === nb_bystanders ? 'Oh no, all civilians died!' :
                       'You retired ' + nb_androids + ' glitchy android' + (nb_androids > 1 ? 's' : ''));
    renderText(text.str, (WIDTH - text.length) / 2, HEIGHT / 3, text.chars)
    if (win) {
      text = measureText('with ' + nb_casualties + ' casualt' + (nb_casualties > 1 ? 'ies' : 'y') + '!');
      renderText(text.str, (WIDTH - text.length) / 2, HEIGHT / 3 + 9);
    }

    text = measureText('Press ENTER to play again' + (win ? 'st' : '.'));
    renderText(text.str, (WIDTH - text.length) / 2, HEIGHT * 2 / 3, text.chars)
    if (win) {
      text = measureText('one more android.');
      renderText(text.str, (WIDTH - text.length) / 2, HEIGHT * 2 / 3 + 9);
    }

    blit();
  });
}

function renderGameTitle(/* uglify optim */ text) {
  requestAnimationFrame(function() {
    ctx.fillStyle = GREY;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    renderTitle((WIDTH - 52 * 3) / 2, 2, 3);

    ctx.fillStyle = WHITE;
    text = measureText('Retire glitchy androids');
    renderText(text.str, (WIDTH - text.length) / 2, HEIGHT / 3 - 9, text.chars);
    text = measureText('before they inflict casualties.');
    renderText(text.str, (WIDTH - text.length) / 2, HEIGHT / 3, text.chars);
    text = measureText('Avoid casualties yourself.');
    renderText(text.str, (WIDTH - text.length) / 2, HEIGHT / 3 + 9, text.chars);


    ctx.drawImage(data.tileset, data.hero.sprites[0].walk[0].x, data.hero.sprites[0].walk[0].y, data.hero.size, data.hero.size,
                                0, HEIGHT / 3 - 4, data.hero.size * 2, data.hero.size * 2);
    ctx.drawImage(data.flippedTileset, data.android.sprites[0].shoot[0].x, data.android.sprites[0].shoot[0].y, data.android.size, data.android.size,
                                       WIDTH - data.android.size * 2.5, HEIGHT / 3 - 18, data.android.size * 2, data.android.size * 2);
    ctx.drawImage(data.flippedTileset, data.android.sprites[1].shoot[0].x, data.android.sprites[1].shoot[0].y, data.android.size, data.android.size,
                                       WIDTH - data.android.size * 2, HEIGHT / 3 + 9, data.android.size * 2, data.android.size * 2);

    text = measureText('Move: arrows/WASD/ZQSD   Shoot: SPACE');
    renderText(text.str, (WIDTH - text.length) / 2, HEIGHT * 2 / 3 - 9, text.chars);

    text = measureText('Press ENTER to start');
    renderText(text.str, (WIDTH - text.length) / 2, HEIGHT * 2 / 3 + 14, text.chars);

    text = measureText('By Jerome Lecomte at JS13KGAMES 2016');
    renderText(text.str, (WIDTH - text.length) / 2, HEIGHT - 9, text.chars);

    blit();
  });
}

function renderEntity(entity) {
  var frame = ((entity.type === 'hero') && (entity.direction === 0) && (entity.action === 'walk')) || entity.action === 'die' ? 0 : entity.frame;
  var sprite = getSprites(entity)[frame];
  var tileset = (entity.type !== 'bullet' && (entity.lastDirection & DIRECTION_LEFT)) ? data.flippedTileset : data.tileset;
  ctx.drawImage(tileset, Math.floor(sprite.x), Math.floor(sprite.y), entity.size, entity.size,
                         Math.floor(entity.x), Math.floor(entity.y), entity.size, entity.size);

}

function measureText(str) {
  var chars = [];
  var dxOffset = 0
  for (var i = 0; i < str.length; i++) {
    var char = str[i];
    var lowercase = char.toUpperCase() !== char;
    // uppercase are 4 pixel wide, lowercase are 3 pixel wide
    var w = lowercase ? 3 : 4;
    var h = 6;
    // m and w are 2 pixel wider, t, 1 and / are 1 pixel narrower,
    // i, :, and , are 2 pixel narrower, . and ! are 3 pixels narrower
    var wOffset = (char === 'm' || char === 'w') ? 2 :
                  (char === 't' || char === '1' || char === '/') ? -1 :
                  (char === 'i' || char === ',' || char === ':') ? -2 :
                  (char === '.' || char === '!') ? -3 :
                   0;
    // w tile is after m tile, which is 2 pixel wider
    var twOffset = char === 'w' ? 2 : 0;
    // char tiles are 4 pixel wide, regardless the character inside
    var tw = 4;
    // 1st row of char spritesheet contains 41 chars: A-Z, 0-9 and 5 punctuation signs
    // 2nd row of char spritsheet contains 26 chars: a-z
    var n = data.alphabet.indexOf(char) % 41;
    // lowercase char are located on the 2nd row of char spritesheet
    sy = lowercase ? 6 : 0;
    chars.push({
      sx: n * tw + twOffset,
      sy: sy,
      sw: w + wOffset,
      sh: h,
      dxOffset: dxOffset,
      dw: w + wOffset,
      dh: h
    });
    dxOffset += w + wOffset + 1;
  }
  return {
    chars: chars,
    length: dxOffset,
    str: str
  };
}

/* inspired from Glitch Hunters by @cmonkeybusiness github.com/coding-monkey-business/glitch-hunters */
function renderText(str, dx, dy, chars) {
  chars = chars || measureText(str).chars;
  chars.forEach(function(char) {
    ctx.drawImage(data.charset, char.sx, char.sy, char.sw, char.sh,
                                dx + char.dxOffset, dy, char.dw, char.dh);
  });
}

function renderTitle(x, y, scale) {
  scale = scale || 1;
  ctx.drawImage(data.charset, 108, 6, 52, 6, x, y, 52 * scale, 6 * scale);
}

function renderScore(context /* uglify optim */, text) {
  context.fillStyle = GREY;
  context.fillRect(0, 0, WIDTH, data.bg.size);
  renderTitle(0, 2);
  text = measureText('android' + (nb_androids > 1 ? 's' : '') + ':' + nb_retires + '/' + nb_androids);
  renderText(text.str, (WIDTH - text.length) / 2, 2);
  text = measureText('casualties:' + nb_casualties);
  renderText(text.str, WIDTH - text.length, 2, text.chars);
}

function createBackground(variant, size, sprite) {
  size = data.bg.size;
  if (variant > 1) {
    size -= 1;
  }
  var i = 0;
  for (var x = 0; x <= WIDTH; x += size) {
    // skip one tile vertically for score
    for (var y = size; y <= HEIGHT; y += size) {
      if (variant === 0) {
        sprite = data.bg.sprites[randomInt(1, 10) > 9 ? 1 : 0];
      } else if (variant === 1) {
        sprite = data.bg.sprites[2 + i];
      } else if (variant === 2) {
        sprite = data.bg.sprites[4 + i];
      } else {
        sprite = data.bg.sprites[6];
      }
      bg_ctx.drawImage(data.tileset, sprite.x, sprite.y, size, size, x, y, size, size);
      i = (i + 1) % 2;
    }
  }
}

function resize(/* uglify optim */ scaleToFit) {
  scaleToFit = Math.min(window.innerWidth / WIDTH, window.innerHeight / HEIGHT);
  viewport.width = WIDTH * scaleToFit;
  viewport.height = HEIGHT * scaleToFit;

  // disable smoothing on scaling
  viewport_ctx.mozImageSmoothingEnabled = ctx.mozImageSmoothingEnabled = false;
  viewport_ctx.msImageSmoothingEnabled = ctx.msImageSmoothingEnabled = false;
  viewport_ctx.imageSmoothingEnabled = ctx.imageSmoothingEnabled = false;
};

function newGame(keyEvent) {
  if (keyEvent.which === 13) {
    startGame();
  }
};

function keyPressed(keyEvent) {
  if (keyEvent.which === 32 && hero.action !== 'shoot') {
    hero.action = 'shoot';
    hero.lastBullet = SHOOT_FREQ;
  }
  // Left arrow / A / Q
  if (keyEvent.which === 37 || keyEvent.which === 65 ||keyEvent.which === 81) { hero.moveLeft = true; }
  // Up arrow / W / Z
  if (keyEvent.which === 38 || keyEvent.which === 90 || keyEvent.which === 87) { hero.moveUp = true; }
  // Right arrow / D
  if (keyEvent.which === 39 || keyEvent.which === 68) { hero.moveRight = true; }
  // Down arrow / S
  if (keyEvent.which === 40 || keyEvent.which === 83) { hero.moveDown = true; }
}

function keyReleased(keyEvent) {
  if (keyEvent.which === 32) { hero.action = 'walk'; }
  // Left arrow / A / Q
  if (keyEvent.which === 37 || keyEvent.which === 65 || keyEvent.which === 81) { hero.moveLeft = false; }
  // Up arrow / W / Z
  if (keyEvent.which === 38 || keyEvent.which === 90 || keyEvent.which === 87) { hero.moveUp = false; }
  // Right arrow / D
  if (keyEvent.which === 39 || keyEvent.which === 68) { hero.moveRight = false; }
  // Down arrow / S
  if (keyEvent.which === 40 || keyEvent.which === 83) { hero.moveDown = false; }
}

function startGame() {
  removeEventListener('keydown', newGame);
  removeEventListener('resize', renderGameTitle);
  removeEventListener('resize', renderEndGame);
  document.addEventListener('visibilitychange', changeVisibility);

  createBackground(bg_variant);

  running = true;

  if (win) {
    nb_androids++;
  }
  nb_retires = 0;
  nb_casualties = 0;

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
  loop();
  gtag('event', 'game start', {
    'event_category': 'bladegunner|level:' + nb_androids,
    'event_label': 'bystanders:' + nb_bystanders
  })
}

// Game loop
function init() {
  document.title = TITLE;

  // disable audio for Safari
  var ua = navigator.userAgent.toLowerCase();
  if (ua.indexOf('safari') !== -1 && ua.indexOf('chrom') === -1) {
    playSound = function() {};
  }

  // visible canvas, in window dimensions
  viewport = document.querySelector('canvas');
  viewport_ctx = viewport.getContext('2d');

  // backbuffer canvas, in game dimensions
  canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  ctx = canvas.getContext('2d');
  resize();
  addEventListener('resize', resize);

  bg = document.createElement('canvas')
  bg.width = WIDTH;
  bg.height = HEIGHT;
  bg_ctx = bg.getContext('2d');

  // load base64 encoded tileset
  var img = new Image();
  img.addEventListener('load', function() {
    data.tileset = img;
    data.flippedTileset = flipTileset(data.tileset);

    img = new Image();
    img.addEventListener('load', function() {
      data.charset = img;

      renderGameTitle();
      addEventListener('keydown', newGame);
      addEventListener('resize', renderGameTitle);
    });
    img.src = data.charset;
  });
  img.src = data.tileset;
  gtag('event', 'bladegunner|splash screen', {
    'event_category': '',
    'event_label': ''
  })
};

function flipTileset(img) {
  var flipped = document.createElement('canvas');
  flipped.width = img.width;
  flipped.height = img.height;
  var ctx = flipped.getContext('2d');
  var size = img.width / 7;
  for (var n = 1; n <= 7; n++) {
    ctx.setTransform(-1, 0, 0, 1, n * size, 0);
    ctx.drawImage(img, (n-1) * size, 0, size, img.height, 0, 0, size, img.height)
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  return flipped;
}

function changeVisibility(event) {
  // event target is document object
  running = !event.target.hidden;
  if (running) {
    // skip all the missed time to avoid a huge leap forward
    lastTime = Date.now();
    // restart the game animation loop
    loop();
  }
};

function loop() {
  if (running) {
    requestId = requestAnimationFrame(loop);
    render();
    currentTime = Date.now();
    update((currentTime - lastTime) / 1000);
    lastTime = currentTime;
  }
};

function update(elapsedTime) {
  entities.forEach(function(entity, i) {
    if (entity.action === 'die') {
      updateScore(entities.splice(i, 1)[0]);
    } else {
      glitchEntity(entity, elapsedTime);
      orientEntity(entity, elapsedTime);
      shootEntity(entity, elapsedTime);
      moveEntity(entity, elapsedTime);
      frameEntity(entity, elapsedTime);
      containEntity(entity);

      if (entity.createBullet) {
        entity.createBullet = false;
        bullets.push(createBullet(entity));
        playSound(entity.type, 'shoot');
      }
    }
  });

  bullets.forEach(function(bullet, i) {
    if (bullet.action === 'die') {
      bullets.splice(i, 1)
    } else {
      frameEntity(bullet, elapsedTime);
      moveEntity(bullet, elapsedTime);

      var e, b;
      if (containBullet(bullet)
          || (e = hitEntity(bullet, entities))
          || (b = hitEntity(bullet, bullets))) {
        bullet.action = 'die';
        if (e) {
          e.action = 'die';
          playSound(e.type, 'hit');
        } else if (b) {
          b.action = 'die';
        }
      }
    }
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

  renderScore(ctx);

  entities.forEach(renderEntity);
  bullets.forEach(renderEntity);

  blit();
};

addEventListener('load', init);
