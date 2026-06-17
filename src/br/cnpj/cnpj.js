'use strict';

var StringMask = require('string-mask');
var BrV = require('br-validations');

var maskFactory = require('../../helpers/mask-factory');

var cnpjPattern = new StringMask('AA.AAA.AAA\/AAAA-00');

module.exports = maskFactory({
	clearValue: function(rawValue) {
		return rawValue.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 14);
	},
	format: function(cleanValue) {
		return (cnpjPattern.apply(cleanValue) || '').trim();
	},
	validations: {
		cnpj: function(value) {
			return BrV.cnpj.validate(value);
		}
	}
});
