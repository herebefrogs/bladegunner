var bg,
    bg_ctx,
    canvas,
    ctx,
    viewport,
    viewport_ctx,
    currentTime,
    lastTime,
    elapsedTime,
    entities = [],
    bullets = [],
    nb_androids,
    nb_bystanders,
    hero,
    data = {
      tileset: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAABpUlEQVR42s2XzU0EMQyFXQoXhDgD2wUX6AUOSFwoAwpAQjQBQnRAC3ClArPOrCPHY09CNniI9KTE823mTX68CcCu4D2gFqgSxqTgx9tMazHAwdPNGcr6Wgw8XWyqrsMYAlgeFMkU0MvrexLV9Vftw8i2xXC96IhcakgPs+6If7PESK6ln+LLaHGxtCGPkYYsxhtFj0lFBi2gN9bLAH5/oaW1mAmqJbRABjhJHT9jBqjeyyCcZ+b28NJkKJ4NbfkCYGnXPL+RDFi7hqQXehRTQBKUW3JfRvMeE2aIE1+TId3ZwclNkpUvophU6IFV/02s1m5lpvzweYSWVmFSwEhW8mgZyWRIn+KsjloYnRgtRidG09C/GKE8hws3gUhmugVYoFhkBaO4aj9bcb6pMfM7knqpe48ydob5nNu7xLjE2Ia8oQ5khp4ah5wY764eUEr+C7NaGFgobja2SqsZyhvM4PXjjOEXs6QZOsg1m/LM6FGpMfxiFhvoMlQzssTwyA0boV4zNG2SGbaGWqeJ6x4Do0rvmtHMnxvydhyvGc0MNTQiF43y8wPwAl25ySr59wAAAABJRU5ErkJggg==',
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
    ANIM_INTERVAL = 0.25; // seconds between animation frames
    DIRECTION_UP = 1,
    DIRECTION_RIGHT = 2,
    DIRECTION_DOWN = 4,
    DIRECTION_LEFT = 8,
    MAX_ANDROIDS = 5,
    MIN_ANDROIDS = 1,
    MAX_BYSTANDERS = 75,
    MIN_BYSTANDERS = 25,
    HEIGHT = 153,
    WIDTH = 198;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max + 1 - min) + min);
}

function createEntity(type) {
  var attrs = {
    direction: [DIRECTION_UP, DIRECTION_RIGHT, DIRECTION_DOWN, DIRECTION_LEFT][randomInt(0, 3)],
    type: type,
    size: data[type].size
  };
  attrs.facingRight = attrs.direction === DIRECTION_RIGHT;
  attrs.x = randomInt(0, WIDTH - attrs.size);
  attrs.y = randomInt(0, HEIGHT - attrs.size);
  return attrs;
}

function createHero() {
  var attrs = createEntity('hero');
  attrs.direction = 0;
  return attrs;
}

