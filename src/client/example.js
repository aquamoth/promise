// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
// A silly little validator function. Just an example.
define(["require", "exports", "./constants"], function (require, exports, constants) {
    "use strict";
    function validateTextField(field) {
        if (field.value) {
            field.removeAttribute("class");
        }
        else {
            field.setAttribute("class", constants.REQUIRED_FIELD_CLASS);
        }
    }
    exports.validateTextField = validateTextField;
});
