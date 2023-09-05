# confluence-bulk-change

Used for swapping out text in the titles and content of Confluence pages. 

To utilize:  
	- Clone this repo  
	- Run `npm i`  
	- Copy the .env.example file, and rename it to .env.  
	- Update the .env file with your Confluence credentials, and the space key for the confluence space.  
		- The space key can be found in the URL of the space.  

To update page content:  
	- Within `index.js` update lines 37 and 42.  
		- Line 37 should contain RegEx that locates your source text.  
		- Line 42 should contain the text you want to replace the source text with.  
	- Run `node index.js`  

To update page titles:
	- Within `updatePageTitles.js`, update lines 18 and 19 with your source text and the text to replace respectively.  
	- Run `node updatePageTitles.js`  