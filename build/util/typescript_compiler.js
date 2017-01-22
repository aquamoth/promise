// Copyright (c) 2017 Trustfall AB. All rights reserved. See LICENSE.TXT for details.
(function () {
    "use strict";

    var jake = require("jake");
    var fs = require("fs");

	exports.compile = function (options, success, fail) {
        var files = deglob(options.files);
		var filesLeft = files.length;

		if (files.length === 0) {
			process.stdout.write("None\n");
			return success();
		}

        files.forEach(function (path) {
            run(path, options.tscPath, options.compilerOptions);
        });
        return;



        function run(path, tscPath, compilerOptions) {
            var cmd = "node " + tscPath + " " + compilerOptions + " " + path;
            //process.stdout.write(cmd + "\n");

            var ex = jake.createExec([cmd]);

            ex.addListener("stdout", function (output) {
                process.stdout.write(output);
            });

            ex.addListener("stderr", function (error) {
                //process.stderr.write("TSC ERROR: " + error + "\n");
                fail(error);
            });

            ex.addListener("cmdEnd", function () {
                process.stdout.write(".");
                if (--filesLeft === 0) {
                    process.stdout.write("\n");
                    success();
                }
            });

            ex.addListener("error", function () {
                fail("Compilation of " + path + " failed.");
            });

            ex.run();
        }
    };

    function deglob(globs) {
        return new jake.FileList(globs).toArray();
    }

} ());