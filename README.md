# AiTari
By: Ananya Bandaru, Karissah Yap, Sreeja Marupalli, Anahitha Raffe Sofia

# What is our project?
Our project is a study tool that combines the commonly used pomodoro timers and an AI chatbot that can help "tutor" the user. The user will be able to input their own notes, which will then be read by the chatbot, powered by Gemini API, to respond to questions by the user. The chatbot runs like any other chatbot, but mostly using your own notes to help you study, similar to NotebookLM. The biggest difference between something like NotebookLm and AiTari is the fun, whimsical ways of learning and answering questions to get points to later redeem as accessories for your character. The chatbot can also create quizzes and summarized study guides to help you study as well.

# Inspiration
As the theme is Frutiger Aero, we thought about some classic icons of the early 2000s. One of them being retro gaming consoles like GameCube or Nintendo Entertainment Systems. We ended up choosing Wii, which is a console where you insert a game card/cartridge to play on a television, and we based the interface based on that. For our name we also used the classic game Atari as our inspiration and named our group and program name to "AiTari" combining Atari and AI. Our opening splash screen was also based off of this.

# Key Features Summary
1. AI tutor
2. Pomodoro timer
3. Notes Hub - A place to put all your notes, you can even upload txt and .md files to save time.
4. Character Customization using points, called ecopoints, redeemed from answering question based off of notes.

# How we built it
We first created a visual outline of how we wanted the UI/UX to look using PenPot. PenPot is an open-source software similar to figma, and using the .penpot file from those designs, we used Claude to convert it to HTML and CSS files. Claude helped us improve our idea by implementing things like the ability to upload a .txt or .md file and the interface for the chatbot when you ask it to make you a quiz. We then used our knowledge about Gemini API to then implement it in the app, continuing to use Gemini and Claude to assist in the complete implementation and making sure it will continue to work as necessary. We then pushed everything to a github repo, which we then used Render, a web deployment software, to make public the website. Using Render allowed us to easily make sure the API is still connected to the website.

# Main tools used
1. Penpot - Tool used to create the UI for the program. We used its features to turn it into code and then implemented the API into that code and updated the visual components as necessary.
2. Gemini API, gemini-3.1-flash-lite - API and version used to create the AI tool in the program. Version may be changed based on usage amounts. 
3. JavaScript, Node.js, HTML, CSS - Main coding languages for the program. 
4. Render - tool used to deploy the website and make it public.
5. Claude Sonnet 5.5 Medium - to convert the .penpot file into html and css as the plugins were not working as intended, as well as understanding how APIs work and how to implement it into the code. 
6. Gemini Pro - to further understand APIs and how to implement Geminis API to be a simple chatbot that reads notes like their own NotebookLM would.

# Challenges we ran into
At first we were unable to make a collaborative file on Figma, which is when we switched to penpot, which in turn made it easier for us to implement the Gemini API Key. However, while trying to get a Gemini API Key, we had issues with the version we were using for the AI bot to work and how it was connected locally on our devices before we made the full website. We were able to fix these issues with API using the documentation and Gemini itself.

# Accomplishments that we're proud of
Honestly, just making the project happen and having it work out for the best. We are also proud of the knowledge we have gained from this project as it is truly impactful experience for not just future hackathons but real world experience as well.

# What we learned
We learned the ways of AI and how it can help not only solve problems but help find ways to make your solution better. Our key role in this project was the creative ideas and UI/UX. The AI's main role took place in assisting us in learning of things like API and how to create better UI/UX. 

# What's next
AiTari can become a well-made platform for students all over the world to use with proper knowledge of servers and AI implementation processes. We plan on continuing to develop on this idea to eventually make it global :)

# Additional Sources for design and icons
1. https://frutigeraeroarchive.org
2. https://frutiger-aero.org/icons 

# AI usage
We primarily used Gemini Pro and Claude to work on this project. Initially we used Claude to understand and develop starter code for making the API work for our context. But then we realized it would be better to use Gemini since the API is literally Gemini API and the LLM would probably know better about the API than Claude. Which then helped us finally make the API work. We also used it to identify and easily deploy the program into a publicly visible website. 
