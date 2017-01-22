// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
// A silly little validator function. Just an example.

import * as constants from "./constants";

export function validateTextField(field: any) {
	if (field.value) {
		field.removeAttribute("class");
	}
	else {
		field.setAttribute("class", constants.REQUIRED_FIELD_CLASS);
	}
}
