"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.test = void 0;
function test(expression) {
    var messages = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        messages[_i - 1] = arguments[_i];
    }
    if (expression)
        return false;
    // Default message
    if (messages.length === 0)
        messages.push('console.assert');
    return {
        method: 'error',
        data: __spreadArray(["Assertion failed:"], messages, true)
    };
}
exports.test = test;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzZXJ0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL0hvb2svcGFyc2UvbWV0aG9kcy9hc3NlcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsU0FBZ0IsSUFBSSxDQUFDLFVBQWU7SUFBRSxrQkFBa0I7U0FBbEIsVUFBa0IsRUFBbEIscUJBQWtCLEVBQWxCLElBQWtCO1FBQWxCLGlDQUFrQjs7SUFDdEQsSUFBSSxVQUFVO1FBQUUsT0FBTyxLQUFLLENBQUE7SUFFNUIsa0JBQWtCO0lBQ2xCLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDO1FBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO0lBRTFELE9BQU87UUFDTCxNQUFNLEVBQUUsT0FBTztRQUNmLElBQUksaUJBQUcsbUJBQW1CLEdBQUssUUFBUSxPQUFDO0tBQ3pDLENBQUE7QUFDSCxDQUFDO0FBVkQsb0JBVUMifQ==