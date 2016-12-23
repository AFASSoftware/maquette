var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var inquirer = require('inquirer');

var win = /^win/.test(process.platform);
let gulp = win ? 'gulp.cmd' : 'gulp';
let npm = win ? 'npm.cmd' : 'npm';

spawn(gulp, ["compress", "dist-min", "declaration"], { stdio: 'inherit' }).on('close', function (code) {
  if(code !== 0) {
    process.exit(code);
  }

  exec("git status --porcelain", function (error, stdout, stderr) {
    if (error) {
      console.log(stdout);
      console.log(stderr);
      console.log("error: " + error);
      process.exit(error);
    }
    if (stdout) {
      console.log(stdout);
      console.log("There are uncommitted changes");
      process.exit(1);
    }

    inquirer.prompt([{
      type: 'list',
      name: 'bump',
      message: 'What type of bump would you like to do?',
      choices: ['patch', 'minor', 'major']
    }]).then(function (answers) {
      spawn(gulp, ["bump-" + answers.bump], { stdio: 'inherit' }).on("close", function (code2) {
        if(code2 !== 0) { process.exit(code2); }
        spawn("git", ["push"], { stdio: 'inherit' }).on("close", function (code3) {
          if(code3 !== 0) { process.exit(code3); }
          spawn("git", ["push", "--tags"], { stdio: 'inherit' }).on("close", function (code4) {
            if(code4 !== 0) {
              process.exit(code4);
            }
            spawn(npm, ['publish'], { stdio: 'inherit' }).on('close', function (code5) {
              process.exit(code5);
            });
          });
        });
      });
    });
  });
});
