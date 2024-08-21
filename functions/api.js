import { flash } from "./dom.js";

export function getData(url, callback, options = {}) {
  fetch(url, options)
    .then((response) => response.json())
    .then(
      (jsonData) => {
        if (jsonData.rs) callback(jsonData.rs);
        else console.log(jsonData.error);
      },
      (error) => {
        flash("Network error - " + error.message, "danger");
      }
    );
}

export function getActionTypes(ability) {
  let result = {
    limitedUse: "",
    spell: "",
    actionType: ""
  };
  result.limitedUse = ability.limitee === 1 ? " (L)" : "";
  result.spell = ability.sort === 1 ? "*" : "";
  switch (ability.action) {
    case 1:
      result.actionType = " (G)";
      break;
    case 2:
      result.actionType = " (M)";
      break;
    case 3:
      result.actionType = " (A)";
      break;
  }
  return result;
}

let apiURL;
if (
  document.location.hostname == "127.0.0.1" ||
  document.location.hostname == "localhost" ||
  document.location.hostname == ""
) {
  apiURL = "http://localhost:8800";
} else {
  apiURL = `${ document.location.protocol }//co-api.alwaysdata.net`;
}
export const API_URL = apiURL;
