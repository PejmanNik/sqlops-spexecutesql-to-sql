import * as vscode from "vscode";

function normalizeQuery(query: string) {
  return query.replace(/''/g, "'");
}

function doesFloatParamExistInDeclaration(parameterDeclaration:string, paramName:string){  
  let paramWithType = paramName.toLowerCase() + " float";  
  let indexOfParamWithType = parameterDeclaration.toLowerCase().indexOf(paramWithType);

  if (indexOfParamWithType != -1){
    return true;
  }

  return false;
}

function isParamAlreadyInSingleQuotes(paramValue:string){
  if (paramValue[0] == "'" && paramValue[paramValue.length - 1] == "'"){
    return true;
  }

  return false;
}

function getQuotedFloatValue(parameterDeclaration:string, paramName:string, paramValue:string): string{
  // Either the parameter isn't a float or it's already in quotes
  // In this case just return the value.
  if(!doesFloatParamExistInDeclaration(parameterDeclaration, paramName) || isParamAlreadyInSingleQuotes(paramValue)){
    return paramValue;
  }

  return "'" + paramValue + "'";
}

function replaceParamInQuery(paramDict:Map<string, string>, normalizedQuery:string){
  paramDict.forEach((value:string, key:string) => {    
    normalizedQuery = normalizedQuery.split(key).join(value);
  })

  return normalizedQuery;
}

function parseQuery(
  parameterDeclaration: string,
  parameterValue: string,
  query: string
) {
  let parameters = parameterDeclaration.split(",");
  let result = "DECLARE " + parameterDeclaration + "\n";  

  let paramDict = new Map<string, string>();
  const isSurroundFloatWithSingleQuotesEnabled = vscode.workspace.getConfiguration().get('spexecutesql.surroundFloatWithSingleQuotes');
  const isInlineParamEnabled = vscode.workspace.getConfiguration().get('spexecutesql.replaceVariablesInQuery');;

  parameterValue.split(",").forEach((value, index) => {
    value = value.trim();

    if (value[0] !== "@") {
      value = parameters[index].split(" ")[0] + "=" + value;
    }

    let paramName = value.split("=")[0];
    let paramValue = value.split("=")[1];
    
    if (isSurroundFloatWithSingleQuotesEnabled){
      paramValue = getQuotedFloatValue(parameterDeclaration, paramName, paramValue);
    }

    paramDict.set(paramName, paramValue);

    result += "SET " + paramName + "=" + paramValue + "\n";
  });

  let normalizedQuery = normalizeQuery(query);
  
  if (isInlineParamEnabled){
    normalizedQuery = replaceParamInQuery(paramDict, normalizedQuery);
  }

  result += "\n" + normalizedQuery + "\n";

  return result;
}

export default parseQuery;
