/***************************************************************************
*     Author: Rishabh Sharma                                               *
*    Company: Newgen Software Technologies Ltd.                            * 
*       Date: 08 Aug 2016 12:12                                            *
****************************************************************************/

(function () {
    'use strict';

    var _historyHelper;

    _historyHelper = (function () {

        //Available Sets of Colors
        var userAbbrColors = ["#00FF2A", "#0055FF", "#FFAA55", "#FFAAAA", "#AAFF55", "#FF00AA", "#00D4FF", "#5B60F9",
                              "#D4EF65", "#D7F928", "#47E1C8", "#9B900E", "#26ED5E", "#E68C2C", "#5369BF", "#EC2626"];

        //Track of already assigned colors
        var changeHistoryUniqueColor = {};

        return new function () {
            this.getUniqueAbbrColor = function (userId) {
                //nothing extraordinary going on here
                //just used character literal 'x' as prefix to userId to make up a key
                if (!changeHistoryUniqueColor['x' + userId]) {
                    changeHistoryUniqueColor['x' + userId] = userAbbrColors[parseInt(Math.random() * userAbbrColors.length)];
                }

                return changeHistoryUniqueColor['x' + userId];
            }
        }
    })();

    var _u = {
        a: function (obj) {
            if (!obj)
                return obj;
            else
                return angular.element(obj);
        },
        safeApply: function (scope, fn) {
            if (scope.$$phase) {
                if (fn instanceof Function)
                    fn();
            } else {
                scope.$apply(fn);
            }
        },
        getExpr: function (val) {
            var splits = val.split(/[\s,{{,}}]+/);
            var expr = null;
            for (var i = 0, max = splits.length ; i < max ; i++) {
                if (splits[i] && splits[i] != '' && !angular.isUndefined(splits[i])) {
                    expr = splits[i];
                    break;
                }
            }
            return expr;
        },
        evalNavigation: function (obj, navs) {
            var data = obj;
            var navs = navs.split('.');
            for (var i = 0, max = navs.length ; i < max ; i++)
                data = data[navs[i]];
            return data;
        },
        evalExpression: function (scope, expr) {
            var evaluate = false;
            var indexFaceOn = expr.indexOf('{{');
            var indexFaceOff = expr.indexOf('}}');
            if (indexFaceOn > -1 && indexFaceOff > -1)
                return scope.$eval(this.getExpr(expr));
            else
                return expr;
        },
		splitAtFirstStop: function(str){
			return str.substring(str.indexOf('.')+1, str.length);
		}
    };

    var projectChangeHistoryDirective = angular.module("project.change.history", [])

    .directive("projectChangeHistory", ['$timeout', '$filter', '$stateParams', function ($timeout, $filter, $stateParams) {
        return {
            restrict: 'EA',
            scope: {},
            templateUrl: 'app/partials/directive-templates/projectChangeHistory.tpl.html',
            link: function (scope, elem, attr) {
                var _elem = angular.element(elem);
                var _projectId = $stateParams.id;

                if (!_projectId) {
                    console.error("ProjectChangeHistory: No ProjectId found");
                    return;
                }

                scope.$changeHistories = null;

                //get ChangeHistories
                // datacontext.changehistory.getAllByEntityId(_projectId).then(function (data) {
                //     var unformattedChangeHistories = data;

                //     if (unformattedChangeHistories.length > 0) {
                //         //group change history in terms of userName and createdDate
                //         scope.$changeHistories = $filter('groupByProperties')(unformattedChangeHistories, 'personId, createdDate');

                //         registerEvents();
                //     }
                // });

                scope.$getUniqueColor = function (personId) {
                    return _historyHelper.getUniqueAbbrColor(personId);
                }

                function registerEvents() {
                    //wait for atleast 100 ms for html to get rendered and then register events
                    $timeout(function () {
                        var changeHistoryBriefLine = _elem.find('.change-histories .change-history-elem .change-history-brief');
                        var fieldsEntryPoint = _elem.find('.change-histories .change-history-elem .change-history-detail div:nth-child(1)');

                        //when Brief description is clicked open up 'Fields'
                        _aelem(changeHistoryBriefLine).on('click', function (event) {
                            addOrRemoveClass(event);
                        });

                        //when 'Fields' is clicked -> show table 
                        _aelem(fieldsEntryPoint).on('click', function (event) {
                            addOrRemoveClass(event);
                        });

                        //on mouseover color some of the spans blue
                        _aelem(changeHistoryBriefLine).on('mouseover', highlightChangeHistoryBrief);
                        _aelem(fieldsEntryPoint).on('mouseover', highlightChangeHistoryFieldsLabel);

                        //revert back the colors once mouse is out
                        _aelem(changeHistoryBriefLine).on('mouseout', unHighlightChangeHistoryBrief);
                        _aelem(fieldsEntryPoint).on('mouseout', unHighlightChangeHistoryFieldsLabel);
                    }, 200);
                }

                //return angular element
                function _aelem(elem) {
                    return angular.element(elem);
                }

                function highlightChangeHistoryBrief(event) {
                    _aelem(_aelem(event.currentTarget).find('span')[2]).css('color', '#007ACC');
                    _aelem(_aelem(event.currentTarget).find('span')[3]).css('color', '#007ACC');
                    _aelem(_aelem(event.currentTarget.children[0])).css('color', '#007ACC');
                }

                function unHighlightChangeHistoryBrief(event) {
                    _aelem(_aelem(event.currentTarget).find('span')[2]).css('color', '#2C2C2C');
                    _aelem(_aelem(event.currentTarget).find('span')[3]).css('color', '#6D6D6D');
                    _aelem(_aelem(event.currentTarget.children[0])).css('color', 'black');
                }

                function highlightChangeHistoryFieldsLabel(event) {
                    _aelem(event.currentTarget.children[0]).css('color', '#007ACC');
                }

                function unHighlightChangeHistoryFieldsLabel(event) {
                    _aelem(event.currentTarget.children[0]).css('color', 'black');
                }

                //add when not already present and remove if already present (class: change-history-elem-visible)
                function addOrRemoveClass(event) {
                    var nextElementSibling = _aelem(event.currentTarget.nextElementSibling);
                    if (event.currentTarget.nextElementSibling && event.currentTarget.nextElementSibling.classList.contains('change-history-elem-visible')) {
                        nextElementSibling.removeClass('change-history-elem-visible');
                        _aelem(event.currentTarget.children[0]).css({ 'transform': 'rotate(0deg)', 'color': 'black' });
                    } else {
                        nextElementSibling.addClass('change-history-elem-visible');
                        _aelem(event.currentTarget.children[0]).css({ 'transform': 'rotate(45deg)', 'color': '#007ACC !important' });
                    }
                }
            }
        }
    }])

    .factory('chService', function () {
        var sectionCount = 0, // number of sections registered to create history
            submittedSection = 0; // number of sections submitted their history

        // @params defObj is deferred object passed in from datacontext's function save(hideToast)
        function submitHistories(defObj, hideToast) {
            submittedSection++;
            // when all sections have submitted their respective histories then call save
            if (submittedSection >= sectionCount) {
                // datacontext.createHistoryFn(false);
                // datacontext.save(hideToast).then(function () {
                //     submittedSection = 0; //reset 
                //     defObj.resolve(); //let function go through
                //     datacontext.createHistoryFn(true);
                // });                
            }
        }

        // register new section
        function registerSection() {
            sectionCount++;
            //datacontext.setHistorySection(true);
        }

        // unregister a section
        function deregisterSection() {
            sectionCount -= 1;
            // if(sectionCount <= 0)
            //     datacontext.setHistorySection(false);
        }

        var obj = {
            submitHistories: submitHistories,
            registerSection: registerSection,
            deregisterSection: deregisterSection,
            isSectionSet: false
        };

        return obj;
    })

    //parent directive
	.directive('changeHistorySection', ['chService', function (chService) {
	    return {
	        restrict: 'E',
	        require: 'changeHistorySection',
	        replace: true,
	        transclude: true,
	        controller: 'changeHistorySectionCtrl',
	        controllerAs: '$historySection',
	        link: function (scope, elem, attr, $historySection, transclude) {
	            // pass the scope
	            transclude(scope, function (clone) {
	                elem.append(clone);
	            });
	        }
	    }
	}])

	.controller('changeHistorySectionCtrl', ['$scope', '$element', '$attrs', '$timeout', 'chService', function ($scope, $element, $attrs, $timeout, chService) {
	    var $historySection = this,									
	        arr = [], // list of all the children of sections 
			defObj = null,
	        watched = 0; // deferred object passed in from datacontext's function save(hideToast)	    

	    chService.registerSection(); //increase section count

	    //name of the historySection
	    $historySection.$defaults = $scope.$eval($attrs['sDefaults']);
	    $historySection.$name = _u.evalExpression($scope, $attrs['sName']);
	    $historySection.$entity = $scope.$eval($attrs['sEntity']);
	    $historySection.$registerField = regFieldConfig;
	    $historySection.$revokeAndRegisterAgain = registerAllFields;

	    $scope.$watch($attrs['sEntity'], function (newValue, oldValue) {
	        if (newValue && newValue != '') {
	            $historySection.$entity = newValue;
	            watched++;
	            if (watched > 1) 
	                registerAllFields();
	        }
	    });

	    function registerAllFields() {
	        arr = [];
	        (function (elem) {
	            $timeout(function () {
	                var elements = elem.querySelectorAll('[ch]');
	                for (var i = 0, max = elements.length ; i < max ; i++)
	                    registerField(elements[i]);
	            });
	        })($element[0]);
	    }

	    function registerField(field) {
	        var aElem = _u.a(field),
                obj = {};

	        obj.$config = $scope.$eval(aElem.attr('ch-config'));	        
	        obj.ngModel = obj.$config && obj.$config.ngModel ? obj.$config.ngModel : aElem.attr('ng-model');
			obj.parentArr = obj.$config && obj.$config.parentArr ? $scope.$eval(obj.$config.parentArr) : null;
			obj.oldValue = !obj.parentArr ? $scope.$eval(obj.ngModel) : obj.parentArr[obj.$config.index][_u.splitAtFirstStop(obj.ngModel)];
	        obj.newValue = null;

	        arr.push(obj);
	    }

	    function regFieldConfig(config) {
	        var obj = {};
	        obj.$config = config;
	        obj.ngModel = obj.$config && obj.$config.ngModel ? obj.$config.ngModel : null;
			obj.parentArr = obj.$config && obj.$config.parentArr ? $scope.$eval(obj.$config.parentArr) : null;
	        obj.oldValue = !obj.parentArr ? $scope.$eval(obj.ngModel) : obj.parentArr[obj.$config.index][_u.splitAtFirstStop(obj.ngModel)];
	        obj.newValue = null;

	        arr.push(obj);
	    }

	    console.log('Registering History: ' + $historySection.$name);
	    $scope.$on('prepareHistory', function (event, data) {
	        console.log('Preparing History: ' + $historySection.$name);
	        //defObj = data.deferred;
	        for (var i = 0, max = arr.length ; i < max ; i++) {
	            arr[i].newValue = !arr[i].parentArr ? $scope.$eval(arr[i].ngModel) : arr[i].parentArr[arr[i].$config.index][_u.splitAtFirstStop(arr[i].ngModel)];
	            var entity = arr[i].$config && arr[i].$config.entity ? arr[i].$config.entity : $historySection.$entity,
					isAdded = false;
                    //isAdded = entity.entityAspect ? entity.entityAspect.entityState.name === 'Added' : false;
	            if ((arr[i].newValue && arr[i].newValue != '') || (arr[i].oldValue != arr[i].newValue)) {

	                
                    // prepare new history
	                //var changeHistory = datacontext.changehistory.create();
					var changeHistory = {};

	                changeHistory = angular.extend(changeHistory, $historySection.$defaults, arr[i].$config);
	                changeHistory.isAdded = isAdded;
	                changeHistory.createdDate = data.currentDate;
	                changeHistory.modifiedDate = data.currentDate;
	                changeHistory.oldValue = isAdded ? null : (arr[i].oldValue === '' ? null : arr[i].oldValue);
	                changeHistory.newValue = arr[i].newValue === '' ? null : arr[i].newValue;
	                changeHistory.sectionName = $historySection.$name;

	                arr[i].oldValue = arr[i].newValue;
	            }
	        }
	        chService.submitHistories(defObj, data.hideToast);
	    });

	    $scope.$on('$destroy', function () {
	        chService.deregisterSection();
	    });

	    registerAllFields();
	}]);
})();

