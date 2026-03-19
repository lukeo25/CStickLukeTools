"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var reducer_1 = __importDefault(require("./reducer"));
var state_1 = require("./state");
function dispatch(action) {
    (0, state_1.update)((0, reducer_1["default"])(state_1.state, action));
}
exports["default"] = dispatch;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlzcGF0Y2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvSG9vay9zdG9yZS9kaXNwYXRjaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUNBLHNEQUE4QjtBQUM5QixpQ0FBdUM7QUFFdkMsU0FBUyxRQUFRLENBQUMsTUFBYztJQUM5QixJQUFBLGNBQU0sRUFBQyxJQUFBLG9CQUFNLEVBQUMsYUFBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUE7QUFDL0IsQ0FBQztBQUVELHFCQUFlLFFBQVEsQ0FBQSJ9