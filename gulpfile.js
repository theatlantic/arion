var gulp = require('gulp');
var nodemon = require('gulp-nodemon');

gulp.task('develop', function () {
  nodemon({
    script: 'bin/www',
    ext: 'js handlebars coffee',
    stdout: false
  }).on('readable', function () {
    this.stdout.pipe(process.stdout);
    this.stderr.pipe(process.stderr);
  });
});

gulp.task('default', ['develop']);
