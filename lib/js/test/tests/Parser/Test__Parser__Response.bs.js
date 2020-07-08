// Generated by BUCKLESCRIPT, PLEASE EDIT WITH CARE
'use strict';

var Belt_Array = require("bs-platform/lib/js/belt_Array.js");
var Mocha$BsMocha = require("bs-mocha/lib/js/src/Mocha.bs.js");
var Assert$BsMocha = require("bs-mocha/lib/js/src/Assert.bs.js");
var Promise$BsMocha = require("bs-mocha/lib/js/src/Promise.bs.js");
var Response$AgdaModeVscode = require("../../../src/Response.bs.js");
var Test__Util$AgdaModeVscode = require("../Test__Util.bs.js");
var Test__Parser__SExpression$AgdaModeVscode = require("./Test__Parser__SExpression.bs.js");

function toResponses(exprs) {
  return Belt_Array.concatMany(Belt_Array.map(Belt_Array.map(exprs, Response$AgdaModeVscode.parse), (function (e) {
                    if (!e.tag) {
                      return [e[0]];
                    }
                    Assert$BsMocha.fail(e[0]);
                    return [];
                  })));
}

Mocha$BsMocha.describe_skip("when parsing responses")(undefined, undefined, undefined, (function (param) {
        return Belt_Array.forEach(Test__Util$AgdaModeVscode.Golden.getGoldenFilepathsSync("../../../../test/tests/Parser/Response"), (function (filepath) {
                      return Promise$BsMocha.it("should golden test " + filepath)(undefined, undefined, undefined, (function (param) {
                                    return Test__Util$AgdaModeVscode.Golden.readFile(filepath).then((function (raw) {
                                                  var partial_arg = [];
                                                  return Test__Util$AgdaModeVscode.Golden.compare(Test__Util$AgdaModeVscode.Golden.map(Test__Util$AgdaModeVscode.Golden.map(Test__Util$AgdaModeVscode.Golden.map(raw, (function (param) {
                                                                            return Test__Parser__SExpression$AgdaModeVscode.parseSExpression(partial_arg, param);
                                                                          })), toResponses), (function (param) {
                                                                    return Test__Util$AgdaModeVscode.serializeWith(Response$AgdaModeVscode.toString, param);
                                                                  })));
                                                }));
                                  }));
                    }));
      }));

exports.toResponses = toResponses;
/*  Not a pure module */