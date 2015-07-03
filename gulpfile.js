var gulp = require("gulp"),
	del = require("del"),
	babel = require("gulp-babel");

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

// Simply copy the rest of the files from src/ to dist/
// Input: All files but JS files that are not under libs/
gulp.task("copy", ["clean"], function() {
	return gulp.src([
		"src/**",
		"!src/**/!(libs)/*.js" // With this glob, JS files must be directly under libs/ (change the glob if nesting folders)
	], { base: "src/" })
		.pipe(gulp.dest("dist/"));
});

gulp.task("default", ["to-ES5", "copy"]);