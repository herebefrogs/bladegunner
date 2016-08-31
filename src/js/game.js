var canvas,
    ctx,
    currentTime,
    lastTime,
    elapsedTime,
    HEIGHT = 600,
    WIDTH = 600;

function init() {
  document.title = 'Blade Gunner';

  canvas = document.querySelector('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  ctx = canvas.getContext('2d');

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
  console.log('update ' + e);
};

function render() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  console.log('render');
};

addEventListener('load', init);
