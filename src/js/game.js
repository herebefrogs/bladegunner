var canvas,
    ctx,
    currentTime,
    lastTime,
    elapsedTime,
    entities = [],
    bullets = [],
    hero,
    data = {
      tileset: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAABpUlEQVR42s2XzU0EMQyFXQoXhDgD2wUX6AUOSFwoAwpAQjQBQnRAC3ClArPOrCPHY09CNniI9KTE823mTX68CcCu4D2gFqgSxqTgx9tMazHAwdPNGcr6Wgw8XWyqrsMYAlgeFMkU0MvrexLV9Vftw8i2xXC96IhcakgPs+6If7PESK6ln+LLaHGxtCGPkYYsxhtFj0lFBi2gN9bLAH5/oaW1mAmqJbRABjhJHT9jBqjeyyCcZ+b28NJkKJ4NbfkCYGnXPL+RDFi7hqQXehRTQBKUW3JfRvMeE2aIE1+TId3ZwclNkpUvophU6IFV/02s1m5lpvzweYSWVmFSwEhW8mgZyWRIn+KsjloYnRgtRidG09C/GKE8hws3gUhmugVYoFhkBaO4aj9bcb6pMfM7knqpe48ydob5nNu7xLjE2Ia8oQ5khp4ah5wY764eUEr+C7NaGFgobja2SqsZyhvM4PXjjOEXs6QZOsg1m/LM6FGpMfxiFhvoMlQzssTwyA0boV4zNG2SGbaGWqeJ6x4Do0rvmtHMnxvydhyvGc0MNTQiF43y8wPwAl25ySr59wAAAABJRU5ErkJggg==',
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
    HEIGHT = 150,
    WIDTH = 200;

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
  return attrs;
}

function moveEntities(elapsed) {
  entities.forEach(function(entity) {
    var speed = data[entity.type].speed;
    if (entity.direction & DIRECTION_RIGHT) { entity.x += speed * elapsed; }
    if (entity.direction & DIRECTION_LEFT) { entity.x -= speed * elapsed; }
    if (entity.direction & DIRECTION_UP) { entity.y -= speed * elapsed; }
    if (entity.direction & DIRECTION_DOWN) { entity.y += speed * elapsed; }
  });
}

function containEntities() {
  entities.forEach(function(entity) {
    if (entity.x <= 0) {
      entity.x = 0;
      if (entity !== hero) {
        entity.direction ^= DIRECTION_LEFT;
        entity.direction |= DIRECTION_RIGHT
      }
    } else if (entity.x + entity.size >= WIDTH) {
      entity.x = WIDTH - entity.size;
      if (entity !== hero) {
        entity.direction ^= DIRECTION_RIGHT;
        entity.direction |= DIRECTION_LEFT;
      }
    } else if (entity.y <= 0) {
      entity.y = 0;
      if (entity !== hero) {
        entity.direction ^= DIRECTION_UP;
        entity.direction |= DIRECTION_DOWN;
      }
    } else if (entity.y >= HEIGHT - entity.size) {
      entity.y = HEIGHT - entity.size;
      if (entity !== hero) {
        entity.direction ^= DIRECTION_DOWN;
        entity.direction |= DIRECTION_UP;
      }
    }
  })
}

function renderEntities() {
  entities.forEach(function(entity) {
    var sprite = data[entity.type].sprites[0];
    if (entity.type !== 'bullet') {
      sprite = sprite[entity.shoot ? 'shoot' : 'walk'][0];
    }
    ctx.drawImage(data.tileset, sprite.x, sprite.y, entity.size, entity.size,
                                entity.x, entity.y, entity.size, entity.size);
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
  entities.push(hero = createHero());
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
  if (e.which == 32) {
    hero.shoot = true;
    entities.push(createBullet(hero));
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
