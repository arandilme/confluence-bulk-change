import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const {
	SPACE_KEY,
	USER_EMAIL,
	API_TOKEN,
	ATLASSIAN_DOMAIN
} = process.env;

let textToSwap = "";
let swapTextTo = "";

// Set up axios instance for Confluence API
const confluence = axios.create({
	baseURL: `https://${ATLASSIAN_DOMAIN}.atlassian.net/wiki/rest/api`,
	headers: {
		"Content-Type": "application/json",
	},
	auth: {
		username: USER_EMAIL,
		password: API_TOKEN,
	},
});

// Fetch all pages from the Confluence Space
async function fetchPages() {
	console.log("Fetching all pages from the Confluence Space...");
	const limit = 50; // Number of results per request (maximum is 50)
	let start = 0; // Starting index for the results
	let fetchedPages = [];
	let hasMorePages = true;
  
	while (hasMorePages) {
	  const response = await confluence.get(
		`/content/search?cql=space=${SPACE_KEY} AND title~"${textToSwap}"&expand=version&start=${start}&limit=${limit}`
	  );
	  const results = response.data.results;
	  console.log(`Fetched ${results.length} pages. Start: ${start}`)
	  hasMorePages = false
	  fetchedPages = fetchedPages.concat(results);
	}
  
	console.log(`Fetched ${fetchedPages.length} pages.`);
	return fetchedPages;
  }

// Update the page title
async function updatePageTitle(page, newTitle) {
	const updatedPage = {
		id: page.id,
		type: page.type,
		title: newTitle,
		space: {
			key: SPACE_KEY,
		},
		version: {
			number: page.version.number + 1,
		},
	};

	await confluence.put(`/content/${page.id}`, updatedPage);
}

(async function main() {
	try {
		const pages = await fetchPages();

		if (pages.length === 0) {
			console.log("No pages found in the Confluence Space.");
			return;
		}

		let updatedCount = 0;

		for (const page of pages) {
			if (page.title.includes(textToSwap)) { 
				const newTitle = page.title.replace(textToSwap, swapTextTo);
				console.log(`Updating "${page.title}" to "${newTitle}"`);
				await updatePageTitle(page, newTitle);
				updatedCount++;
			}
		}

		if (updatedCount === 0) {
			console.log(`No pages with '${textToSwap}' in their titles were found.`);
		} else {
			console.log(`All ${updatedCount} page titles updated successfully.`);
		}
	} catch (error) {
		console.error("An error occurred:", error.message);
	}
})();