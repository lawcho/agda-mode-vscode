// Generated by BUCKLESCRIPT, PLEASE EDIT WITH CARE
'use strict';

var Vscode = require("vscode");
var $$Promise = require("reason-promise/lib/js/src/js/promise.js");
var Mocha$BsMocha = require("bs-mocha/lib/js/src/Mocha.bs.js");
var Promise$BsMocha = require("bs-mocha/lib/js/src/Promise.bs.js");
var Editor$AgdaModeVscode = require("../../src/Editor.bs.js");
var States$AgdaModeVscode = require("../../src/States.bs.js");

var source = "\ndata ℕ : Set where\n  Z : ℕ\n  S : ℕ → ℕ\n";

var AgdaMode = States$AgdaModeVscode.Impl({
      Disposable: Editor$AgdaModeVscode.Disposable,
      Point: {
        line: Editor$AgdaModeVscode.Point.line,
        column: Editor$AgdaModeVscode.Point.column,
        make: Editor$AgdaModeVscode.Point.make,
        translate: Editor$AgdaModeVscode.Point.translate,
        compare: Editor$AgdaModeVscode.Point.compare
      },
      $$Range: Editor$AgdaModeVscode.$$Range,
      editorType: Editor$AgdaModeVscode.editorType,
      getExtensionPath: Editor$AgdaModeVscode.getExtensionPath,
      getFileName: Editor$AgdaModeVscode.getFileName,
      save: Editor$AgdaModeVscode.save,
      isAgda: Editor$AgdaModeVscode.isAgda,
      onDidChangeFileName: Editor$AgdaModeVscode.onDidChangeFileName,
      onDidChangeActivation: Editor$AgdaModeVscode.onDidChangeActivation,
      onDidCloseEditor: Editor$AgdaModeVscode.onDidCloseEditor,
      registerCommand: Editor$AgdaModeVscode.registerCommand,
      setContext: Editor$AgdaModeVscode.setContext,
      addToSubscriptions: Editor$AgdaModeVscode.addToSubscriptions,
      Config: {
        getAgdaPath: Editor$AgdaModeVscode.Config.getAgdaPath,
        setAgdaPath: Editor$AgdaModeVscode.Config.setAgdaPath,
        getLibraryPath: Editor$AgdaModeVscode.Config.getLibraryPath,
        getHighlightingMethod: Editor$AgdaModeVscode.Config.getHighlightingMethod,
        getBackend: Editor$AgdaModeVscode.Config.getBackend
      },
      View: {
        make: Editor$AgdaModeVscode.View.make,
        destroy: Editor$AgdaModeVscode.View.destroy,
        show: Editor$AgdaModeVscode.View.show,
        hide: Editor$AgdaModeVscode.View.hide,
        focus: Editor$AgdaModeVscode.View.focus,
        send: Editor$AgdaModeVscode.View.send,
        on: Editor$AgdaModeVscode.View.on
      },
      Decoration: {
        decorate: Editor$AgdaModeVscode.Decoration.decorate,
        highlightBackground: Editor$AgdaModeVscode.Decoration.highlightBackground,
        highlightBackgroundWithColor: Editor$AgdaModeVscode.Decoration.highlightBackgroundWithColor,
        decorateText: Editor$AgdaModeVscode.Decoration.decorateText,
        decorateTextWithColor: Editor$AgdaModeVscode.Decoration.decorateTextWithColor,
        overlayText: Editor$AgdaModeVscode.Decoration.overlayText,
        overlayTextWithColor: Editor$AgdaModeVscode.Decoration.overlayTextWithColor,
        underlineText: Editor$AgdaModeVscode.Decoration.underlineText,
        destroy: Editor$AgdaModeVscode.Decoration.destroy
      },
      focus: Editor$AgdaModeVscode.focus,
      getSelectionRange: Editor$AgdaModeVscode.getSelectionRange,
      getSelectionRanges: Editor$AgdaModeVscode.getSelectionRanges,
      getCursorPosition: Editor$AgdaModeVscode.getCursorPosition,
      getCursorPositions: Editor$AgdaModeVscode.getCursorPositions,
      setCursorPosition: Editor$AgdaModeVscode.setCursorPosition,
      onChangeCursorPosition: Editor$AgdaModeVscode.onChangeCursorPosition,
      rangeForLine: Editor$AgdaModeVscode.rangeForLine,
      pointAtOffset: Editor$AgdaModeVscode.pointAtOffset,
      offsetAtPoint: Editor$AgdaModeVscode.offsetAtPoint,
      fromAgdaOffset: Editor$AgdaModeVscode.fromAgdaOffset,
      toAgdaOffset: Editor$AgdaModeVscode.toAgdaOffset,
      getText: Editor$AgdaModeVscode.getText,
      getTextInRange: Editor$AgdaModeVscode.getTextInRange,
      selectText: Editor$AgdaModeVscode.selectText,
      setText: Editor$AgdaModeVscode.setText,
      insertText: Editor$AgdaModeVscode.insertText,
      deleteText: Editor$AgdaModeVscode.deleteText,
      onChange: Editor$AgdaModeVscode.onChange,
      copyToClipboard: Editor$AgdaModeVscode.copyToClipboard,
      colorThemeIsDark: Editor$AgdaModeVscode.colorThemeIsDark,
      lineEndingIsCRLF: Editor$AgdaModeVscode.lineEndingIsCRLF
    });

function openTextEditor(content) {
  return $$Promise.flatMap(Vscode.workspace.openTextDocument({
                  content: content,
                  language: "agda"
                }), (function (textDocument) {
                return Vscode.window.showTextDocument(textDocument, undefined);
              }));
}

Mocha$BsMocha.describe_only("Case split")(undefined, undefined, undefined, (function (param) {
        return Promise$BsMocha.it("should load the source")(undefined, undefined, undefined, (function (param) {
                      return $$Promise.Js.toBsPromise($$Promise.flatMap(openTextEditor(source), (function (textEditor) {
                                        return $$Promise.tap(Vscode.commands.executeCommand("agda-mode:load"), (function (param) {
                                                      console.log("agda-mode loaded");
                                                      
                                                    }));
                                      })));
                    }));
      }));

var Assert;

var P;

exports.Assert = Assert;
exports.P = P;
exports.source = source;
exports.AgdaMode = AgdaMode;
exports.openTextEditor = openTextEditor;
/* AgdaMode Not a pure module */