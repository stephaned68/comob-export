import { getData } from "./functions/api.js";

import { createElement, clearContent, flash } from "./functions/dom.js";

const version = "1.1.0"

const $universe = document.querySelector("#universe");
const $profile = document.querySelector("#profile");
const $json_char = document.querySelector("#json_char");
const $json_gear = document.querySelector("#json_gear");
const $copy = document.querySelector("#copy");

import { API_URL } from "./functions/api.js";

let profileList = [];

const voieInfo = {
  cof: [
    { title: "Profil" },
    { title: "Profil" },
    { title: "Profil" },
    { title: "Profil" },
    { title: "Profil" },
    { title: "Prestige" },
  ],
  coc: [{ title: "Profil" }, { title: "Profil" }, { title: "Profil" }],
  coct: [{ title: "Profil" }, { title: "Profil" }, { title: "Profil" }],
  cocy: [
    { title: "Profil" },
    { title: "Profil" },
    { title: "Profil" },
    { title: "Profil" },
    { title: "Historique" },
    { title: "Prestige" },
  ],
  cog: [
    { title: "Culturelle" },
    { title: "Professionnelle" },
    { title: "Professionnelle" },
    { title: "Espèce" },
    { title: "Hobby/Augmentation" },
    { title: "Prestige/Augmentation" },
  ],
};

/**
 * @typedef {object} Family
 * @property {string} id
 * @property {string} libelle
 *
 * @typedef {object} Profile
 * @property {string} profil
 * @property {string} nom
 * @property {string} description
 * @property {Family} famille
 */

function loadProfileData() {
  const universe = $universe.value;
  const profile = $profile.value;
  if (profile === "") return;
  const profileInfo = profileList.filter((prof) => {
    return prof.profil.trim() === profile.trim();
  })[0];
  const result = {
    profile: profileInfo.nom,
    family: profileInfo.famille.libelle,
    paths: [],
  };
  getData(`${API_URL}/abilities/${universe}/?profile=${profile}`, (data) => {
    const temp = {};
    data.forEach((ability) => {
      const path = ability.voie;
      const rank = {
        name: ability.capacite,
        description: ability.description,
        limitedUse: ability.limitee === 1 ? " (L)" : "",
        spell: ability.sort === 1 ? "*" : "",
        deladu: ability.voie_deladu,
      };
      if (!temp.hasOwnProperty(path)) {
        temp[path] = [];
      }
      temp[path].push(rank);
    });
    const paths = [];
    Object.keys(temp).forEach((path) => {
      const item = {
        name: path,
        abilities: temp[path],
      };
      item.full = `Voie ${temp[path][0].deladu}${path}`;
      temp[path].forEach((ability, ix) => {
        delete temp[path][ix].deladu;
      });
      paths.push(item);
    });
    getData(`${API_URL}/paths/${universe}/${profile}`, (data) => {
      data.forEach((path, ix) => {
        document.querySelector(`#voie${ix + 1}`).value = path.voie;
        result.paths.push(paths.filter((p) => p.name === path.nom)[0]);
      });
      $json_char.textContent = JSON.stringify(result);
    });
  });
  getData(`${API_URL}/equipments/${universe}?profile=${profile}`, (data) => {
    $json_gear.textContent = JSON.stringify(data);
  });
}

function sortProfiles(a, b) {
  if (a.famille.id.trim() < b.famille.id.trim()) return -1;
  if (a.famille.id.trim() > b.famille.id.trim()) return +1;
  if (a.profil.trim() < b.profil.trim()) return -1;
  if (a.profil.trim() > b.profil.trim()) return +1;
  return 0;
}

function loadProfiles(data) {
  $profile.appendChild(createElement("option", "Choisir...", { value: "" }));
  profileList = data.sort(sortProfiles);
  let groupId = profileList[0].famille.id;
  let optgroup = createElement("optgroup", null, {
    label: profileList[0].famille.libelle,
  });
  for (const profile of profileList) {
    const option = createElement("option", profile.nom, {
      value: profile.profil.trim(),
    });
    if (profile.famille.id !== groupId) {
      $profile.appendChild(optgroup);
      optgroup = createElement("optgroup", null, {
        label: profile.famille.libelle,
      });
      optgroup.appendChild(option);
      groupId = profile.famille.id;
    } else {
      optgroup.appendChild(option);
    }
  }
  $profile.appendChild(optgroup);
}

