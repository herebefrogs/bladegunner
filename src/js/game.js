var canvas,
    ctx,
    currentTime,
    lastTime,
    elapsedTime,
    entities = [],
    hero,
    DIRECTION_UP = 1,
    DIRECTION_RIGHT = 2,
    DIRECTION_DOWN = 3,
    DIRECTION_LEFT = 4,
    MAX_ANDROIDS = 5,
    MIN_ANDROIDS = 1,
    MAX_BYSTANDERS = 100,
    MIN_BYSTANDERS = 25,
    SPEED = 30, // pixels per seconds
    HEIGHT = 300,
    WIDTH = 400;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max + 1 - min) + min);
}

function createEntity(color) {
  var entity = {
    color: color,
    direction: randomInt(DIRECTION_UP, DIRECTION_LEFT),
    speed: SPEED,
    height: 10,
    width: 10,
  };
  entity.x = randomInt(entity.width, WIDTH - entity.width);
  entity.y = randomInt(entity.height, HEIGHT - entity.height);
  return entity;
}

function moveEntities(elapsed) {
  entities.forEach(function(entity) {
    if (entity === hero) {
      if (entity.moveLeft) { entity.x += entity.speed * elapsed; }
      if (entity.moveRight) { entity.x -= entity.speed * elapsed; }
      if (entity.moveUp) { entity.y += entity.speed * elapsed; }
      if (entity.moveDown) { entity.y -= entity.speed * elapsed; }
    } else {
      entity.x += (entity.direction === DIRECTION_RIGHT ? 1 : entity.direction === DIRECTION_LEFT ? -1 : 0) * entity.speed * elapsed;
      entity.y += (entity.direction === DIRECTION_UP ? 1 : entity.direction === DIRECTION_DOWN ? -1 : 0) * entity.speed * elapsed;
    }
  });
}

function containEntities() {
  entities.forEach(function(entity) {
    if (entity.x <= 0) {
      entity.x = 0;
      if (entity !== hero) {
        entity.direction = DIRECTION_RIGHT;
      }
    } else if (entity.x + entity.width >= WIDTH) {
      entity.x = WIDTH - entity.width;
      if (entity !== hero) {
        entity.direction = DIRECTION_LEFT;
      }
    } else if (entity.y - entity.height <= 0) {
      entity.y = entity.height;
      if (entity !== hero) {
        entity.direction = DIRECTION_UP;
      }
    } else if (entity.y >= HEIGHT) {
      entity.y = HEIGHT;
      if (entity !== hero) {
        entity.direction = DIRECTION_DOWN;
      }
    }
  })
}

function renderEntities() {
  entities.forEach(function(entity) {
    ctx.fillStyle = entity.color;
    ctx.fillRect(entity.x, HEIGHT - entity.y, entity.width, entity.height);
});
}

// Game loop
function init() {
  document.title = 'Blade Gunner';

  canvas = document.querySelector('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  ctx = canvas.getContext('2d');

  // hero
  entities.push(hero = createEntity('#00DD00'));
  // glitchy androids
  for (var n = randomInt(MIN_ANDROIDS, MAX_ANDROIDS); n > 0; n--) {
    entities.push(createEntity('#DD0000'));
  }
  // bystanders
  for (var n = randomInt(MIN_BYSTANDERS, MAX_BYSTANDERS); n > 0; n--) {
    entities.push(createEntity('#0000DD'));
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
  moveEntities(elapsedTime);
  containEntities();
};

function render() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  renderEntities();
};

addEventListener('load', init);
addEventListener('keydown', function(e) {
  if (e.which == 32) { hero.shoot = true; }
  if (e.which == 37) { hero.moveRight = true; }
  if (e.which == 38) { hero.moveUp = true; }
  if (e.which == 39) { hero.moveLeft = true; }
  if (e.which == 40) { hero.moveDown = true; }
});

addEventListener('keyup', function(e) {
  if (e.which == 32) { hero.shoot = false; }
  if (e.which == 37) { hero.moveRight = false; }
  if (e.which == 38) { hero.moveUp = false; }
  if (e.which == 39) { hero.moveLeft = false; }
  if (e.which == 40) { hero.moveDown = false; }
});
