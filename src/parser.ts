import * as vscode from "vscode";

function normalizeQuery(query: string) {
  return query.replace(/''/g, "'");
}

function doesParamFloatExistInParamDeclaration(parameterDeclaration:string, paramName:string){  
  let paramWithUpperType = paramName + " FLOAT";
  let paramWithLowerType = paramName + " float";
  let indexOfUpper = parameterDeclaration.indexOf(paramWithUpperType);
  let indexOfLower = parameterDeclaration.indexOf(paramWithLowerType);

  if (indexOfUpper != -1 || indexOfLower != -1){
    return true;
  }

  return false;
}

function isParamSurroundedWithSingleQuotes(paramValue:string){
  if (paramValue[0] != "'" && paramValue[paramValue.length] != "'"){
    return true;
  }

  return false;
}

function surroundFloatWithQuotesFlow(parameterDeclaration:string, paramName:string, paramValue:string, value:string, paramDict:Map<string, string>){
  if (doesParamFloatExistInParamDeclaration(parameterDeclaration, paramName)){
    if (isParamSurroundedWithSingleQuotes(paramValue)){
        paramValue = "'" + paramValue + "'";
        paramDict.set(paramName, paramValue);

        value = paramName + "=" + paramValue;
        return value;
    }
  }

  return value;
}

function replaceParamInQueryFlow(paramDict:Map<string, string>, normalizedQuery:string){
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
    paramDict.set(paramName, paramValue);   
    
    if (isSurroundFloatWithSingleQuotesEnabled){
      value = surroundFloatWithQuotesFlow(parameterDeclaration, paramName, paramValue, value, paramDict);
    }

    result += "SET " + value + "\n";
  });

  let normalizedQuery = normalizeQuery(query);
  
  if (isInlineParamEnabled){
    normalizedQuery = replaceParamInQueryFlow(paramDict, normalizedQuery);
  }

  result += "\n" + normalizedQuery + "\n";

  return result;
}

export default parseQuery;
