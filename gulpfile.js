var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
var path = require('path');
var streamqueue = require('streamqueue');
var eslint = require('gulp-eslint');
var postcss = require('gulp-postcss');
var postcssOpacity = require('postcss-opacity');
var postcssFilterGradient = require('postcss-filter-gradient');
var autoprefixer = require('autoprefixer');

var htmlmin = require('gulp-htmlmin');
var minifyCSS = require('gulp-minify-css');
var concatCss = require('gulp-concat-css');
var concatJs = require('gulp-concat');
var notify = require('gulp-notify');
var uglify = require('gulp-uglify');

// UI JavaScript
var uiJS = require('./libs/files/ui').JS;

// Package data
var pkg = require('./package.json');

var distPath = './dist';

var banner = {
    full: ''
};

// build-css: Compile Sass, concat Css, minifyCSS
gulp.task('build-css', function () {
    return streamqueue({ objectMode: true },
            //gulp.src(['node_modules/Mesh/dist/mesh.css']),
            gulp.src(['src/ui/styles/ui-theme.scss'])
            .pipe($.sourcemaps.init())
            .pipe($.sass({
                outputStyle: 'expanded' // nested, compact, compressed, expanded
            }))
            .pipe(postcss([
                postcssFilterGradient,
                autoprefixer({'browsers': ['last 5 versions', '> 1%']}),
                postcssOpacity
            ]))
        )
        .pipe(concatCss('uxtest.css'))
        .pipe(minifyCSS({keepBreaks:false}))
        .pipe($.rename({suffix: '.min'}))
        .pipe(gulp.dest('dist/css'))
});

// build-js: concat Js, uglify
gulp.task('build-js', function() {
    return streamqueue({ objectMode: true },
        gulp.src('node_modules/tiny.js/dist/tiny.js'),
        gulp.src(uiJS.core).pipe($.concat('core.js'))
        .pipe($.wrapper({
            header: "\n(function (window) {\n\t'use strict';\n\n",
            footer: '\n\tch.version = \'' + pkg.version + '\';\n\twindow.ch = ch;\n}(this));'
        })),
        gulp.src(uiJS.abilities.concat(uiJS.components)),
        gulp.src('views/uxtest-customer.js')
    )
        .pipe($.concat('uxtest.js'))
        .pipe($.wrapper({
            header: banner.full
        }))
        .pipe(uglify())
        .pipe($.rename({suffix: '.min'}))
        .pipe(gulp.dest('dist/js'));
});

// Minify HTML
gulp.task('minify-html', function() {
  return gulp.src('views/index.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(''));
});

// Start a BrowserSync server, which you can view at http://localhost:3040
gulp.task('browser-sync', ['build'], function () {
    browserSync.init({
        port: 3040,
        startPath: '',
        server: {
            baseDir: [
                // base path for views and demo assets
                'dist/',
                // root folder for everything else
                './'
            ],
            middleware: [
                function(req, res, next) {
                    var redirectTo;

                    switch (req.url) {
                        case '/':
                            redirectTo = '/index.html';
                            break;
                    }

                    if (redirectTo) {
                        res.writeHead(301, {Location: redirectTo});
                        res.end();
                    } else {
                        next();
                    }
                }
            ]
        },
        bsFiles: {
            src: [
                'dist/**/*.css',
                'dist/**/*.js',
                'dist/*.html'
            ]
        }
    });

    //gulp.watch(['src/shared/**/*.js', 'src/ui/**/*.js'], ['concatJS:ui']);
    //gulp.watch(['src/shared/**/*.js', 'src/mobile/**/*.js'], ['concatJS:mobile']);
    //gulp.watch('dist/**/*.js').on('change', reload);
    //gulp.watch('dist/*.html').on('change', reload);
    //gulp.watch('src/**/styles/**/*.scss', ['compileSass','concatCSS']);
    gulp.watch('views/index.html', ['minify-html']);
    gulp.watch('views/index.html').on('change', reload);
});

// Validates JavaScript files with ESLint
gulp.task('lint', function () {
    return gulp.src(['src/**/*.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
});

// Build all files without starting a server
gulp.task('build', function (done) {
    runSequence([
        'build-css',
        'build-js',
        'minify-html'        
    ], done);
});

// Dev task: build the Chico and start a server
gulp.task('dev', [
    'build',
    'browser-sync'
]);

// Default task: run the dev
gulp.task('default', ['dev']);
