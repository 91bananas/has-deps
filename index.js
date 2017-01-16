var semver = require('semver'),
    _ = require('underscore'),
    colors = require('colors');

module.exports = function (grunt) {
    return function () {
        var fs = require('fs'),
            path = require('path'),
            dependencies = _.extend({}, require('../package.json').dependencies, require('../package.json').devDependencies);

        function getDirectories(srcpath) {
            return fs.readdirSync(srcpath).filter(function(file) {
                return fs.statSync(path.join(srcpath, file)).isDirectory();
            });
        }
        var names = getDirectories('./node_modules/'),
            directories = {};

        _.each(names, function (value, index) {
            if (value !== '.bin') {
                directories[value] = require('../node_modules/' + value + '/package.json').version
            }
        });

        var good = true;
        _.each(dependencies, function (versionRequired, dep) {
            var installedVersion = directories[dep];
            if (_.has(directories, dep)) {
                if (!semver.satisfies(installedVersion, versionRequired)) {//dependency out of date
                    grunt.log.writeln('\nDependency ' + dep.underline.cyan + ' is installed ' + ('@' + installedVersion).underline.cyan + ' but needs ' + versionRequired.underline.cyan);
                    grunt.log.writeln('Run $ ' + 'npm install'.bgRed.white + ' to fix this!\n');
                    good = false;
                }
            } else {
                grunt.log.writeln('\nDependency ' + dep.underline.cyan + ' is missing!');
                grunt.log.writeln('Run $ ' + 'npm install'.bgRed.white + ' to fix this!\n');
                good = false;
            }
        });
        if (good) {
            grunt.log.writeln('All dependencies met!'.dim.green);
        } else {
            grunt.fatal('Dependency not met');
        }
    }
};
