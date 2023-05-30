// heavily based on Eoin McGrath's Roboflip gulpfile
// https://github.com/eoinmcg/roboflip
var fs = require('fs'),
    cheerio = require('cheerio'),
    gulp = require('gulp'),
    gutil = require('gulp-util'),
    concat = require('gulp-concat'),
    htmlmin = require('gulp-htmlmin'),
    rimraf = require('gulp-rimraf'),
    rename = require('gulp-rename'),
    replace = require('gulp-replace'),
    webserver = require('gulp-webserver'),
    uglify = require('gulp-uglify'),
    zip = require('gulp-zip'),
    exclude_min = ['js/ga.min.js', 'js/jsfxr.min.js'];
    config = { js: [] };


gulp.task('build', ['clean', 'initbuild', 'jsmin', 'addjs', 'zip', 'report']);


gulp.task('serve', ['build'], function() {
  gulp.src('./build')
    .pipe(webserver({
      livereload: true,
      host: '0.0.0.0',
      port: 8013,
      open: true
    }));
});


gulp.task('clean', function() {
  // delete prev files
  stream = gulp.src('dist/*')
        .pipe(rimraf());

  stream = gulp.src('build/*')
        .pipe(rimraf());

  return stream;
});

gulp.task('initbuild', ['clean'], function() {

  var html, $, src, js = [];

  // get a list of all js scripts from our dev file
  html = fs.readFileSync('src/index.html', 'utf-8', function(e, data) {
    return data;
  });

  $ = cheerio.load(html);

  $('script').each(function() {
    src = $(this).attr('src');
    if (exclude_min.indexOf(src) === -1) {
      js.push('./src/' + src);
    }
  });

  config.js = js;

});

gulp.task('jsmin', ['initbuild'], function() {

  var stream = gulp.src(config.js)
    .pipe(concat('./build/g.js'))
    .pipe(uglify())
    .pipe(gulp.dest('.'));

  return stream;

});

gulp.task('addjs', ['jsmin'], function() {

    var js = fs.readFileSync('./build/g.js', 'utf-8', function(e, data) {
      return data;
    });

    var i, extra_js = '';

    for (i = 0; i < exclude_min.length; i += 1) {
      console.log(exclude_min[i])
      extra_js += fs.readFileSync('./src/' + exclude_min[i], 'utf-8', function(e, data) {
        return data;
      });
    }
    console.log(extra_js.length, 'OK', exclude_min);

    var stream = gulp.src('src/index.html')
      .pipe(replace(/<script.*>(.|\n)*<\/script>/i, '<script async src="https://www.googletagmanager.com/gtag/js?id=G-G36K3DYXSS"></script><script>'+extra_js+' '+js+'</script>'))
      .pipe(htmlmin({collapseWhitespace: true}))
      .pipe(gulp.dest('./build'));

    return stream;

});

gulp.task('zip', ['addjs'], function() {
  var stream = gulp.src('./build/index.html')
      .pipe(zip('game.zip'))
      .pipe(gulp.dest('./dist'));

  return stream;
});


gulp.task('report', ['zip'], function() {
  var stat = fs.statSync('dist/game.zip'),
      limit = 1024 * 13,
      size = stat.size,
      remaining = limit - size,
      percentage = (remaining / limit) * 100;

  percentage = Math.round(percentage * 100) / 100

  console.log('\n\n-------------');
  console.log('BYTES USED: ' + stat.size);
  console.log('BYTES REMAINING: ' + remaining);
  console.log(percentage +'%');
  console.log('-------------\n\n');
});


// base64 encode png spritesheet asset and inline it in js
gulp.task('encode', function()  {
  var assets = [
    { image: 'assets.png', property: 'tileset' },
    { image: 'charset.png', property: 'charset' }
  ];

  var loaders = [];
  assets.forEach(function(asset) {
    loaders.push(new Promise(function(resolve) {
      fs.readFile('src/' + asset.image, function(err, data) {
        asset.data = 'data:image/png;base64,' + data.toString('base64');
        resolve(asset);
      });
    }));
  });

  return Promise.all(loaders).then(function(values) {
    var stream = gulp.src('src/js/game.js');

    values.forEach(function(value) {
      stream.pipe(replace(new RegExp(value.property + ': \'.*\'', 'gm'),
                          value.property + ': \'' + value.data + '\''));
    });

    return stream.pipe(gulp.dest('./src/js/'));
  });
});
