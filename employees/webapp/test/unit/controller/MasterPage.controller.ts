/*global QUnit*/
import Controller from "de/santos/employees/controller/Master.controller";

QUnit.module("Master Controller");

QUnit.test("I should test the Master controller", function (assert: Assert) {
	const oAppController = new Controller("Master");
	oAppController.onInit();
	assert.ok(oAppController);
});