"use strict";

import * as vscode from "vscode";
import parseQuery from "./parser";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      "extension.convert",
      async (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) => {
        const getFullRange = (): vscode.Range => {
          var lastLine = textEditor.document.lineAt(
            textEditor.document.lineCount - 1
          );

          return new vscode.Range(
            new vscode.Position(0, 0),
            new vscode.Position(
              textEditor.document.lineCount - 1,
              lastLine.range.end.character
            )
          );
        };

        const regex = /(?:exec)*\s*sp_executesql\s+N'([\s\S]*)'\s*,\s*N'(@[\s\S]*?)'\s*,\s*([\s\S]*)/;
        const text = textEditor.document.getText();
        const match = regex.exec(text);

        if (match) {
          // convert sp_executesql query to sql query
          const newText = parseQuery(match[2], match[3], match[1]);

          await textEditor.edit(
            (editBuilder: vscode.TextEditorEdit) => {
              editBuilder.replace(getFullRange(), newText);
            },
            { undoStopBefore: true, undoStopAfter: false }
          );

          // move anchor to first of the document
          textEditor.selections = [new vscode.Selection(0, 0, 0, 0)];

          // run editor code format
          vscode.commands.executeCommand("editor.action.formatDocument");

          // move scrolls to best view
          textEditor.revealRange(new vscode.Range(0, 0, 0, 0));
        }
      }
    )
  );
}

export function deactivate() {}
