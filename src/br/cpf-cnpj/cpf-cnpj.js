'use strict';

var StringMask = require('string-mask');
var BrV = require('br-validations');
var maskFactory = require('../../helpers/mask-factory');

var cnpjPattern = new StringMask('AA.AAA.AAA\/AAAA-00');
var cpfPattern = new StringMask('000.000.000-00');

module.exports = maskFactory({
	clearValue: function(rawValue) {
		return rawValue.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 14);
	},
	format: function(cleanValue) {
		if (!cleanValue) return '';

		if (cleanValue.length > 11) {
			return (cnpjPattern.apply(cleanValue) || '').trim();
		}
		return (cpfPattern.apply(cleanValue) || '').trim().replace(/[^0-9]$/, '');
	},
	validations: {
		cpf: function(value) {
			return value.length > 11 || BrV.cpf.validate(value);
		},
		cnpj: function(value) {
			return value.length <= 11 || BrV.cnpj.validate(value);
		}
	}
});
