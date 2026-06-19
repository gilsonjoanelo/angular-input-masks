'use strict';

var formatDate = require('date-fns/format');
var parseDate = require('date-fns/parse');
var isValidDate = require('date-fns/isValid');
var StringMask = require('string-mask');

function isISODateString(date) {
    return /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]{1,})?(Z|[-+][0-9]{2}:[0-9]{2})?$/
        .test(date.toString());
}

var dateFormatMapByLocale = {
	'pt-br': 'DD/MM/YYYY',
	'es-ar': 'DD/MM/YYYY',
	'es-mx': 'DD/MM/YYYY',
	'es'   : 'DD/MM/YYYY',
	'en-us': 'MM/DD/YYYY',
	'en'   : 'MM/DD/YYYY',
	'fr-fr': 'DD/MM/YYYY',
	'fr'   : 'DD/MM/YYYY',
	'ru'   : 'DD.MM.YYYY'
};

function normalizarParaObjetoDate(value) {
    if (!value) return null;

    // If it is already a native JS Date object, return it directly
    if (typeof value === 'object' && value instanceof Date) {
        return isNaN(value.getTime()) ? null : value;
    }

    var str = value.toString().trim();

    // If the cleaned string is shorter than a full date (e.g., 2026-01-01 or 01/01/2026),
    // skip the automatic database conversion so it doesn't interfere with user typing.
    if (str.length < 8) {
        return null;
    }

    // Isolate the Date part by removing the time (either after 'T' or after a space)
    var apenasData = str.split('T')[0].split(' ')[0];

    // Standardize separators and split the blocks
    apenasData = apenasData.replace(/\//g, '-');
    var partes = apenasData.split('-');

    if (partes.length !== 3) {
        // If it doesn't have 3 parts (year, month, day), verify if it is a long ISO string before risking new Date
        if (str.includes('-') || str.includes('/')) {
            var dataNativa = new Date(value);
            return isNaN(dataNativa.getTime()) ? null : dataNativa;
        }
        return null;
    }

    var ano, mes, dia;

    // AUTOMATIC YEAR POSITION DETECTION (Ensures the year has 4 digits)
    if (partes[0].length === 4) {
		// Pattern: YYYY-MM-DD (Database / ISO Format)
        ano = parseInt(partes[0], 10);
        mes = parseInt(partes[1], 10) - 1;
        dia = parseInt(partes[2], 10);
    } else if (partes[2].length === 4) {
		// Pattern: DD-MM-YYYY (PT-BR / Inverted Format)
        dia = parseInt(partes[0], 10);
        mes = parseInt(partes[1], 10) - 1;
        ano = parseInt(partes[2], 10);
    } else {
        return null;
    }

    // Capture the time if it exists in the original string
    var hora = 0, minuto = 0, segundo = 0;
    var parteHorario = str.includes('T') ? str.split('T')[1] : (str.includes(' ') ? str.split(' ')[1] : null);

    if (parteHorario) {
        // Remove timezone or milliseconds if present (.000Z, -03:00, etc)
        var apenasHoraMinSeg = parteHorario.split('.')[0].split('-')[0].split('+')[0].replace('Z', '');
        var componentesHora = apenasHoraMinSeg.split(':');

        hora = parseInt(componentesHora[0] || 0, 10);
        minuto = parseInt(componentesHora[1] || 0, 10);
        segundo = parseInt(componentesHora[2] || 0, 10);
    }

    // Create the native local Date object
    var dataFinal = new Date(ano, mes, dia, hora, minuto, segundo);
    return isNaN(dataFinal.getTime()) ? null : dataFinal;
}

function DateMaskDirective($locale) {
    var currentLocale = ($locale.id || 'pt-br').toLowerCase();
    var dateFormat = dateFormatMapByLocale[currentLocale] || 'YYYY-MM-DD';

    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ctrl) {
            attrs.parse = attrs.parse || 'true';
            dateFormat = (attrs.uiDateMask || dateFormat).toUpperCase();
            var dateMask = new StringMask(dateFormat.replace(/[YMD]/g, '0'));

            function formatter(value) {
                if (ctrl.$isEmpty(value)) {
                    return null;
                }

                var dataValida = normalizarParaObjetoDate(value);
                var cleanValue = value;
                if (dataValida) {
                    cleanValue = formatDate(value, dateFormat);
                }

                cleanValue = cleanValue.replace(/[^0-9]/g, '');
                var formatedValue = dateMask.apply(cleanValue) || '';

                return formatedValue.trim().replace(/[^0-9]$/, '');
            }

            ctrl.$formatters.push(formatter);

            ctrl.$parsers.push(function parser(value) {
                if (ctrl.$isEmpty(value)) {
                    return value;
                }

                var formatedValue = formatter(value);

                if (ctrl.$viewValue !== formatedValue) {
                    ctrl.$setViewValue(formatedValue);
                    ctrl.$render();
                }

                return attrs.parse === 'false'
                    ? formatedValue
                    : parseDate(formatedValue, dateFormat, new Date());
            });

            ctrl.$validators.date = function validator(modelValue, viewValue) {
                if (ctrl.$isEmpty(modelValue)) {
                    return true;
                }

                return isValidDate(parseDate(viewValue, dateFormat, new Date())) && viewValue.length === dateFormat.length;
            };
        }
    };
}
DateMaskDirective.$inject = ['$locale'];

module.exports = DateMaskDirective;
