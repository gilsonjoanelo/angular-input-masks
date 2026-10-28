'use strict';

var StringMask = require('string-mask');
var parseDate = require('date-fns/parse');
var formatDate = require('date-fns/format');

describe('uiDateTimeMask', function() {
	describe('default ("YYYY-MM-DD HH:mm:ss") mask', function() {
		it('should load the demo page', function() {
			browser.get('/src/global/date-time/date-time.html');
			expect(browser.getTitle()).toEqual('Date Time Spec');
		});

		it('should format a date and time', function() {
			var dateTimeFormatter = new StringMask('0000-00-00 00:00:00'),
				formattedDateTimeAsString, numberToFormat = '', inputKeysToSend = '19991231153045';

			var input = element(by.model('dateTimeMask')),
				value = element(by.exactBinding('dateTimeMask'));

			var i;
			for (i = 0; i < 14; i++) {
				var key = inputKeysToSend.charAt(i);
				input.sendKeys(key);
				numberToFormat += key;
				formattedDateTimeAsString = dateTimeFormatter.apply(numberToFormat).replace(/[\-\ :\s]+$/, '');
				expect(input.getAttribute('value')).toEqual(formattedDateTimeAsString);
			}

			expect(value.evaluate('dateTimeMask.toISOString()')).toEqual(parseDate(formattedDateTimeAsString, 'YYYY-MM-DD HH:mm:ss', new Date()).toISOString());

			for (i = 13; i >= 0; i--) {
				input.sendKeys(protractor.Key.BACK_SPACE);
				numberToFormat = numberToFormat.slice(0, -1);
				if (numberToFormat) {
					formattedDateTimeAsString = dateTimeFormatter.apply(numberToFormat).replace(/[\-\ :\s]+$/, '');
					expect(input.getAttribute('value')).toEqual(formattedDateTimeAsString);
				}
			}
		});

		it('should format a model initialized with a date object', function() {
			var input = element(by.model('initializedDateTimeMask')),
				value = element(by.exactBinding('initializedDateTimeMask'));

			value.evaluate('initializedDateTimeMask.toString()').then((initialValue) => {
				var dateTimeValue = formatDate(new Date(initialValue), 'YYYY-MM-DD HH:mm:ss');
				expect(input.getAttribute('value')).toEqual(dateTimeValue);
			});
		});

		it('should format a model initialized with a ISO string', function() {
			var input = element(by.model('initializedWithISOStringDateTimeMask')),
				value = element(by.exactBinding('initializedWithISOStringDateTimeMask'));

			value.getText().then((textValue) => {
				var dateTimeValue = formatDate(parseDate(textValue, 'YYYY-MM-DD HH:mm:ss', new Date()), 'YYYY-MM-DD HH:mm:ss');
				expect(input.getAttribute('value')).toEqual(dateTimeValue);
			});
		});

		it('should be valid if the model is a valid date and time', function() {
			var inputKeysToSend = '12311999153045';

			var input = element(by.model('dateTimeMask')),
				valid = element(by.binding('form.dateTimeMaskInput.$error'));

			var i;
			for (i = 0; i < 13; i++) {
				input.sendKeys(inputKeysToSend.charAt(i));
				expect(valid.getText()).toEqual('{ "dateTime": true }');
			}

			input.sendKeys(inputKeysToSend.charAt(13));
			expect(valid.getText()).toEqual('{}');

			for (i = 13; i > 0; i--) {
				input.sendKeys(protractor.Key.BACK_SPACE);
				expect(valid.getText()).toEqual('{ "dateTime": true }');
			}

			input.sendKeys(protractor.Key.BACK_SPACE);
			expect(valid.getText()).toEqual('{}');
		});
	});

	describe('pt-br ("DD/MM/YYYY HH:mm:ss") mask', function() {
		it('should load the demo page', function() {
			browser.get('/src/global/date-time/date-time-pt-br.html');
			expect(browser.getTitle()).toEqual('Date Time Spec');
		});

		it('should format a date and time', function() {
			var dateTimeFormatter = new StringMask('00/00/0000 00:00:00'),
				formattedDateTimeAsString, numberToFormat = '', inputKeysToSend = '31121999153045';

			var input = element(by.model('dateTimeMask')),
				value = element(by.exactBinding('dateTimeMask'));

			var i;
			for (i = 0; i < 14; i++) {
				var key = inputKeysToSend.charAt(i);
				input.sendKeys(key);
				numberToFormat += key;
				formattedDateTimeAsString = dateTimeFormatter.apply(numberToFormat).replace(/[\/\ :\s]+$/, '');
				expect(input.getAttribute('value')).toEqual(formattedDateTimeAsString);
			}

			expect(value.evaluate('dateTimeMask.toISOString()')).toEqual(parseDate(formattedDateTimeAsString, 'DD/MM/YYYY HH:mm:ss', new Date()).toISOString());

			for (i = 13; i >= 0; i--) {
				input.sendKeys(protractor.Key.BACK_SPACE);
				numberToFormat = numberToFormat.slice(0, -1);
				if (numberToFormat) {
					formattedDateTimeAsString = dateTimeFormatter.apply(numberToFormat).replace(/[\/\ :\s]+$/, '');
					expect(input.getAttribute('value')).toEqual(formattedDateTimeAsString);
				}
			}
		});

		it('should format a model initialized with a date object', function() {
			var input = element(by.model('initializedDateTimeMask')),
				value = element(by.exactBinding('initializedDateTimeMask'));

			value.evaluate('initializedDateTimeMask.toString()').then((initialValue) => {
				var dateTimeValue = formatDate(new Date(initialValue), 'DD/MM/YYYY HH:mm:ss');
				expect(input.getAttribute('value')).toEqual(dateTimeValue);
			});
		});

		it('should format a model initialized with a ISO string', function() {
			var input = element(by.model('initializedWithISOStringDateTimeMask')),
				value = element(by.exactBinding('initializedWithISOStringDateTimeMask'));

			value.evaluate('initializedDateTimeMask.toString()').then((initialValue) => {
				var dateTimeValue = formatDate(new Date(initialValue), 'DD/MM/YYYY HH:mm:ss');
				expect(input.getAttribute('value')).toEqual(dateTimeValue);
			});
		});

		it('should be valid if the model is a valid date and time', function() {
			var inputKeysToSend = '31121999153045';

			var input = element(by.model('dateTimeMask')),
				valid = element(by.binding('form.dateTimeMaskInput.$error'));

			var i;
			for (i = 0; i < 13; i++) {
				input.sendKeys(inputKeysToSend.charAt(i));
				expect(valid.getText()).toEqual('{ "dateTime": true }');
			}

			input.sendKeys(inputKeysToSend.charAt(13));
			expect(valid.getText()).toEqual('{}');

			for (i = 13; i > 0; i--) {
				input.sendKeys(protractor.Key.BACK_SPACE);
				expect(valid.getText()).toEqual('{ "dateTime": true }');
			}

			input.sendKeys(protractor.Key.BACK_SPACE);
			expect(valid.getText()).toEqual('{}');
		});
	});
});