function resetPathNames(universe) {
  const defaultPath = { title: "Autre" };
  document.querySelectorAll(".voie-nom").forEach((label) => {
    label.textContent = "";
    if (!voieInfo[universe]) return;
    const vn = parseInt(label.id.charAt(4));
    const voie = voieInfo[universe][vn - 1] || defaultPath;
    label.textContent = voie.title + " :";
  });
}

function loadPathSelect($path) {
  clearContent($path);
  $path.appendChild(createElement("option", "Choisir...", { value: "" }));
  // base / un-categorized paths
  getData(`${API_URL}/paths/${$universe.value}/?type=%20`, (data) => {
    let optgroup = createElement("optgroup", null, { label: "Base" });
    data.forEach((path) => {
      const option = createElement("option", path.nom, {
        value: path.voie.trim(),
      });
      optgroup.appendChild(option);
    });
    $path.appendChild(optgroup);
  });
  // path types
  getData(`${API_URL}/types/paths/${$universe.value}`, (data) => {
    data.forEach((type) => {
      if (!type.type_voie_config) {
        let optgroup = createElement("optgroup", null, {
          label: type.type_voie_intitule,
        });
        // typed paths
        getData(
          `${API_URL}/paths/${$universe.value}/?type=${type.type_voie}`,
          (data) => {
            data.forEach((path) => {
              const option = createElement("option", path.nom, {
                value: path.voie.trim(),
              });
              optgroup.appendChild(option);
            });
          }
        );
        $path.appendChild(optgroup);
      }
    });
    loadProfileData();
  });
}

function onUniverseChanged(e) {
  const universe = $universe.value;
  resetPathNames(universe);
  if (universe === "") return;
  clearContent($profile);
  getData(`${API_URL}/profiles/${$universe.value}`, loadProfiles);
}

function onProfileChanged(e) {
  document.querySelectorAll(".path-select").forEach(loadPathSelect);
}

function onCopyClicked(e) {
  let copyData;
  if (!navigator.clipboard) {
    $json_char.select();
    document.execCommand("copy");
  } else {
    copyData = {
      character: JSON.parse($json_char.innerHTML),
      gears: JSON.parse($json_gear.innerHTML),
    }
    navigator.clipboard.writeText(JSON.stringify(copyData));
  }
  flash("Profil JSON copié vers le presse-papier", "success");
}

function onPathChanged(e) {
  let jsonData = JSON.parse($json_char.textContent);
  if (!jsonData) return;
  const pathId = this.dataset.id;
  while (jsonData.paths.length < pathId) {
    jsonData.paths.push({});
  }
  if (this.value === "") {
    jsonData.paths[pathId - 1] = {};
    $json_char.textContent = JSON.stringify(jsonData);
    return;
  }
  const url = `${API_URL}/abilities/${$universe.value}/${this.value}`;
  getData(url, (data) => {
    const name = data[0].voie;
    let path = {
      name,
      abilities: [],
      full: `Voie ${data[0].voie_deladu}${name}`,
    };
    data.forEach((ability) => {
      path.abilities.push({
        name: ability.nom,
        description: ability.description,
        limitedUse: ability.limitee + "",
        spell: ability.sort + "",
      });
    });
    jsonData.paths[pathId - 1] = path;
    $json_char.textContent = JSON.stringify(jsonData);
  });
}

/**
 * Main process
 */
document.querySelector("h1")?.title=`Version ${version}`;

getData(`${API_URL}/datasets?all=1`, (data) => {
  $universe.appendChild(createElement("option", "Choisir...", { value: "" }));
  for (const dataset of data) {
    $universe.appendChild(
      createElement("option", dataset.name, { value: dataset.dbid })
    );
  }
});

$universe.addEventListener("change", onUniverseChanged);

$profile.addEventListener("change", onProfileChanged);

document.querySelectorAll(".path-select").forEach((select) => {
  select.addEventListener("change", onPathChanged);
});

$copy.addEventListener("click", onCopyClicked);
