window.onload = async function () {
    let config = await this.loadConfig();
    this.loadSections(config);
    this.loadStyleSheet(config);
    this.initSearchBar(config);
    this.initStyleButton();
};

const searchBarId = "search-bar-input";
const styleButtonId = "style-button";
const tableId = "sections-table";

function initSearchBar(config) {
    clearAndFocus();

    document
        .getElementById(searchBarId)
        .addEventListener("keypress", (event) => {
            if (event.key != "Enter") return;

            let query = document.getElementById(searchBarId).value;

            let searchUrl;

            if (isUrl(query)) {
                searchUrl = query;
            } else if (isSearchKey(query)) {
                queryKey = query.substring(0, 1);
                config["search-keys"].forEach((element) => {
                    if (element["queryKey"] == queryKey) {
                        searchUrl =
                            config["default-search-engine"].uri +
                            element["name"] +
                            " " +
                            query.substring(2, query.length);
                    }
                });
            } else if (isSearchEngine(query)) {
                queryKey = query.substring(0, 2);
                config["search-engines"].forEach((element) => {
                    if (element["queryKey"] == queryKey) {
                        searchUrl =
                            element.uri + query.substring(2, query.length);
                    }
                });
            } else {
                searchUrl = config["default-search-engine"].uri + query;
            }

            openInNewTab(searchUrl);

            clearAndFocus();
        });
}

function isSearchKey(query) {
    const command = query.substring(0, 2);

    return command.match(/[a-z] /);
}

function isSearchEngine(query) {
    const command = query.substring(0, 2);

    return command.match(/\/[a-z]/);
}

function isUrl(query) {
    return query.match(/\b(https?:\/\/\S*\b)/g);
}

function openInNewTab(url) {
    window.open(url, "_blank").focus();
}

function openInSameTab(url) {
    window.location = searchURL;
}

function clearAndFocus() {
    document.getElementById(searchBarId).value = "";
    document.getElementById(searchBarId).focus();
}

function initStyleButton() {
    document
        .getElementById(styleButtonId)
        .addEventListener("click", (event) => {
            if (
                document
                    .getElementById(styleButtonId)
                    .getAttribute("isLight") == "true"
            ) {
                loadDarkStyleSheet();
            } else {
                loadLightStyleSheet();
            }
        });
}

function loadLightStyleSheet() {
    const lightNode = "<link rel='stylesheet' href='css/white.css'>";
    document.head.innerHTML += lightNode;
    document.getElementById(styleButtonId).setAttribute("isLight", true);
}

function loadDarkStyleSheet() {
    const darkNode = "<link rel='stylesheet' href='css/dark.css'>";
    document.head.innerHTML += darkNode;
    document.getElementById(styleButtonId).setAttribute("isLight", false);
}

function loadStyleSheet(config) {
    const morningStart = config["light-theme-start"];
    const morningEnd = config["dark-theme-start"];

    let currentTime = new Date().getHours();
    if (morningStart <= currentTime && currentTime < morningEnd) {
        loadLightStyleSheet();
    } else {
        loadDarkStyleSheet();
    }
}

async function loadConfig() {
    return await fetch("./config.json").then((response) => {
        return response.json();
    });
}

async function loadSections(config) {
    let sectionsHtml = Object.keys(config.sections).map((x) => {
        let section = config.sections[x];
        let mappedSection = Object.keys(section.links).map((y) => {
            let sectionLinks = section.links[y];
            return `<a href="${sectionLinks.uri}">${sectionLinks.name}</a>`;
        });
        return `<tr>
                    <th id=${section["css-name"]}>${section.name}
                        <td>
                            >>
                            ${mappedSection.join(` / `)}
                        </td>
                    </th>
                </tr>`;
    });
    document.getElementById(tableId).innerHTML += sectionsHtml.join("");
}
