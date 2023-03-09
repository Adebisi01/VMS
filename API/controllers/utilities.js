const getQueryString = (data) => {
  const dataList = Object.entries(data);
  let queryString = dataList.map(([key, value] = data) => {
    let string = "";
    string = string + `${key} = "${value}"`;
    return string;
  });
  queryString = queryString.join();
  return queryString;
};
const searchQueryString = (keys, values) => {
  const searchString = keys.map(
    (key, i) => `${key} = ${values[i]} ${i !== keys.length ? "AND" : ""}`
  );
  return searchString;
};
const getTableType = (type) => {
  visitorType =
    type === "general"
      ? "visitors"
      : type === "expected"
      ? "expected_visitors"
      : type === "regular"
      ? "regular_visitor"
      : "";
  return visitorType;
};
const hash = async (password) => {
  password = await bcrypt.hash(password, saltRounds);
  return password;
};
const compare = async (password, dbPassword) => {
  const result = await bcrypt.compare(password, dbPassword);
  return result;
};
module.exports = {
  getQueryString,
  getTableType,
  hash,
  compare,
  searchQueryString,
};
