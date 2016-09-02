var canvas,
    ctx,
    currentTime,
    lastTime,
    elapsedTime,
    entities = [],
    hero,
    data = {
      tileset: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAABlElEQVR42s2XQU4DMQxFfRQ2CLEGegs2cBdYILHhGO0BkBCXACFuwBVgywlMnakjx+NM0qnrIdKXMu5r+sdJ3ARg13ANqAWqhTEp+PUx0lIMcPBydYWyvxQDLzerpuswhgBWDYpkCujt/TOJ+vqtDmHks8VwvxiIXGpIp1kPxN+ZYiTXM07xZrS4WNpQjZGGLKaWxRqTmgxawNzYXAbw9wctLcUMUKugBTLARer8FTNA/bkMwnVmHk9vTYbi2dCWLwCWds3zG8mAtWtIeqFHMQUkQbklD2U0X2PCDHHh6zKkBzu5eEiy6kUUkxp9YPX3ibWee5mhPnyfoaVFmBQwipU8WkYyGdKnOGugHkYXRovRhdE09C8ylOdw4iYQyQy3AAsUi6xgFNccZyuuNy1mfEdSP1q9Rxk7w/ycn3eFcYqxDdVSHci4nhpdToxPdxuUkv/CrB4GvFqvGaobzOD984hxN9TKSotxNdQyMsVw5twMzTVD03aUDPVOE/drjLuhfdeMZo5uqLbjeM1oxtWQRy3y8vMHDNYv8X02M4UAAAAASUVORK5CYII=',
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
    DIRECTION_DOWN = 3,
    DIRECTION_LEFT = 4,
    MAX_ANDROIDS = 5,
    MIN_ANDROIDS = 1,
    MAX_BYSTANDERS = 75,
    MIN_BYSTANDERS = 25,
    HEIGHT = 150,
    WIDTH = 200;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max + 1 - min) + min);
}

function createEntity(type) {
  var entity = {
    direction: randomInt(DIRECTION_UP, DIRECTION_LEFT),
    type: type,
    size: data[type].size
  };
  entity.x = randomInt(entity.size, WIDTH - entity.size);
  entity.y = randomInt(entity.size, HEIGHT - entity.size);
  return entity;
}

function moveEntities(elapsed) {
  entities.forEach(function(entity) {
    var speed = data[entity.type].speed;
    if (entity === hero) {
      if (entity.moveLeft) { entity.x += speed * elapsed; }
      if (entity.moveRight) { entity.x -= speed * elapsed; }
      if (entity.moveUp) { entity.y += speed * elapsed; }
      if (entity.moveDown) { entity.y -= speed * elapsed; }
    } else {
      entity.x += (entity.direction === DIRECTION_RIGHT ? 1 : entity.direction === DIRECTION_LEFT ? -1 : 0) * speed * elapsed;
      entity.y += (entity.direction === DIRECTION_UP ? 1 : entity.direction === DIRECTION_DOWN ? -1 : 0) * speed * elapsed;
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
    } else if (entity.x + entity.size >= WIDTH) {
      entity.x = WIDTH - entity.size;
      if (entity !== hero) {
        entity.direction = DIRECTION_LEFT;
      }
    } else if (entity.y - entity.size <= 0) {
      entity.y = entity.size;
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
    var sprite = data[entity.type].sprites[0].walk[0];
    ctx.drawImage(data.tileset, sprite.x, sprite.y, entity.size, entity.size, entity.x, HEIGHT - entity.y, entity.size, entity.size);
  });
}

// Game loop
function init() {
  document.title = 'Blade Gunner';

  canvas = document.querySelector('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  ctx = canvas.getContext('2d');

  // load base64 encoded tileset
  var img = new Image();
  img.src = data.tileset;
  data.tileset = img;

  // hero
  entities.push(hero = createEntity('hero'));
  // glitchy androids
  for (var n = randomInt(MIN_ANDROIDS, MAX_ANDROIDS); n > 0; n--) {
    entities.push(createEntity('android'));
  }
  // bystanders
  for (var n = randomInt(MIN_BYSTANDERS, MAX_BYSTANDERS); n > 0; n--) {
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
