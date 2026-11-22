# Sizzle Shack

A fast-paced, browser-based cooking game.

## How to Play

1. Open `index.html` in a browser, or serve the project with a local web server.
2. Select the ingredients needed for the active customer order.
3. Press **Cook** and wait three seconds.
4. Press **Serve Order** to deliver the cooked dish.
5. Complete orders before the timer expires and before all lives run out.

## Features

- Multiple randomized recipes and customer orders
- Ingredient selection and cooking animation
- Score and streak bonuses
- Timer and three-life system
- Responsive kitchen-themed interface
- Start and game-over screens

## Run Locally

Using Node.js:

```powershell
node -e "require('http').createServer((request, response) => require('fs').createReadStream(require('path').join(process.cwd(), request.url === '/' ? 'index.html' : request.url.slice(1))).pipe(response)).listen(4173, '127.0.0.1')"
```

Then visit `http://127.0.0.1:4173`.
