'use strict';

var formatDate = require('date-fns/format');
var parseDate = require('date-fns/parse');
var isValidDate = require('date-fns/isValid');
var StringMask = require('string-mask');

var dateFormatMapByLocale = {
	'pt-br': 'dd/MM/yyyy',
	'es-ar': 'dd/MM/yyyy',
	'en-us': 'MM/dd/yyyy',
	'fr-fr': 'dd/MM/yyyy',
	'ru'   : 'dd.MM.yyyy'
};

function normalizarParaObjetoDate(value) {
    if (!value) return null;

    if (typeof value === 'object' && value instanceof Date) {
        return isNaN(value.getTime()) ? null : value;
    }

    var str = value.toString().trim();
    if (str.length < 8) {
        return null;
    }

    var partesDataHora = str.split('T');
    var apenasData = partesDataHora[0].split(' ')[0].replace(/\//g, '-');
    var partes = apenasData.split('-');

    if (partes.length !== 3) {
        var dataNativa = new Date(value);
        return isNaN(dataNativa.getTime()) ? null : dataNativa;
    }

    var ano, mes, dia;
    if (partes[0].length === 4) {
        ano = parseInt(partes[0], 10);
        mes = parseInt(partes[1], 10) - 1;
        dia = parseInt(partes[2], 10);
    } else if (partes[2].length === 4) {
        dia = parseInt(partes[0], 10);
        mes = parseInt(partes[1], 10) - 1;
        ano = parseInt(partes[2], 10);
    } else {
        return null;
    }

    var hora = 0, minuto = 0, segundo = 0;
    var parteHorario = partesDataHora[1] || (str.includes(' ') ? str.split(' ')[1] : null);

    if (parteHorario) {
        var apenasHoraMinSeg = parteHorario.split('.')[0].split('-')[0].split('+')[0].replace('Z', '');
        var componentesHora = apenasHoraMinSeg.split(':');

        hora = parseInt(componentesHora[0] || 0, 10);
        minuto = parseInt(componentesHora[1] || 0, 10);
        segundo = parseInt(componentesHora[2] || 0, 10);
    }

    var dataFinal = new Date(ano, mes, dia, hora, minuto, segundo);
    return isNaN(dataFinal.getTime()) ? null : dataFinal;
}

function DateTimeMaskDirective($locale) {
    var currentLocale = ($locale.id || 'pt-br').toLowerCase();
    var dateFormat = dateFormatMapByLocale[currentLocale] || 'dd/MM/yyyy';

    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ctrl) {
            attrs.parse = attrs.parse || 'true';

            // Define se o formato de hora será completo (HH:mm:ss) ou curto (HH:mm)
            var timeFormat = (attrs.uiDateTimeMask === 'short') ? 'HH:mm' : 'HH:mm:ss';
            var dynamicFormat = dateFormat + ' ' + timeFormat;

            // Substitui as letras por zeros para a máscara de caracteres do StringMask
            var maskPattern = dynamicFormat.replace(/[dMyHms]/g, '0');
            var dateTimeMask = new StringMask(maskPattern);
            var unformattedLength = maskPattern.replace(/[^0-9]/g, '').length;

            function formatter(value) {
                if (ctrl.$isEmpty(value)) {
                    return null;
                }

                var dataValida = normalizarParaObjetoDate(value);
                var cleanValue = value;

                if (dataValida) {
                    cleanValue = formatDate(dataValida, dynamicFormat);
                }

                cleanValue = cleanValue.replace(/[^0-9]/g, '').slice(0, unformattedLength);
                var formattedValue = dateTimeMask.apply(cleanValue) || '';

                return formattedValue.trim().replace(/[^0-9]$/, '');
            }

            ctrl.$formatters.push(formatter);

            ctrl.$parsers.push(function parser(value) {
                if (ctrl.$isEmpty(value)) {
                    return value;
                }

                var formattedValue = formatter(value);

                if (ctrl.$viewValue !== formattedValue) {
                    ctrl.$setViewValue(formattedValue);
                    ctrl.$render();
                }

                return attrs.parse === 'false'
                    ? formattedValue
                    : parseDate(formattedValue, dynamicFormat, new Date());
            });

            ctrl.$validators.dateTime = function validator(modelValue, viewValue) {
                if (ctrl.$isEmpty(modelValue)) {
                    return true;
                }

                return isValidDate(parseDate(viewValue, dynamicFormat, new Date())) && viewValue.length === dynamicFormat.length;
            };
        }
    };
}

DateTimeMaskDirective.$inject = ['$locale'];

module.exports = DateTimeMaskDirective;