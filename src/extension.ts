"use strict";

import * as vscode from "vscode";

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

        const regex = /(?:exec)*\s*sp_executesql\s+N'([\s\S]*)',\s*N'(@[\s\S]*?)',\s*([\s\S]*)/;
        const text = textEditor.document.getText();
        const match = regex.exec(text);

        if (match) {
          let newText = "DECLARE " + match[2] + "\n";

          match[3].split(",").forEach((value: string) => {
            newText += "SET " + value + "\n";
          });

          newText += "\n" + match[1];

          await textEditor.edit((editBuilder: vscode.TextEditorEdit) => {
            editBuilder.replace(getFullRange(), newText);
          },
          { undoStopBefore: true, undoStopAfter: false });

          const formater = await vscode.commands.executeCommand(
            "vscode.executeFormatDocumentProvider",
            textEditor.document.uri,
            {}
          );

          if (formater) {
            await textEditor.edit(
              (editBuilder: vscode.TextEditorEdit) => {
                const edit = formater as vscode.TextEdit[];
                editBuilder.replace(getFullRange(), edit[0].newText);
              },
              { undoStopBefore: false, undoStopAfter: true }
            );
          }
        }
      }
    )
  );
}

export function deactivate() {}
