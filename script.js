import { Store } from "n3";
import { QueryEngine } from "@comunica/query-sparql";

let store;

/**
 * Executes a SPARQL query on a given N3 store using the Comunica query engine.
 * @param {string} query - The SPARQL query string.
 * @param {object} store - The N3 store instance.
 * @returns {Promise<Array>} - A promise that resolves to an array of query result bindings.
 */
async function comunicaQuery(query, store) {
  const queryEngine = new QueryEngine();
  const loader = document.getElementById("loader");

  try {
    // Show loader
    loader.style.display = "block";

    const result = await queryEngine.queryBindings(query, {
      sources: [store],
    });

    const bindings = [];
    result.on("data", (binding) => {
      const bindingObject = {};
      binding.forEach((value, key) => {
        bindingObject[key.value] = value.value;
      });
      bindings.push(bindingObject);
    });

    return new Promise((resolve, reject) => {
      result.on("end", () => {
        // Hide loader
        loader.style.display = "none";
        resolve(bindings);
      });
      result.on("error", (error) => {
        // Hide loader on error
        loader.style.display = "none";
        reject(error);
      });
    });
  } catch (error) {
    // Hide loader on exception
    loader.style.display = "none";
    console.error("Error executing SPARQL query:", error);
    throw error;
  }
}
let queryEngine = new QueryEngine();

// Handle file uploads
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) {
    alert("No file selected.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function () {
    parseTTLFile(reader.result);
  };
  reader.readAsText(file);
}

// Parse .ttl file into an N3 store
function parseTTLFile(ttlContent) {
  store = new Store();

  try {
    console.log("Parsing TTL file...");
    const parser = new (require("n3").Parser)();
    const quads = parser.parse(ttlContent);
    store.addQuads(quads);
    console.log("TTL file parsed successfully.");

    // SPARQL query to fetch the first 20 triples
    const query = `
      SELECT ?s ?p ?o
      WHERE {
        ?sub <http://www.w3.org/ns/shacl#result> ?s .
        ?s ?p ?o .
      }
    `;

    // Fetch triples using comunicaQuery and pass them to displayTriples
    comunicaQuery(query, store)
      .then((triples) => {
        doublesmashresults(smashresults(triples));
        displayTriples(triples);
      })
      .catch((error) => {
        console.error("Error fetching triples with comunicaQuery:", error);
        alert("Failed to fetch triples.");
      });
  } catch (error) {
    console.error("Error parsing TTL file:", error);
    alert("Failed to parse the .ttl file.");
  }
}

function smashresults(triples) {
  let all_smashed = [];
  //iterate over triples
  // the mapping should be done on the same s .
  // the p will be a new key in a dict and the o will be the value
  // e.g. [{s: "subject", p: "predicate", o: "object"}, {s: "subject", p: "predicate", o: "object"},{s: "subject2", p: "predicate", o: "object"}, ...]
  // will be smashed to {subject: {predicate: "object", predicate: "object", ...}, subject2: {predicate: "object", predicate: "object", ...}, ...}

  triples.forEach((triple) => {
    //check if the subject is already in the smashed array
    const smashed = all_smashed.find((smashed) => smashed.s === triple.s);
    if (smashed) {
      //if it is, add the predicate and object to the smashed array
      smashed[triple.p] = triple.o;
    } else {
      //if it is not, create a new smashed object and add it to the smashed array
      all_smashed.push({ s: triple.s, [triple.p]: triple.o });
    }
  });

  console.log("Smashed results:", all_smashed);
  // Display the smashed results in the console or in a specific area of your HTML
  return all_smashed;
}

