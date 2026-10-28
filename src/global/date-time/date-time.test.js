'use strict';

require('../global-masks');

describe('ui-date-time-mask', function() {
	beforeEach(angular.mock.module('ui.utils.masks.global'));

	it('should throw an error if used without ng-model', function() {
		expect(function() {
			TestUtil.compile('<input ui-date-time-mask>');
		}).toThrow();
	});

	it('should register a $parser and a $formatter', function() {
		var input = TestUtil.compile('<input ng-model="model">');
		var model = input.controller('ngModel');

		var maskedInput = TestUtil.compile('<input ng-model="maskedModel" ui-date-time-mask>');
		var maskedModel = maskedInput.controller('ngModel');

		expect(maskedModel.$parsers.length).toBe(model.$parsers.length + 1);
		expect(maskedModel.$formatters.length).toBe(model.$formatters.length + 1);
	});

	it('should format initial model values', function() {
		var date = new Date('1999-12-31 15:30:45');
		var input = TestUtil.compile('<input ng-model="model" ui-date-time-mask>', {
			model: date
		});

		var model = input.controller('ngModel');
		expect(model.$viewValue).toBe('12/31/1999 15:30:45');
	});

	it('should use specified mask', function() {
		var input = TestUtil.compile('<input ng-model="model" ui-date-time-mask="DD.MM.YYYY HH:mm:ss">', {
			model: new Date('1999-12-31 15:30:45')
		});

		var model = input.controller('ngModel');
		expect(model.$viewValue).toBe('31.12.1999 15:30:45');
	});

	it('should ignore non digits', function() {
		var input = TestUtil.compile('<input ng-model="model" ui-date-time-mask="YYYY-MM-DD HH:mm:ss">');
		var model = input.controller('ngModel');

		var tests = [
			{value:'@', viewValue:''},
			{value:'1-', viewValue:'1'},
			{value:'1999a', viewValue:'1999'},
			{value:'1999_12', viewValue:'1999-12'},
			{value:'1999123!', viewValue:'1999-12-3'},
			{value:'19991231153045!', viewValue:'1999-12-31 15:30:45'},
		];

		tests.forEach(function(test) {
			input.val(test.value).triggerHandler('input');
			expect(model.$viewValue).toBe(test.viewValue);
		});
	});

	it('should parse input', angular.mock.inject(function($rootScope) {
		var input = TestUtil.compile('<input ng-model="model" ui-date-time-mask>');

		input.val('1999-12-31 15:30:45').triggerHandler('input');
		expect($rootScope.model instanceof Date).toBe(true);
	}));

	it('should not parse input when parse disabled', angular.mock.inject(function($rootScope) {
		var input = TestUtil.compile('<input ng-model="model" ui-date-time-mask parse="false">');

		input.val('1999-12-31 15:30:45').triggerHandler('input');
		expect(typeof ($rootScope.model) === 'string').toBe(true);
	}));

	it('should handle corner cases', angular.mock.inject(function($rootScope) {
		var input = TestUtil.compile('<input ng-model="model" ui-date-time-mask>');
		var model = input.controller('ngModel');

		var tests = [
			{modelValue: '', viewValue: ''},
			{modelValue: null, viewValue: null},
			{}, //tests undefined values
		];

		tests.forEach(function(test) {
			$rootScope.model = test.modelValue;
			$rootScope.$digest();
			expect(model.$viewValue).toBe(null);
		});
	}));

	it('should correctly format database strings with single-digit fields without affecting the raw model structure', function() {
		var input = TestUtil.compile('<input ng-model="model" ui-date-time-mask>', {
			model: '1999-12-3 5:4:9'
		});

		var model = input.controller('ngModel');
		
		expect(model.$viewValue).toBe('03/12/1999 05:04:09');
		
		input.val('03/12/1999 05:04:09').triggerHandler('input');
		expect(model.$modelValue).toBe('1999-12-3 5:4:9');
	});
});