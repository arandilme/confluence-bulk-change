import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const spaceKey = process.env.SPACE_KEY;
const userEmail = process.env.USER_EMAIL;
const apiToken = process.env.API_TOKEN;
const atlassianDomain = process.env.ATLASSIAN_DOMAIN;

const auth = Buffer.from(`${userEmail}:${apiToken}`).toString('base64');

const instance = axios.create({
	baseURL: `https://${atlassianDomain}.atlassian.net/wiki/rest/api`,
	headers: {
		'Authorization': `Basic ${auth}`,
		'Content-Type': 'application/json'
	},
});

const replaceText = async (start = 0, limit = 50) => {
	try {
		const response = await instance.get(`/content/search?cql=space=${spaceKey} &start=${start}&limit=${limit}&expand=body.storage,version`);
		const {
			results
		} = response.data;

		if (results.length === 0) {
			console.log('No more pages found.');
			return;
		}

		for (const page of results) {
			if (page.type == 'page') {
				console.log(`Checking for text to swap in "${page.title}"`);

				const regex = new RegExp('text to replace', 'gi'); // TO-DO: Replace with your own regex
				console.log(page)
				console.log(page.body)
				const originalContent = page.body.storage.value;
				const updatedContent = originalContent
					.replace(regex, 'textReplaced'); // TO-DO: Replace with your own substitution.

				if (originalContent !== updatedContent) {
					console.log(`Updating "${page.title}" with replaced content.`);
					await instance.put(`/content/${page.id}`, {
						version: {
							number: page.version.number + 1
						},
						title: page.title,
						type: 'page',
						body: {
							storage: {
								value: updatedContent,
								representation: 'storage'
							}
						}
					});
					console.log(`Successfully updated "${page.title}"`);
				} else {
					console.log(`No replacements needed for "${page.title}"`);
				}
			}
		}

		await new Promise(resolve => setTimeout(resolve, 1000));
		await replaceText(start + limit, limit);

	} catch (error) {
		console.error('Error:', error.message);
	}
};


replaceText();