function doublesmashresults(smashresults) {
  let double_smashed = [];
  //iterate over the smashed results
  // the mapping should be done on the "http://www.w3.org/ns/shacl#focusNode" key
  // each of these keys will be a child list
  // for each dict that is found that has the same key, we will add the dict to the child list
  /*
  [{ s: "bc_0_b0_718da12c2ac646d592633692900bfa70246", "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://www.w3.org/ns/shacl#ValidationResult", "http://www.w3.org/ns/shacl#focusNode": "https://edmo.seadatanet.org/report/6097", … },
  ​{ s: "bc_0_b0_718da12c2ac646d592633692900bfa70247", "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://www.w3.org/ns/shacl#ValidationResult", "http://www.w3.org/ns/shacl#focusNode": "https://edmo.seadatanet.org/report/6097", … },
  { s: "bc_0_b0_718da12c2ac646d592633692900bfa70248", "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://www.w3.org/ns/shacl#ValidationResult", "http://www.w3.org/ns/shacl#focusNode": "https://edmo.seadatanet.org/report/6099", … },]
  */
  // will be smashed to
  /*
  [
  {"https://edmo.seadatanet.org/report/6097": [{ s: "bc_0_b0_718da12c2ac646d592633692900bfa70246", "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://www.w3.org/ns/shacl#ValidationResult", "http://www.w3.org/ns/shacl#focusNode": "https://edmo.seadatanet.org/report/6097", … },​{ s: "bc_0_b0_718da12c2ac646d592633692900bfa70247", "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://www.w3.org/ns/shacl#ValidationResult", "http://www.w3.org/ns/shacl#focusNode": "https://edmo.seadatanet.org/report/6097", … }],
  "https://edmo.seadatanet.org/report/6099": [{ s: "bc_0_b0_718da12c2ac646d592633692900bfa70248", "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://www.w3.org/ns/shacl#ValidationResult", "http://www.w3.org/ns/shacl#focusNode": "https://edmo.seadatanet.org/report/6099", … }]
  ]
  */
  smashresults.forEach((smashed) => {
    //check if the focusNode is already in the smashed array
    const double_smashed_item = double_smashed.find(
      (double_smashed) =>
        double_smashed[smashed["http://www.w3.org/ns/shacl#focusNode"]]
    );
    if (double_smashed_item) {
      //if it is, add the smashed object to the child list
      double_smashed_item[smashed["http://www.w3.org/ns/shacl#focusNode"]].push(
        smashed
      );
    } else {
      //if it is not, create a new smashed object and add it to the smashed array
      double_smashed.push({
        [smashed["http://www.w3.org/ns/shacl#focusNode"]]: [smashed],
      });
    }
  });

  console.log("Double smashed results:", double_smashed);
  return double_smashed;
}

function displayReportResults(double_smashed) {
  //get the id of the div where the results will be displayed
  const summaryDiv = document.getElementById("validationReportContent");
  summaryDiv.innerHTML = ""; // Clear existing content
  // table where the results will be displayed
  const tableresultsbody = document.getElementById("reportTableBody");
  tableresultsbody.innerHTML = ""; // Clear existing content

  // Create a h3 element and insert the length of the double smashed array in it
  const h3 = document.createElement("h3");
  h3.textContent = `Validation Report: ${double_smashed.length} results`;
  summaryDiv.appendChild(h3);

  // for each item in the double smashed array
  // add a row and populate it with the data
}

// Execute SPARQL query using @comunica/query-sparql
async function executeSPARQLQuery(query) {
  if (!store) {
    alert("The RDF store is not initialized. Please upload a .ttl file first.");
    return;
  }

  const engine = newEngine();
  const result = await engine.query(query, {
    sources: [store],
  });

  const bindings = await result.bindings();
  const triples = bindings.map((binding) => ({
    subject: binding.get("?s").value,
    predicate: binding.get("?p").value,
    object: binding.get("?o").value,
  }));

  displayTriples(triples);
}

// Display RDF triples in a table format
function displayTriples(triples) {
  console.log("Received triples:", triples);

  //only take the first 20 triples
  triples = triples.slice(0, 20);

  const displayArea = document.getElementById("rdfTriplesTableBody");
  displayArea.innerHTML = ""; // Clear existing content

  console.log("Displaying triples:", triples);

  // each triples is an object containing a certain ammount of keys and values
  // e.g. {s: "subject", p: "predicate", o: "object"}
  // extract the keys and values from the first triple to create the table header
  const keys = Object.keys(triples[0]);

  // Create a table element
  const table = document.createElement("table");
  table.setAttribute("border", "1");

  // Create table header
  const headerRow = document.createElement("tr");
  keys.forEach((key) => {
    const headerCell = document.createElement("th");
    headerCell.textContent = key.toUpperCase(); // Convert to uppercase for header
    headerRow.appendChild(headerCell);
  });
  table.appendChild(headerRow);

  // Populate table rows
  triples.forEach((triple) => {
    const row = document.createElement("tr");

    // Iterate over the keys and create a cell for each value
    // Note: The keys are dynamic, so we use the keys from the first triple
    keys.forEach((key) => {
      const cell = document.createElement("td");
      cell.textContent = triple[key]; // Use the key to access the value
      row.appendChild(cell);
    });
    // Append the row to the table
    table.appendChild(row);
  });

  // Append the table to the display area
  displayArea.appendChild(table);
}

// Event listeners
document
  .getElementById("ttlFileInput")
  .addEventListener("change", handleFileUpload);
document.getElementById("runQueryButton").addEventListener("click", () => {
  const queryInput = document.getElementById("sparqlQueryInput").value;
  if (!queryInput) {
    alert("Please enter a SPARQL query.");
    return;
  }

  comunicaQuery(queryInput, store)
    .then((triples) => {
      displayTriples(triples);
    })
    .catch((error) => {
      console.error("Error fetching triples with comunicaQuery:", error);
      alert("Failed to fetch triples.");
    });
});
