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
          let parameters = match[2].split(",");
          let newText = "DECLARE " + match[2] + "\n";

          match[3].split(",").forEach((value,index) => {
            if (value[0]!=='@')
            {
              value =  parameters[index].split(' ')[0] + '=' + value;
            }
            newText += "SET " + value + "\n";
          });

          newText += "\n" + match[1] + "\n";
          
          await textEditor.edit((editBuilder: vscode.TextEditorEdit) => {            
            editBuilder.replace(getFullRange(), newText);
          },
          { undoStopBefore: true, undoStopAfter: false });          
          
          // move anchor to first of the document
          textEditor.selections = [new vscode.Selection(0,0,0,0)];

          // run editor code format
          vscode.commands.executeCommand("editor.action.formatDocument");
          
          // move scrolls to best view
          textEditor.revealRange(new vscode.Range(0,0,0,0));          
        }
      }
    )
  );
}

export function deactivate() {}
