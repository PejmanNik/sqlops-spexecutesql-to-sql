function normalizeQuery(query: string) {
  return query.replace(/''/g, "'");
}

function parseQuery(
  parameterDeclaration: string,
  parameterValue: string,
  query: string
) {
  let parameters = parameterDeclaration.split(",");
  let result = "DECLARE " + parameterDeclaration + "\n";

  parameterValue.split(",").forEach((value, index) => {
    if (value[0] !== "@") {
      value = parameters[index].split(" ")[0] + "=" + value;
    }
    result += "SET " + value + "\n";
  });

  result += "\n" + normalizeQuery(query) + "\n";

  return result;
}

export default parseQuery;
