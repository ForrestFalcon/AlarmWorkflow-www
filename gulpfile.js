// Sass configuration
var gulp = require('gulp');
var sass = require('gulp-sass');
var ts = require('gulp-typescript');

var tsProject = ts.createProject('tsconfig.json');

gulp.task('sass', function() {
    gulp.src('assets/scss/*.scss')
        .pipe(sass())
        /*.pipe(gulp.dest(function(f) {
            return f.base;
        }))*/
        .pipe(gulp.dest('assets/css'));
});


gulp.task('ts', function() {
    gulp.src('assets/app_ts/**/*.ts')
        .pipe(ts(tsProject))
        .pipe(gulp.dest('assets/app'));
});

gulp.task('default', ['sass', 'ts'], function() {
    gulp.watch('assets/scss/*.scss', ['sass']);
    gulp.watch('assets/app_ts/**/*.ts', ['ts']);
})