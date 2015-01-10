var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var inquirer = require('inquirer');


exec("git status --porcelain", function (error, stdout, stderr) {
  if(error) {
    console.log(stdout);
    console.log(stderr);
    console.log("error: "+error);
    process.exit(error);
  }
  if (stdout) {
    console.log(stdout);
    console.log("There are uncommitted changes");
    process.exit(1);
  }

  spawn("gulp.cmd", ["compress"], { stdio: 'inherit' }).on('close', function (code) {
    if (code === 0) {
      inquirer.prompt({
        type: 'list',
        name: 'bump',
        message: 'What type of bump would you like to do?',
        choices: ['patch', 'minor', 'major']
      }, function (importance) {
        spawn("gulp.cmd", ["bump-" + importance.bump], { stdio: 'inherit' }).on("close", function (code) {
          if (code === 0) {
            spawn('npm.cmd', ['publish'], { stdio: 'inherit' }).on('close', function (code2) {
              process.exit(code2);
            });
          }
        });
      });
    }
  });

});
