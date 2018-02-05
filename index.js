var semver = require('semver'),
    _ = require('underscore'),
    colors = require('colors');

module.exports = function (grunt) {
    return function () {
        var fs = require('fs'),
            path = require('path'),
            actualPath = path.resolve();
        var pkg;
        if (fs.existsSync(actualPath + '/package.json')) {
            pkg = require(actualPath + '/package.json');
        } else {

        }
        var dependencies;

        function getDirectories(srcpath) {
            return fs.readdirSync(srcpath).filter(function(file) {
                return fs.statSync(path.join(srcpath, file)).isDirectory();
            });
        }
        if (pkg) {
            dependencies = _.extend({}, pkg.dependencies, pkg.devDependencies);

            var names = getDirectories(actualPath + '/node_modules/'),
                directories = {};

            _.each(names, function (value, index) {
                if (value !== '.bin') {
                    try {
                        directories[value] = require(actualPath + '/node_modules/' + value + '/package.json').version;
                    } catch (e) {
                        if (e.code === 'MODULE_NOT_FOUND') {
                            grunt.log.writeln('\nDependency ' + actualPath + '/node_modules/' + value + '/' + ' is weird...');
                        }
                    }
                }
            });

            var good = true;
            _.each(dependencies, function (versionRequired, dep) {
                var installedVersion = directories[dep];
                if (_.has(directories, dep)) {
                    if (!semver.satisfies(installedVersion, versionRequired)) {//dependency out of date
                        if (grunt) {
                            grunt.log.writeln('\nDependency ' + dep.underline.cyan + ' is installed ' + ('@' + installedVersion).underline.cyan + ' but needs ' + versionRequired.underline.cyan);
                            grunt.log.writeln('Run $ ' + 'npm install'.bgRed.white + ' to fix this!\n');
                        } else {
                            console.log('\nDependency ' + dep.underline.cyan + ' is installed ' + ('@' + installedVersion).underline.cyan + ' but needs ' + versionRequired.underline.cyan);
                            console.log('Run $ ' + 'npm install'.bgRed.white + ' to fix this!\n');
                        }
                        good = false;
                    }
                } else {
                    if (grunt) {
                        grunt.log.writeln('\nDependency ' + dep.underline.cyan + ' is missing!');
                        grunt.log.writeln('Run $ ' + 'npm install'.bgRed.white + ' to fix this!\n');
                    } else {
                        console.log('\nDependency ' + dep.underline.cyan + ' is missing!');
                        console.log('Run $ ' + 'npm install'.bgRed.white + ' to fix this!\n');

                    }
                    good = false;
                }
            });
            if (good) {
                grunt.log.writeln('All dependencies met! (' + actualPath + ')'.dim.green);
            } else {
                grunt.fatal('Dependencies not met (' + actualPath + ')');
            }
        }
    };
};
