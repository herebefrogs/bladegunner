var canvas,
    ctx,
    currentTime,
    lastTime,
    elapsedTime,
    entities = [],
    MAX_ANDROIDS = 5,
    MIN_ANDROIDS = 1,
    MAX_BYSTANDERS = 100,
    MIN_BYSTANDERS = 25,
    HEIGHT = 300,
    WIDTH = 400;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max + 1 - min) + min);

}
function createEntity(color) {
  var entity = {
    color: color,
    height: 10,
    width: 10,
  };
  entity.x = randomInt(entity.width, WIDTH - entity.width);
  entity.y = randomInt(entity.height, HEIGHT - entity.height);
  return entity;
}

function renderEntities(entities) {
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
  entities.push(createEntity('#00DD00'));
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
  update(currentTime - lastTime);
  render();
  lastTime = currentTime;
  requestAnimationFrame(loop);
};

function update(e) {
};

function render() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  renderEntities(entities);
};

addEventListener('load', init);
