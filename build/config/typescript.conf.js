// Copyright (c) 2017 Trustfall AB. All rights reserved. For license, see "README" or "LICENSE" file.

// Configuration options for TypeScript compiler. Change this to match your preferences.

(function() {
	"use strict";

    exports.tscPath = "node_modules/typescript/bin/tsc";

	//exports.compilerOptions = "@tsconfig.json";
	exports.compilerOptions = "--module amd --noImplicitAny --target es5"; //--outDir generated/ts/  --removeComments 
    //TODO: read compiler options from tsconfig.json instead

}());