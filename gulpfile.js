var gulp = require("gulp"),
	del = require("del"),
	babel = require("gulp-babel"),
	concat = require("gulp-concat"),
	cssnext = require("gulp-cssnext"),
	beeper = require("beeper"),
	mergeStream = require("merge-stream");

gulp.task("clean", function(c) {
	del("dist/**", c);
});

// Transpile to ES5
// Input: All JS files but those under libs/
gulp.task("to-ES5", ["clean"], function() {
	return gulp.src([
		"src/**/*.js",
		"!src/**/libs/**"
	], { base: "src/" })
		.pipe(babel())
		.pipe(gulp.dest("dist/"));
});

var buildThemedCss = function(theme) {
	var appCssBundle;
	var sandboxCssBundle;

	// Input: All CSS files but the sandbox's, and only the current theme
	appCssBundle = gulp.src([
		"src/**/*.css",
		"!src/sandbox/css/*.css",
		"!src/app-shared/css/themes/**/!(" + theme + "-theme-vars.css)"
	], { base: "src/" })
		.pipe(concat("css/bundle-" + theme + "-theme.css"))
		.pipe(cssnext())
		.pipe(gulp.dest("dist/"));

	// Input: app-shared's main.css for rules that are unrelated to the Chrome
	// app's UI, the sandbox's CSS files, and only the current theme
	sandboxCssBundle = gulp.src([
		"src/app-shared/css/main.css",
		"src/sandbox/css/*.css",
		"src/app-shared/css/themes/" + theme + "-theme-vars.css"
	], { base: "src/" })
		.pipe(concat("sandbox/css/bundle-" + theme + "-theme.css"))
		.pipe(cssnext())
		.pipe(gulp.dest("dist/"));

	return mergeStream(appCssBundle, sandboxCssBundle);
};

gulp.task("build-css-theme-light", ["clean"], buildThemedCss.bind(null, "light"));
gulp.task("build-css-theme-dark", ["clean"], buildThemedCss.bind(null, "dark"));

// Simply copy the rest of the files from src/ to dist/
// Input: All files but JS files that are not under libs/
gulp.task("copy", ["clean"], function() {
	return gulp.src([
		"src/**",
		"!src/**/*.css",
		"!src/**/!(libs)/*.js" // With this glob, JS files must be directly under libs/ (change the glob if nesting folders)
	], { base: "src/" })
		.pipe(gulp.dest("dist/"));
});

gulp.task("default", ["to-ES5", "build-css-theme-light", "build-css-theme-dark", "copy"], function() {
	console.log("Watching...");
});

gulp.task("build-from-watch", ["default"], function() {
	if (getArg("--beep")) beeper(2); // Audio feedback when build is complete (enable by passing --beep param)
});

// Build as soon as a file changes
gulp.watch("src/**", ["build-from-watch"])
	.on("change", function(event) {
		console.log("Watch: file " + event.path + " was " + event.type + ", building...");
	});

// From http://stackoverflow.com/a/26946499/408173
// Eases reading command line params
function getArg(key) {
	var index = process.argv.indexOf(key);
	var next = process.argv[index + 1];
	return (index < 0) ? null : (!next || next[0] === "-") ? true : next;
}