function createBullet(entity) {
  var attrs = createEntity('bullet');
  // direction the entity is facing or if immobile, the direction it is facing
  attrs.direction = entity.direction || (entity.facingRight ? DIRECTION_RIGHT : DIRECTION_LEFT);
  attrs.x = entity.x;
  attrs.y = entity.y;
  // place bullet outside of entity bounding box (to avoid immediate entity kill)
  if (attrs.direction & DIRECTION_LEFT) { attrs.x -= attrs.size; }
  if (attrs.direction & DIRECTION_RIGHT) { attrs.x += entity.size; }
  if (attrs.direction & DIRECTION_UP) { attrs.y -= attrs.size; }
  if (attrs.direction & DIRECTION_DOWN) { attrs.y += entity.size; }
  // center bullet halfway along the sprite if no diagonal motion
  if (!(attrs.direction & DIRECTION_LEFT) && !(attrs.direction & DIRECTION_RIGHT)) { attrs.x += (entity.size - attrs.size) / 2; }
  if (!(attrs.direction & DIRECTION_UP) && !(attrs.direction & DIRECTION_DOWN)) { attrs.y += (entity.size - attrs.size) / 2; }
  return attrs;
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
  if (entity.y <= 0) {
    entity.y = 0;
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

function containBullet(bullet, i) {
  // bullet out of screen?
  var discard = (bullet.x <= 0 || bullet.x + bullet.size >= WIDTH
                 || bullet.y <= 0 || bullet.y >= HEIGHT - bullet.size);

  if (!discard) {
    // cache some collision math
    var bullet_up = bullet.y + bullet.size;
    var bullet_right = bullet.x + bullet.size;

    for (var n in entities) {
      var entity = entities[n];
      // bullet hit entity?
      discard = bullet_up > entity.y && bullet.x < entity.x + entity.size
                && bullet.y < entity.y + entity.size && bullet_right > entity.x;
      if (discard) {
        updateScore(entities.splice(n, 1)[0]);
        break;
      }
    }
  }

  if (discard) {
    bullets.splice(i, 1);
  }
}

function updateScore(entity) {
  if (entity.type === 'bystander') { nb_bystanders--; }
  if (entity.type === 'android') { nb_androids--; }
  if (entity.type === 'hero') { hero = undefined; }
}

function checkEndGame() {
  if (!(hero && nb_bystanders)) {
    console.log('game over - you loose!');
  } else if (!nb_androids) {
    console.log('game over - you win!');
  }
}

function renderEntity(entity) {
  var sprite = data[entity.type].sprites[0];
  if (entity.type !== 'bullet') {
    sprite = sprite[entity.shoot ? 'shoot' : 'walk'][0];
  }
  ctx.drawImage(data.tileset, Math.floor(sprite.x), Math.floor(sprite.y), entity.size, entity.size,
                              Math.floor(entity.x), Math.floor(entity.y), entity.size, entity.size);
}

function createBackground() {
  var size = data.bg.size;
  for (var x = 0; x < WIDTH; x += size) {
    for (var y = 0; y < HEIGHT; y += size) {
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

// Game loop
function init() {
  document.title = 'Blade Gunner';

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
  img.src = data.tileset;
  data.tileset = img;

  createBackground();

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

  lastTime = Date.now();
  loop();
};

function loop() {
  currentTime = Date.now();
  update((currentTime - lastTime) / 1000);
  render();
  lastTime = currentTime;
  requestAnimationFrame(loop);
};

function update(elapsedTime) {
  entities.forEach(function(entity) {
    moveEntity(entity, elapsedTime);
    containEntity(entity);
  });
  bullets.forEach(function(bullet, i) {
    moveEntity(bullet, elapsedTime);
    containBullet(bullet, i);
  });
  checkEndGame();
};

function render() {
  ctx.drawImage(bg, 0, 0);

  entities.forEach(renderEntity);
  bullets.forEach(renderEntity);

  // copy backbuffer onto visible canvas, scaling them to screen dimensions
  viewport_ctx.drawImage(canvas, 0, 0, WIDTH, HEIGHT,
                                 0, 0, viewport.width, viewport.height);
};

addEventListener('load', init);
// TODO remove listeners if hero gets killed
// TODO add listeners on init (will be easier when title menu)
addEventListener('keydown', function(e) {
  if (e.which == 32) {
    hero.shoot = true;
    bullets.push(createBullet(hero));
  }
  if (e.which == 37) { hero.direction |= DIRECTION_LEFT; hero.facingRight = false; }
  if (e.which == 38) { hero.direction |= DIRECTION_UP; }
  if (e.which == 39) { hero.direction |= DIRECTION_RIGHT; hero.facingRight = true; }
  if (e.which == 40) { hero.direction |= DIRECTION_DOWN; }
});

addEventListener('keyup', function(e) {
  if (e.which == 32) { hero.shoot = false; }
  if (e.which == 37) { hero.direction ^= DIRECTION_LEFT; }
  if (e.which == 38) { hero.direction ^= DIRECTION_UP; }
  if (e.which == 39) { hero.direction ^= DIRECTION_RIGHT; }
  if (e.which == 40) { hero.direction ^= DIRECTION_DOWN; }
});
