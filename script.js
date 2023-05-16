// link-to implementation
class LinkTo extends HTMLElement {
    get hasPage() {
        return this.hasAttribute("page");
    }

    constructor() {
        super();
    }

    connectedCallback() {
        if (this.hasPage) {
            // Transform this link-to into an anchor.
            this.innerHTML = `<a href="loader.html?page=${this.attributes.page.value}.txt">${this.innerHTML}</a>`;
        }
    }
}
window.customElements.define('link-to', LinkTo); // Register.

class SectionHeading extends HTMLElement {
    get hasTitle() {
        return this.hasAttribute("title");
    }

    constructor() {
        super();
    }

    connectedCallback() {
        if (this.hasTitle) {
            this.innerHTML = `<details><summary id="section-head">${this.attributes.title.value}</summary>${this.innerHTML}</details>`;
        }
    }
}
window.customElements.define('section-heading', SectionHeading); // Register.

function showSpoiler(buttonNode, spoilerId) {
    document.getElementById(spoilerId).style.display = 'block';
    buttonNode.style.display = 'none';
}

function doSearch() {
    window.location.assign(`search.html?q=${document.getElementById("search_field").value}`);
}

function getParameterByName(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

async function populateIndex() {
    let file = "index.txt";

    let indexResponse = await fetch(file);
    let indexText = await indexResponse.text();

    let index = indexText.split(/\r?\n/);
    let indexTag = document.getElementById('index');

    if (index.length > 0) indexTag.innerHTML = "";

    for (let element of index) {
        let anchor = document.createElement('a');
        let elementSplit = element.split("->");

        // Some fancy categories.
        let header = document.createElement('p');
        let category = elementSplit[1];
        let categoryName = category.replaceAll(' ', '');
        let categoryHeader = document.createElement('div');

        if (indexTag.querySelector(`#${categoryName}`) == null) {
            indexTag.appendChild(header);
        }

        header.id = categoryName;
        categoryHeader.innerHTML = `<b>${category.trim()}</b>\n`;
        header.appendChild(categoryHeader);

        // Linkify the text
        let elementLink =
            `loader.html?page=${elementSplit[2].trim()}.txt`;
        let node = document.createTextNode(
            `• ${elementSplit[0].trim()}\n`);

        anchor.appendChild(node);
        anchor.href = elementLink;

        indexTag.querySelector(`#${categoryName}`).appendChild(anchor);
    }
}

async function populatePage() {
    let file = getParameterByName("page");
    let folder = "pages"

    let response = await fetch(`${folder}/${file}`);

    if (response.status == 200) {
        let responseText = await response.text();

        let title = responseText.split('title:')[1].split('\n')[0];
        let update = responseText.split('update:')[1].split('\n')[0];

        document.title = `Viewing: ${title}`;

        document.getElementById('date-tag').innerHTML =
            `<b>Last updated</b>: ${update}`;
        document.getElementById('content').innerHTML = responseText
            .substring(responseText.indexOf("[end]") + 7);
    } else if (response.status == 404) {
        document.title = "A fragmented memory"

        document.getElementById('date-tag').innerHTML =
            "<b>Meditate.</b>";
        document.getElementById('content').innerHTML =
            "A memory misplaced, regressed by time."
    } else {
        document.title = "A disillusion"

        document.getElementById('date-tag').innerHTML =
            "<b>See past this fata morgana.</b>";
        document.getElementById('content').innerHTML =
            "A blurry text, unwound in recollection."
    }
}

async function makeSearch() {
    let file = "index.txt"
    var query = getParameterByName("q");

    var response = await fetch(file);
    var responseText = await response.text();

    let updateTo = document.getElementById('content');
    let matches = 0;
    const index = responseText.split(/\r?\n/);

    document.title = `Searching: ${query}`;

    for (let element of index) {
        if (query === "" || !query) break;

        let elementSplit = element.split("->");
        let text = elementSplit[0].trim();
 
        if (text.toLowerCase().includes(query.toLowerCase())) {
            matches++;

            if (matches == 1) updateTo.innerHTML = "";

            let anchor = document.createElement('a');

            // Some fancy categories.
            let header = document.createElement('p');
            let category = elementSplit[1];
            let categoryName = category.replaceAll(' ', '');
            let categoryHeader = document.createElement('div');

            if (updateTo.querySelector(`#${categoryName}`) == null) {
                updateTo.appendChild(header);
            }

            header.id = categoryName;
            categoryHeader.innerHTML = `<b>${category.trim()}</b>\n`;
            header.appendChild(categoryHeader);

            // Linkify the text
            let elementLink =
                `loader.html?page=${elementSplit[2].trim()}.txt`;
            let node = document.createTextNode(
                `• ${elementSplit[0].trim()}\n`);

            anchor.appendChild(node);
            anchor.href = elementLink;

            updateTo.querySelector(`#${categoryName}`).appendChild(
                anchor);
        }
    }

    if (matches == 0) {
        updateTo.innerHTML =
            `<b>Your query yielded no result.</b><br>Perhaps try an alternative query?`;
        document.title = "Search ends";
        document.getElementById('date-tag').innerHTML =
            `<b>Found</b>: ${matches} result(s)`;
        return;
    } else {
        document.getElementById('date-tag').innerHTML =
            `<b>Found</b>: ${matches} result(s)`;
    }
}