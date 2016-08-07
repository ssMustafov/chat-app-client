var gulp = require('gulp');
var ngConstant = require('gulp-ng-constant');
var args = require('yargs').argv;
var run = require('gulp-run');

gulp.task('start', function () {
    var backend = args.backend || 'http://localhost:8080/chat';

    return ngConstant({
        constants: {"BACKEND_URL": backend},
        name: 'chatApp.constants',
        stream: true
    })
        .pipe(gulp.dest('app'))
        .pipe(run('npm start', {verbosity: 3}));
});