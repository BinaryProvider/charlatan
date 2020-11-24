/* eslint-disable */
const gulp = require('gulp');
const ts = require('gulp-typescript');
const rimraf = require('gulp-rimraf'); 
const tsProject = ts.createProject('tsconfig.json');
const outDir = './dist';

gulp.task('clean', function() {
  return gulp.src(outDir, { read: false, allowEmpty: true })
    .pipe(rimraf());
});

gulp.task('build', function() {
  return tsProject.src().pipe(tsProject()).js.pipe(gulp.dest(outDir));
});

gulp.task('copy-core', function () {
  return gulp.src(['./src/core/**/*', './src/core/**/.*', './src/core/.**/*', './src/core/.**/.*']).pipe(gulp.dest(`${outDir}/core`));
});

gulp.task('copy-templates', function () {
  return gulp.src(['./src/templates/**/*']).pipe(gulp.dest(`${outDir}/templates`));
});

gulp.task('default', gulp.series('clean', 'build', 'copy-core', 'copy-templates'));
